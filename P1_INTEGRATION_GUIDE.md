# FASE 2 — P1 INTEGRATION GUIDE

**Como integrar P1 (Observabilidade + Rate Limiting) ao seu projeto**

---

## 📦 Arquivos Novos Adicionados

```
lib/
  ├── logger.ts              ← Pino structured logging
  ├── correlation-id.ts      ← UUID tracking
  ├── request-context.ts     ← AsyncLocalStorage context
  ├── sentry.ts              ← Error tracking
  └── rate-limit.ts          ← Redis rate limiting

middleware/
  ├── with-correlation-id.ts ← Initialize context
  ├── with-logger.ts         ← Log requests/responses
  ├── with-sentry.ts         ← Capture errors
  └── with-rate-limit.ts     ← Apply rate limits

app/api/
  └── example/route.ts       ← Exemplo completo

tests/
  └── p1-observability.http  ← HTTP tests

scripts/
  └── run-p1-tests.ps1       ← PowerShell test suite

docs/
  └── P1_OBSERVABILITY_COMPLETE.md ← Full documentation
```

---

## 🚀 Step 1: Instalar Dependências

```bash
npm install pino pino-pretty ioredis rate-limiter-flexible @sentry/nextjs @sentry/profiling-node
```

**Compatibilidade:**

- Node.js 18+
- Next.js 14+
- React 18+

---

## 🔧 Step 2: Configurar Variáveis de Ambiente

Criar/atualizar `.env.local`:

```env
# ===== LOGGING =====
LOG_LEVEL="debug"
LOG_FORMAT="pretty"

# ===== REDIS (Rate Limiting) =====
REDIS_URL="redis://localhost:6379"
# REDIS_PASSWORD="your-password"   # Opcional

# ===== SENTRY (Error Tracking) =====
SENTRY_DSN="https://your-key@sentry.io/your-project-id"
SENTRY_ENVIRONMENT="development"
SENTRY_TRACES_SAMPLE_RATE="1.0"        # 100% em dev
SENTRY_PROFILES_SAMPLE_RATE="1.0"      # 100% em dev

# ===== NODE ENV =====
NODE_ENV="development"
```

### Obter Credenciais

**Redis:**
```bash
# Local (Docker)
docker run -d -p 6379:6379 redis

# Cloud: Redis Cloud, Upstash, etc
# Copiar REDIS_URL da dashboard
```

**Sentry:**
1. Ir para https://sentry.io
2. Criar projeto Node.js
3. Copiar DSN da seção "Client Keys (DSN)"

---

## 🎯 Step 3: Inicializar Infraestrutura

### Em `app/layout.tsx` (ou nearest parent layout)

```typescript
import { initRateLimiters } from '@/lib/rate-limit';
import { initSentry } from '@/lib/sentry';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Inicializar P1 infrastructure
  try {
    await initRateLimiters();
    initSentry();
    console.log('✅ P1 Infrastructure initialized');
  } catch (err) {
    console.error('❌ P1 Initialization failed:', err);
  }

  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

---

## 📝 Step 4: Usar em Rotas

### Exemplo Simples (Copy-Paste Ready)

**File:** `app/api/items/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { composeMiddleware, withCorrelationId } from '@/middleware/with-correlation-id';
import { withLogger } from '@/middleware/with-logger';
import { withSentry } from '@/middleware/with-sentry';
import { withRateLimit } from '@/middleware/with-rate-limit';
import { getRequestContext } from '@/lib/request-context';
import { createContextLogger } from '@/lib/logger';

