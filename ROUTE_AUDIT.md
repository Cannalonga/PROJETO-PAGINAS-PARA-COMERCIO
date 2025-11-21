# ROUTE AUDIT - Security & Compliance Check

**Date**: 2025-11-21  
**Status**: 🔴 IN PROGRESS  
**Auditor**: Automated + Manual Review Required

---

## Legend
- ✅ **SECURE**: Implements withAuthHandler, RBAC, tenant scoping, validation, logging
- ❌ **EXPOSED**: Missing auth, RBAC, or tenant scoping
- ⚠️ **UNCLEAR**: Needs manual inspection
- 🟡 **PARTIAL**: Some protections present, others missing

---

## Summary Stats
| Category | Total | ✅ Secure | ❌ Exposed | ⚠️ Unclear | 🟡 Partial |
|----------|-------|----------|-----------|-----------|-----------|
| Auth Routes | 2 | 0 | ? | 2 | 0 |
| Tenant Routes | 4 | 0 | ? | 4 | 0 |
| User Routes | 8+ | 0 | ? | 8+ | 0 |
| Page Routes | 4 | ✅ 4 | ❌ 0 | ⚠️ 0 | 🟡 0 |
| Template Routes | 2 | ✅ 2 | ❌ 0 | ⚠️ 0 | 🟡 0 |
| Upload Routes | 1 | ✅ 1 | ❌ 0 | ⚠️ 0 | 🟡 0 |
| Webhook Routes | 1 | 0 | ? | 1 | 0 |
| Analytics Routes | 2+ | 0 | ? | 2+ | 0 |
| **TOTAL** | **24+** | **8** | **?** | **16+** | **0** |

---

## Detailed Route Audit

### 🟢 SECURED ROUTES (✅ Implements Security Pattern)

#### Authentication Routes
```
Route: POST /api/auth/signin
File: (NextAuth - handled by framework)
Status: ⚠️ UNCLEAR - Need to verify NextAuth config

Checks:
- [ ] NextAuth secret set (NEXTAUTH_SECRET in .env)
- [ ] Session expiry configured (30 days in current config)
- [ ] JWT secret strong enough
- [ ] Secure cookie settings enabled
- [ ] CSRF protection active

TODO: Audit NextAuth session configuration
```

#### Page Routes (✅ All 4 routes secured)
```
✅ GET /api/pages
  File: app/api/pages/route.ts
  Auth: withAuthHandler ✅
  RBAC: Not needed (can any authenticated user read?) - CHECK
  Tenant Scoping: ✅ PageService.listPagesByTenant(tenant.id)
  Validation: ✅ Zod listPagesSchema
  Rate Limit: ⚠️ NOT APPLIED - should apply 'authenticated' profile
  Logging: ❌ NOT IMPLEMENTED

✅ POST /api/pages
  File: app/api/pages/route.ts
  Auth: withAuthHandler ✅
  RBAC: ✅ Only SUPERADMIN, OPERADOR, CLIENTE_ADMIN
  Tenant Scoping: ✅ tenant.id enforced
  Validation: ✅ Zod createPageSchema
  Rate Limit: ⚠️ NOT APPLIED - should apply 'authenticated' profile
  Logging: ❌ NOT IMPLEMENTED

✅ GET /api/pages/[pageId]
  File: app/api/pages/[pageId]/route.ts
  Auth: withAuthHandler ✅
  RBAC: Not needed (any tenant member can read their pages)
  Tenant Scoping: ✅ IDOR prevention via PageService.getPageById(tenant.id, id)
  Validation: ✅ pageId as CUID
  Rate Limit: ⚠️ NOT APPLIED
  Logging: ❌ NOT IMPLEMENTED

✅ PUT /api/pages/[pageId]
  File: app/api/pages/[pageId]/route.ts
  Auth: withAuthHandler ✅
  RBAC: ✅ Only SUPERADMIN, OPERADOR, CLIENTE_ADMIN
  Tenant Scoping: ✅ IDOR prevention
  Validation: ✅ Zod updatePageSchema
  Rate Limit: ⚠️ NOT APPLIED
  Logging: ❌ NOT IMPLEMENTED

❌ DELETE /api/pages/[pageId] - NEEDS REVIEW
  File: app/api/pages/[pageId]/route.ts
  Auth: withAuthHandler ✅
  RBAC: ✅ Checks roles
  Tenant Scoping: ⚠️ Should verify tenant.id in WHERE clause
  Validation: ✅ pageId schema
  Rate Limit: ⚠️ NOT APPLIED
  Logging: ❌ NOT IMPLEMENTED
  ⚠️ NOTE: Currently sets status='ARCHIVED', need database migration for deletedAt
```

