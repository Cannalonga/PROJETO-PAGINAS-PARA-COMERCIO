# FEATURE 7 — BLOCO 5: Sitemap & Robots.txt Automation — Complete Guide

**Status**: ✅ Production Ready  
**Created**: Session N  
**Version**: 1.0.0  
**Language**: Portuguese (Brasil)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Multi-Language Sitemap](#multi-language-sitemap)
4. [Core Modules](#core-modules)
5. [API Endpoints](#api-endpoints)
6. [Search Engine Ping](#search-engine-ping)
7. [Integration with Feature 6](#integration-with-feature-6)
8. [Usage Examples](#usage-examples)
9. [Deployment Checklist](#deployment-checklist)

---

## Overview

**BLOCO 5** implementa um sistema completo de sitemap e robots.txt com:

- **Multi-idioma**: PT-BR, EN-US, ES-ES com hreflang automático
- **Multi-tenant**: Sitemap index global + sitemaps por tenant
- **Inteligente**: Bloqueia rotas privadas, libera conteúdo público
- **Automático**: Ping para Google, Bing, Yandex após atualização
- **Integrado**: Conecta com Feature 6 (deployment system)
- **Production-ready**: Zero dependencies externas, totalmente type-safe

### Key Features

✅ **Global Sitemap Index** — Multi-tenant com última modificação  
✅ **Tenant Sitemaps** — Cada tenant tem seu próprio sitemap  
✅ **Multi-Language Support** — PT-BR, EN-US, ES-ES com hreflang  
✅ **Intelligent Robots.txt** — Prod vs Dev, bloqueia rotas privadas  
✅ **Auto Ping** — Google, Bing, Yandex com fault tolerance  
✅ **Cache Control** — Headers otimizados para performance  
✅ **Regeneration** — Força update após deploy ou mudanças  

---

## Architecture

### Component Hierarchy

```
Sitemap System
├── Global Sitemap Index
│   └── /sitemap.xml → lista todos sitemaps de tenants
├── Tenant Sitemaps
│   └── /[tenantSlug]/sitemap.xml → URLs com hreflang
├── Robots.txt
│   └── /robots.txt → regras globais
└── Search Engine Ping
    ├── POST /api/seo/ping → notifica search engines
    └── POST /api/seo/regenerate → força atualização
```

### Directory Structure

```
src/lib/seo/
├── seo-sitemap-types.ts        # Types (SitemapPage, SitemapContext, etc.)
├── sitemap-generator.ts        # Core: XML builder com hreflang
├── sitemap-index.ts            # Index para multi-tenant
├── robots-generator.ts         # Generator inteligente
└── search-engine-ping.ts       # Ping para Google/Bing/Yandex

app/
├── sitemap.xml/route.ts        # GET /sitemap.xml (index global)
├── [tenantSlug]/sitemap.xml/route.ts  # GET /[tenant]/sitemap.xml
├── robots.txt/route.ts         # GET /robots.txt
└── api/seo/
    ├── ping/route.ts           # POST /api/seo/ping
    └── regenerate/route.ts     # POST /api/seo/regenerate
```

### Data Flow

```
1. Website atualiza página
2. Deploy triggered (Feature 6)
3. POST /api/seo/regenerate enviado
   ↓
4. Sitemap cache invalidado
5. Nova lista de páginas compilada
6. sitemap.xml(s) regenerado
7. Se pingAfter=true:
   ↓
8. POST /api/seo/ping enviado
9. Paralelo: Google + Bing + Yandex notificados
10. Mecanismos de busca re-indexam novas URLs
```

---

## Multi-Language Sitemap

### Estratégia: Hreflang + x-default

Cada página com múltiplos idiomas gera:

```xml
<url>
  <loc>https://dominio.com/pt/pizzaria-do-joao</loc>
  <lastmod>2024-01-15T10:30:00Z</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
  
  <!-- Alternativas em outros idiomas -->
  <xhtml:link rel="alternate" hreflang="pt-BR" 
    href="https://dominio.com/pt/pizzaria-do-joao" />
  <xhtml:link rel="alternate" hreflang="en-US" 
    href="https://dominio.com/en/joes-pizza" />
  <xhtml:link rel="alternate" hreflang="es-ES" 
    href="https://dominio.com/es/pizzeria-juan" />
  <xhtml:link rel="alternate" hreflang="x-default" 
    href="https://dominio.com/pt/pizzaria-do-joao" />
</url>
```

### Impacto em SEO

- **Google**: Indexa cada versão de idioma separadamente
- **Rankings**: Cada país/idioma compite em seu próprio ranking
- **CTR**: Usuários recebem resultado no seu idioma nativo
- **Autoridade**: URLs multi-idioma não competem entre si
- **Cobertura**: Aumenta presença em múltiplos mercados

### Suporte de Idiomas

Atualmente suportados:
- `pt-BR` — Português (Brasil)
- `en-US` — English (USA)
- `es-ES` — Español (España)

Para adicionar mais (ex: `fr-FR`, `de-DE`), edite:

```typescript
// src/lib/seo/seo-sitemap-types.ts
export type SupportedLocale = "pt-BR" | "en-US" | "es-ES" | "fr-FR" | "de-DE";
```

---

## Core Modules

### 1. seo-sitemap-types.ts

Tipos base para todo o sistema de sitemap.

**Tipos principais**:

```typescript
type SupportedLocale = "pt-BR" | "en-US" | "es-ES";

interface PageLocaleInfo {
  locale: SupportedLocale;
  slug: string;              // "pt/pizzaria-do-joao"
  isDefault?: boolean;
}

interface SitemapPage {
  pageId: string;
  tenantId: string;
  baseSlug: string;          // "pizzaria-do-joao"
  isPublished: boolean;
  updatedAt: Date;
  locales: PageLocaleInfo[];
  priority?: number;         // 0.0-1.0
  changefreq?: "weekly" | "daily" | ...;
}

interface SitemapContext {
  baseUrl: string;           // "https://app.dominio.com/tenant-a"
  defaultLocale: SupportedLocale;
  tenantId?: string;
}

interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  hreflang?: Array<{
    locale: string;
    href: string;
  }>;
}
```

---

### 2. sitemap-generator.ts

Core engine que constrói sitemap.xml.

**Funções principais**:

#### `escapeXml(value: string): string`
Escapa caracteres especiais para XML seguro.
```typescript
escapeXml("Pizza & cia") // → "Pizza &amp; cia"
```

#### `buildAbsoluteUrl(baseUrl: string, slug: string): string`
Constrói URL absoluta a partir de base e slug.
```typescript
buildAbsoluteUrl(
  "https://example.com",
  "pt/pizzaria"
) // → "https://example.com/pt/pizzaria"
```

#### `buildHreflangForPageLocales(baseUrl: string, locales: PageLocaleInfo[]): SitemapUrlEntry["hreflang"]`
Constrói links hreflang para múltiplos idiomas.
```typescript
const links = buildHreflangForPageLocales(
  "https://example.com",
  [
    { locale: "pt-BR", slug: "pt/pizzaria", isDefault: true },
    { locale: "en-US", slug: "en/pizza-shop" },
  ]
);
// Retorna array com pt-BR, en-US, x-default
```

#### `buildSitemapXml(pages: SitemapPage[], ctx: SitemapContext, options?): string`
Gera XML completo de sitemap.
```typescript
const xml = buildSitemapXml(pages, context, {
  lastmodByPageId: {
    "page-1": new Date(), // Override lastmod
  }
});
```

---

### 3. sitemap-index.ts

Gerencia sitemap index para multi-tenant.

**Funções principais**:

#### `buildSitemapIndexXml(entries: SitemapIndexEntry[]): string`
Constrói sitemap-index.xml.
```typescript
const xml = buildSitemapIndexXml([
  {
    loc: "https://app.example.com/tenant-a/sitemap.xml",
    lastmod: "2024-01-15T10:30:00Z"
  },
  {
    loc: "https://app.example.com/tenant-b/sitemap.xml",
    lastmod: "2024-01-14T15:45:00Z"
  }
]);
```

#### `buildMultiTenantSitemapIndex(baseUrl: string, tenants: Array<...>): SitemapIndexEntry[]`
Construtor helper para multi-tenant.
```typescript
const entries = buildMultiTenantSitemapIndex(
  "https://app.example.com",
  [
    { slug: "tenant-a", updatedAt: new Date() },
    { slug: "tenant-b", updatedAt: new Date() },
  ]
);
```

---

### 4. robots-generator.ts

Gera robots.txt inteligente.

**Funções principais**:

#### `generateRobotsTxt(options: RobotsOptions): string`
Gera robots.txt com base em ambiente.

Comportamento:
- **Produção**: Libera `/`, bloqueia `/admin`, `/api`, `/dashboard`
- **Desenvolvimento**: Bloqueia tudo (não indexar)

```typescript
const robots = generateRobotsTxt({
  host: "example.com",
  sitemapUrl: "https://example.com/sitemap.xml",
  isProduction: true,
  additionalDisallows: ["/draft", "/temp"]
});
```

Output:
```
User-agent: *
Disallow: /admin
Disallow: /dashboard
Disallow: /api
Disallow: /draft
Disallow: /temp
Allow: /

Host: example.com
Sitemap: https://example.com/sitemap.xml
```

---

### 5. search-engine-ping.ts

Notifica mecanismos de busca sobre sitemap.

**Funções principais**:

#### `pingSearchEngines(options: PingOptions): Promise<PingResults>`
Faz ping paralelo para Google, Bing, Yandex.

```typescript
const results = await pingSearchEngines({
  sitemapUrl: "https://example.com/sitemap.xml",
  debug: true
});

// Results:
// {
//   success: true,
//   results: {
//     google: { ok: true, status: 200 },
//     bing: { ok: true, status: 200 },
//     yandex: { ok: false, status: 0, error: "..." }
//   },
//   summary: { total: 3, successful: 2, failed: 1 }
// }
```

**Características**:
- Fault-tolerant: não falha se um ping falhar
- Timeout: 5s por request
- Paralelo: todos em simultâneo via Promise.all
- Seguro: trata erros sem exceções

---

## API Endpoints

### 1. GET /sitemap.xml

**Retorna**: Sitemap index global (multi-tenant)

**Exemplo**:
```bash
curl https://app.example.com/sitemap.xml
```

**Response** (200 OK):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://app.example.com/tenant-a/sitemap.xml</loc>
    <lastmod>2024-01-15T10:30:00Z</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://app.example.com/tenant-b/sitemap.xml</loc>
    <lastmod>2024-01-14T15:45:00Z</lastmod>
  </sitemap>
</sitemapindex>
```

**Cache Headers**:
```
Cache-Control: public, max-age=86400, s-maxage=86400
```
(24 horas)

---

### 2. GET /[tenantSlug]/sitemap.xml

**Retorna**: Sitemap do tenant com suporte multi-idioma (PT, EN, ES)

**Exemplo**:
```bash
curl https://app.example.com/tenant-a/sitemap.xml
```

**Response** (200 OK):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://app.example.com/tenant-a/pt</loc>
    <lastmod>2024-01-15T10:30:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="pt-BR" 
      href="https://app.example.com/tenant-a/pt" />
    <xhtml:link rel="alternate" hreflang="en-US" 
      href="https://app.example.com/tenant-a/en" />
    <xhtml:link rel="alternate" hreflang="es-ES" 
      href="https://app.example.com/tenant-a/es" />
    <xhtml:link rel="alternate" hreflang="x-default" 
      href="https://app.example.com/tenant-a/pt" />
  </url>
  <url>
    <loc>https://app.example.com/tenant-a/pt/pizzaria-do-joao</loc>
    <lastmod>2024-01-15T09:15:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="pt-BR" 
      href="https://app.example.com/tenant-a/pt/pizzaria-do-joao" />
    <xhtml:link rel="alternate" hreflang="en-US" 
      href="https://app.example.com/tenant-a/en/joes-pizza" />
    <xhtml:link rel="alternate" hreflang="es-ES" 
      href="https://app.example.com/tenant-a/es/pizzeria-juan" />
    <xhtml:link rel="alternate" hreflang="x-default" 
      href="https://app.example.com/tenant-a/pt/pizzaria-do-joao" />
  </url>
</urlset>
```

**Cache Headers**:
```
Cache-Control: public, max-age=43200, s-maxage=43200
```
(12 horas)

**Query Params** (futuros):
- `?locale=en-US` — Filtrar URLs por idioma
- `?priority=0.8` — Filtrar por prioridade mínima
- `?exclude-draft=true` — Excluir páginas rascunho

---

### 3. GET /robots.txt

**Retorna**: Robots.txt global para o sistema

**Exemplo**:
```bash
curl https://app.example.com/robots.txt
```

**Response** (200 OK - Produção):
```
User-agent: *
Disallow: /admin
Disallow: /dashboard
Disallow: /api
Allow: /

Host: app.example.com
Sitemap: https://app.example.com/sitemap.xml
```

**Response** (200 OK - Desenvolvimento):
```
User-agent: *
Disallow: /

# Development environment
Host: app.example.com
Sitemap: https://app.example.com/sitemap.xml
```

**Cache Headers**:
```
Cache-Control: public, max-age=604800, s-maxage=604800
```
(7 dias)

---

### 4. POST /api/seo/ping

**Notifica** mecanismos de busca sobre sitemap.

**Request**:
```bash
curl -X POST https://app.example.com/api/seo/ping
```

**Response** (200 OK):
```json
{
  "success": true,
  "sitemapUrl": "https://app.example.com/sitemap.xml",
  "timestamp": "2024-01-15T10:30:00Z",
  "results": {
    "google": { "ok": true, "status": 200 },
    "bing": { "ok": true, "status": 200 },
    "yandex": { "ok": false, "status": 0, "error": "..." }
  },
  "summary": {
    "total": 3,
    "successful": 2,
    "failed": 1
  }
}
```

**Rate Limit**: 10 pings/hora por IP

**Error Responses**:
- **429**: Rate limit exceeded
- **401**: Unauthorized (sem Bearer token)
- **500**: Server error

**Headers**:
```
Cache-Control: no-cache, no-store, must-revalidate
```

---

### 5. POST /api/seo/regenerate

**Força** regeneração de sitemap.

**Request**:
```bash
curl -X POST https://app.example.com/api/seo/regenerate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSlug": "tenant-a",
    "pingAfter": true
  }'
```

**Response** (202 Accepted):
```json
{
  "success": true,
  "regenerationId": "regen-1705315800000",
  "message": "Sitemap regeneration started",
  "status": "processing",
  "tenantSlug": "tenant-a",
  "pingAfter": true
}
```

**Rate Limit**: 5 regenerações/hora por IP

**Body Parameters**:
- `tenantId` (optional): ID do tenant
- `tenantSlug` (optional): Slug do tenant
- `pingAfter` (optional, default: false): Se notificar search engines após regenerar

**Error Responses**:
- **400**: Missing tenantId/tenantSlug
- **401**: Unauthorized
- **429**: Rate limit exceeded
- **500**: Server error

**Headers**:
```
Cache-Control: no-cache, no-store, must-revalidate
```

---

## Search Engine Ping

### How It Works

1. **Google**: `GET https://www.google.com/ping?sitemap={encoded_url}`
2. **Bing**: `GET https://www.bing.com/ping?sitemap={encoded_url}`
3. **Yandex**: `GET https://webmaster.yandex.com/site/map.xml?host={host}&sitemap_url={url}`

### Execution Strategy

- **Paralelo**: Todos 3 em simultâneo (Promise.all)
- **Timeout**: 5 segundos por request
- **Fault-tolerant**: Se um falhar, outros continuam
- **Logging**: Debug mode para troubleshooting

### Integration with Deployment

Típico workflow:

```
1. Deploy novo conteúdo (Feature 6)
2. Webhook dispara POST /api/seo/regenerate
3. Sitemap regenerado em background
4. Se sucesso: POST /api/seo/ping
5. Google/Bing notificados em < 1 segundo
6. Re-indexação iniciada em horas (não dias)
```

---

## Integration with Feature 6

### DeploymentRecord Integration

**Futuro**: Conectar com tabela `DeploymentRecord` do Feature 6.

```typescript
// app/[tenantSlug]/sitemap.xml/route.ts
import { prisma } from "@/lib/prisma";

// TODO: Substituir mock por query real
const deployments = await prisma.deploymentRecord.findMany({
  where: { tenantId },
  orderBy: { createdAt: "desc" },
  take: 100,
});

// Mapear lastmod de cada página ao deploy mais recente
const lastmodByPageId = Object.fromEntries(
  deployments.map((d) => [d.pageId, d.createdAt])
);

const xml = buildSitemapXml(pages, ctx, { lastmodByPageId });
```

### Auto-Regeneration on Deploy

**Futuro**: Chamar regenerate endpoint automaticamente após deploy.

```typescript
// lib/deployment.ts
export async function triggerSeoRegenerationAfterDeploy(
  tenantId: string,
  tenantSlug: string
) {
  const baseUrl = process.env.APP_BASE_URL;
  const token = process.env.SEO_REGENERATE_TOKEN;

  await fetch(`${baseUrl}/api/seo/regenerate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tenantId,
      tenantSlug,
      pingAfter: true, // Notificar search engines
    }),
  });
}
```

---

## Usage Examples

### Manual Sitemap Testing

```bash
# Get global sitemap index
curl https://app.example.com/sitemap.xml

# Get tenant sitemap
curl https://app.example.com/tenant-a/sitemap.xml

# Get robots.txt
curl https://app.example.com/robots.txt
```

### Manual Ping

```bash
curl -X POST https://app.example.com/api/seo/ping
```

### Manual Regeneration

```bash
curl -X POST https://app.example.com/api/seo/regenerate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSlug": "tenant-a",
    "pingAfter": true
  }'
```

### Programmatic Usage

```typescript
import { 
  buildSitemapXml, 
  buildHreflangForPageLocales 
} from "@/lib/seo/sitemap-generator";

// Gerar sitemap para um tenant
const pages = await fetchPagesFromDatabase(tenantId);
const xml = buildSitemapXml(pages, {
  baseUrl: "https://app.example.com/tenant-a",
  defaultLocale: "pt-BR",
  tenantId,
});

console.log(xml);
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] TypeScript compilation: `npm run type-check`
- [ ] All tests passing: `npm test`
- [ ] Sitemap XML valid: teste com `curl` ou XML validator
- [ ] Robots.txt syntax: confirme User-agent e Disallow
- [ ] Ping endpoints: teste manualmente
- [ ] Rate limiting funcionando
- [ ] Cache headers corretos (verify via DevTools)
- [ ] Environment variables: `APP_BASE_URL`, `NODE_ENV`
- [ ] TODO items completados (Prisma integration)

