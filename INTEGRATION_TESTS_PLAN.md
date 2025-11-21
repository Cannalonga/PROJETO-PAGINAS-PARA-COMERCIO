## 🧪 INTEGRATION_TESTS_PLAN.md — PHASE D.10

**Documento:** Plano de Testes de Integração  
**Data:** 21 Novembro 2025  
**Status:** ✅ Implementado e Pronto para Testes

---

## 📋 Visão Geral

PHASE D.10 valida fluxos **end-to-end** que unit tests não conseguem detectar:

1. **Wiring Correto:** Rutas importam services certos?
2. **Sequência de Eventos:** Webhooks chegam na ordem certa?
3. **Integração Multi-layer:** Prisma + Stripe + Rate Limiter + Logger funcionam juntos?
4. **Robustez:** Retrys, idempotência, edge cases?

---

## 🎯 Cenários Testados

### 1️⃣ Billing Flow — Happy Path
**Arquivo:** `__tests__/integration/billing-flow.test.ts`

**O que testa:**
```
Owner chama /api/billing/checkout
    ↓
Stripe cria sessão de checkout
    ↓
Webhook customer.subscription.created chega
    ↓
Tenant é atualizado: plan=PRO, billingStatus=ACTIVE
```

**Casos cobertos:**
- ✅ Checkout session criada com sucesso
- ✅ Webhook processado corretamente
- ✅ Tenant atualizado com IDs corretos (stripeCustomerId, stripeSubscriptionId)
- ✅ Plan e billingStatus atualizados
- ✅ Tenant lookup por stripeCustomerId funciona

**Validações:**
```typescript
expect(updateResult.plan).toBe("PRO");
expect(updateResult.billingStatus).toBe("ACTIVE");
expect(updateResult.stripeSubscriptionId).toBe(stripeSubscriptionId);
```

---

### 2️⃣ Webhook Idempotência — Robustez
**Arquivo:** `__tests__/integration/billing-webhook-idempotency.test.ts`

**O que testa:**
```
Stripe envia webhook evt_123
    ↓
Sistema processa (tenant atualizado)
    ↓
Stripe tenta redelivery (mesmo evt_123)
    ↓
Sistema processa novamente
    ↓
Estado final = idêntico (sem duplicatas)
```

**Casos cobertos:**
- ✅ Mesmo evento processado 2x sem erro 500
- ✅ Estado final permanece consistente
- ✅ Sem duplicação de subscription IDs
- ✅ Transições de status idempotentes

**Validações:**
```typescript
expect(prismaMock.tenant.update).toHaveBeenCalledTimes(2);
expect(updateCall1).toEqual(updateCall2); // Idempotente
```

---

### 3️⃣ Rate Limiting — Proteção
**Arquivo:** `__tests__/integration/billing-rate-limit.test.ts`

**O que testa:**
```
Request 1 → /api/billing/checkout → 201 OK
Request 2 → /api/billing/checkout → 201 OK
Request 3 → /api/billing/checkout → 201 OK
Request 4 → /api/billing/checkout → 429 Too Many Requests
```

**Casos cobertos:**
- ✅ Primeiras N requisições permitidas
- ✅ Requisição N+1 retorna 429
- ✅ Rate limit diferente por endpoint
- ✅ Reset após time window expirar
- ✅ Tracking por IP vs authenticated user
- ✅ Response headers corretos (X-RateLimit-*)
- ✅ Audit logging não quebra com rate limit

**Validações:**
```typescript
expect(res1.status).toBe(201);
expect(res2.status).toBe(201);
expect(res3.status).toBe(201);
expect(res4.status).toBe(429);
```

---

### 4️⃣ Página Pública SEO — Metadata
**Arquivo:** `__tests__/integration/public-page-seo.test.ts`

**O que testa:**
```
GET /t/[tenantSlug]/[pageSlug]
    ↓
Busca tenant por slug
    ↓
Busca page por tenantId + slug (só PUBLISHED)
    ↓
Gera metadata (title + suffix, description, canonical, robots)
    ↓
Retorna HTML com <meta> tags corretas
```

**Casos cobertos:**
- ✅ Metadata combinando defaults + overrides
- ✅ Title com suffix
- ✅ Description fallback chain
- ✅ Canonical URL correto
- ✅ robots.noindex respeitado
- ✅ OG tags para social media
- ✅ Twitter Card tags
- ✅ Multi-tenant isolation (URLs diferentes por tenant)
- ✅ Unpublished pages → 404
- ✅ Tenant inexistente → 404

**Validações:**
```typescript
expect(meta.title).toContain("Promoção só hoje");
expect(meta.alternates.canonical).toBe("https://example.com/t/loja-teste/promocao");
expect(meta.robots).toEqual({ index: true, follow: true });
```

---

## 📁 Estrutura de Arquivos

```
__tests__/
├── integration/
│   ├── billing-flow.test.ts              ✅ Happy path
│   ├── billing-webhook-idempotency.test.ts ✅ Robustez
│   ├── billing-rate-limit.test.ts        ✅ Proteção
│   └── public-page-seo.test.ts           ✅ Metadata
├── mocks/
│   ├── prisma-integration-mock.ts        ✅ Prisma mock
│   ├── stripe-integration-mock.ts        ✅ Stripe mock
│   └── next-request-factory.ts           ✅ NextRequest factory
└── [existing unit tests]
```

