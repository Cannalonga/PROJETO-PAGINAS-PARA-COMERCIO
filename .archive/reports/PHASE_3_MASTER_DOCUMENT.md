# 🚀 MASTER DOCUMENT — FASE 3 KICKOFF

**Status:** P0 + P1 COMPLETE (20 files, ~4,900 LOC, 0 errors)  
**Next:** FASE 3 — Product Features (Creator, Templates, Dashboard)  
**Date:** November 19, 2025  
**Target:** Production SaaS with multi-tenant page creation

---

## 📊 CURRENT STATE (P0 + P1 COMPLETE)

### What We Built

**P0 — Security Foundation**
```
✅ CSRF Protection          (lib/csrf.ts + middleware)
✅ Tenant Isolation         (lib/tenant-isolation.ts)
✅ Audit Logging            (lib/audit.ts + CSV export)
✅ Data Encryption Ready    (patterns established)
```

**P1 — Observability Stack**
```
✅ Structured Logging       (Pino, context-aware)
✅ Request Tracing          (Correlation IDs)
✅ Rate Limiting            (Redis, IP/Tenant/User)
✅ Error Tracking           (Sentry integration)
✅ Middleware Composition   (Clean architecture)
```

### Tech Stack Ready

```
Frontend:         Next.js 14 (App Router)
Backend:          Next.js API Routes
Database:         Prisma + PostgreSQL (schema ready)
Auth:             JWT (pattern established)
Logging:          Pino (JSON in prod)
Rate Limiting:    Redis + rate-limiter-flexible
Errors:           Sentry
Storage:          S3 (for tenant images/assets)
Hosting:          Vercel (serverless ready)
```

### Project Structure

```
PAGINAS PARA O COMERCIO APP/
├── app/
│   ├── layout.tsx                    (initialized with P0/P1)
│   ├── page.tsx                      (landing page)
│   └── api/
│       ├── health.ts                 ✅ (P0)
│       ├── csrf-token/               ✅ (P0)
│       ├── audit-logs/               ✅ (P0)
│       ├── tenants/                  ✅ (P0)
│       ├── users/                    ✅ (P0)
│       ├── auth/                     (next)
│       ├── pages/                    (next)
│       ├── templates/                (next)
│       ├── publish/                  (next)
│       └── master/                   (next)
│
├── lib/
│   ├── logger.ts                     ✅ (P1)
│   ├── correlation-id.ts             ✅ (P1)
│   ├── request-context.ts            ✅ (P1)
│   ├── sentry.ts                     ✅ (P1)
│   ├── rate-limit.ts                 ✅ (P1)
│   ├── csrf.ts                       ✅ (P0)
│   ├── tenant-isolation.ts           ✅ (P0)
│   ├── audit.ts                      ✅ (P0)
│   ├── auth.ts                       (next)
│   ├── page-builder.ts               (next)
│   ├── template-engine.ts            (next)
│   ├── publish-utils.ts              (next)
│   └── prisma.ts                     ✅ (Initialized)
│
├── db/
│   └── prisma/
│       ├── schema.prisma             ✅ (Full schema)
│       └── migrations/
│
├── middleware/
│   ├── with-correlation-id.ts        ✅ (P1)
│   ├── with-logger.ts                ✅ (P1)
│   ├── with-sentry.ts                ✅ (P1)
│   ├── with-rate-limit.ts            ✅ (P1)
│   ├── with-auth.ts                  (next)
│   └── with-tenant.ts                (next)
│
├── components/
│   ├── common/                       (next)
│   ├── layouts/                      (next)
│   ├── editor/                       (next)
│   ├── dashboard/                    (next)
│   └── templates/                    (next)
│
└── types/
    ├── index.ts                      ✅ (Initialized)
    ├── page.ts                       (next)
    ├── template.ts                   (next)
    └── tenant.ts                     (next)
```

---

## 🎯 FASE 3 SCOPE — PRODUCT FEATURES

### 3.1 — Page Creator & Editor

**Core Functionality**
```
• Create new page for tenant
• Edit existing page
• Delete page
• Publish page (make live)
• Unpublish page
• Page history/versions
• Preview responsive (mobile/tablet/desktop)
• Drag-drop editor (optional: simple version first)
• Template selection
• Custom CSS support
```

