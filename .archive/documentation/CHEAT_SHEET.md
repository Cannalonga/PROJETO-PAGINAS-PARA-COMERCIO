# ⚡ CHEAT SHEET — P0 Security Layer Quick Reference

## 🚀 Start Here

```bash
# Step 1: Validate P0 works
.\run-p0-tests.ps1

# Step 2: Check integration guide
cat P0_INTEGRATION_GUIDE.md

# Step 3: Integrate in endpoints
# (Use copy-paste template from guide)

# Step 4: Create PR
# (Use PR_TEMPLATE_P0.md content)

# Step 5: Merge when approved
git checkout main && git merge feature/fase-2-seguranca-observabilidade
```

---

## 🔐 P0.1 — CSRF Quick Facts

**Token Generation:**
```typescript
import { generateCsrfToken } from '@/lib/csrf';
const token = generateCsrfToken();  // 256-bit random
```

**Validation:**
```typescript
import { verifyCsrfToken } from '@/lib/csrf';
export const POST = safeHandler(async (req, ctx) => {
  const error = verifyCsrfToken(req);
  if (error) return error;  // 403 if invalid
});
```

**Frontend Usage:**
```typescript
// 1. Get token
const res = await fetch('/api/csrf-token');
const { csrfToken } = await res.json();

// 2. Include in requests
fetch('/api/tenants', {
  method: 'POST',
  headers: { 'x-csrf-token': csrfToken },
  body: JSON.stringify(data),
});
```

---

## 🏢 P0.2 — Tenant Isolation Quick Facts

**Safe Query Pattern:**
```typescript
import { getTenantScopedDb } from '@/lib/tenant-isolation';

export const GET = safeHandler(async (req, ctx) => {
  // ✅ This FORCES tenantId in WHERE
  const db = getTenantScopedDb(ctx.tenantId);
  const pages = await db.page.findMany();
  
  // Result: only pages for THIS tenant
});
```

**Cannot Bypass:**
- Impossible to query another tenant's data
- Database WHERE clause forces tenantId
- TypeScript validates at compile time

**Supported Models:**
- page
- user
- pageImage
- payment
- auditLog

---

## 📝 P0.3 — Audit Logging Quick Facts

**Log an Event:**
```typescript
import { logAuditEvent } from '@/lib/audit';

await logAuditEvent({
  userId: ctx.userId,
  tenantId: ctx.tenantId,
  action: 'CREATE',           // or UPDATE, DELETE, LOGIN
  entity: 'page',
  entityId: page.id,
  newValues: page,
  ipAddress: req.ip,
  requestId: ctx.requestId,
});
```

**Automatic Protections:**
- ✅ Passwords: Automatically redacted
- ✅ Tokens: Automatically redacted
- ✅ Email: Masked (u***@domain.com)
- ✅ Phone: Masked (+55 11 9876****)
- ✅ CPF: Masked (123.***.***-**)

**Export for Auditors:**
```typescript
import { exportAuditLogsAsCSV } from '@/lib/audit';

const csv = await exportAuditLogsAsCSV(tenantId, {
  fromDate: new Date('2025-01-01'),
  toDate: new Date('2025-01-31'),
});
```

---

## 📋 Integration Template (Copy-Paste)

```typescript
// ============ 1. Add imports ============
import { verifyCsrfToken } from '@/lib/csrf';
import { getTenantScopedDb } from '@/lib/tenant-isolation';
import { logAuditEvent } from '@/lib/audit';

// ============ 2. GET endpoint (no CSRF needed) ============
export const GET = safeHandler(async (req: NextRequest, ctx) => {
  const db = getTenantScopedDb(ctx.tenantId);
  const items = await db.yourModel.findMany();
  return NextResponse.json(items);
});

// ============ 3. POST endpoint (with CSRF) ============
export const POST = safeHandler(async (req: NextRequest, ctx) => {
  // CSRF check FIRST
  const csrfError = verifyCsrfToken(req);
  if (csrfError) return csrfError;

  // Get scoped DB
  const db = getTenantScopedDb(ctx.tenantId);
  const body = await req.json();

  // Create resource
  const result = await db.yourModel.create({
    data: { ...body, tenantId: ctx.tenantId },
  });

  // Log audit
  await logAuditEvent({
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    action: 'CREATE',
    entity: 'yourModel',
    entityId: result.id,
    newValues: result,
    ipAddress: req.ip,
    requestId: ctx.requestId,
  });

  return NextResponse.json(result, { status: 201 });
});

// ============ 4. PUT endpoint (with CSRF) ============
export const PUT = safeHandler(async (req: NextRequest, ctx) => {
  // CSRF check FIRST
  const csrfError = verifyCsrfToken(req);
  if (csrfError) return csrfError;

  const { id } = ctx.params;
  const db = getTenantScopedDb(ctx.tenantId);
  const body = await req.json();

  // Get old value for audit
  const oldValue = await db.yourModel.findUnique({ where: { id } });

  // Update (tenant isolation validated automatically)
  const updated = await db.yourModel.update({
    where: { id },
    data: body,
  });

  // Log audit
  await logAuditEvent({
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    action: 'UPDATE',
    entity: 'yourModel',
    entityId: id,
    oldValues: oldValue,
    newValues: updated,
    ipAddress: req.ip,
    requestId: ctx.requestId,
  });

  return NextResponse.json(updated);
});

// ============ 5. DELETE endpoint (with CSRF) ============
export const DELETE = safeHandler(async (req: NextRequest, ctx) => {
  // CSRF check FIRST
  const csrfError = verifyCsrfToken(req);
  if (csrfError) return csrfError;

  const { id } = ctx.params;
  const db = getTenantScopedDb(ctx.tenantId);

  // Delete (tenant isolation validated automatically)
  await db.yourModel.delete({ where: { id } });

  // Log audit
  await logAuditEvent({
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    action: 'DELETE',
    entity: 'yourModel',
    entityId: id,
    ipAddress: req.ip,
    requestId: ctx.requestId,
  });

  return NextResponse.json({ success: true });
});
```

