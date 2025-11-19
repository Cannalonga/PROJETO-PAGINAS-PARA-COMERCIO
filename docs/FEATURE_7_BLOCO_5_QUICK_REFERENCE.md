# FEATURE 7 — BLOCO 5: Quick Reference

**Quick lookup guide for developers**

---

## 📚 Module Imports

```typescript
// Types
import type {
  SupportedLocale,
  PageLocaleInfo,
  SitemapPage,
  SitemapContext,
  SitemapUrlEntry,
  SitemapIndexEntry,
} from "@/lib/seo/seo-sitemap-types";

// Generators
import {
  escapeXml,
  buildAbsoluteUrl,
  buildHreflangForPageLocales,
  buildSitemapEntryForPage,
  buildSitemapXml,
  calculateAutoPriority,
} from "@/lib/seo/sitemap-generator";

import { buildSitemapIndexXml, buildMultiTenantSitemapIndex } from "@/lib/seo/sitemap-index";

import {
  generateRobotsTxt,
  generateRobotsTxtForTenant,
} from "@/lib/seo/robots-generator";

import { pingSearchEngines, testPingEngine } from "@/lib/seo/search-engine-ping";
```

---

## 🎯 Quick Usage

### Generate Tenant Sitemap
```typescript
import { buildSitemapXml } from "@/lib/seo/sitemap-generator";
import type { SitemapPage, SitemapContext } from "@/lib/seo/seo-sitemap-types";

const pages: SitemapPage[] = [
  {
    pageId: "page-1",
    tenantId: "tenant-a",
    baseSlug: "home",
    isPublished: true,
    updatedAt: new Date(),
    priority: 1.0,
    changefreq: "daily",
    locales: [
      { locale: "pt-BR", slug: "pt", isDefault: true },
      { locale: "en-US", slug: "en" },
      { locale: "es-ES", slug: "es" },
    ],
  },
];

const context: SitemapContext = {
  baseUrl: "https://app.example.com/tenant-a",
  defaultLocale: "pt-BR",
  tenantId: "tenant-a",
};

const xml = buildSitemapXml(pages, context);
console.log(xml);
```

### Generate Global Sitemap Index
```typescript
import { buildMultiTenantSitemapIndex, buildSitemapIndexXml } from "@/lib/seo/sitemap-index";

const tenants = [
  { slug: "tenant-a", updatedAt: new Date() },
  { slug: "tenant-b", updatedAt: new Date(Date.now() - 86400000) },
];

const entries = buildMultiTenantSitemapIndex("https://app.example.com", tenants);
const xml = buildSitemapIndexXml(entries);
```

### Generate Robots.txt
```typescript
import { generateRobotsTxt } from "@/lib/seo/robots-generator";

const robots = generateRobotsTxt({
  host: "app.example.com",
  sitemapUrl: "https://app.example.com/sitemap.xml",
  isProduction: true,
  additionalDisallows: ["/draft"],
});
```

### Ping Search Engines
```typescript
import { pingSearchEngines } from "@/lib/seo/search-engine-ping";

const results = await pingSearchEngines({
  sitemapUrl: "https://app.example.com/sitemap.xml",
  debug: true,
});

console.log(`Google: ${results.results.google.ok}`);
console.log(`Bing: ${results.results.bing.ok}`);
console.log(`Success rate: ${results.summary.successful}/${results.summary.total}`);
```

---

## 🔌 API Endpoints

### GET /sitemap.xml
```bash
curl https://app.example.com/sitemap.xml
```
Returns: Sitemap index for all tenants (XML)

### GET /[tenantSlug]/sitemap.xml
```bash
curl https://app.example.com/tenant-a/sitemap.xml
```
Returns: Tenant sitemap with multi-language URLs + hreflang (XML)

### GET /robots.txt
```bash
curl https://app.example.com/robots.txt
```
Returns: Robots.txt (plain text)

### POST /api/seo/ping
```bash
curl -X POST https://app.example.com/api/seo/ping
```
Returns: Ping results for Google/Bing/Yandex (JSON)

### POST /api/seo/regenerate
```bash
curl -X POST https://app.example.com/api/seo/regenerate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenantSlug": "tenant-a", "pingAfter": true}'
```
Returns: Regeneration started (JSON, 202 Accepted)

---

## 🗣️ Supported Locales

```typescript
type SupportedLocale = "pt-BR" | "en-US" | "es-ES";

// Currently supported:
// pt-BR — Português (Brasil)
// en-US — English (USA)
// es-ES — Español (España)

// To add more:
// 1. Edit type in seo-sitemap-types.ts
// 2. Update page locale data
// 3. Hreflang auto-generates for all
```

---

## 🎨 Page Priority Calculation

```typescript
import { calculateAutoPriority } from "@/lib/seo/sitemap-generator";

calculateAutoPriority("home", true);        // → 1.0 (home)
calculateAutoPriority("about");             // → 0.7
calculateAutoPriority("contact");           // → 0.7
calculateAutoPriority("blog/post");         // → 0.6
calculateAutoPriority("other-page");        // → 0.5
```