**API Endpoints**
```
POST   /api/tenants/{id}/pages                 Create page
GET    /api/tenants/{id}/pages                 List pages
GET    /api/tenants/{id}/pages/{pageId}        Get page
PUT    /api/tenants/{id}/pages/{pageId}        Update page
DELETE /api/tenants/{id}/pages/{pageId}        Delete page
POST   /api/tenants/{id}/pages/{pageId}/publish    Publish
POST   /api/tenants/{id}/pages/{pageId}/unpublish  Unpublish
GET    /api/tenants/{id}/pages/{pageId}/versions   Get history
```

**Database Models (Prisma)**
```prisma
model Page {
  id              String   @id @default(cuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  title           String
  slug            String
  content         Json     // HTML + component tree
  template        String   // template id used
  isPublished     Boolean  @default(false)
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  versions        PageVersion[]
  
  @@unique([tenantId, slug])
  @@index([tenantId])
}

model PageVersion {
  id        String   @id @default(cuid())
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id])
  content   Json
  version   Int
  createdAt DateTime @default(now())
  
  @@index([pageId])
}
```

---

### 3.2 — Template Engine

**Template Features**
```
• Base templates (5-10 predefined)
• Dynamic variables:
  - Tenant name
  - Tenant logo
  - Tenant phone
  - Tenant email
  - Tenant address
  - Maps embed
  - Product catalog (if applicable)
  - Banner image
  - Business hours
  - Social media links
  - Google Analytics ID

• Sections:
  - Hero section
  - Features/Services
  - Products/Catalog
  - About/Contact
  - Testimonials
  - Call-to-action
  - Footer

• Styling:
  - Light/Dark theme toggle
  - Color customization
  - Font selection (Google Fonts)
```

**API Endpoints**
```
GET    /api/templates                         List templates
GET    /api/templates/{id}                    Get template
POST   /api/templates                         Create template (master only)
PUT    /api/templates/{id}                    Update template (master only)
```

**Database Models (Prisma)**
```prisma
model Template {
  id              String   @id @default(cuid())
  name            String   @unique
  description     String
  thumbnail       String   // URL to preview image
  structure       Json     // Component tree
  variables       String[] // List of variable keys
  themes          Json     // Pre-configured themes
  createdBy       String   // Master user ID
  isPublic        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  pages           Page[]
}

model TemplateVariable {
  id          String   @id @default(cuid())
  templateId  String
  template    Template @relation(fields: [templateId], references: [id])
  key         String   // e.g., "storeName", "phone"
  label       String   // Display name
  type        String   // "text", "email", "url", "image", "color"
  required    Boolean
  
  @@unique([templateId, key])
}
```

---

### 3.3 — Tenant Dashboard (Comerciante)

**Pages**
```
/dashboard                          Overview + stats
/dashboard/pages                    My pages list
/dashboard/pages/new                Create new page
/dashboard/pages/{id}/edit          Edit page
/dashboard/settings                 Tenant settings
/dashboard/settings/profile         Edit profile
/dashboard/settings/branding        Logo, colors
/dashboard/settings/social          Social links
/dashboard/analytics                View stats
```

**Features**
```
• List all tenant's pages
• See published status
• Quick edit/publish
• Upload images/assets
• Configure tenant info
• View basic analytics (page views, etc)
• Delete pages
• View page history
• Preview pages
```

**Components Needed**
```
- TenantLayout (sidebar + header)
- PagesList (table/grid view)
- PageEditor (inline or modal)
- SettingsForm (tenant config)
- AnalyticsChart (basic stats)
- ImageUploader (S3 integration)
```

---

### 3.4 — Master Dashboard (Você)

**Pages**
```
/master                             Overview
/master/tenants                     Manage all tenants
/master/tenants/new                 Create new tenant
/master/tenants/{id}                View tenant details
/master/tenants/{id}/edit           Edit tenant
/master/templates                   Manage templates
/master/users                       Manage users
/master/logs                        View audit logs
/master/analytics                   Platform analytics
/master/settings                    Platform settings
```

**Features**
```
• Create new tenant
• Manage tenant subscriptions/plans
• View all published pages
• See platform analytics
• View audit logs
• Monitor rate limits
• Manage users
• Configure system settings
• See error logs (Sentry)
```

