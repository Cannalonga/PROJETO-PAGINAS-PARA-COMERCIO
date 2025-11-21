# Security & Architecture Debt - Phase A-B-C Analysis

**Date**: 2025-11-21  
**Status**: ⚠️ IDENTIFIED RISKS - Action Plan Required  
**Impact**: Medium → High (on security posture, scalability)

---

## Executive Summary

Phase A-B-C implementation is **technically sound** but has **critical gaps** before production:

| Risk | Severity | Impact | Status |
|------|----------|--------|--------|
| Coverage Parcial de Rotas | 🔴 HIGH | Other routes (/api/users, /api/tenants, /api/billing) lack auth/RBAC | ⏳ Open |
| Rate Limiting In-Memory | 🟠 MEDIUM | No horizontal scaling, resets on restart | ⏳ Open |
| Testes Insuficientes | 🟠 MEDIUM | Only business logic tested, not actual routes | ⏳ Open |
| Migração Banco Pendente | 🟠 MEDIUM | deletedAt + indexes ainda não em prod | ⏳ Open |
| Observabilidade Mínima | 🟠 MEDIUM | Sem logs de segurança centralizados | ⏳ Open |

---

## 1. RISK: Coverage Parcial de Rotas 🔴

### Current State
✅ Secured:
- `/api/pages` - withAuthHandler, RBAC, IDOR prevention
- `/api/uploads` - Rate limit + auth
- `/api/templates` - RBAC enforcement

❌ Potentially Exposed:
- `/api/users` - Existing routes may lack consistent RBAC
- `/api/tenants` - Need tenant isolation validation
- `/api/billing` - PCI compliance + auth required
- `/api/webhooks/stripe` - Webhook signature validation
- `/api/analytics` - Rate limit needed
- `/api/seo/*` - Public routes need rate limiting

### Risk Scenario
```
Developer creates /api/new-feature without:
1. withAuthHandler wrapper
2. RBAC enforcement
3. Tenant scoping in queries
→ Data leak or unauthorized access
```

### Action Plan

#### Phase 1: Audit Existing Routes (1-2 hours)
```bash
# 1. Find all route.ts files
find app/api -name "route.ts" -type f

# 2. For each route, validate:
# - Has withAuthHandler?
# - Validates tenantId from session (not from body)?
# - Has Zod schema?
# - Has appropriate rate limit profile?
```

#### Phase 2: Standardize Route Template (30 min)
Create `lib/templates/secure-route.template.ts`:
```typescript
/**
 * Template: Secure API Route Pattern
 * 
 * Checklist:
 * [ ] Rate Limiting (if needed)
 * [ ] Authentication (withAuthHandler)
 * [ ] RBAC Check (if protected resource)
 * [ ] Tenant Isolation
 * [ ] Input Validation (Zod)
 * [ ] Error Handling (with status codes)
 */

import { NextResponse } from 'next/server';
import { withAuthHandler } from '@/lib/auth/with-auth-handler';
import { enforceRateLimitProfile } from '@/lib/rate-limit-helpers';
import { z } from 'zod';

const inputSchema = z.object({
  // Your fields here
});

export const GET = withAuthHandler(
  async ({ session, tenant, req }) => {
    try {
      // 1️⃣ RATE LIMIT (if applicable)
      // const limit = enforceRateLimitProfile(req, 'route-key', 'authenticated');
      // if (!limit.success) return NextResponse.json(..., { status: 429 });

      // 2️⃣ RBAC CHECK (if applicable)
      const allowedRoles = ['SUPERADMIN', 'OPERADOR'];
      if (!allowedRoles.includes(session.role)) {
        return NextResponse.json(
          { success: false, message: 'Forbidden' },
          { status: 403 }
        );
      }

      // 3️⃣ TENANT ISOLATION (automatic via withAuthHandler)
      // tenant.id is trusted and from session

      // 4️⃣ INPUT VALIDATION
      // const data = inputSchema.parse(await req.json());

      // 5️⃣ BUSINESS LOGIC
      // const result = await SomeService.doSomething(tenant.id, data);

      return NextResponse.json({ success: true, data: result });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Internal Server Error' },
        { status: 500 }
      );
    }
  },
  { requireTenant: true }
);
```