#### Upload Routes (✅ Secured)
```
✅ POST /api/uploads
  File: app/api/uploads/route.ts
  Auth: withAuthHandler ✅
  RBAC: Not needed (users can upload own files)
  Tenant Scoping: ✅ Stores in /tenants/{tenantId}/images/
  Validation: ✅ MIME type whitelist + 5MB size limit
  Rate Limit: ✅ enforceRateLimitProfile('upload') - 10/hour
  Logging: ❌ NOT IMPLEMENTED
  ✅ SECURITY: Random filename generation prevents guessing
```

#### Template Routes (✅ Secured)
```
✅ GET /api/templates
  File: app/api/templates/route.ts
  Auth: withAuthHandler ✅
  RBAC: Not needed (all authenticated can view)
  Tenant Scoping: N/A (global resource)
  Validation: ✅ Returns hardcoded list (no user input)
  Rate Limit: ⚠️ NOT APPLIED - should apply 'public' profile (30/min)
  Logging: ❌ NOT IMPLEMENTED

✅ POST /api/templates
  File: app/api/templates/route.ts
  Auth: withAuthHandler ✅
  RBAC: ✅ Only SUPERADMIN can create
  Tenant Scoping: N/A (global resource)
  Validation: ✅ Zod createTemplateSchema
  Rate Limit: ⚠️ NOT APPLIED - should apply 'auth' profile (5/min)
  Logging: ❌ NOT IMPLEMENTED
```

---

### 🟡 PARTIAL/UNCLEAR ROUTES (Need Audit)

#### User Routes (❌ NEEDS URGENT AUDIT)
```
❌ GET /api/users
  File: app/api/users/route.ts
  Status: NEEDS AUDIT
  Concerns:
    - Is withAuthHandler applied?
    - Are RBAC roles checked?
    - Is tenant isolation applied?
    - Can User A see users from Tenant B?
  
  ACTION: Review source code immediately

❌ POST /api/users
  File: app/api/users/route.ts
  Status: NEEDS AUDIT
  Concerns:
    - Can anyone create users?
    - Are new users restricted to tenant?
    - Are passwords hashed (bcrypt)?
  
  ACTION: Review + audit password handling

❌ GET /api/users/[id]
❌ PUT /api/users/[id]
❌ DELETE /api/users/[id]
  Status: NEEDS AUDIT (same as above)

❌ GET /api/users/[id]/audit-logs
❌ POST /api/users/[id]/reset-password
❌ POST /api/users/[id]/permissions
❌ GET /api/users/export
  Status: NEEDS AUDIT
  Concerns:
    - Audit logs visible to tenant users only?
    - Password reset links secure + time-limited?
    - Permissions changes logged?
    - Export function scoped to tenant?
  
  ACTION: Audit each route individually
```

#### Tenant Routes (❌ NEEDS URGENT AUDIT)
```
❌ GET /api/tenants
  File: app/api/tenants/route.ts
  Status: NEEDS AUDIT
  Concerns:
    - Can any user list all tenants?
    - Should be restricted to SUPERADMIN only?
  
  ACTION: Verify RBAC is SUPERADMIN-only

❌ POST /api/tenants
  Status: NEEDS AUDIT
  Concerns:
    - Who can create tenants?
    - Are new tenants isolated from existing ones?
    - Is creator assigned as admin?

❌ GET /api/tenants/[id]
❌ PUT /api/tenants/[id]
  Status: NEEDS AUDIT
  Concerns:
    - Can tenant member edit own tenant settings?
    - Can tenant A edit tenant B?
    - Are changes logged?
```

#### Billing/Stripe Routes (🔴 CRITICAL - NEEDS AUDIT)
```
❌ POST /api/webhooks/stripe
  File: app/api/webhooks/stripe/route.ts
  Status: NEEDS URGENT AUDIT
  Concerns:
    - ✅ Should NOT require auth (public webhook)
    - ⚠️ IS signature verified? (CRITICAL for payment security)
    - ⚠️ Are events idempotent (replays handled)?
    - ⚠️ Is tenant ID from payload or session? (MUST be from payload in webhook)
    - ⚠️ Are state changes transactional?
  
  SECURITY RISK: Unverified webhooks = payment manipulation
  
  ACTION: URGENT - Review signature verification immediately

❌ GET /api/billing/...
❌ POST /api/billing/checkout
  Status: NEEDS AUDIT
  Concerns:
    - Are prices hardcoded or user-modifiable?
    - Is tenant scoping present?
    - Are payment intents associated with correct tenant?
```