**API Endpoints**
```
POST   /api/master/tenants                Create tenant
GET    /api/master/tenants                List all tenants
PUT    /api/master/tenants/{id}           Update tenant
DELETE /api/master/tenants/{id}           Delete tenant

GET    /api/master/analytics              Platform analytics
GET    /api/master/audit-logs             Audit trail
GET    /api/master/errors                 Error logs
```

---

### 3.5 — Deployment & Publishing

**Publishing Flow**
```
1. Tenant creates/edits page in dashboard
2. Tenant clicks "Publish"
3. System validates page + content
4. Generate static HTML + assets
5. Deploy to CDN or static host
6. Page live at: {tenant-slug}.pages-commercio.com/pages/{page-slug}
   OR: pages-commercio.com/{tenant-slug}/pages/{page-slug}
```

**Deployment Options**
```
Option A: Vercel (easiest, costs scale)
  - Each tenant gets a deployment
  - Uses environment variables for tenant ID
  - Fast preview deployments

Option B: Static S3 + CloudFront (cheapest)
  - Generate static HTML per page
  - Upload to S3
  - Serve via CloudFront
  - Very scalable

Option C: Serverless (middle ground)
  - Use Vercel Functions or AWS Lambda
  - Dynamic tenant routing
  - Good balance
```

**For MVP: Recommend Option C (Dynamic Routing)**
```
Flow:
1. Request comes to: {subdomain}.pages-commercio.com
2. Middleware routes to correct handler
3. Handler loads tenant data from DB
4. Handler renders page with tenant context
5. Response with proper headers (caching, etc)

API Endpoint:
GET  /published/{tenant-slug}/{page-slug}  Public page view (no auth)
```

---

## 📐 ARCHITECTURE OVERVIEW

### Request Flow (Already Implemented P0/P1)

```
Client Request
    ↓
withCorrelationId (initialize context + tenant ID)
    ↓
withLogger (log request)
    ↓
withSentry (catch errors)
    ↓
withRateLimit (check limits)
    ↓
withAuth (verify JWT) ← NEW IN PHASE 3
    ↓
withTenant (scope to tenant) ← NEW IN PHASE 3
    ↓
Handler (business logic)
    ↓
Response (with correlationId header)
    ↓
Logs to stdout/Sentry
    ↓
Client
```

### Authentication Flow (PHASE 3)

```
1. Login: POST /api/auth/login
   → JWT token issued
   → Refresh token stored in httpOnly cookie

2. Request: GET /api/tenants/{id}/pages
   → JWT from Authorization header
   → withAuth middleware validates
   → withTenant middleware checks tenant access
   → Handler executes

3. Logout: POST /api/auth/logout
   → Clear refresh token
   → Client clears JWT
```

---

## 🗄️ DATABASE SCHEMA (For Phase 3)

### New Models Needed