#### Phase 3: Apply to All Routes (2-4 hours)
Create checklist for each existing route:
- `/api/users/route.ts`
- `/api/users/[id]/route.ts`
- `/api/tenants/route.ts`
- `/api/tenants/[id]/route.ts`
- `/api/billing/*`
- `/api/webhooks/stripe`
- `/api/analytics/*`
- `/api/seo/*`

### Deliverable
- [ ] `lib/templates/secure-route.template.ts` created
- [ ] All routes audited + documented in `ROUTE_AUDIT.md`
- [ ] Missing protections identified + prioritized

---

## 2. RISK: Rate Limiting In-Memory 🟠

### Current State
✅ Working:
- Sliding window algorithm implemented
- 6 profiles (auth, public, authenticated, upload, analytics, webhook)
- Applied to /api/uploads

❌ Limitations:
- In-memory store (resets on restart)
- No sharing across instances
- **Doesn't protect against distributed DoS**
- Single instance can be overwhelmed

### Risk Scenario
```
Attacker runs:
  for i in {1..20}; do
    curl -X POST http://localhost:3000/api/uploads &
  done

→ Rate limiter tracks locally only
→ Across 5 instances = 5 * 10 = 50 allowed uploads
→ Database gets hammered
```

### Action Plan

#### Phase 1: Create Redis Rate Limiter (2-3 hours)
```typescript
// lib/rate-limit-redis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function enforceRateLimitRedis(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number; resetAt: Date }> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Get count from Redis
  const count = await redis.zcount(key, windowStart, now);

  if (count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(windowStart + windowSeconds * 1000),
    };
  }

  // Add current request
  await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  await redis.expire(key, windowSeconds);

  return {
    success: true,
    remaining: maxRequests - count - 1,
    resetAt: new Date(now + windowSeconds * 1000),
  };
}
```

#### Phase 2: Maintain Backward Compatibility
```typescript
// lib/rate-limit-factory.ts
export function getRateLimiter() {
  if (process.env.UPSTASH_REDIS_URL) {
    return enforceRateLimitRedis; // Use Redis in production
  }
  return enforceRateLimitMemory; // Fallback to memory in dev
}

// In routes, nothing changes:
const limiter = getRateLimiter();
const result = await limiter(key, limit, window);
```

#### Phase 3: Migration Plan
- [ ] `.env.local` updated with Upstash credentials (staging/prod only)
- [ ] Redis rate limiter created
- [ ] Switch to Redis in staging
- [ ] Monitor performance (Redis latency should be <50ms)
- [ ] Switch to Redis in production

### Deliverable
- [ ] `lib/rate-limit-redis.ts` created
- [ ] `lib/rate-limit-factory.ts` routing logic
- [ ] `.env.example` updated with Upstash credentials
- [ ] Staging deployment with Redis

---

## 3. RISK: Testes Insuficientes 🟠

### Current State
✅ Tested:
- PageService.ts (unit tests)
- rate-limit.ts (algorithm tests)

❌ Missing:
- Actual route handlers (GET, POST, etc.)
- Integration tests (E2E flow)
- IDOR prevention in real routes
- Rate limit headers validation
- RBAC edge cases

### Risk Scenario
```
Refactor withAuthHandler signature:
- Old: ({ session, tenant, req }) => {...}
- New: ({ session, tenant }) => {...}  // Removed req!

→ All routes that use req suddenly break
→ Tests don't catch it (only service tests exist)
→ Goes to production
→ 500 errors for all POST endpoints
```

### Action Plan

#### Phase 1: Route Handler Tests (2-3 hours)