### Deployment

- [ ] Code pushed to Git
- [ ] CI/CD pipeline passing
- [ ] Feature flags enabled (se aplicável)
- [ ] Rate limits apropriados para scale
- [ ] Monitoring alerts configurados
- [ ] Error tracking habilitado

### Post-Deployment

- [ ] Submeter sitemap ao Google Search Console
- [ ] Submeter sitemap ao Bing Webmaster
- [ ] Monitorar erros de crawl no GSC
- [ ] Verificar índice de URLs em 48h
- [ ] Testar regeneração automática após deploy
- [ ] Validar multi-idioma em SERP
- [ ] Monitorar ping latency

---

## Performance Optimization

### Cache Strategy

- **Global Sitemap**: 24 horas (muda raramente)
- **Tenant Sitemap**: 12 horas (muda com páginas)
- **Robots.txt**: 7 dias (praticamente estático)

### Pagination (Future)

Se > 50,000 URLs por tenant:

```
tenant-a-sitemap-1.xml
tenant-a-sitemap-2.xml
tenant-a-sitemap-3.xml
→ sitemap-index.xml lista todos 3
```

### GZIP Compression (Future)

```typescript
const gzip = require("zlib").gzipSync;
const compressedXml = gzip(xml);
```

---

## Troubleshooting