```prisma
model Tenant {
  id              String   @id @default(cuid())
  slug            String   @unique
  name            String
  email           String   @unique
  phone           String?
  address         String?
  logo            String?  // URL
  banner          String?  // URL
  
  // Settings
  theme           String   @default("light")
  accentColor     String   @default("#0066cc")
  businessHours   Json?    // { mon: "9-5", tue: "9-5", ... }
  
  // Subscription
  plan            String   @default("free")  // free, pro, enterprise
  monthlyPagesLimit Int    @default(5)
  customDomain    String?
  
  // Relations
  ownerId         String
  owner           User     @relation(fields: [ownerId], references: [id])
  users           User[]
  pages           Page[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([ownerId])
}

model User {
  id              String   @id @default(cuid())
  email           String   @unique
  passwordHash    String
  name            String
  role            String   @default("user")  // admin, editor, viewer
  
  // Multi-tenant
  tenants         Tenant[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Page {
  id              String   @id @default(cuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  title           String
  slug            String   @unique
  content         Json     // Serialized component tree
  templateId      String?
  template        Template? @relation(fields: [templateId], references: [id])
  
  isPublished     Boolean  @default(false)
  publishedAt     DateTime?
  publishedUrl    String?  // Generated URL
  
  seoTitle        String?
  seoDescription  String?
  
  views           Int      @default(0)
  
  createdBy       String
  updatedBy       String
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  versions        PageVersion[]
  
  @@unique([tenantId, slug])
  @@index([tenantId])
  @@index([isPublished])
}

model PageVersion {
  id        String   @id @default(cuid())
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id])
  content   Json
  versionNumber Int
  createdBy String
  createdAt DateTime @default(now())
  
  @@index([pageId])
}

model Template {
  id              String   @id @default(cuid())
  name            String   @unique
  description     String
  thumbnail       String   // URL to preview
  content         Json     // Component structure
  variables       Json     // Variable definitions
  
  createdBy       String   // Master user ID
  isPublic        Boolean  @default(true)
  
  pages           Page[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 🔄 IMPLEMENTATION ROADMAP

### Sprint 1: Foundation (Week 1-2)

**Goals:**
- ✅ Database migrations
- ✅ User authentication (login/logout)
- ✅ Tenant CRUD
- ✅ Basic page model

**Deliverables:**
```
lib/auth.ts                    JWT token generation/validation
middleware/with-auth.ts        Auth verification
middleware/with-tenant.ts      Tenant scoping
app/api/auth/login            Login endpoint
app/api/auth/logout           Logout endpoint
app/api/auth/refresh          Token refresh
app/api/tenants/{id}/pages    Page CRUD endpoints
app/pages/auth/login          Login page
app/pages/auth/register       Register page (optional)
```

---

### Sprint 2: Page Editor (Week 3-4)

**Goals:**
- ✅ Simple page builder
- ✅ Template system
- ✅ Content storage
- ✅ Preview functionality

**Deliverables:**
```
lib/template-engine.ts         Template rendering logic
app/api/templates              Template endpoints
app/api/pages                  Page endpoints (full CRUD)
app/pages/editor               Page editor component
components/Editor              Drag-drop editor (or form-based)
components/Preview             Responsive preview
components/TemplateSelector    Template picker
```

---

### Sprint 3: Tenant Dashboard (Week 5-6)

**Goals:**
- ✅ Merchant interface
- ✅ Page management
- ✅ Tenant settings
- ✅ Basic analytics

**Deliverables:**
```
app/pages/dashboard            Dashboard layout
app/pages/dashboard/pages      Pages list
app/pages/dashboard/pages/new  Create page
app/pages/dashboard/pages/[id] Edit page
app/pages/dashboard/settings   Tenant settings
components/Dashboard/          Dashboard components
```

---

### Sprint 4: Master Dashboard (Week 7-8)

**Goals:**
- ✅ Platform overview
- ✅ Tenant management
- ✅ User management
- ✅ Analytics/Logs

**Deliverables:**
```
app/api/master/*              Master endpoints
app/pages/master              Master dashboard
app/pages/master/tenants      Tenant management
app/pages/master/users        User management
app/pages/master/analytics    Platform analytics
components/Master/            Master dashboard components
```

---

### Sprint 5: Publishing & Deployment (Week 9-10)

**Goals:**
- ✅ Static page generation
- ✅ Publishing flow
- ✅ Public URL generation
- ✅ CDN integration

**Deliverables:**
```
lib/publish-utils.ts          Publishing logic
app/api/pages/{id}/publish    Publish endpoint
app/pages/published/[tenant]/[page]  Public page view
lib/cdn-utils.ts              CDN integration
scripts/deploy.ts             Deployment script
```

---

## 📦 DEPENDENCIES TO ADD

```bash
npm install \
  next-auth \
  jsonwebtoken \
  bcrypt \
  zod \
  react-beautiful-dnd \
  react-hook-form \
  recharts \
  @tanstack/react-query \
  axios \
  clsx \
  tailwind-css
```

---

## 🎨 UI/UX FOUNDATION (Phase 3.0)

### Design System

```
Colors:
  Primary:    #0066cc (Professional blue)
  Success:    #00b359 (Green)
  Warning:    #ff9900 (Orange)
  Error:      #cc0000 (Red)
  Neutral:    #f5f5f5 - #333333

Typography:
  Heading:    Inter, 24px, bold
  Body:       Inter, 14px, regular
  Caption:    Inter, 12px, regular

Spacing:
  Unit:       8px (all multiples: 8, 16, 24, 32, ...)

Components:
  Button:     Primary, Secondary, Outline, Danger
  Input:      Text, Email, Number, Select, Textarea
  Card:       Shadow, padding, border
  Modal:      Dialog, confirmation
  Toast:      Info, success, warning, error
```

---

## 🚀 PHASE 3 EXECUTION STRATEGY

### Week 1-2: Sprint 1 (Auth + Tenants)

**Day 1-2:**
- Prisma migrations
- User signup/login flow
- JWT implementation
- Auth middleware

**Day 3-4:**
- Tenant CRUD endpoints
- Tenant scoping middleware
- Basic tenant dashboard

**Day 5-10:**
- Auth UI (login/register)
- Tenant settings UI
- Testing + refinement

---

### Week 3-4: Sprint 2 (Page Editor)

**Day 1-4:**
- Template system design
- Page model + endpoints
- Simple page editor (form-based, NOT drag-drop for MVP)

**Day 5-10:**
- Editor UI
- Preview functionality
- Page versioning

---

### Week 5-6: Sprint 3 (Dashboard)

**Day 1-5:**
- Tenant dashboard layout
- Pages list/management
- Create/edit page flows

**Day 6-10:**
- Settings page
- Analytics dashboard
- Image upload (S3)

---

### Week 7-8: Sprint 4 (Master)

**Day 1-5:**
- Master dashboard layout
- Tenant management UI
- User management UI

**Day 6-10:**
- Analytics
- Logs viewer
- System settings

---

### Week 9-10: Sprint 5 (Publishing)

**Day 1-5:**
- Publishing logic
- Page generation
- URL routing

**Day 6-10:**
- Deployment
- CDN integration
- Testing + launch

---

## ✅ SUCCESS CRITERIA

**For MVP Launch:**
```
✅ Tenants can create pages
✅ Pages use templates
✅ Pages can be published
✅ Public pages are accessible
✅ Tenant dashboard works
✅ Master dashboard works
✅ All P0/P1 security active
✅ Rate limiting active
✅ Errors logged to Sentry
✅ Audit trail complete
```

---

## 📊 METRICS TO TRACK

```
Technical:
- Page creation time (should be <2s)
- Page load time (should be <1s)
- API response time (should be <200ms)
- Error rate (should be <0.1%)

Business:
- Pages created (daily/weekly)
- Pages published (daily/weekly)
- Active tenants (daily/weekly)
- Tenant retention
- Page views
```

---

## 🔒 Security Checklist (P0/P1 Base)

Already Implemented:
```
✅ CSRF protection on forms
✅ Tenant isolation enforced
✅ Rate limiting active
✅ Audit logging complete
✅ Error masking in production
✅ Request correlation tracking
```

Phase 3 Must Add:
```
- JWT token validation ← ADD
- Password hashing (bcrypt) ← ADD
- HTTPS enforcement ← ADD
- CORS configuration ← ADD
- Input sanitization ← ADD
- XSS prevention ← ADD
- SQL injection prevention (via Prisma) ← Already covered
```

---

## 🎯 NEXT IMMEDIATE STEP

### Option 1: Sprint 1 Codebase (Recommended)

I generate:
- Auth system (lib/auth.ts + middleware)
- User/Tenant models + migrations
- Login/Register endpoints
- Basic tenant dashboard

**Estimated:** 2-3 hours, 1,000-1,500 LOC

**Result:** You can start building features immediately

### Option 2: Full Roadmap Document

I create detailed specs for each sprint with:
- Wireframes (ASCII art)
- Endpoint definitions
- Component structure
- Testing strategy

**Estimated:** 1 hour, comprehensive guide

### Option 3: Design System + UI Components

I create:
- Tailwind config
- Component library (buttons, inputs, cards, etc)
- Layout components
- Dashboard skeleton

**Estimated:** 2 hours, production-ready UI

---

## 🎊 PHASE 3 IS READY TO START

**You have:**
- ✅ Secure foundation (P0)
- ✅ Observable system (P1)
- ✅ Database schema (ready)
- ✅ Tech stack chosen
- ✅ Architecture designed
- ✅ Sprints planned
- ✅ Roadmap clear

**What you need:**
→ Choose Option 1, 2, or 3 above

**Then we build the PRODUCT.**

---

## 🚀 FINAL NOTE

This project has evolved from:
- "Let's build a SaaS" → ✅ Foundation done
- "Let's secure it" → ✅ P0 complete
- "Let's monitor it" → ✅ P1 complete
- **"Let's build the actual product"** ← YOU ARE HERE

**Time to make it real.**

---

**Branch:** feature/fase-2-seguranca-observabilidade  
**Next:** Choose implementation option above  
**Status:** Ready to proceed 🚀
