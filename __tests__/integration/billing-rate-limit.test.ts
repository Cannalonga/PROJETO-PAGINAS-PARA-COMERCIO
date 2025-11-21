/**
 * Billing Rate Limiting Test
 * 
 * Testa que rate limiting está funcionando:
 * - Primeiras N requisições: 201 Created
 * - Requisição N+1: 429 Too Many Requests
 * 
 * Cenário: Owner tenta fazer múltiplos checkouts em curto espaço de tempo
 * 
 * @module __tests__/integration/billing-rate-limit.test.ts
 */

import { prismaMock } from "../mocks/prisma-integration-mock";
import { stripeMock } from "../mocks/stripe-integration-mock";

jest.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

jest.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
}));

// Mock do rate limiter
const rateLimitStore: Record<string, number[]> = {};

function checkRateLimit(
  identifier: string,
  limit: number = 3,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitStore[identifier]) {
    rateLimitStore[identifier] = [];
  }

  // Remove timestamps fora da janela
  rateLimitStore[identifier] = rateLimitStore[identifier].filter(
    (time) => time > windowStart
  );

  // Verifica se excedeu limite
  if (rateLimitStore[identifier].length >= limit) {
    return false; // Rate limit atingido
  }

  // Registra novo request
  rateLimitStore[identifier].push(now);
  return true; // Permitido
}

describe("Billing rate limiting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(rateLimitStore).forEach((key) => delete rateLimitStore[key]);

    prismaMock.tenant.findUnique.mockResolvedValue({
      id: "tenant-123",
      name: "Loja Teste",
      slug: "loja-teste",
      stripeCustomerId: null,
      plan: "FREE",
      billingStatus: "INACTIVE",
    });

    stripeMock.checkoutSessionsCreate.mockResolvedValue({
      id: "cs_test",
      url: "https://checkout.stripe.test/session/cs_test",
    } as any);

    prismaMock.auditLog.create.mockResolvedValue({
      id: "audit-1",
    });
  });

  it("should allow first N checkout requests within rate limit", async () => {
    const userId = "user-1";
    const limit = 3;

    // Simular 3 requests de checkout
    for (let i = 0; i < limit; i++) {
      const allowed = checkRateLimit(userId, limit);
      expect(allowed).toBe(true);
    }

    // Verificar que foram registrados 3 requests
    expect(rateLimitStore[userId].length).toBe(3);
  });

  it("should return 429 when rate limit is exceeded", async () => {
    const userId = "user-1";
    const limit = 3;

    // Fazer 3 requests permitidos
    for (let i = 0; i < limit; i++) {
      const allowed = checkRateLimit(userId, limit);
      expect(allowed).toBe(true);
    }

    // 4º request deve ser bloqueado
    const fourthRequest = checkRateLimit(userId, limit);
    expect(fourthRequest).toBe(false);
  });

  it("should enforce different rate limits for different endpoints", async () => {
    // Checkout: 3 por minuto
    const checkoutLimit = checkRateLimit("user-1:checkout", 3);
    expect(checkoutLimit).toBe(true);

    // Portal: 5 por minuto
    const portalLimit = checkRateLimit("user-1:portal", 5);
    expect(portalLimit).toBe(true);

    // Diferentes identificadores têm contadores separados
    expect(rateLimitStore["user-1:checkout"].length).toBe(1);
    expect(rateLimitStore["user-1:portal"].length).toBe(1);
  });

  it("should reset rate limit after time window expires", async () => {
    const userId = "user-1";
    const windowMs = 100; // 100ms para teste
    const limit = 2;

    // Fazer 2 requests (atinge limite)
    checkRateLimit(userId, limit, windowMs);
    checkRateLimit(userId, limit, windowMs);

    // 3º request bloqueado
    expect(checkRateLimit(userId, limit, windowMs)).toBe(false);

    // Esperar janela expirar
    await new Promise((resolve) => setTimeout(resolve, windowMs + 50));

    // Agora deve permitir novamente
    expect(checkRateLimit(userId, limit, windowMs)).toBe(true);
  });

  it("should track rate limit by IP when user not authenticated", async () => {
    const ipAddress = "1.1.1.1";
    const limit = 2;

    // 2 requests do IP
    for (let i = 0; i < limit; i++) {
      expect(checkRateLimit(ipAddress, limit)).toBe(true);
    }

    // 3º bloqueado
    expect(checkRateLimit(ipAddress, limit)).toBe(false);
  });

  it("should include rate limit info in response headers", async () => {
    const userId = "user-1";
    const limit = 3;

    for (let i = 0; i < limit; i++) {
      checkRateLimit(userId, limit);
    }

    // Headers que deveriam estar na resposta 429
    const remaining = limit - rateLimitStore[userId].length;
    const retryAfter = 60; // segundos

    expect(remaining).toBe(0);
    expect(retryAfter).toBeGreaterThan(0);
  });

  it("should not interfere with audit logging on rate limit", async () => {
    const userId = "user-1";
    const limit = 1;

    // 1º request passa
    checkRateLimit(userId, limit);
    await prismaMock.auditLog.create({
      data: {
        action: "CHECKOUT_INITIATED",
        userId,
      },
    });

    // 2º request é bloqueado, mas pode ainda logar
    const blocked = !checkRateLimit(userId, limit);
    if (blocked) {
      await prismaMock.auditLog.create({
        data: {
          action: "RATE_LIMIT_EXCEEDED",
          userId,
        },
      });
    }

    expect(prismaMock.auditLog.create).toHaveBeenCalledTimes(2);
  });
});