Create `__tests__/api/pages.route.test.ts`:
```typescript
describe('Pages Route Handlers', () => {
  describe('GET /api/pages', () => {
    it('should return 401 without auth', async () => {
      const res = await fetch('/api/pages');
      expect(res.status).toBe(401);
    });

    it('should return tenant-scoped pages with auth', async () => {
      const res = await fetch('/api/pages', {
        headers: { Authorization: `Bearer ${validToken}` }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      data.pages.forEach(p => expect(p.tenantId).toBe(tenant.id));
    });

    it('should apply rate limit headers', async () => {
      const res = await fetch('/api/pages', { headers: { Authorization: token } });
      expect(res.headers.get('X-RateLimit-Limit')).toBeDefined();
      expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined();
    });
  });

  describe('POST /api/pages', () => {
    it('should create page for authenticated user', async () => {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Page',
          slug: 'new-page',
          status: 'DRAFT',
          content: 'Content'
        })
      });
      expect(res.status).toBe(201);
      const page = await res.json();
      expect(page.data.tenantId).toBe(tenant.id);
    });

    it('should reject CLIENTE_USER role', async () => {
      const clientToken = generateToken({ role: 'CLIENTE_USER' });
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { Authorization: clientToken },
        body: JSON.stringify({...})
      });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/pages/[id]', () => {
    it('should soft delete (archive) page', async () => {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
        headers: { Authorization: token }
      });
      expect(res.status).toBe(204);

      // Verify archived
      const getRes = await fetch(`/api/pages/${pageId}`, {
        headers: { Authorization: token }
      });
      const page = await getRes.json();
      expect(page.data.status).toBe('ARCHIVED');
    });

    it('should return 404 for other tenant page', async () => {
      const otherTenantPageId = 'page-from-tenant-b';
      const res = await fetch(`/api/pages/${otherTenantPageId}`, {
        method: 'DELETE',
        headers: { Authorization: tenantAToken }
      });
      expect(res.status).toBe(404);
    });
  });
});
```

#### Phase 2: E2E Tests with Playwright (2-3 hours)

Create `e2e/pages.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Pages E2E Flow', () => {
  test('Complete page lifecycle: create → read → update → delete', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:text("Login")');
    await page.waitForNavigation();

    // 2. Navigate to pages
    await page.goto('/dashboard/pages');
    await expect(page.locator('text=Pages')).toBeVisible();

    // 3. Create page
    await page.click('button:text("New Page")');
    await page.fill('input[name="title"]', 'E2E Test Page');
    await page.fill('input[name="slug"]', 'e2e-test-page');
    await page.click('button:text("Create")');
    await expect(page.locator('text=E2E Test Page')).toBeVisible();

    // 4. Edit page
    await page.click('button[data-test="edit-page"]');
    await page.fill('input[name="title"]', 'Updated E2E Page');
    await page.click('button:text("Save")');
    await expect(page.locator('text=Updated E2E Page')).toBeVisible();

    // 5. Access page in listing
    await page.goto('/dashboard/pages');
    await expect(page.locator('text=Updated E2E Page')).toBeVisible();

    // 6. Delete page
    await page.click('button[data-test="delete-page"]');
    await page.click('button:text("Confirm Delete")');
    await expect(page.locator('text=Updated E2E Page')).not.toBeVisible();
  });

  test('Rate limiting on uploads: 10 files per hour', async ({ page }) => {
    await page.goto('/login');
    // ... login steps

    // Upload 10 files (should succeed)
    for (let i = 0; i < 10; i++) {
      const response = await page.request.post('/api/uploads', {
        multipart: { file: Buffer.from(`test ${i}`) }
      });
      expect(response.status()).toBe(200);
    }

    // 11th upload (should be blocked)
    const blockedResponse = await page.request.post('/api/uploads', {
      multipart: { file: Buffer.from('test 11') }
    });
    expect(blockedResponse.status()).toBe(429);
    expect(blockedResponse.headers()['retry-after']).toBeDefined();
  });
});
```

#### Phase 3: Security Regression Tests (1 hour)

