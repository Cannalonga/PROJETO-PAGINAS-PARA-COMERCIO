# FASE 2 — P1 OBSERVABILITY & RATE LIMITING

**Status:** Planejado  
**Dependências:** P0 Security Layer (✅ Completo)  
**Tempo Estimado:** 4-6 horas  
**Sequência:** Rate Limiting → Sentry → Structured Logging  

---

## 🎯 Objetivos P1

| Objetivo | Por quê | Benefício |
|----------|---------|-----------|
| **Rate Limiting** | Proteger endpoints públicos de brute-force | Segurança + UX (sem spam) |
| **Sentry** | Parar de ter erros silenciosos | Debugging + proatividade |
| **Structured Logging** | Rastreabilidade total de operações | Compliance + DevOps |

---

## 🔹 P1.1 — RATE LIMITING (PRIORIDADE ALTA)

### Problema

Sem rate limiting:
- Login: Qualquer um pode brute-force senha infinitamente
- Reset de senha: Spam infinito em email
- APIs públicas: DOS simples (muitas requisições)

### Solução

**Package:** `rate-limiter-flexible` + `redis` (ou in-memory para começar)

```bash
npm install rate-limiter-flexible redis
```

### Arquitetura

```
lib/
  └── rate-limiter.ts          ← Configuração central
      ├── createRateLimiter()  ← Factory function
      ├── rateLimitByIp()      ← Middleware genérico
      └── rateLimitByUserId()  ← Para authenticated endpoints

middleware.ts  ← Apply rate limits globalmente (opcional)
  └── Rate limit em /auth/login, /auth/reset-password

app/api/auth/
  ├── login/route.ts           ← +3 linhas: rate limit check
  └── reset-password/route.ts  ← +3 linhas: rate limit check
```

### Implementação Template

**lib/rate-limiter.ts:**

```typescript
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { createClient } from 'redis';

// Escolher Redis em prod, memória em dev
const useRedis = process.env.NODE_ENV === 'production';

const client = useRedis ? createClient() : null;

// Rate limiters específicos
export const loginLimiter = new RateLimiterRedis({
  storeClient: client,
  keyPrefix: 'rl:login',
  points: 5,           // 5 tentativas
  duration: 900,       // por 15 minutos
});

export const resetPasswordLimiter = new RateLimiterRedis({
  storeClient: client,
  keyPrefix: 'rl:reset',
  points: 3,           // 3 tentativas
  duration: 3600,      // por 1 hora
});

export const apiPublicLimiter = new RateLimiterRedis({
  storeClient: client,
  keyPrefix: 'rl:api',
  points: 100,         // 100 requisições
  duration: 60,        // por minuto
});

// Helper function
export async function checkRateLimit(
  limiter: RateLimiterRedis | RateLimiterMemory,
  key: string
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  try {
    const res = await limiter.consume(key);
    return {
      allowed: true,
      remaining: res.remainingPoints,
      resetTime: new Date(Date.now() + res.msBeforeNext),
    };
  } catch (rateLimiterRes) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(Date.now() + rateLimiterRes.msBeforeNext),
    };
  }
}
```

**app/api/auth/login/route.ts:**

```typescript
export const POST = safeHandler(async (req: NextRequest, ctx) => {
  // 1. Rate limit check (PRIMEIRO, antes de CPU-heavy ops)
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  const rateLimitResult = await checkRateLimit(loginLimiter, `login:${ip}`);
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many login attempts. Try again later.',
          resetTime: rateLimitResult.resetTime.toISOString(),
        },
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimitResult.resetTime.getTime() / 1000),
        },
      }
    );
  }

  // 2. Normal login logic...
  const body = await req.json();
  // ... autenticação ...

  return NextResponse.json({ success: true, user });
});
```

### Endpoints a Proteger (Inicialmente)

```
Priority 1 (crítico):
  POST /api/auth/login              ← 5 tentativas/15min
  POST /api/auth/reset-password     ← 3 tentativas/1h
  POST /api/auth/register           ← 10 tentativas/1h

Priority 2 (importante):
  GET /api/tenants                  ← 100 req/min por IP
  POST /api/users                   ← 50 req/min por tenant
  GET /api/audit-logs               ← 200 req/min por user
```

### Configuração Redis (Production)

```bash
# Se usar Redis externo (DigitalOcean, AWS ElastiCache, etc)
REDIS_URL=redis://:password@host:port

# Ou local (development)
docker run -d -p 6379:6379 redis:latest
```

### Testes

```bash
# Teste manual: tentar login 6x + rapid succession
# Esperado: 429 Too Many Requests na 6ª tentativa

for i in {1..7}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"wrong"}'
  sleep 0.5
done
# Esperado: Últimas 2 tentativas retornam 429
```