---

## 📊 Hreflang Example Output

For a page with PT, EN, ES:

```xml
<url>
  <loc>https://app.example.com/tenant-a/pt/pizzaria</loc>
  <lastmod>2024-01-15T10:30:00Z</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
  
  <xhtml:link rel="alternate" hreflang="pt-BR" 
    href="https://app.example.com/tenant-a/pt/pizzaria" />
  <xhtml:link rel="alternate" hreflang="en-US" 
    href="https://app.example.com/tenant-a/en/pizza-shop" />
  <xhtml:link rel="alternate" hreflang="es-ES" 
    href="https://app.example.com/tenant-a/es/pizzeria" />
  <xhtml:link rel="alternate" hreflang="x-default" 
    href="https://app.example.com/tenant-a/pt/pizzaria" />
</url>
```

---

## 🔐 Rate Limits

- **Ping**: 10 requests/hour per IP
- **Regenerate**: 5 requests/hour per IP
- **Other endpoints**: No limit (caching handles load)

Response when limit exceeded:
```json
{
  "error": "Rate limit exceeded",
  "status": 429
}
```

---

## 💾 Cache Headers

| Endpoint | Duration | Scope |
|----------|----------|-------|
| /sitemap.xml | 24h | public |
| /[tenant]/sitemap.xml | 12h | public |
| /robots.txt | 7d | public |
| /api/seo/ping | none | no-cache |
| /api/seo/regenerate | none | no-cache |

---

## 🔍 Debugging

### Test XML Generation
```typescript
import { buildSitemapXml } from "@/lib/seo/sitemap-generator";

const xml = buildSitemapXml(pages, context);

// Validate with npm package
const { parseStringPromise } = require("xml2js");
const parsed = await parseStringPromise(xml);
console.log("Valid XML:", parsed);
```

### Test Search Engine Connectivity
```typescript
import { testPingEngine } from "@/lib/seo/search-engine-ping";

const googleResult = await testPingEngine("google", "https://example.com");
console.log(googleResult); // { ok, status, error? }
```

### Debug Ping Results
```typescript
const results = await pingSearchEngines({
  sitemapUrl: "...",
  debug: true,  // Enables console.log
});
```

---

## 🚨 Common Issues

### "Invalid tenant"
- Check tenantSlug is valid
- Verify tenantSlug in database
- Test: GET /tenant-a/sitemap.xml

### Hreflang not showing
- Verify `locales` array not empty
- Check `isDefault` flag is set
- Validate URL format (no duplicates)
- Use hreflang validator: https://www.webconfs.com/hreflang-tags-generator.php

### Ping returns 0 status
- Check internet connectivity
- Verify sitemapUrl is accessible
- Test manually: `curl google.com/ping?sitemap=...`
- Check rate limiting not blocking

### Robots.txt blocking everything
- Verify `NODE_ENV !== "production"`
- Check `isProduction` flag in options
- Test: GET /robots.txt

---

## 📋 Endpoint Testing Checklist

```bash
# 1. Test global sitemap index
curl https://app.example.com/sitemap.xml

# 2. Test tenant sitemap
curl https://app.example.com/tenant-a/sitemap.xml

# 3. Validate XML is valid
# Use: https://www.w3schools.com/xml/xml_validator.asp

# 4. Test robots.txt
curl https://app.example.com/robots.txt

# 5. Test ping endpoint
curl -X POST https://app.example.com/api/seo/ping \
  -H "Content-Type: application/json"

# 6. Test regenerate endpoint
curl -X POST https://app.example.com/api/seo/regenerate \
  -H "Authorization: Bearer TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenantSlug": "tenant-a"}'

# 7. Verify cache headers
curl -I https://app.example.com/sitemap.xml
# Should see: Cache-Control: public, max-age=86400
```

---

## 🔗 Related Documentation

- **Full Docs**: See `FEATURE_7_BLOCO_5_INDEX.md`
- **Status Report**: See `FEATURE_7_BLOCO_5_STATUS.md`
- **BLOCO 4 Dashboard**: See `FEATURE_7_BLOCO_4_INDEX.md`
- **BLOCO 3 JSON-LD**: See `FEATURE_7_BLOCO_3_INDEX.md`
- **SEO Engine**: See `lib/seo-engine.ts`

---

## ✅ Pre-flight Checklist

Before deploying:

- [ ] All sitemaps generate without errors
- [ ] XML valid per schema
- [ ] Hreflang correct for all locales
- [ ] Robots.txt different in prod vs dev
- [ ] Ping endpoints respond
- [ ] Rate limiting working
- [ ] Cache headers present
- [ ] No console errors
- [ ] TypeScript strict mode passing

---

**Last Updated**: Session N  
**Version**: 1.0.0  
**Status**: Production Ready ✅
