# Fast-Track Remediation Plan (Pragmatic Approach)

**Goal**: Get to production safely in **2-3 days** (not 2 weeks)  
**Focus**: High-impact, low-effort fixes first  
**Trade-off**: Defer "nice-to-have" improvements to post-launch

---

## 1. TODAY: Critical 90-Minute Sprint

### 1.1 Audit Stripe Webhook (30 min)
**Why**: Payment security is non-negotiable  
**Risk**: Unverified webhooks = fraudulent charges

```bash
# File to check:
# app/api/webhooks/stripe/route.ts

# Look for:
# 1. Stripe signature verification?
#    Example: stripe.webhooks.constructEvent(req.body, sig, secret)
# 
# 2. Event handler idempotency?
#    (Can replay same webhook without side effects)
#
# 3. Tenant ID from payload?
#    (NOT from session, since webhook is unsigned initially)
```

**Action**:
- [ ] Open file + inspect
- [ ] If missing signature verification → STOP, fix before anything else
- [ ] If present → Mark ✅ + move on

**If Vulnerable** (5 min fix):
```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;
  try {
    // ✅ CRITICAL: Verify signature
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return new Response('Invalid signature', { status: 401 });
  }

  // Handle event...
  return new Response('Received', { status: 200 });
}
```

### 1.2 Audit User Routes Tenant Isolation (30 min)
**Why**: Prevents data leaks between tenants  
**Risk**: User A sees/modifies User B's data

```bash
# Files to check:
# app/api/users/route.ts
# app/api/users/[id]/route.ts

# Look for:
# 1. withAuthHandler wrapper?
# 2. Is tenant.id used in WHERE clause?
#    Example: where: { tenantId: tenant.id }
#
# 3. Is tenantId from session (not from body)?
```

**Action**:
- [ ] Inspect code
- [ ] If missing tenant scoping → Need quick fix (see below)
- [ ] If present → Mark ✅ + move on

**If Vulnerable** (template fix):
```typescript
// app/api/users/route.ts
import { withAuthHandler } from '@/lib/auth/with-auth-handler';

export const GET = withAuthHandler(
  async ({ tenant, req }) => {
    try {
      // ✅ Tenant scoping
      const users = await prisma.user.findMany({
        where: { tenantId: tenant.id }, // Critical!
        select: { id: true, email: true, role: true },
      });

      return NextResponse.json({ success: true, data: users });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Error' },
        { status: 500 }
      );
    }
  },
  { requireTenant: true }
);
```

### 1.3 Decision Point (5 min)
**Question**: Are Stripe webhook + User routes secure?

**IF YES**: Continue to Phase 2 ✅  
**IF NO**: 
- Fix now (use templates above)
- Re-test locally
- Then continue to Phase 2

---

## 2. TOMORROW: Rate Limiting + Logging (4-6 hours)

### 2.1 Add Rate Limiting to Key Routes (2 hours)

Apply to these routes (in order of importance):
1. `GET /api/pages` → `authenticated` profile (100/min)
2. `POST /api/pages` → `authenticated` profile (100/min)
3. `GET /api/users` → `auth` profile (5/min, only for admins)
4. `POST /api/tenants` → `auth` profile (5/min, only for superadmin)

**Template** (copy-paste):
```typescript
import { enforceRateLimitProfile } from '@/lib/rate-limit-helpers';

export const GET = withAuthHandler(
  async ({ tenant, req }) => {
    // ADD THIS (3 lines):
    const limit = enforceRateLimitProfile(req, `pages:${tenant.id}`, 'authenticated');
    if (!limit.success) {
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { 
          status: 429,
          headers: { 'Retry-After': limit.retryAfter.toString() }
        }
      );
    }

    // Rest of handler...
  }
);
```

**Effort**: ~10 min per route × 4 routes = 40 min

### 2.2 Add Security Logging (2-3 hours)

**Option A: Simple (1 hour)**
```typescript
// lib/simple-logger.ts
export function logSecurityEvent(event: {
  action: string; // 'PAGE_DELETE', 'UPLOAD', etc.
  tenant: string;
  user?: string;
  status: 'success' | 'blocked' | 'failed';
  reason?: string;
}) {
  const log = {
    timestamp: new Date().toISOString(),
    ...event,
  };
  
  // Log to console (staging/prod: configure cloud logging)
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(log)); // CloudWatch/DataDog will pick this up
  } else {
    console.log('[SECURITY]', log);
  }
}
```

