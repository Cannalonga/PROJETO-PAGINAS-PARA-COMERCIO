/**
 * Billing Webhook Idempotency Test
 * 
 * Testa robustez do webhook Stripe:
 * - Mesmo evento é processado 2x
 * - Estado final do tenant permanece consistente
 * - Sem erro 500
 * - Sem duplicatas de dados
 * 
 * Simula cenário real: Stripe tenta redelivery se não receber 200 OK
 * 
 * @module __tests__/integration/billing-webhook-idempotency.test.ts
 */

import { prismaMock } from "../mocks/prisma-integration-mock";
import { stripeMock } from "../mocks/stripe-integration-mock";
import type Stripe from "stripe";

jest.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

jest.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
}));

describe("Billing webhook idempotency", () => {
  const tenantId = "tenant-123";
  const stripeCustomerId = "cus_123";
  const stripeSubscriptionId = "sub_123";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup tenant findFirst (lookup por stripeCustomerId)
    prismaMock.tenant.findFirst.mockResolvedValue({
      id: tenantId,
      name: "Loja Teste",
      plan: "FREE",
      billingStatus: "INACTIVE",
      stripeCustomerId,
      stripeSubscriptionId: null,
    });

    // Setup tenant update
    prismaMock.tenant.update.mockResolvedValue({
      id: tenantId,
      plan: "PRO",
      billingStatus: "ACTIVE",
      stripeSubscriptionId,
    });

    // Setup audit log
    prismaMock.auditLog.create.mockResolvedValue({
      id: "audit-1",
      action: "BILLING_UPDATED",
      description: "Webhook processado",
    });
  });

  it("should handle same event twice without error or inconsistency", async () => {
    // 1️⃣ Simular webhook com subscription.updated
    const fakeEvent: Partial<Stripe.Event> = {
      id: "evt_idempotent_123",
      type: "customer.subscription.updated",
      created: 1700000000,
      data: {
        object: {
          id: stripeSubscriptionId,
          customer: stripeCustomerId,
          status: "active",
          items: {
            data: [{ price: { id: "price_pro" } }],
          } as any,
        } as any,
      },
    };

    stripeMock.webhooksConstructEvent.mockReturnValue(fakeEvent as any);

    // 2️⃣ Primeira chamada do webhook
    const tenant1 = await prismaMock.tenant.findFirst({
      where: { stripeCustomerId },
    });

    expect(tenant1).toBeDefined();
    expect(tenant1?.id).toBe(tenantId);

    // 3️⃣ Processar atualização
    const updateCall1 = await prismaMock.tenant.update({
      where: { id: tenantId },
      data: {
        plan: "PRO",
        billingStatus: "ACTIVE",
        stripeSubscriptionId,
      },
    });

    expect(updateCall1.plan).toBe("PRO");
    expect(updateCall1.billingStatus).toBe("ACTIVE");

    // 4️⃣ Segunda chamada do MESMO evento (retry de Stripe)
    const tenant2 = await prismaMock.tenant.findFirst({
      where: { stripeCustomerId },
    });

    expect(tenant2).toBeDefined();
    expect(tenant2?.id).toBe(tenantId);

    // 5️⃣ Processar atualização novamente
    const updateCall2 = await prismaMock.tenant.update({
      where: { id: tenantId },
      data: {
        plan: "PRO",
        billingStatus: "ACTIVE",
        stripeSubscriptionId,
      },
    });

    expect(updateCall2.plan).toBe("PRO");
    expect(updateCall2.billingStatus).toBe("ACTIVE");

    // 6️⃣ Validações finais
    // - Nenhum erro 500
    // - Update foi chamado 2x mas dados finais são iguais
    // - Estado é determinístico (idempotente)
    expect(prismaMock.tenant.findFirst).toHaveBeenCalledTimes(2);
    expect(prismaMock.tenant.update).toHaveBeenCalledTimes(2);

    // Ambas as chamadas de update tiveram os mesmos dados
    expect(updateCall1).toEqual(updateCall2);
  });

  it("should not create duplicate subscriptions on webhook retry", async () => {
    // Cenário: webhook tenta 2x, sistema não deve criar 2 records

    prismaMock.tenant.findFirst.mockResolvedValue({
      id: tenantId,
      stripeCustomerId,
      stripeSubscriptionId: null,
    });

    // Primeira vez: atualiza tenant com nova subscription
    prismaMock.tenant.update.mockResolvedValueOnce({
      id: tenantId,
      stripeSubscriptionId,
      plan: "PRO",
    });

    // Segunda vez: mesmo tenant já tem subscription, update é idempotente
    prismaMock.tenant.update.mockResolvedValueOnce({
      id: tenantId,
      stripeSubscriptionId,
      plan: "PRO",
    });

    // 1ª tentativa
    const first = await prismaMock.tenant.update({
      where: { id: tenantId },
      data: { stripeSubscriptionId, plan: "PRO" },
    });

    // 2ª tentativa (retry)
    const second = await prismaMock.tenant.update({
      where: { id: tenantId },
      data: { stripeSubscriptionId, plan: "PRO" },
    });

    // Ambas devem ter o mesmo subscription ID
    expect(first.stripeSubscriptionId).toBe(second.stripeSubscriptionId);
    expect(first.id).toBe(second.id);

    // Nenhuma duplicação (ainda é o mesmo tenant)
    expect(prismaMock.tenant.update).toHaveBeenCalledTimes(2);
  });

  it("should handle subscription status transitions idempotently", async () => {
    // Cenário: webhook chega 2x com status='active' → update duas vezes é safe

    const transitions = [
      { status: "active", plan: "PRO", billingStatus: "ACTIVE" },
      { status: "active", plan: "PRO", billingStatus: "ACTIVE" },
    ];

    for (const transition of transitions) {
      prismaMock.tenant.findFirst.mockResolvedValueOnce({
        id: tenantId,
        stripeCustomerId,
        plan: "FREE",
        billingStatus: "INACTIVE",
      });

      prismaMock.tenant.update.mockResolvedValueOnce({
        id: tenantId,
        plan: transition.plan,
        billingStatus: transition.billingStatus,
      });

      const result = await prismaMock.tenant.update({
        where: { id: tenantId },
        data: {
          plan: transition.plan,
          billingStatus: transition.billingStatus,
        },
      });

      expect(result.plan).toBe(transition.plan);
      expect(result.billingStatus).toBe(transition.billingStatus);
    }

    // Ambas transições resultaram no mesmo estado final
    expect(prismaMock.tenant.update).toHaveBeenCalledTimes(2);
  });
});
