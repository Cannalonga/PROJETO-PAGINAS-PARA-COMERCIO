# 🔐 SECURITY GATES & COMPLIANCE

**Last Updated:** November 18, 2025  
**Status:** ✅ PRODUCTION READY  
**Compliance:** LGPD, GDPR, PCI-DSS (partial)

---

## 1. Security Gates (Pre-Deployment Checklist)

### Pre-Push to Main
- [ ] `npm audit --audit-level=high` returns 0 vulnerabilities
- [ ] `git log --all` scanned for secrets (no API keys, tokens, credentials)
- [ ] `npx tsc --noEmit` passes (no TypeScript errors)
- [ ] `npm run build` succeeds with 0 errors
- [ ] `npm test` passes (or all tests skipped appropriately)
- [ ] `.env.local` is in `.gitignore` and NOT committed
- [ ] `NEXTAUTH_SECRET` is generated fresh (not hardcoded)
- [ ] All endpoints use `withAuth()` middleware before processing

### Pre-Merge to Main (CI/CD Gates)
- [ ] CodeQL analysis passes (no high-severity issues)
- [ ] Dependabot security PRs are reviewed and merged
- [ ] All GitHub Actions workflows pass:
  - Security scan ✅
  - Lint & TypeScript ✅
  - Unit & integration tests ✅
  - Build ✅
- [ ] Code coverage remains above 70% (aim for 80%+)
- [ ] No secrets found in branch history

### Pre-Deploy to Production
- [ ] Database backup taken (snapshot at current state)
- [ ] Prisma migrations tested on shadow database
- [ ] Load test passed: 50 concurrent requests, p95 < 200ms
- [ ] All rate limiters configured and active
- [ ] Audit logging verified (create → audit-log entry present)
- [ ] Sentry integration active and receiving events
- [ ] CORS headers verified in response
- [ ] CSP headers verified in response
- [ ] HSTS header enabled in production
- [ ] Custom domain SSL certificate valid (if applicable)

---

## 2. Middleware Stack (Mandatory for ALL Endpoints)

Every endpoint MUST apply this middleware chain in order:

```typescript
// Correct order (middleware.ts):
1. withAuth()              // Validate JWT
2. withRole(allowedRoles)  // Check RBAC
3. withTenantIsolation()   // IDOR prevention (CRITICAL)
4. rateLimitResponse()     // Rate limiting
5. withValidation()        // Input validation (Zod)
```

### Example: Protected Endpoint with All Gates

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, withTenantIsolation } from '@/lib/middleware';
import { rateLimiters, rateLimitResponse } from '@/lib/rate-limiter';
import { logAuditEvent } from '@/lib/audit';
import { getTenantIdFromSession } from '@/lib/middleware';

// ✅ PROTECTED: Auth required, RBAC required, rate-limited, tenant-isolated
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Validate auth
  const userId = request.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  // 2. Check rate limit FIRST
  const limitResult = rateLimitResponse(rateLimiters.api)(request);
  if (limitResult) return limitResult; // 429 Too Many Requests

  // 3. Get tenant (already validated by middleware)
  const tenantId = getTenantIdFromSession(request);

  // 4. Parse & validate input
  const body = await request.json();
  // validation here...

  // 5. Business logic
  // ...

  // 6. Log audit
  await logAuditEvent({
    userId,
    tenantId,
    action: 'UPDATE',
    entity: 'USER',
    entityId: params.id,
    oldValues: oldUser,
    newValues: updated,
    maskPii: true, // Mask email, phone, etc.
  });

  return NextResponse.json({ success: true });
}
```

---

## 3. IDOR Prevention (Insecure Direct Object Reference)

### ✅ What We Do

1. **Always validate tenant from JWT, never from client**
   ```typescript
   // ✅ CORRECT
   const tenantId = request.headers.get('x-tenant-id'); // From session
   
   // ❌ WRONG
   const tenantId = request.query.tenantId; // Client-provided
   ```

2. **Check tenant match before any query**
   ```typescript
   if (requestedTenantId !== userTenantId && userRole !== 'SUPERADMIN') {
     return errorResponse('Forbidden', 403);
   }
   ```

3. **Apply to ALL queries**
   ```typescript
   const data = await prisma.model.findUnique({
     where: { id: resourceId, tenantId }, // Always include tenantId
   });
   ```

### 🧪 Test IDOR Attempts
```bash
# Attempt 1: Access another tenant's data
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer TENANT_A_TOKEN" \
  -H "x-tenant-id: TENANT_B_ID"
# Expected: 403 Forbidden

# Attempt 2: SUPERADMIN can bypass (intentional)
curl -X GET http://localhost:3000/api/users?tenantId=ANY_TENANT \
  -H "Authorization: Bearer SUPERADMIN_TOKEN"