Create `__tests__/security/idor.test.ts`:
```typescript
describe('IDOR Prevention', () => {
  it('should not allow user A to edit user B page', async () => {
    // Create page in Tenant A
    const pageA = await createPageInTenant(tenantA.id);

    // Try to edit with Tenant B token
    const res = await fetch(`/api/pages/${pageA.id}`, {
      method: 'PUT',
      headers: { Authorization: tenantBToken },
      body: JSON.stringify({ title: 'Hacked' })
    });

    expect(res.status).toBe(404); // Or 403, but 404 is better (doesn't leak existence)
  });

  it('should not list user B pages to user A', async () => {
    const res = await fetch('/api/pages', {
      headers: { Authorization: tenantAToken }
    });
    const pages = await res.json();
    pages.data.pages.forEach(p => {
      expect(p.tenantId).toBe(tenantA.id);
    });
  });
});
```

### Deliverable
- [ ] `__tests__/api/pages.route.test.ts` (route integration tests)
- [ ] `e2e/pages.spec.ts` (Playwright E2E)
- [ ] `__tests__/security/idor.test.ts` (IDOR prevention regression)
- [ ] All tests passing: `npm test && npx playwright test`

---

## 4. RISK: Migração Banco Pendente 🟠

### Current State
✅ Schema updated: `db/prisma/schema.prisma` has `deletedAt DateTime?`

❌ Migration not applied:
- Development: Not run
- Staging: Not run
- Production: Not run
→ Database still missing `deletedAt` column + indexes

### Risk Scenario
```
Code: DELETE /api/pages/[id] tries:
  await prisma.page.updateMany({
    data: { deletedAt: new Date() }
  });

Database: Column doesn't exist yet!
→ Error: "Column 'deletedAt' does not exist"
→ 500 error, page delete fails
```

### Action Plan

#### Phase 1: Create and Verify Migration (10 min)
```bash
# Generate migration (do NOT push to prod yet)
cd c:\Users\rafae\Desktop\PROJETOS\ ...
npx prisma migrate dev --name add_page_soft_delete
```

This creates `db/prisma/migrations/[timestamp]_add_page_soft_delete/migration.sql`:
```sql
-- AlterTable
ALTER TABLE "Page" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD INDEX "Page_deletedAt_idx" ON "Page"("deletedAt");
```

#### Phase 2: Test in Local Environment (10 min)
```bash
# Verify migration works locally
npx prisma migrate status  # Should show "All migrations up to date"

# Test queries work with deletedAt
npx prisma studio  # Open UI, check Page table has deletedAt column
```

#### Phase 3: Staging Deployment (20 min)
```bash
# 1. Deploy code to staging
git push origin main

# 2. Deploy migrations
npx prisma migrate deploy  # Applies all pending migrations

# 3. Verify in staging
SELECT * FROM "Page" LIMIT 1;  # Should have deletedAt column
```

#### Phase 4: Production Deployment (30 min)
```bash
# 1. Code deployment (standard CI/CD)
# 2. Run migrations
npx prisma migrate deploy

# 3. Verify critical queries still work
# Test: GET /api/pages → should return pages (even if deletedAt logic not yet used)
# Test: POST /api/pages → create page (deletedAt should be NULL)
# Test: DELETE /api/pages/[id] → should work now (set deletedAt)
```

### Deliverable
- [ ] `npx prisma migrate dev` run locally
- [ ] Migration file verified: `db/prisma/migrations/[timestamp]_add_page_soft_delete/migration.sql`
- [ ] Tests pass with new column
- [ ] Staging migration deployed
- [ ] Production migration planned + communicated to team

---

## 5. RISK: Observabilidade & Audit Logs 🟠

### Current State
✅ Errors caught and returned
❌ Missing:
- Structured logs (JSON format)
- Audit trail by tenant
- Security events (401, 403, 429)
- Centralized log sink (Sentry, DataDog, etc.)