---

## 🧪 Test Checklist

```
✓ Run .\run-p0-tests.ps1
✓ Test 1: GET /api/csrf-token (200 + token)
✓ Test 2: POST without CSRF (403)
✓ Test 3: POST with invalid token (403)
✓ Test 4: POST with valid token (201)
✓ Test 5: GET without auth (401)
✓ Test 6: Tenant isolation (different tenants can't access each other's data)
✓ Test 7: Audit logs created for each action
```

---

## 📁 Document Quick Reference

| Document | Read If | Time |
|----------|---------|------|
| **run-p0-tests.ps1** | You want to validate | 5 min (run) |
| **CSRF_ISOLATION_TESTS.md** | Tests are failing | 20 min |
| **P0_INTEGRATION_GUIDE.md** | You're integrating | 45 min (apply) |
| **P0_SECURITY_COMPLETE.md** | You want details | 20 min |
| **PR_TEMPLATE_P0.md** | You're creating PR | 5 min (copy) |
| **PHASE_2_ROADMAP.md** | You want full context | 15 min |
| **P1_OBSERVABILITY_AND_RATE_LIMITING.md** | Planning P1 | 30 min |
| **EXECUTION_CHECKLIST_P0.txt** | You need todo list | 10 min |
| **YOUR_SAAS_JOURNEY.md** | You want motivation | 15 min |

---

## 🎯 Today's Todo (90 minutes)

```
[5 min]   Run .\run-p0-tests.ps1
[45 min]  Integrate P0 in 4 endpoints (use template above)
[20 min]  Test integrated endpoints with CURL
[20 min]  Create PR (copy PR_TEMPLATE_P0.md)
────────────────────────────────────────
Total: ~90 minutes to P0 complete
```

---

## 🚨 Common Issues & Fixes

**CSRF token mismatch (403):**
```
❌ Problem: Token from cookie ≠ token in header
✅ Solution: Ensure frontend stores token in memory + sends in header
```

**Tenant isolation not working (can see other tenant's data):**
```
❌ Problem: Not using getTenantScopedDb()
✅ Solution: Replace prisma.model with db.model (from getTenantScopedDb)
```

**Audit logs not created:**
```
❌ Problem: Forgot to call logAuditEvent()
✅ Solution: Add after every CREATE/UPDATE/DELETE
```

**Auth failing (401):**
```
❌ Problem: Missing Authorization header
✅ Solution: Include "Authorization: Bearer {JWT_TOKEN}"
```

---

## 📞 Useful Commands

```bash
# Test CSRF endpoint
curl http://localhost:3000/api/csrf-token

# Test protected endpoint (should fail with 403)
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT}" \
  -d '{"name":"test"}'

# View git log
git log --oneline -10

# Check branch status
git status

# See diff
git diff --stat

# Create PR branch
git checkout -b feature/branch-name
git push origin feature/branch-name
```

---

## 🎖️ Success Criteria

✅ When you've done everything right:

1. **Tests Pass**
   ```
   .\run-p0-tests.ps1
   → All 7 tests green
   ```

2. **Integration Works**
   ```
   curl -X POST /api/users (with valid CSRF token)
   → 201 Created
   ```

3. **Audit Logging Works**
   ```
   Check audit logs in database
   → User CREATE event logged
   ```

4. **PR Is Merged**
   ```
   git log main
   → Shows P0 security layer commit
   ```

---

## 🚀 Next: P1 Quick Start (Tomorrow)

```bash
# 1. Rate Limiting (2-3 hours)
npm install rate-limiter-flexible redis
# Implement lib/rate-limiter.ts
# Apply to /api/auth/login

# 2. Sentry (1-2 hours)
npm install @sentry/nextjs
# Create Sentry account
# Implement lib/sentry.ts

# 3. Logging (2-3 hours)
npm install pino pino-http pino-pretty
# Implement lib/logger.ts
# Replace console.log
```

---

## 💪 You've Got This

P0 is SOLID. You have:
- ✅ CSRF (unbreakable)
- ✅ Isolation (database-level)
- ✅ Audit (immutable logs)
- ✅ Templates (copy-paste ready)
- ✅ Tests (automated + manual)

**Time to integrate and merge. 🚀**

---

## 📧 Questions?

Check these docs in order:
1. **P0_INTEGRATION_GUIDE.md** — integration questions
2. **CSRF_ISOLATION_TESTS.md** — test failures
3. **P0_SECURITY_COMPLETE.md** — architecture questions
4. **PHASE_2_ROADMAP.md** — planning questions

**You're not alone. Everything is documented.** ✅