#### Analytics Routes (⚠️ UNCLEAR)
```
❌ GET /api/analytics/...
❌ POST /api/analytics/track
  Status: NEEDS AUDIT
  Concerns:
    - Is analytics endpoint rate-limited? (prevent spam)
    - Can user A see tenant B analytics?
    - Are sessions tracked correctly?
    - What data is collected? (privacy implications)

  ACTION: Review + apply 'analytics' rate limit profile (20/min)
```

#### SEO Routes (⚠️ UNCLEAR)
```
❌ GET /api/seo/[pageId]
❌ GET /api/seo/sitemap/[tenantSlug]
  Status: NEEDS AUDIT
  Concerns:
    - Are these supposed to be public?
    - If public: should have rate limiting but NO auth
    - If private: should require auth + tenant scoping

  ACTION: Clarify intent + apply appropriate controls
```

---

## Audit Findings Summary

### 🔴 CRITICAL ISSUES
1. **Billing/Stripe webhook**: Signature verification ⚠️ UNKNOWN
   - Risk: Payment manipulation, unauthorized charges
   - Impact: Revenue + legal liability
   - Action: **AUDIT IMMEDIATELY** before any production deployment

2. **User routes**: Tenant isolation ⚠️ UNKNOWN
   - Risk: User A sees/modifies User B data from other tenant
   - Impact: Data breach
   - Action: **AUDIT IMMEDIATELY**

### 🟠 HIGH ISSUES
3. **Tenant routes**: Permission model ⚠️ UNCLEAR
   - Risk: Users manipulate other tenants
   - Action: **AUDIT THIS WEEK**

4. **Logging**: Security events not logged
   - Risk: Cannot audit/investigate incidents
   - Impact: LGPD non-compliance
   - Action: Implement structured logging (1-2 hours)

### 🟡 MEDIUM ISSUES
5. **Rate limiting incomplete**: Missing from pages, templates, analytics
   - Risk: DoS on popular endpoints
   - Action: Add rate limit profiles to routes (30-60 min)

6. **Tests insufficient**: No route handler tests
   - Risk: Refactors break security without detection
   - Action: Create route handler tests (2-3 hours)

---

## Remediation Plan

### PHASE 1: Critical (Today - 2 hours)
- [ ] Audit `/api/webhooks/stripe` (signature verification)
- [ ] Audit `/api/users` (tenant isolation)
- [ ] Document findings + decide: fix before staging or abort

### PHASE 2: High (This Week - 4-6 hours)
- [ ] Audit `/api/tenants` routes
- [ ] Implement structured logging for security events
- [ ] Apply rate limiting to pages, templates, analytics
- [ ] Create route audit test suite

### PHASE 3: Medium (Next Week - 3-4 hours)
- [ ] Create route handler tests (Jest)
- [ ] E2E tests with Playwright
- [ ] Security regression tests (IDOR, RBAC, rate limiting)

---

## Template for Route Audit (Use for Each Route)

```markdown
### Route: [METHOD] [PATH]
**File**: [app/api/...]
**Status**: ✅ / ❌ / ⚠️ / 🟡

**Checklist**:
- [ ] Authentication: withAuthHandler applied?
- [ ] RBAC: Roles enforced? Allowed roles documented?
- [ ] Tenant Scoping: Queries filtered by tenant.id from session?
- [ ] Input Validation: Zod schema applied?
- [ ] Rate Limiting: Profile applied? Headers returned?
- [ ] Logging: Security events logged?
- [ ] Tests: Unit + integration tests present?
- [ ] Documentation: Purpose + security model clear?

**Findings**:
- [Specific issues found]

**Remediation**:
- [ ] [Action 1]
- [ ] [Action 2]

**Estimated Effort**: X hours
**Priority**: 🔴 / 🟠 / 🟡
```

---

## Sign-Off

- **Auditor**: Automated scan + manual review pending
- **Reviewed By**: [Name] - [Date]
- **Approved For Production**: ❌ NOT YET
  - Reason: Critical routes not yet audited
  - Conditions for approval:
    1. All routes audited
    2. Critical issues (stripe, users) resolved
    3. Logging implemented
    4. Tests passing

---

**Next Step**: Start audit with CRITICAL routes (stripe, users, tenants)