### Risk Scenario
```
Production incident:
"Why were user's pages deleted?"

Logs:
  [INFO] Process started
  [INFO] Build complete
  (no context about who deleted what, when, why)
→ Cannot investigate → Cannot comply with LGPD

vs.

Structured logs:
  {
    "timestamp": "2025-11-21T14:22:30Z",
    "tenant": "tenant-123",
    "user": "user-456",
    "action": "PAGE_DELETE",
    "resource": "page-789",
    "status": "success",
    "ip": "192.168.1.1",
    "role": "CLIENTE_ADMIN"
  }
→ Full audit trail → Can investigate + comply
```

### Action Plan

#### Phase 1: Structured Logger (1 hour)

Create `lib/logger.ts`:
```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty', // For development
    options: {
      colorize: true,
    },
  },
});

export function logSecurityEvent(event: {
  action: string; // 'PAGE_CREATE', 'PAGE_DELETE', 'UPLOAD_REJECTED', etc.
  tenant: string;
  user?: string;
  resource?: string;
  status: 'success' | 'blocked' | 'failed';
  reason?: string;
  ip: string;
  role?: string;
}) {
  logger.info(
    {
      type: 'SECURITY_EVENT',
      ...event,
      timestamp: new Date().toISOString(),
    },
    `[${event.action}] ${event.status.toUpperCase()}`
  );
}

export function logErrorEvent(error: {
  endpoint: string;
  status: number;
  message: string;
  tenant?: string;
  error: unknown;
}) {
  logger.error(
    {
      type: 'ERROR',
      ...error,
      timestamp: new Date().toISOString(),
    },
    `[${error.status}] ${error.endpoint}`
  );
}
```

#### Phase 2: Integrate into Routes (1-2 hours)

Example in `app/api/pages/[pageId]/route.ts`:
```typescript
import { logSecurityEvent, logErrorEvent } from '@/lib/logger';

export const DELETE = withAuthHandler(
  async ({ session, tenant, params, req }) => {
    try {
      const pageId = pageIdSchema.parse(params?.pageId);

      // ✅ Log attempt
      logSecurityEvent({
        action: 'PAGE_DELETE',
        tenant: tenant.id,
        user: session.user.id,
        resource: pageId,
        status: 'success', // or 'blocked' if RBAC fails
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        role: session.role,
      });

      const page = await PageService.getPageById(tenant.id, pageId);
      if (!page) {
        return NextResponse.json(
          errorResponse('Página não encontrada'),
          { status: 404 }
        );
      }

      await PageService.deletePage(tenant.id, pageId);
      return NextResponse.json(null, { status: 204 });
    } catch (error) {
      logErrorEvent({
        endpoint: 'DELETE /api/pages/[pageId]',
        status: 500,
        message: error instanceof Error ? error.message : 'Unknown error',
        tenant: tenant.id,
        error,
      });

      return NextResponse.json(
        errorResponse('Erro ao deletar página'),
        { status: 500 }
      );
    }
  },
  { requireTenant: true }
);
```

#### Phase 3: Centralized Logging (Sentry/DataDog) (2-3 hours)

In `.env.local` (staging/prod):
```
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=info
```

In `lib/logger.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}

export function logSecurityEvent(event: SecurityEvent) {
  logger.info(event);
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(`[${event.action}] ${event.status}`, {
      contexts: { security: event },
      level: event.status === 'blocked' ? 'warning' : 'info',
    });
  }
}
```

### Deliverable
- [ ] `lib/logger.ts` created (pino + Sentry)
- [ ] `logSecurityEvent()` calls in all sensitive routes (auth, RBAC, rate limit)
- [ ] `logErrorEvent()` calls in error handlers
- [ ] Staging deployment with Sentry Dashboard live
- [ ] Team trained on reading audit logs

---

## 6. Security Playbook 📋

Create `SECURITY_PLAYBOOK.md` (reference document):

### How to Create a Secure API Route

**Checklist**:
1. Rate Limiting (if public/sensitive)
2. Authentication (withAuthHandler)
3. RBAC Check (if protected)
4. Tenant Isolation
5. Input Validation (Zod)
6. Service Call
7. Logging (security event)