// Handler do negócio (sua lógica específica)
async function handler(req: NextRequest): Promise<Response> {
  const ctx = getRequestContext();
  if (!ctx) return NextResponse.json({ error: 'No context' }, { status: 500 });

  const log = createContextLogger(ctx);

  try {
    switch (req.method) {
      case 'GET':
        log.info({ action: 'LIST' }, 'Listing items');
        // Sua lógica aqui
        return NextResponse.json({ items: [] });

      case 'POST':
        const body = await req.json();
        log.info({ item: body }, 'Creating item');
        // Sua lógica aqui
        return NextResponse.json({ id: '123' }, { status: 201 });

      default:
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
  } catch (err) {
    // Erro é capturado automaticamente por withSentry
    throw err;
  }
}

// Stack de middlewares
export const GET = composeMiddleware(
  handler,
  withRateLimit,        // Aplicado primeiro (outermost)
  withSentry,
  withLogger,
  withCorrelationId     // Aplicado último (innermost)
);

export const POST = composeMiddleware(
  handler,
  withRateLimit,
  withSentry,
  withLogger,
  withCorrelationId
);
```

### Exemplo com Rate Limit Customizado

```typescript
// Versão com rate limit mais restritivo para login
export const POST = composeMiddleware(
  handler,
  (h) => withRateLimit(h, { mode: 'ip', customLimits: { points: 5, duration: 60 } }),
  withSentry,
  withLogger,
  withCorrelationId
);
```

### Acessar Contexto de Request

```typescript
import { getRequestContext, requireRequestContext } from '@/lib/request-context';

async function handler(req: NextRequest) {
  // Safe access (retorna undefined se fora de contexto)
  const ctx = getRequestContext();
  
  // Required access (throw error se fora de contexto)
  const ctxRequired = requireRequestContext();

  // ctx contém:
  // - correlationId: string (UUID)
  // - tenantId: string
  // - userId?: string
  // - ip: string
  // - userAgent: string
}
```

### Logging Estruturado

```typescript
import { createContextLogger } from '@/lib/logger';

async function handler(req: NextRequest) {
  const ctx = getRequestContext();
  const log = createContextLogger(ctx);

  // Automático: correlationId, tenantId, userId (binding)
  log.info({ userId: '123', action: 'CREATE' }, 'User created');
  log.warn({ deprecated: true }, 'Old API endpoint');
  log.error({ error: 'Database error' }, 'Failed to save');
  log.debug({ data: { foo: 'bar' } }, 'Debug info');
}
```

---

## 🧪 Step 5: Testar

### Quick Test

```bash
# 1. Iniciar server
npm run dev

# 2. Em outro terminal, fazer request
curl -X POST http://localhost:3000/api/example \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: test-tenant" \
  -d '{"name":"Test"}'

# 3. Verificar response
# Deve incluir "x-correlation-id" header
# Deve incluir "correlationId" no JSON body
```

### HTTP Tests (VS Code)

1. Instalar extensão "REST Client"
2. Abrir `tests/p1-observability.http`
3. Clicar "Send Request" em cada teste

### PowerShell Test Suite

```bash
# Full suite
./run-p1-tests.ps1

# Skip rate limiting tests (mais rápido)
./run-p1-tests.ps1 -SkipRateLimitTests

# Verbose
./run-p1-tests.ps1 -Verbose
```

---

## 📊 Step 6: Monitorar

### Logs em Desenvolvimento

```bash
npm run dev

# Output deve ser pretty-printed:
# [INFO] Incoming request (path=/api/items, method=GET)
# [INFO] Request completed (status=200, duration=42ms)
```

### Logs em Produção

```bash
npm run build && npm start

# Output deve ser JSON lines (estruturado):
# {"level":30,"time":"2024-01-15T10:30:00Z","msg":"Incoming request","path":"/api/items"}
```

### Sentry Dashboard

1. Fazer request que cause erro:
```bash
curl -X POST http://localhost:3000/api/example \
  -H "Content-Type: application/json" \
  -d '{}' # Falta campo obrigatório
```

2. Ir para https://sentry.io
3. Ver erro com tags: correlationId, tenantId, userId
4. Ver breadcrumb trail do erro

### Redis Status

```bash
redis-cli

# Ver quantas chaves de rate limit existem
DBSIZE

# Ver rate limit para um IP específico
GET rate-limit:ip:127.0.0.1

# Limpar tudo
FLUSHALL
```

---

## 🔍 Troubleshooting

### ❌ "Redis connection refused"

**Solução:**
```bash
# Verificar se Redis está rodando
redis-cli ping
# Deve retornar PONG

# Se não estiver, iniciar:
redis-server

# Ou usar Docker:
docker run -d -p 6379:6379 redis:latest
```

### ❌ "Rate limit não funciona"

**Checklist:**
- [ ] REDIS_URL está em `.env.local`
- [ ] Redis está rodando
- [ ] `initRateLimiters()` foi chamado em app startup

### ❌ "Logs não aparecem"

**Checklist:**
- [ ] LOG_LEVEL não está "silent"
- [ ] Middleware withLogger foi adicionado
- [ ] Não há erro em withCorrelationId ou withSentry

### ❌ "Sentry não captura erros"

**Checklist:**
- [ ] SENTRY_DSN está em `.env.local`
- [ ] Projeto Sentry criado em sentry.io
- [ ] Middleware withSentry foi adicionado

---

## 📚 Próximos Passos

1. **Integrar em mais rotas**
   - Copiar stack de middlewares para outras rotas
   - Ajustar rate limits conforme necessário

2. **Customizar Limits**
   - Criar `withAuthRateLimit` para login (mais restritivo)
   - Criar `withApiRateLimit` para API keys (mais generoso)

3. **Monitorar em Produção**
   - Configurar alertas em Sentry
   - Monitorar Redis memory usage
   - Análise de logs com ferramentas como ELK

4. **Expandir P1**
   - Adicionar APM (Sentry Profiling)
   - Implementar Circuit Breaker para external APIs
   - Distributed tracing com Jaeger/Zipkin

---

## ✅ Checklist de Integração

- [ ] Dependências instaladas: `npm install pino pino-pretty ioredis rate-limiter-flexible @sentry/nextjs`
- [ ] `.env.local` criado com REDIS_URL e SENTRY_DSN
- [ ] `initRateLimiters()` e `initSentry()` chamados em layout.tsx
- [ ] Pelo menos uma rota tem middleware stack completo
- [ ] `./run-p1-tests.ps1` passa >80% dos testes
- [ ] Logs aparecem em stdout
- [ ] Sentry recebe eventos
- [ ] Rate limit retorna 429 após limite

---

## 📞 Suporte

**Arquivo de referência:** `P1_OBSERVABILITY_COMPLETE.md`

**Exemplo completo:** `app/api/example/route.ts`

**Testes:** `tests/p1-observability.http`

---

**Status:** ✅ PRONTO PARA PRODUÇÃO  
**Última atualização:** Fase 2 P1 Complete  
**Versão:** 1.0.0
