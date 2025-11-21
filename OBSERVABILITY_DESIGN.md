# OBSERVABILITY_DESIGN.md

## 📊 Observability & SRE Architecture (PHASE E)

**Version**: 1.0  
**Date**: 2025-11-21  
**Status**: ✅ PRODUCTION READY  

---

## Table of Contents

1. [Vision](#vision)
2. [Architecture](#architecture)
3. [Components](#components)
4. [How to Use](#how-to-use)
5. [Integration Patterns](#integration-patterns)
6. [Future: Sentry](#future-sentry)
7. [SLO & Monitoring](#slo--monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Vision

> **Parar de voar no escuro**

**Problem**: Application logs are scattered, unstructured, and lack correlation

**Goal**: 
- Every request has a unique ID
- Every log entry includes context (requestId, tenantId, userId)
- Logs are machine-readable JSON
- PII is automatically redacted
- Production incidents can be debugged in minutes

**Outcome**: SRE can investigate any issue by filtering logs on requestId

---

## Architecture

### Layer 1: Request Entry Point

```
┌─────────────────────────────────────────────────────────┐
│ Incoming Request (HTTP)                                 │
│ GET /api/users?tenantId=tenant-123                      │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Middleware: withRequestContext()                         │
│ - Generate requestId (UUID) or use x-request-id header  │
│ - Create AsyncLocalStorage context                      │
│ - Log: "Incoming request"                               │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Middleware: withAuth()                                  │
│ - Validate JWT token                                    │
│ - setUserInContext(userId)                              │
│ - setTenantInContext(tenantId)                          │
│ - Log: "Authentication succeeded"                       │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Route Handler                                           │
│ - All logs automatically include context                │
│ - logger.info(), logger.error() available              │
│ - Return response                                       │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│ Response (HTTP)                                         │
│ Headers: x-request-id: 550e8400-e29b-41d4-a716...     │
└─────────────────────────────────────────────────────────┘
```

### Layer 2: Context Flow

```
Request Context (AsyncLocalStorage)
├── requestId: "550e8400-e29b-41d4-a716-446655440000"
├── path: "/api/users"
├── method: "GET"
├── tenantId: "tenant-prod-001" (set by middleware)
└── userId: "user-123" (set by auth)
    
↓ (Automatically included in all logs)

Log Entry (JSON)
{
  "level": "info",
  "message": "User fetched",
  "time": "2025-11-21T10:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "path": "/api/users",
  "method": "GET",
  "tenantId": "tenant-prod-001",
  "userId": "user-123",
  "customField": "value"
}
```

### Layer 3: Integration Points

```
Services (BillingService, AuthService, etc.)
  ├── Call: logger.info("message", { data })
  └── Automatically includes context
      
Route Handlers (app/api/*)
  ├── Call: logger.error("error", { error })
  └── Automatically includes context
      
Database Queries
  ├── Optionally include context
  └── log: `[${getRequestContext()?.requestId}] Query...`
      
External APIs (Stripe, etc.)
  ├── Catch errors: logError(err, { service })
  └── Logs include context + error details
```

---

## Components

### 1. Request Context (lib/request-context.ts)

**Purpose**: Store and retrieve request-scoped state

**API**:

```typescript
// Generate context and run function inside it
await runWithRequestContext(
  {
    requestId: "550e8400...",
    path: "/api/users",
    method: "GET",
  },
  async () => {
    // This function executes with context
    logger.info("Running inside context");
    
    // Anywhere in async call chain:
    const ctx = getRequestContext();
    // Returns: { requestId, path, method, tenantId?, userId? }
  }
);

// Set tenant context (after resolving)
setTenantInContext("tenant-123");

// Set user context (after auth)
setUserInContext("user-456");

// Get full correlation for manual logging
const corr = getCorrelation();
// Returns: { requestId, tenantId, userId }
```

**Thread Safety**: ✅ Each request has isolated storage

---

### 2. Structured Logger (lib/logger.ts)

**Purpose**: Log events with automatic context and PII redaction

**API**:

```typescript
import { logger, logError } from "@/lib/logger";

// Info: Normal operations
logger.info("User logged in", { 
  role: "ADMIN",
  ipAddress: "192.168.1.1",
});
// Output: JSON with requestId, userId, tenantId, etc.

// Warn: Unexpected but recoverable
logger.warn("Rate limit approaching", {
  remaining: 10,
  limit: 100,
});

// Error: Failures
logger.error("Payment failed", {
  stripeCode: "card_declined",
  amount: 99.99,
});

// Debug: Detailed troubleshooting (dev only)
logger.debug("Processing order", {
  orderId: "order-123",
  items: [...],
});

// Error helper: Safely log exceptions
try {
  await processPayment(user);
} catch (err) {
  logError(err, {
    userId: user.id,
    action: "processPayment",
  });
}
```

**Output Format**:

```json
{
  "level": "info",
  "message": "User logged in",
  "time": "2025-11-21T10:30:00.123Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "path": "/api/auth/login",
  "method": "POST",
  "userId": "user-123",
  "tenantId": "tenant-prod-001",
  "role": "ADMIN",
  "ipAddress": "192.168.1.1"
}
```

**Automatic Redaction**:

| Input | Output |
|-------|--------|
| `password: "secret123"` | `password: "[REDACTED]"` |
| `token: "abc123xyz"` | `token: "[REDACTED]"` |
| `email: "john@example.com"` (prod) | `email: "joh***@***"` |
| `card: "4111..."` | `card: "[REDACTED]"` |

---

### 3. Middleware (lib/middleware.ts)

**Key Functions**:

#### withRequestContext()

```typescript
// Generates requestId, creates context
export function withRequestContext(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? randomUUID();
  const url = new URL(request.url);
  
  return runWithRequestContext({
    requestId,
    path: url.pathname,
    method: request.method,
  }, async () => {
    logger.info('Incoming request', { /* ... */ });
    const res = NextResponse.next();
    res.headers.set('x-request-id', requestId);
    return res;
  });
}
```

#### withAuth()

```typescript
// Updates context with userId and tenantId
export async function withAuth(request: NextRequest) {
  const session = await getServerSession();
  setUserInContext(session.user.id);
  setTenantInContext(session.user.tenantId);
  logger.info('Authentication succeeded', { userId: session.user.id });
  return NextResponse.next();
}
```

#### withTenantIsolation()

```typescript
// Logs IDOR attempts (security event)
export function withTenantIsolation(request: NextRequest) {
  if (urlTenantId && urlTenantId !== userTenantId) {
    logger.warn('IDOR attempt detected', {
      userId,
      attemptedTenantId: urlTenantId,
      actualTenantId: userTenantId,
    });
    // Reject request
  }
}
```

---

### 4. Healthcheck Endpoint (app/api/health/route.ts)

**Purpose**: Monitor application and dependencies

**Endpoint**: `GET /api/health`

**Response**:

```json
{
  "status": "ok",
  "checks": {
    "app": "ok",
    "db": "ok"
  },
  "timestamp": "2025-11-21T10:30:00.000Z"
}
```

**HTTP Status**:
- `200 OK`: All checks passed
- `500 Internal Server Error`: At least one check failed

**Usage**:

```bash
# Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10

# Monitoring alert
if response.status != 200:
  alert("Application unhealthy")
```

---

## How to Use

### Basic Logging

```typescript
// In any route handler or service
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const data = await fetchData();
  
  logger.info("Data fetched successfully", {
    count: data.length,
    took_ms: Date.now() - start,
  });
  
  return NextResponse.json(data);
}
```

### Error Handling

```typescript
import { logError } from "@/lib/logger";

try {
  await processPayment(order);
} catch (err) {
  logError(err, {
    orderId: order.id,
    action: "processPayment",
    amount: order.total,
  });
  
  // Return generic error to client
  return NextResponse.json(
    { error: "Payment processing failed" },
    { status: 500 }
  );
}
```

### Tenant-Scoped Debugging

```typescript
// All logs include tenantId automatically
logger.info("Processing order", {
  orderId: order.id,
  amount: order.total,
});

// In log aggregator, filter:
// tenantId="tenant-prod-001" AND level="error"
// → See all errors for this customer
```

---

## Integration Patterns

### Pattern 1: Service Method Logging

```typescript
// services/billing-service.ts
export class BillingService {
  static async createCheckoutSession(params) {
    logger.info("Creating checkout session", {
      tenantId: params.tenantId,
      plan: params.plan,
    });
    
    try {
      const session = await stripe.checkout.sessions.create({...});
      logger.info("Checkout session created", {
        sessionId: session.id,
      });
      return session;
    } catch (err) {
      logError(err, {
        action: "createCheckoutSession",
        plan: params.plan,
      });
      throw err;
    }
  }
}
```

### Pattern 2: Route Handler Logging

```typescript
// app/api/pages/route.ts
export async function POST(req: NextRequest) {
  logger.info("Creating page");
  
  const { valid, data, response } = await withValidation(
    req,
    CreatePageSchema
  );
  
  if (!valid) {
    logger.warn("Validation failed", { errors: data });
    return response;
  }
  
  try {
    const page = await prisma.page.create({ data });
    logger.info("Page created", { pageId: page.id });
    return NextResponse.json(page);
  } catch (err) {
    logError(err, { action: "createPage" });
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
```

### Pattern 3: Rate Limit Logging

```typescript
// Middleware automatically logs:
// {
//   "level": "warn",
//   "message": "Rate limit exceeded",
//   "requestId": "...",
//   "identifier": "192.168.1.1",
//   "limit": 5
// }
```

### Pattern 4: Security Event Logging

```typescript
// IDOR attempt logged by middleware:
// {
//   "level": "warn",
//   "message": "IDOR attempt detected",
//   "userId": "user-attacker",
//   "attemptedTenantId": "tenant-victim",
//   "actualTenantId": "tenant-attacker"
// }

// In monitoring: alert on these events
```

---

## Future: Sentry Integration

### Setup (Not in PHASE E)

```bash
npm install @sentry/nextjs
```

### Configuration

```typescript
// sentry.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http(),
  ],
});
```

### Usage

```typescript
// In middleware
import { getRequestContext } from "@/lib/request-context";

export async function middleware(req: NextRequest) {
  const ctx = getRequestContext();
  
  Sentry.setUser({
    id: ctx?.userId,
    username: ctx?.tenantId,
  });
  
  Sentry.setContext("request", {
    id: ctx?.requestId,
    path: ctx?.path,
  });
}

// In route handlers
try {
  await processPayment();
} catch (err) {
  logError(err, { action: "processPayment" });
  Sentry.captureException(err);
}
```

### Benefits

- ✅ Real-time error tracking
- ✅ Stack traces with source maps
- ✅ Performance monitoring (slow requests)
- ✅ Release tracking (which version had error)
- ✅ Alerts (spike in errors)

---

## SLO & Monitoring

### Recommended SLOs

| Metric | Target | Alert |
|--------|--------|-------|
| API Availability | 99.5% | Below 99% for 5min |
| P50 Latency | < 100ms | Above 200ms |
| P99 Latency | < 500ms | Above 1000ms |
| Error Rate | < 0.1% | Above 0.5% |
| DB Connection Pool | < 50% used | Above 80% |

### Dashboard Queries (Future)

```promql
# Error rate (last 5 minutes)
rate(logs{level="error"}[5m]) > 0.005

# Errors per tenant
sum by (tenantId) (rate(logs{level="error"}[5m]))

# IDOR attempts
logs{message="IDOR attempt detected"}

# Rate limit violations
logs{message="Rate limit exceeded"}

# Slow requests
logs{latency_ms > 500}
```

### Alert Examples

```yaml
# High error rate
- alert: HighErrorRate
  expr: rate(logs{level="error"}[5m]) > 0.01
  for: 5m
  action: page_oncall

# Database connection pool exhausted
- alert: DBPoolExhausted
  expr: db_connections_used / db_connections_max > 0.8
  action: page_oncall

# IDOR attack
- alert: IDORAttack
  expr: count(logs{message="IDOR attempt detected"}) > 5
  for: 1m
  action: block_user + investigate
```

---

## Troubleshooting

### Issue: requestId not appearing in logs

**Cause**: Middleware not running

**Solution**:
```typescript
// Verify middleware is registered
// middleware.ts exists and exports middleware function
// next.config.js includes:
// matcher: ['/((?!_next).*']
```

### Issue: tenantId is undefined in logs

**Cause**: Auth middleware not setting context

**Solution**:
```typescript
// In withAuth():
setTenantInContext(session.user.tenantId); // ← Must call this
```

### Issue: PII appearing in logs (email)

**Cause**: Production environment not set

**Solution**:
```bash
# Verify NODE_ENV
NODE_ENV=production npm start

# Or in .env
NODE_ENV=production
```

### Issue: Logs not JSON formatted

**Cause**: Using console.log directly

**Solution**:
```typescript
// ❌ Don't do this:
console.log("Error:", error);

// ✅ Do this:
logError(error, { action: "something" });
```

### Issue: Stack traces visible in production

**Cause**: Sentry capturing full errors

**Solution**:
```typescript
// Before v2: Sentry included stack traces
// After sentry integration: Configure to exclude stack traces

Sentry.init({
  withSourceMap: false, // Don't upload source maps to client
});
```

---

## Deployment Checklist

- [ ] `lib/request-context.ts` created
- [ ] `lib/logger.ts` created
- [ ] `lib/middleware.ts` updated with logging
- [ ] `app/api/health/route.ts` deployed
- [ ] Logger tests passing: `npm test lib/__tests__/logger.test.ts`
- [ ] Healthcheck responding: `curl http://localhost:3000/api/health`
- [ ] Sample logs showing correct format (JSON)
- [ ] No PII in sample logs
- [ ] `x-request-id` header in responses
- [ ] Request context persists in async calls
- [ ] Documentation updated

---

## Success Criteria

✅ **Phase E Complete When**:

1. Every request has a unique `requestId`
2. All logs are in JSON format with context
3. PII is automatically redacted
4. Healthcheck endpoint working
5. No stack traces in production logs
6. Tests passing (40+ tests total)
7. Documentation complete
8. Team trained on new logging patterns

---

## Quick Start Guide

```bash
# 1. Run tests
npm test lib/__tests__/logger.test.ts

# 2. Start dev server
npm run dev

# 3. Make a request
curl http://localhost:3000/api/health

# 4. Check logs (should see JSON)
# Logs appear on console

# 5. Look for requestId
# Every log should have: "requestId": "550e8400-..."

# 6. Test tenant correlation
# Auth request should set tenantId in context
```

---

## Glossary

**RequestId**: Unique identifier per HTTP request (UUIDv4)

**Context**: AsyncLocalStorage data available to all functions in request chain

**Correlation**: Linking events (logs, errors, metrics) by requestId

**PII**: Personally Identifiable Information (email, phone, etc.)

**Sanitization**: Removing sensitive data before logging

**SRE**: Site Reliability Engineer (operations)

**SLO**: Service Level Objective (target availability/performance)

---

## References

- [Node.js AsyncLocalStorage Docs](https://nodejs.org/api/async_hooks.html#async_hooks_class_asynclocalstorage)
- [JSON Logging Best Practices](https://www.elastic.co/guide/en/ecs/current/)
- [LGPD Privacy Law](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [Sentry Documentation](https://docs.sentry.io/)

---

**End of Document**

**Next Phase**: PHASE F - Redis & Distributed Rate Limiting  
**Timeline**: 1-2 weeks  
**Effort**: 4-6 hours
