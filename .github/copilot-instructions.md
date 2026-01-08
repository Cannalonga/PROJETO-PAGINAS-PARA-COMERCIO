# GitHub Copilot Instructions - VitrinaFast Platform

## Project Context

**VitrinaFast** is a multi-tenant SaaS platform enabling small businesses to create professional digital storefronts in minutes without technical knowledge.

- **Tech Stack:** Next.js 14 + React 18 + TypeScript + Tailwind CSS 4 + Prisma ORM + PostgreSQL
- **Key External Services:** Stripe (billing), Cloudinary (image storage), NextAuth (auth), Redis (queues)
- **Deployment:** Vercel (frontend) + Render (workers)
- **Node Version:** 24.x

---

## Critical Architecture Patterns

### 1. **Multi-Tenant Isolation**
- **Middleware-enforced:** [lib/prisma-middleware.ts](lib/prisma-middleware.ts) - automatically injects `tenantId` into all Prisma queries for models: `Page`, `User`, `TenantData`, `Store`
- **Context Stack:** Use `pushTenantContext(tenantId)` / `popTenantContext()` for nested tenant operations
- **Wrapper Pattern:** Use `withTenant(tenantId, callback)` in [lib/prisma.ts](lib/prisma.ts#L30) for safe tenant-scoped queries
- **CRITICAL:** Always verify tenantId context before DB operations; missing context causes queries to fail silently

### 2. **Authentication & Authorization**
- **NextAuth + JWT:** [lib/auth.ts](lib/auth.ts) implements CredentialsProvider with email + password
- **Password Hashing:** Bcrypt rounds = 12 (not 10) - security patch #3
- **Email Normalization:** Always lowercase + trim emails on login/create/update (patch #9)
- **Roles:** SUPERADMIN, OPERADOR, CLIENTE_ADMIN, CLIENTE_USER (defined in [db/prisma/schema.prisma](db/prisma/schema.prisma#L19))
- **Session Expiry:** 15-minute JWT + refresh tokens (patch #4) - long 30-day sessions are insecure

### 3. **Security Headers & CSP**
- **Middleware:** [middleware.ts](middleware.ts) applies HSTS, X-Frame-Options, CSP headers globally
- **CSP Policy:** `'self'` + Stripe + Cloudinary + fonts.googleapis.com (patch #2 removed unsafe-inline/eval)
- **IMPORTANT:** When adding third-party JS (analytics, tracking), update CSP in middleware.ts BEFORE testing
- **Next.config CSP Headers:** Also defined in [next.config.js](next.config.js#L13) - keep in sync with middleware

### 4. **Database Schema & Relationships**
- **Key Entities:** User → Tenant (1:many), Page (with templates), TenantData (config), Store (billing)
- **Enums in schema:** UserRole, TenantStatus, PageStatus, PageTemplate (LOJA, RESTAURANTE, SERVICOS, CONSULTORIO, SALON, CUSTOM)
- **BillingStatus:** INACTIVE, TRIALING, ACTIVE, PAST_DUE, CANCELED, INCOMPLETE, INCOMPLETE_EXPIRED
- **Prisma Client Logging:** Disabled during builds (see [lib/prisma.ts](lib/prisma.ts#L8-L14))

---

## Development Workflows

### Essential Commands
```bash
npm run dev                    # Start dev server (Next.js on port 3000)
npm run build                  # Build + generate Prisma client
npm run prisma:generate        # Regenerate Prisma client only
npm run prisma:migrate         # Create/apply database migrations
npm run prisma:seed            # Populate test data from db/prisma/seed.ts
npm run prisma:studio          # Open Prisma Studio GUI for DB
npm run type-check             # TypeScript check (tsc --noEmit)
npm run test                   # Run Jest tests (__tests__/**/*.test.ts)
npm run test:watch             # Jest in watch mode
npm run lint                   # Next.js linting
```

### Setup Sequence for New Environment
1. Clone repo + `npm install` (triggers `prisma:generate` postinstall)
2. Copy `.env.example` → `.env.local` (update DATABASE_URL, DIRECT_URL, secrets)
3. `npm run prisma:migrate` (apply pending migrations)
4. `npm run prisma:seed` (optional: load test data)
5. `npm run dev` (start server)

### Common Gotchas
- **Prisma "No Tenant Context":** If queries fail without errors, check tenant context is set (middleware disables context on build)
- **Image Optimization:** Cloudinary is trusted remotePattern in [next.config.js](next.config.js#L51); adding new CDNs requires config update
- **Environment Variables:** NEXTAUTH_SECRET must be generated (use `gen-hash.js` script); don't commit `.env.local`

---

## Code Patterns & Conventions

### API Route Structure
- Location: `app/api/[resource]/[action]/route.ts`
- Enforce tenant isolation: `const tenantId = (session?.user as any)?.tenantId`
- Example: `app/api/pages/create/route.ts` should validate tenantId before creating pages
- Return JSON errors with status codes (400, 401, 403, 404, 500)

### Component Architecture
- **Components Dir:** `components/common/` (reusable), `components/forms/` (form components), `components/layouts/`, `components/templates/`
- **Tailwind:** Use class composition (clsx/classnames), avoid inline styles
- **Form Validation:** Use `react-hook-form` + Zod/yup validators from `lib/validations/`

### Prisma Operations
- Always use `include: { tenant: true }` when fetching users to check tenant access
- For multi-record operations, prefer `findMany()` + `updateMany()` over loops
- Use `delete: { tenantId }` in where clauses to cascade-delete tenant data

### Stripe Integration
- [lib/stripe.ts](lib/stripe.ts) - webhook handling, customer creation, subscription updates
- Webhook secret: STRIPE_WEBHOOK_SECRET in env
- Events: customer.subscription.created/updated/deleted, payment_intent.succeeded

### Image Handling
- Use Cloudinary for user uploads ([lib/upload-validate.ts](lib/upload-validate.ts))
- Sharp.js for optimization (installed, used in API routes)
- Trusted origins in [next.config.js](next.config.js#L51) - validate before adding new domains

---

## Testing Strategy

### Test Setup
- **Framework:** Jest with ts-jest preset, jsdom environment
- **Locations:** `__tests__/**/*.test.ts` and `tests/**/*.e2e.ts`
- **Setup:** [jest.setup.js](jest.setup.js) + [jest.config.js](jest.config.js)

### Key Test Files
- Unit tests in `__tests__/` (lib functions, auth, utilities)
- E2E tests in `tests/` (user flows, API endpoints)
- Security tests exist in `__tests__/security/` (CSP, auth isolation)

### Running Tests
```bash
npm test                    # Run all tests once
npm run test:watch         # Watch mode for development
npm run test:e2e           # Run Playwright E2E tests (if configured)
```

---

## Important Files & Their Purposes

| File | Purpose |
|------|---------|
| [middleware.ts](middleware.ts) | Global security headers, HSTS, CSP, clickjacking protection |
| [lib/auth.ts](lib/auth.ts) | NextAuth configuration, credential validation, session handling |
| [lib/prisma.ts](lib/prisma.ts) | Prisma client singleton, tenant context wrapper |
| [lib/prisma-middleware.ts](lib/prisma-middleware.ts) | Auto-inject tenantId, enforce isolation per query |
| [db/prisma/schema.prisma](db/prisma/schema.prisma) | Data model, enums, relationships |
| [next.config.js](next.config.js) | Image optimization, CSP headers, webpack config |
| [lib/stripe.ts](lib/stripe.ts) | Stripe SDK, webhook validation, subscription logic |
| [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts) | NextAuth endpoint |

---

## Security Audit Status

**10 Security Patches Applied:**
1. SQL Injection - Prisma parameterization ✅
2. CSP Headers - XSS Prevention (removed unsafe-inline) ✅
3. Bcrypt Rounds - Password hashing (10→12) ✅
4. Session Lifetime - Refresh tokens (30d→15m JWT) ✅
5. (Reserved)
6. (Reserved)
7-10. Additional security patches logged in SECURITY_AUDIT_FINAL.md

**Critical Rules:**
- Never use `eval()` or `Function()` constructor
- Never set Response headers without HSTS prefix
- Always normalize emails to lowercase
- Always validate tenant context before DB operations
- CSP violations should be logged (Report-uri configured in next.config.js)

---

## Documentation References

For deeper dives, see:
- [README.md](README.md) - Quick start & stack overview
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - User journey & feature list
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Complete docs index
- [SECURITY_AUDIT_FINAL.md](SECURITY_AUDIT_FINAL.md) - All 10 security patches
- [PRODUCTION_READY_CHECKLIST.md](PRODUCTION_READY_CHECKLIST.md) - Deployment status

---

## When Stuck

1. **"No Tenant Context" DB Errors:** Check middleware.ts disableMiddleware() isn't active; verify tenantId in session
2. **Build Failures:** Clear `.next/` folder, run `npm run prisma:generate`, then `npm run build`
3. **Auth Issues:** Check NEXTAUTH_SECRET in .env.local; verify email is lowercase in seed data
4. **Image Upload Fails:** Validate Cloudinary API key + credentials in .env.local
5. **Prisma Migration Conflicts:** Check `db/prisma/migrations/` for incomplete migrations; run `prisma migrate resolve`