Then add 1-2 lines to sensitive routes:
```typescript
// In DELETE /api/pages/[id]:
logSecurityEvent({
  action: 'PAGE_DELETE',
  tenant: tenant.id,
  status: 'success'
});
```

**Option B: Comprehensive (2-3 hours)**
- Use `pino` logger
- Integrate with Sentry
- Structured JSON logs

**Recommendation**: Use Option A today, plan Option B for next sprint.

---

## 3. DAY 3: Tests + Validation (3-4 hours)

### 3.1 Database Migration (5 min)
```bash
npx prisma migrate dev --name add_page_soft_delete
```

### 3.2 Quick Route Tests (1-2 hours)

Create `__tests__/api/pages.route.quick.test.ts`:
```typescript
describe('Pages API Quick Tests', () => {
  it('should return 401 without auth', async () => {
    const res = await fetch('http://localhost:3000/api/pages');
    expect(res.status).toBe(401);
  });

  it('should return 403 for CLIENTE_USER creating page', async () => {
    const token = generateToken({ role: 'CLIENTE_USER' });
    const res = await fetch('http://localhost:3000/api/pages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({...})
    });
    expect(res.status).toBe(403);
  });

  it('should enforce rate limit after 100 requests', async () => {
    const token = generateToken({ role: 'OPERADOR' });
    
    for (let i = 0; i < 101; i++) {
      const res = await fetch('http://localhost:3000/api/pages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (i < 100) {
        expect(res.status).toBe(200);
      } else {
        expect(res.status).toBe(429); // Rate limited
      }
    }
  });

  it('should return 404 for cross-tenant page access', async () => {
    const tokenA = generateToken({ tenantId: 'tenant-a' });
    const pageFromTenantB = 'page-xyz-from-b';
    
    const res = await fetch(`http://localhost:3000/api/pages/${pageFromTenantB}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    expect(res.status).toBe(404);
  });
});
```

**Effort**: 30 min to write + 30 min to run locally

### 3.3 Manual Postman Tests (1-2 hours)

Create Postman collection with critical tests:
```
COLLECTION: API Security Validation

1. [AUTH] GET /api/pages without token → 401
2. [RBAC] POST /api/pages as CLIENTE_USER → 403
3. [IDOR] GET /api/pages/TENANT_B_PAGE → 404
4. [RATE] POST /api/uploads 11 times → 10x 200, 11x 429
5. [TENANT] GET /api/users (as Tenant A) → only Tenant A users returned
6. [LOGGING] Check console for security events after each test
```

**Effort**: 60 min

---

## 4. Deployment Readiness Checklist

- [ ] **Day 1 Audits Passed**
  - [ ] Stripe webhook signature verified ✅
  - [ ] User routes have tenant scoping ✅

- [ ] **Day 2 Applied**
  - [ ] Rate limiting added to 4 key routes ✅
  - [ ] Logging implemented (Option A) ✅

- [ ] **Day 3 Validated**
  - [ ] Database migration run locally ✅
  - [ ] Route tests passing (4+ critical tests) ✅
  - [ ] Manual Postman tests passed ✅
  - [ ] npm test passes ✅
  - [ ] npm run build passes ✅

---

## 5. What to SKIP (Defer to Post-Launch)

### Skip Now (too time-consuming):
- ❌ E2E tests with Playwright (2-3 hours) → Post-launch iteration
- ❌ Full Sentry integration (1-2 hours) → Can use console logs for now
- ❌ Redis migration (2-3 hours) → Use in-memory for MVP
- ❌ Comprehensive audit of ALL routes → Only audit critical ones (payments, users, tenants)
- ❌ Security playbook document → Can be documented asynchronously
- ❌ TenantService / UserService refactoring → Current code works, refactor later

### Do Now (non-negotiable):
- ✅ Stripe webhook verification
- ✅ User tenant isolation
- ✅ Rate limiting on sensitive endpoints
- ✅ Security logging (simple version)
- ✅ Database migration
- ✅ Critical route tests
- ✅ Manual validation

---

## 6. Risk vs. Effort Matrix

| Task | Risk if Skipped | Effort | Decision |
|------|----------------|--------|----------|
| Stripe signature verify | 🔴 HIGH (fraud) | 5 min | ✅ DO NOW |
| User tenant isolation | 🔴 HIGH (data leak) | 15 min | ✅ DO NOW |
| Rate limiting key routes | 🟠 MEDIUM (DoS) | 40 min | ✅ DO NOW |
| Simple logging | 🟠 MEDIUM (audit) | 60 min | ✅ DO NOW |
| DB migration | 🟠 MEDIUM (queries fail) | 5 min | ✅ DO NOW |
| Route tests | 🟡 LOW (catch regressions) | 60 min | ✅ DO NOW |
| E2E Playwright | 🟡 LOW (e2e coverage) | 180 min | ❌ SKIP |
| Redis migration | 🟡 LOW (MVP ok) | 180 min | ❌ SKIP |
| Full audit of all 24 routes | 🟡 LOW (most are low-risk) | 240 min | ❌ SKIP (only critical) |

**Total Effort**: ~4-5 hours (achievable in 1-2 days)

---

## 7. Deployment Timeline

```
TODAY (Day 1):
├─ 09:00 - Audit Stripe webhook (30 min)
├─ 09:30 - Audit User routes (30 min)
├─ 10:00 - Fix any vulnerabilities found (30 min)
└─ 10:30 - DONE ✅