---

## 🔹 P1.2 — SENTRY INTEGRATION

### Problema

Errors acontecem em produção e ninguém descobre até usuário reclamar.

### Solução

Capturar errors automaticamente + send to Sentry dashboard

```bash
npm install @sentry/nextjs @sentry/tracing
```

### Arquitetura

```
lib/
  └── sentry.ts              ← Inicialização + config
      ├── initSentry()       ← Setup em servidor
      └── captureException() ← Wrapper para erros críticos

app/
  └── global-error.ts        ← Fallback error boundary

middleware.ts
  └── Integração com Sentry tracing (opcional, mais tarde)
```

### Implementação Template

**lib/sentry.ts:**

```typescript
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  const isDev = process.env.NODE_ENV === 'development';
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('[SENTRY] DSN not configured, skipping init');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: isDev ? 1.0 : 0.1, // 100% in dev, 10% in prod
    
    // Ignore certain errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection',
      'NetworkError',
    ],

    // Release version (from package.json)
    release: process.env.npm_package_version,

    // Capture breadcrumbs
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
    ],

    // Before send (adicionar contexto)
    beforeSend(event, hint) {
      // Não enviar erros de desenvolvimento
      if (isDev && event.level === 'error') {
        console.log('[SENTRY-DEV]', hint.originalException);
        return null; // Skip
      }

      return event;
    },
  });
}

// Wrapper para capturar erros críticos
export function captureCriticalError(
  error: Error,
  context: Record<string, any> = {}
) {
  Sentry.captureException(error, {
    tags: {
      severity: 'critical',
    },
    extra: context,
  });
}

// Para erros de negócio (não críticos)
export function captureBusinessError(
  message: string,
  context: Record<string, any> = {}
) {
  Sentry.captureMessage(message, {
    level: 'warning',
    extra: context,
  });
}
```

**Integração em safeHandler:**

```typescript
// lib/api-helpers.ts — modificar safeHandler existente

export function safeHandler(
  handler: (req: NextRequest, ctx: RequestContext) => Promise<Response>
) {
  return async (req: NextRequest) => {
    try {
      const ctx = extractContext(req);
      return await handler(req, ctx);
    } catch (error) {
      // Já temos logging, agora add Sentry
      const err = error instanceof Error ? error : new Error(String(error));

      // Capture em Sentry
      Sentry.captureException(err, {
        tags: {
          handler: 'api_route',
          method: req.method,
          path: req.nextUrl.pathname,
        },
        extra: {
          requestId: ctx?.requestId,
          userId: ctx?.userId,
          tenantId: ctx?.tenantId,
        },
      });

      return errorResponse(
        'INTERNAL_SERVER_ERROR',
        err.message,
        undefined,
        ctx?.requestId
      );
    }
  };
}
```

### Setup Sentry

1. Criar conta em https://sentry.io
2. Criar projeto Next.js
3. Copiar DSN
4. Add to `.env.local`:
   ```
   SENTRY_DSN=https://key@sentry.io/project-id
   SENTRY_ORG=your-org
   SENTRY_PROJECT=your-project
   ```
5. Inicializar em server startup:
   ```typescript
   // app/layout.tsx ou next.config.js
   import { initSentry } from '@/lib/sentry';
   initSentry();
   ```

### Dashboard Sentry

Após setup, você terá:
- ✅ Real-time error alerts
- ✅ Source maps para production debugging
- ✅ Performance tracing (opcional)
- ✅ Integração com Slack/Email

---

## 🔹 P1.3 — STRUCTURED LOGGING (Pino)

### Problema

```
❌ console.log("user created")
❌ console.error("Error at xyz")
❌ Sem contexto tenantId, userId, requestId
```

### Solução

```bash
npm install pino pino-http pino-pretty
```

Criar logger central que emite JSON em prod, bonito em dev.

### Arquitetura

```
lib/
  └── logger.ts              ← Pino config + setup
      ├── createLogger()     ← Factory
      ├── withContext()      ← Add tenantId, userId, etc
      └── child()            ← Nested logging

app/api/
  └── Todos routes           ← Substituir console.log

middleware.ts
  └── logger.trace()         ← Log request/response
```

### Implementação Template

**lib/logger.ts:**

```typescript
import pino, { Logger } from 'pino';

const isDev = process.env.NODE_ENV === 'development';

// Base logger
const baseLogger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  
  // Pretty printing em desenvolvimento
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,

  // Em produção, enviar pra stack de logs (ELK, Datadog, etc)
  // Aqui será JSON puro, que pode ser coletado
});

// Logger com contexto (RequestContext)
export function createContextLogger(
  requestId: string,
  userId?: string,
  tenantId?: string
): Logger {
  return baseLogger.child({
    requestId,
    userId,
    tenantId,
  });
}

export const logger = baseLogger;
```

