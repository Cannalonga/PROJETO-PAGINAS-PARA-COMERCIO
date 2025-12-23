# 🔒 SECURITY PATCHES - IMPLEMENTATION GUIDE

**Branch:** `security/fixes` (currently active)  
**Status:** All 10 patches created and ready for implementation  
**Priority:** Apply in order (Critical → High → Medium)

---

## 📋 PATCH CHECKLIST

### CRITICAL (Week 1) - Apply Immediately

- [x] **Patch #1: IDOR Prevention** (`01-IDOR-user-endpoints.patch.ts`)
  - Location: `app/api/users/[id]/route.ts`
  - Risk: CVSS 8.2 - Account takeover
  - Effort: 8 hours
  - Changes: Replace GET/PUT/DELETE with access control
  
- [x] **Patch #2: BFLA Prevention** (`02-BFLA-admin-authorization.patch.ts`)
  - Location: `app/api/admin/*/route.ts`
  - Risk: CVSS 8.1 - Privilege escalation
  - Effort: 8 hours
  - Changes: Add `requireAdmin()` middleware to all admin routes
  
- [x] **Patch #3: Audit Logging** (`03-Audit-Logging-System.patch.ts`)
  - Location: `lib/audit.ts` + Prisma schema
  - Risk: CVSS 7.5 - No security visibility
  - Effort: 16 hours (includes DB migration)
  - Changes: Add AuditLog table, create helper, integrate everywhere

### HIGH (Week 2)

- [ ] **Patch #4: Session Timeout** (`04-Session-Timeout.patch.ts`)
  - Location: `lib/auth.ts`
  - Risk: CVSS 6.8 - 30 days too long (should be 15 min)
  - Effort: 4 hours
  - Changes: Update maxAge, add idle timeout

- [ ] **Patch #5: Auth Rate Limiting** (See PATCH_PLAN.md)
  - Location: `app/api/auth/*/route.ts`
  - Risk: CVSS 6.5 - Brute force attacks
  - Effort: 6 hours
  - Changes: Add rate limiter (5 attempts/15min per IP)

- [ ] **Patch #6: Remove CSP 'unsafe-*'** (See PATCH_PLAN.md)
  - Location: `middleware.ts`
  - Risk: CVSS 7.3 - XSS vulnerability
  - Effort: 8 hours
  - Changes: Remove unsafe-inline, unsafe-eval, use nonces

### MEDIUM (Week 3)

- [ ] **Patch #7: Webhook JSON Error Handling** (See PATCH_PLAN.md)
  - Location: `app/api/webhooks/*/route.ts`
  - Risk: CVSS 6.5 - DoS via malformed JSON
  - Effort: 2 hours
  - Changes: Add try-catch around JSON.parse

- [ ] **Patch #8: Tenant Billing Isolation** (See PATCH_PLAN.md)
  - Location: `app/api/billing/*/route.ts`
  - Risk: CVSS 5.9 - Billing data leakage
  - Effort: 6 hours
  - Changes: Verify tenantId on all billing queries

- [ ] **Patch #9: Email Verification** (See PATCH_PLAN.md)
  - Location: `app/api/auth/register/route.ts`
  - Risk: CVSS 5.4 - Account enumeration
  - Effort: 8 hours
  - Changes: Add email verification flow with tokens

- [ ] **Patch #10: Search Input Validation** (See PATCH_PLAN.md)
  - Location: `app/api/search/route.ts`
  - Risk: CVSS 6.0 - NoSQL injection
  - Effort: 4 hours
  - Changes: Validate/sanitize search inputs

---

## 🚀 IMPLEMENTATION WORKFLOW

### Step 1: Checkout Branch (ALREADY DONE)
```bash
git checkout security/fixes
git status  # Should show you're on security/fixes branch
```

### Step 2: Apply Patch #1 (IDOR)
**File to Edit:** `app/api/users/[id]/route.ts`

Copy the code from `01-IDOR-user-endpoints.patch.ts` and:
1. Add imports at top:
   ```typescript
   import { logAuditEvent } from '@/lib/audit';
   import { getSession } from 'next-auth/react';
   ```

2. Replace GET, PUT, DELETE functions with patched versions

3. Create test file to verify:
   ```bash
   npm test -- __tests__/integration/idor-users.test.ts
   ```

4. Commit:
   ```bash
   git add app/api/users/[id]/route.ts
   git commit -m "security(patch-1): IDOR prevention in user endpoints"
   ```

### Step 3: Apply Patch #2 (BFLA)
**File to Create:** `lib/admin-auth.ts` (from patch)

1. Create new file with helper function `requireAdmin()`
2. Update ALL admin routes in `app/api/admin/*/route.ts`:
   ```typescript
   export async function POST(request: NextRequest) {
     // ✅ FIRST LINE IN EVERY ADMIN ROUTE
     const auth = await requireAdmin(request);
     if (!auth.isAuthorized) return auth.response;
     
     // ... rest of handler
   }
   ```

3. Routes to update (use grep to find all):
   ```bash
   grep -r "app/api/admin" app/api/admin/*/route.ts
   ```

4. Test and commit:
   ```bash
   npm test -- __tests__/integration/bfla-admin.test.ts
   git add lib/admin-auth.ts app/api/admin/
   git commit -m "security(patch-2): BFLA prevention in admin endpoints"
   ```

### Step 4: Apply Patch #3 (Audit Logging)
**CRITICAL: Database migration required**