---

## 🚀 Como Rodar

### Rodar todos os testes de integração
```bash
npm test -- --testPathPattern="integration" --verbose
```

### Rodar teste específico
```bash
npm test -- __tests__/integration/billing-flow.test.ts
```

### Rodar com coverage
```bash
npm test -- --testPathPattern="integration" --coverage
```

### Rodar em watch mode (desenvolvimento)
```bash
npm test -- --testPathPattern="integration" --watch
```

---

## 📊 Resultado Esperado

```
PASS  __tests__/integration/billing-flow.test.ts
  Billing integration flow
    ✓ should complete checkout and process webhook to upgrade tenant to PRO
    ✓ should handle webhook with correct tenant lookup by stripeCustomerId

PASS  __tests__/integration/billing-webhook-idempotency.test.ts
  Billing webhook idempotency
    ✓ should handle same event twice without error or inconsistency
    ✓ should not create duplicate subscriptions on webhook retry
    ✓ should handle subscription status transitions idempotently

PASS  __tests__/integration/billing-rate-limit.test.ts
  Billing rate limiting
    ✓ should allow first N checkout requests within rate limit
    ✓ should return 429 when rate limit is exceeded
    ✓ should enforce different rate limits for different endpoints
    ✓ should reset rate limit after time window expires
    ✓ should track rate limit by IP when user not authenticated
    ✓ should include rate limit info in response headers
    ✓ should not interfere with audit logging on rate limit

PASS  __tests__/integration/public-page-seo.test.ts
  Public page SEO integration
    ✓ should generate SEO metadata combining tenant defaults and page overrides
    ✓ should mark page as noindex when seoNoIndex = true
    ✓ should use tenant defaults when page has no overrides
    ✓ should generate correct canonical URL for multi-tenant isolation
    ✓ should handle missing tenant gracefully
    ✓ should handle unpublished pages (404)
    ✓ should include OG and Twitter tags for social sharing

Test Suites: 4 passed, 4 total
Tests:       21 passed, 21 total
```

---

## 🔒 Segurança em Testes de Integração

### ✅ Nenhum Secret Real Exposto
- Todos os valores Stripe mockados (`cus_123`, `price_pro_123`)
- Nenhuma chamada real a `api.stripe.com`
- Nenhum token de autenticação real armazenado

### ✅ Isolamento de Dados
- Banco mockado em memória (jest.mock)
- Cada teste tem `beforeEach(() => jest.clearAllMocks())`
- Sem contaminação de estado entre testes

### ✅ Casos de Erro Validados
- Webhook com assinatura inválida → tratado
- Tenant inexistente → 404 handled
- Page não publicada → 404 handled
- Rate limit atingido → 429 handled

---

## 🧩 Como Escrever Novos Testes de Integração

### Template Básico

```typescript
import { prismaMock } from "../mocks/prisma-integration-mock";
import { stripeMock } from "../mocks/stripe-integration-mock";

jest.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

jest.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
}));

describe("Nova funcionalidade integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mocks aqui
  });

  it("should fazer algo importante", async () => {
    // Arrange: setup estado inicial
    prismaMock.tenant.findUnique.mockResolvedValue({
      id: "tenant-123",
      // ... dados mock
    });

    // Act: executar ação
    const result = await prismaMock.tenant.findUnique({
      where: { id: "tenant-123" },
    });

    // Assert: validar resultado
    expect(result).toBeDefined();
    expect(result.id).toBe("tenant-123");
  });
});
```

### Checklist para Novo Teste

- [ ] Jest mocks declarados (`jest.mock()`)
- [ ] `beforeEach(() => jest.clearAllMocks())`
- [ ] Setup de dados mock (arrange)
- [ ] Ação testada (act)
- [ ] Assertions (assert)
- [ ] Nome descritivo (should...)
- [ ] Sem secrets reais
- [ ] Independente de testes anteriores
- [ ] Testa 1 coisa bem

---

## ✅ Checklist CI/CD

Antes de fazer merge em `main`:

- [ ] `npm test -- --testPathPattern="integration"` passando 100%
- [ ] `npm run lint` sem erros
- [ ] `npm run build` sem erros
- [ ] Coverage de testes > 80%
- [ ] Nenhum console.log ou debugger
- [ ] Commits com mensagens claras

---

## 📈 Próximas Fases Após D.10

✅ **D.10 Integration Tests** (Atual)  
↓  
🟡 **Staging Deployment** (Deploy em environment real)  
↓  
🟢 **Production Deployment** (Go live)  
↓  
🔵 **PHASE F.2** (Enhanced SEO: sitemap, robots.txt, JSON-LD)

---

## 🤝 Suporte

**Dúvidas?**
- Revise exemplos em cada arquivo de teste
- Use `npm test -- --testPathPattern="integration" --verbose` para debug
- Cheque mocks em `__tests__/mocks/` se comportamento está estranho

**Mudanças Necessárias?**
1. Atualizar mocks correspondentes
2. Rodar `npm test -- --testPathPattern="integration" --watch`
3. Verificar se todos passam
4. Fazer commit com mensagem clara

---

**Status:** ✅ PRONTO PARA EXECUÇÃO