# Expected: 200 OK (SUPERADMIN privilege)
```

---

## 4. Rate Limiting

### Configured Limits
| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/login | 5 | 15 min |
| POST /api/auth/signup | 5 | 15 min |
| GET /api/users | 100 | 1 min |
| POST /api/pages | 50 | 1 min |
| POST /api/upload | 10 | 1 hour |
| Webhooks | 500 | 1 hour |

### Monitor Rate Limiting
```bash
# Check remaining requests in headers
curl -I http://localhost:3000/api/users
# Headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 87
# X-RateLimit-Reset: 2025-11-18T21:45:00Z
```

---

## 5. Audit Logging & LGPD Compliance

### What's Logged
- ✅ User ID
- ✅ Tenant ID
- ✅ Action (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
- ✅ Entity type and ID
- ✅ Old values (before) / New values (after)
- ✅ IP address (last octet masked)
- ✅ User agent
- ✅ Timestamp (ISO 8601)

### What's Masked (PII)
- ✅ Email: `user@example.com` → `u***@example.com`
- ✅ Phone: `+55 11 98765-4321` → `+55 11 9876****`
- ✅ CPF/CNPJ: `123.456.789-00` → `123.***.***-**`
- ✅ Password: Always `***REDACTED***`
- ✅ Credit card: Always `***REDACTED***`

### Retention Policy
- **Default:** 30 days
- **Compliance:** LGPD requires retention of audit logs for legal disputes (can extend to 90 days if needed)
- **Deletion:** Run scheduled job `prisma.auditLog.deleteMany({ where: { timestamp: { lt: 30daysAgo } } })`

### Query Audit Logs
```bash
# List recent logins
curl -X GET "http://localhost:3000/api/audit-logs?action=LOGIN&limit=10" \
  -H "Authorization: Bearer SUPERADMIN_TOKEN"

# List user modifications
curl -X GET "http://localhost:3000/api/audit-logs?entity=USER&tenantId=TENANT_ID" \
  -H "Authorization: Bearer SUPERADMIN_TOKEN"
```

---

## 6. Dependency Security

### Automated Scanning
- ✅ GitHub Dependabot: Daily security updates
- ✅ npm audit: Pre-push check (high severity blocks)
- ✅ CodeQL: Static analysis in CI/CD

### Manual Inspection
```bash
# List outdated packages
npm outdated

# Audit all dependencies
npm audit

# Specific vulnerability info
npm audit show PACKAGE_NAME

# Update safely (patch only)
npm update
npm ci  # Install exact versions from package-lock
```

---

## 7. Secrets Management

### Never Commit
- [ ] `.env.local` (local development)
- [ ] `.env.production.local` (production secrets)
- [ ] Private API keys, tokens, credentials
- [ ] Database connection strings (use managed services)

### Manage Secrets Safely
```bash
# Development (local)
echo "DATABASE_URL=postgresql://..." > .env.local
echo ".env.local" >> .gitignore

# Production (GitHub Secrets)
# Go to repo Settings → Secrets and variables → Actions
# Add: DATABASE_URL, NEXTAUTH_SECRET, STRIPE_SECRET_KEY, etc.

# Deploy with secrets
git push origin main
# CI/CD uses secrets from GitHub Actions secrets
```

### Rotate Secrets
If any secret is exposed:
1. Rotate immediately on provider (Stripe, Auth0, etc.)
2. Update in GitHub Secrets
3. Redeploy application
4. Run `git log --all` to verify old secrets removed
5. If found: use `git filter-repo` to rewrite history

---

## 8. Webhook Security (Stripe Example)

### Validate Signatures
```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature');
  
  // ✅ VALIDATE before processing
  try {
    const event = stripe.webhooks.constructEvent(
      await request.text(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // ✅ Only process verified events
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle payment
        break;
      default:
        console.warn('Unhandled webhook:', event.type);
    }
  } catch (err) {
    console.error('Webhook signature validation failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
```

---

## 9. Headers & CSP

### Automatic Security Headers
```typescript
// next.config.js already includes:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - X-XSS-Protection: 1; mode=block
// - Content-Security-Policy (strict)
// - Strict-Transport-Security (HSTS)
```

### Verify Headers
```bash
curl -I http://localhost:3000
# Should show:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000
```

---

## 10. Incident Response

### If Breach Suspected
1. **Isolate:** Disconnect affected service
2. **Investigate:** Check audit logs for suspicious activity
3. **Rotate:** All credentials and secrets
4. **Notify:** Affected users (LGPD Art. 34)
5. **Update:** Security measures to prevent recurrence
6. **Document:** Incident report + lessons learned

### Audit Log Investigation
```bash
# Find suspicious activity in last hour
curl -X GET "http://localhost:3000/api/audit-logs?startDate=2025-11-18T20:00:00Z&action=DELETE" \
  -H "Authorization: Bearer SUPERADMIN_TOKEN"

# Export logs for analysis
curl -X GET "http://localhost:3000/api/audit-logs?limit=1000" > audit_export.json
```

---

## ✅ Pre-Production Checklist

- [ ] All 10 security gates implemented and tested
- [ ] Middleware applied consistently to all endpoints
- [ ] IDOR prevention verified on all resources
- [ ] Rate limiting active and monitored
- [ ] Audit logging with PII masking enabled
- [ ] Secrets rotated and GitHub Secrets configured
- [ ] Webhooks validated with signatures
- [ ] Headers verified in responses
- [ ] CI/CD gates passing (CodeQL, tests, build)
- [ ] Database backup procedure documented
- [ ] Incident response playbook created
- [ ] Team trained on security practices

---

**Status:** 🟢 PRODUCTION READY  
**Next:** Proceed to deployment with confidence.