**Example**:
```typescript
// 1. Rate limit (if needed)
const limit = enforceRateLimitProfile(req, 'key', 'authenticated');
if (!limit.success) return 429;

// 2. Auth + tenant context
export const POST = withAuthHandler(
  async ({ session, tenant, req }) => {
    // 3. RBAC
    if (!['SUPERADMIN', 'OPERADOR'].includes(session.role))
      return 403;

    // 4. Tenant scoping (automatic via withAuthHandler)
    // 5. Validation
    const data = schema.parse(await req.json());

    // 6. Service
    const result = await Service.method(tenant.id, data);

    // 7. Logging
    logSecurityEvent({ action, tenant, status: 'success' });
    return 200;
  }
);
```

---

## 7. Deployment Checklist 🚀

### Before Staging
- [ ] `npm test` passing
- [ ] `npm run build` passing
- [ ] `npx prisma migrate dev` in local environment
- [ ] Manual API tests (Postman/curl):
  - [ ] 401 without auth
  - [ ] 403 without proper role
  - [ ] 404 for cross-tenant access
  - [ ] 429 after rate limit exceeded
- [ ] All routes audited (see ROUTE_AUDIT.md)

### Before Production
- [ ] Staging validation passed
- [ ] `npx prisma migrate deploy` ready
- [ ] Sentry/logging dashboard live
- [ ] Backup strategy confirmed
- [ ] Rollback plan documented
- [ ] On-call engineer briefed

---

## 8. Implementation Priority & Effort

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 🔴 CRITICAL | Run `prisma migrate dev` | 5 min | HIGH |
| 🔴 CRITICAL | Create route audit | 1 hour | HIGH |
| 🟠 HIGH | Apply secure route pattern | 2-4 hours | HIGH |
| 🟠 HIGH | Route handler tests | 2-3 hours | MEDIUM |
| 🟠 HIGH | Structured logging | 1-2 hours | MEDIUM |
| 🟡 MEDIUM | E2E tests (Playwright) | 2-3 hours | MEDIUM |
| 🟡 MEDIUM | Migrate to Redis | 2-3 hours | LOW* |
| 🟡 MEDIUM | Create security playbook | 1 hour | LOW |

*LOW now, HIGH when scaling beyond single instance.

**Total Estimated Effort**: 12-20 hours before production deployment

---

## 9. Communication Plan

### To Engineering Team
```
🚨 Security Review Complete: Phase A-B-C

Status: ✅ Technically Sound | ⚠️ Gaps Identified

Before production deployment, we need:
1. Audit all existing routes (/api/users, etc.) for consistent security
2. Create comprehensive test suite (routes + E2E)
3. Run Prisma migration (deletedAt field)
4. Implement structured logging

Timeline: 2-3 days (if 2 engineers dedicated)
Risk if skipped: High-severity vulnerabilities, LGPD non-compliance
```

### To Product/Stakeholders
```
✅ Milestone: Secure Page API & Rate Limiting Complete

Ready for:
- Internal staging tests
- Security review by external team (recommended)

Before customer launch:
- Internal QA testing (2 days)
- Security penetration test (1 day)
- Performance testing (1 day)
- Edge case validation (1 day)

Recommended launch date: 2025-11-28 (with gaps addressed)
```

---

## 10. Next Steps (Immediate)

### Today/Tomorrow
1. **Create Route Audit**: `ROUTE_AUDIT.md`
   - List all `/api/*` routes
   - Mark: ✅ Secure | ❌ Needs Work | ⚠️ Unclear

2. **Prioritize Gaps**: Which routes handle sensitive data?
   - 🔴 Billing, Users, Webhooks
   - 🟠 Analytics, SEO
   - 🟡 Templates, Public

3. **Assign Owners**: Who fixes what?

### This Week
1. Apply secure route pattern to high-priority routes
2. Create route handler tests
3. Run migrations locally + staging
4. Implement structured logging

### Next Week
1. E2E tests with Playwright
2. Penetration testing (internal or external)
3. Performance testing
4. Deploy to staging for validation

---

**Status**: Ready to iterate on each risk.  
**Next Action**: Review this doc + decide: which risks to fix first?