TOMORROW (Day 2):
├─ 09:00 - Add rate limiting to 4 routes (40 min)
├─ 09:40 - Implement simple logging (60 min)
├─ 10:40 - Test locally (20 min)
└─ 11:00 - DONE ✅

DAY 3:
├─ 09:00 - Run DB migration (5 min)
├─ 09:05 - Create + run route tests (60 min)
├─ 10:05 - Manual Postman validation (90 min)
└─ 11:35 - DEPLOY TO STAGING ✅
```

---

## 8. Decision Gate: Ready for Staging?

✅ **YES, if:**
- Stripe webhook signature verification ✓
- User tenant isolation working ✓
- Rate limiting on key routes ✓
- Simple logging in place ✓
- DB migration applied ✓
- Route tests passing ✓
- Manual tests passed ✓

❌ **NO, if:**
- Any critical audit finding remains unfixed
- Rate limiting causes false positives
- Logging not working
- Tests failing

---

## 9. Success Metrics

### By EOD Day 1:
- [ ] Stripe + User routes audited
- [ ] No critical vulnerabilities found
- [ ] Decision to proceed or fix made

### By EOD Day 2:
- [ ] Rate limiting applied + tested locally
- [ ] Logging implemented
- [ ] npm run build passes
- [ ] npm test passes (if applicable)

### By EOD Day 3:
- [ ] All critical tests passing
- [ ] Manual validation complete
- [ ] Ready to deploy to staging

---

## 10. If Something Goes Wrong

### Stripe Signature Verification Failed
**Quick Fix** (5 min):
```bash
# Verify STRIPE_WEBHOOK_SECRET in .env matches Stripe dashboard
echo $STRIPE_WEBHOOK_SECRET

# If missing, add it:
# 1. Go to Stripe Dashboard → Webhooks → Show signing secret
# 2. Copy secret
# 3. Add to .env.local: STRIPE_WEBHOOK_SECRET=whsec_...
# 4. Restart dev server
```

### User Routes Expose Data
**Quick Fix** (10 min):
```typescript
// Add tenant scoping to WHERE clause:
where: { tenantId: tenant.id } // Add this line
```

### Rate Limit False Positives
**Adjust Profile** (2 min):
```typescript
// If getting 429 too quickly, increase limit:
// From: 'authenticated' (100/min)
// To: 'public' (30/min) or custom { limit: 200, window: 60 }
```

---

## 11. Communication to Team

**Slack/Email Message**:
```
🚀 FAST-TRACK TO PRODUCTION - 3 Days

Critical audits + fixes planned for:
1. Stripe webhook verification (today)
2. User data isolation (today)
3. Rate limiting + logging (tomorrow)
4. Testing + validation (day 3)

Goal: Deploy to staging by EOD Day 3

If critical issues found during audit → will communicate delay immediately

Who: [Your name]
Timeline: [Dates]
Status: 🟡 IN PROGRESS
```

---

**Bottom Line**: 
- **Pragmatic approach = 4-5 hours of focused work**
- **Defer nice-to-haves, fix critical gaps only**
- **Ready for staging by Day 3 morning**
- **Launch to production on Day 4 after staging validation**

Ready to execute? Start with Section 1 today! 🚀