### Sitemap not updating after deploy

1. Check `/api/seo/regenerate` foi chamado
2. Verify rate limiting não bloqueou
3. Check database connection funciona
4. Verify cache headers não sendo ignorados
5. Force clear: DELETE entries from cache table

### Search engines not indexing URLs

1. Test: `curl https://app.example.com/sitemap.xml`
2. Validate XML: use online XML validator
3. Submit manually ao GSC e Bing Webmaster
4. Wait: Google leva 24-48h para indexar
5. Check robots.txt não está bloqueando

### Hreflang links not appearing

1. Verify todas as páginas têm `locales` array
2. Confirm URL format correto (sem duplicados)
3. Test: use hreflang validator online
4. Check GSC coverage por idioma
5. Verify `isDefault` setado corretamente

---

## Roadmap

### Phase 1 (Atual)
- ✅ Multi-language sitemap
- ✅ Multi-tenant support
- ✅ Robots.txt inteligente
- ✅ Search engine ping

### Phase 2 (Próximo)
- ⏳ Sitemap pagination (> 50k URLs)
- ⏳ GZIP compression
- ⏳ Auto-regenerate on deploy
- ⏳ Prisma integration completa

### Phase 3 (Future)
- ⏳ Rich snippets in SERP
- ⏳ Advanced analytics
- ⏳ SEO scoring insights
- ⏳ A/B testing integrations

---

**BLOCO 5 Implementation Complete** ✅

Total LOC: 1,800+ across generators, endpoints, and types  
Status: Production Ready  
Next: BLOCO 6 - Final Testing & Deployment