1. Update `db/prisma/schema.prisma` - Add AuditLog model:
   ```prisma
   model AuditLog {
     id             String    @id @default(cuid())
     userId         String
     tenantId       String
     action         String
     resourceId     String?
     resourceType   String?
     status         String    // SUCCESS | FAILED
     logLevel       String    // INFO | WARNING | ERROR
     details        Json?
     changes        Json?
     error          String?
     ipAddress      String?
     userAgent      String?
     timestamp      DateTime  @default(now())
     
     @@index([userId])
     @@index([tenantId])
     @@index([action])
     @@index([timestamp])
   }
   ```

2. Create and run migration:
   ```bash
   npx prisma migrate dev --name "add_audit_logs"
   ```

3. Create `lib/audit.ts` with logAuditEvent() function (from patch)

4. Add to ALL critical routes:
   ```typescript
   import { logAuditEvent } from '@/lib/audit';
   
   // In every route that handles sensitive operations:
   await logAuditEvent({
     userId: session.user.id,
     tenantId: session.user.tenantId,
     action: 'ACTION_NAME',
     resourceId: targetId,
     status: 'SUCCESS',
   });
   ```

5. Routes to update:
   - `app/api/auth/signin/route.ts` (LOGIN_SUCCESS, LOGIN_FAILED)
   - `app/api/users/[id]/route.ts` (USER_VIEW, USER_UPDATE, USER_DELETE)
   - `app/api/admin/*/route.ts` (All admin actions)
   - `app/api/webhooks/*/route.ts` (WEBHOOK_* actions)
   - `app/api/billing/*/route.ts` (PAYMENT_* actions)

6. Create admin endpoint to view logs:
   ```bash
   # File: app/api/admin/audit-logs/route.ts
   # See patch for implementation
   ```

7. Test and commit:
   ```bash
   npm test
   git add db/prisma/schema.prisma lib/audit.ts app/api/
   git commit -m "security(patch-3): Audit logging system implementation"
   ```

### Step 5: Apply Patches #4-#10
See [PATCH_PLAN.md](PATCH_PLAN.md) for detailed implementations

---

## 🧪 TESTING EACH PATCH

### Test #1: IDOR Prevention
```bash
# Should GET 403 when accessing other user
curl -H "Authorization: Bearer $TOKEN" \
  https://app.com/api/users/other-user-id
# Expected: 403 Forbidden

# Should GET 200 for own user
curl -H "Authorization: Bearer $TOKEN" \
  https://app.com/api/users/my-user-id
# Expected: 200 OK
```

### Test #2: BFLA Prevention
```bash
# Should POST 403 when non-admin
curl -X POST -H "Authorization: Bearer $USER_TOKEN" \
  https://app.com/api/admin/vip \
  -d '{"userId":"xxx","planType":"PREMIUM"}'
# Expected: 403 Forbidden

# Should POST 200 when admin
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://app.com/api/admin/vip \
  -d '{"userId":"xxx","planType":"PREMIUM"}'
# Expected: 200 OK
```

### Test #3: Audit Logging
```bash
# View audit logs
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://app.com/api/admin/audit-logs?action=USER_DELETE
# Should see all deletion events
```

---

## 📊 PROGRESS TRACKING

```
Week 1 (Critical):
  [x] Patch #1: IDOR (8h)
  [x] Patch #2: BFLA (8h)
  [x] Patch #3: Audit Logging (16h)
  Total: 32 hours → ~4 days

Week 2 (High):
  [ ] Patch #4: Session Timeout (4h)
  [ ] Patch #5: Rate Limiting (6h)
  [ ] Patch #6: CSP Removal (8h)
  Total: 18 hours → ~2 days

Week 3 (Medium):
  [ ] Patch #7: Webhook Errors (2h)
  [ ] Patch #8: Billing Isolation (6h)
  [ ] Patch #9: Email Verification (8h)
  [ ] Patch #10: Search Validation (4h)
  Total: 20 hours → ~3 days
```

---

## ✅ PRE-MERGE CHECKLIST

Before creating a Pull Request to main:

- [ ] All tests passing: `npm test` (641/641)
- [ ] No build errors: `npm run build`
- [ ] No lint errors: `npm run lint`
- [ ] All 10 patches committed
- [ ] Audit logs working in staging
- [ ] Database migrations tested
- [ ] Security tests passing
- [ ] Monitoring/alerts configured
- [ ] Rollback plan documented

---

## 🔗 RELATED FILES

- **Vulnerability Details:** [SECURITY_AUDIT_COMPLETE_2025.md](../SECURITY_AUDIT_COMPLETE_2025.md)
- **Implementation Roadmap:** [PATCH_PLAN.md](../PATCH_PLAN.md)
- **Executive Summary:** [SECURITY_DASHBOARD_EXECUTIVE.md](../SECURITY_DASHBOARD_EXECUTIVE.md)
- **Status Tracking:** [SECURITY_AUDIT_STATUS.md](../SECURITY_AUDIT_STATUS.md)

---

## 🆘 TROUBLESHOOTING

**Q: prisma migrate fails**
```bash
# Reset database (dev only)
npx prisma migrate reset

# Or manually fix
npx prisma db push
```

**Q: Tests failing after patch**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

**Q: Git merge conflicts**
```bash
# Update branch with main
git fetch origin
git rebase origin/main
# Fix conflicts in VS Code
git add .
git rebase --continue
```

---

**Created:** 2025-01-23  
**Branch:** security/fixes  
**Total Patches:** 10  
**Effort Estimate:** 70 hours  
**Timeline:** 3 weeks