**Substituir console.log em handlers:**

```typescript
// ❌ ANTES
console.log('User created:', { userId, email });
console.error('Error:', error.message);

// ✅ DEPOIS
const log = createContextLogger(ctx.requestId, ctx.userId, ctx.tenantId);
log.info({ userId: newUser.id, email: newUser.email }, 'User created');
log.error({ err: error, errorCode }, 'Failed to create user');
```

### Log Levels

```typescript
log.debug({ detail: '...' }, 'Debug info')       // Development only
log.info({ event: '...' }, 'Informational')      // Normal operations
log.warn({ issue: '...' }, 'Warning')            // Suspicious
log.error({ err, code }, 'Error occurred')       // Errors
log.fatal({ err }, 'Fatal error')                // Unrecoverable
```

### ELK Stack (Optional Production)

Para coletar logs em produção:

```yaml
# docker-compose.yml (opcional)
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.10.0
    
  kibana:
    image: docker.elastic.co/kibana/kibana:7.10.0
    
  logstash:
    image: docker.elastic.co/logstash/logstash:7.10.0
```

Pino emite JSON que Logstash coleta → Elasticsearch → Kibana (interface)

---

## 📊 Comparação: Rate Limiting vs Sentry vs Logging

| Aspecto | Rate Limiting | Sentry | Logging |
|---------|---------------|--------|---------|
| **Protege contra** | Brute-force, DOS | Silent errors | Lost context |
| **Quando ativa** | Em produção (Redis) | Sempre | Always |
| **Performance** | O(1) check + Redis | Async (não-blocking) | Async (não-blocking) |
| **Custo** | Redis infra | Sentry SaaS (free tier ok) | Local disk / ELK |
| **Prioridade** | ALTA (security) | ALTA (debugging) | MÉDIA (observability) |

---

## 🔄 Ordem de Implementação

### Dia 1 (2-3 horas): Rate Limiting
1. Implementar `lib/rate-limiter.ts`
2. Adicionar a `/api/auth/login`
3. Testar brute-force (requisições rápidas)
4. Add a `/api/auth/reset-password`

### Dia 2 (1-2 horas): Sentry
1. Setup Sentry account + DSN
2. Implementar `lib/sentry.ts`
3. Integrar em `safeHandler()` existente
4. Testar capturando erro proposital

### Dia 3 (2-3 horas): Structured Logging
1. Implementar `lib/logger.ts` com Pino
2. Substituir `console.log` em 3-4 handlers principais
3. Testar que logs em JSON aparecem em prod
4. Opcional: Setup local ELK para visualizar

**Total: 5-8 horas para P1 completo** ✅

---

## 📦 Dependências Necessárias

```bash
npm install rate-limiter-flexible redis @sentry/nextjs pino pino-http pino-pretty
```

**Tamanho adicionado:** ~50 MB (negligível)

---

## ✅ Checklist P1 Final

- [ ] P1.1 Rate Limiting
  - [ ] lib/rate-limiter.ts criado
  - [ ] Aplicado em /api/auth/login
  - [ ] Aplicado em /api/auth/reset-password
  - [ ] Testes manuais passam (429 após limite)

- [ ] P1.2 Sentry
  - [ ] Conta criada + DSN obtido
  - [ ] lib/sentry.ts implementado
  - [ ] Integrado em safeHandler()
  - [ ] Erro de teste capturado corretamente

- [ ] P1.3 Logging Estruturado
  - [ ] lib/logger.ts com Pino
  - [ ] console.log substituído em handlers
  - [ ] requestId propagado em todos os logs
  - [ ] Logs JSON aparecem em produção

---

## 🚀 Próximas Fases (Além de P1)

**P2 — Data & Analytics:**
- Track user behavior
- Page view metrics
- Business analytics

**P3 — Performance:**
- Caching strategies
- Query optimization
- CDN integration

**P4 — DevOps:**
- Automated deployment
- Monitoring dashboards
- Incident response

---

## 📝 Notas

- Rate limiting com Redis é escalável (múltiplos servidores compartilham estado)
- Sentry é gratuito até 5k errors/mês (plenty para começar)
- Pino em JSON + ELK é enterprise-grade logging
- Todos 3 componentes são non-breaking para código existente

**Próximo passo:** Após merge de P0, comece com P1.1 (Rate Limiting) — é o mais crítico para segurança.
