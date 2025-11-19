# 🚀 SPRINT 2 — ROADMAP COMPLETO & PROTOTIPAGEM

**Data de Início:** November 19, 2025  
**Duração Estimada:** 2.5-3 semanas  
**Objetivo Principal:** Adicionar funcionalidades visuais e de negócio (Editor Visual, Marketplace, Dashboard, SEO, Deploy)

---

## 📋 VISÃO GERAL

### Sprint 1 (✅ COMPLETO)
- ✅ 5 Core Features
- ✅ 21 Endpoints
- ✅ 30 Funções de Negócio
- ✅ 28/28 Testes
- ✅ Production Ready

### Sprint 2 (🔄 INICIANDO AGORA)
- 📊 6 Features Novas/Estendidas
- 🎯 ~40-50 Endpoints Novos
- 💾 ~50-60 Funções de Negócio
- ✨ UI/UX Avançada
- 🚀 Deployment Automation

---

## 🎯 FEATURE 1: EDITOR VISUAL COM DRAG-AND-DROP

### Escopo
- Visual drag-and-drop interface para Page Editor
- Reordenação em tempo real
- Block management (add/remove/edit)
- Live preview lado-a-lado
- Undo/redo functionality

### Arquitetura
```typescript
// Novo componente React
components/PageEditor/
  ├── Editor.tsx (container principal)
  ├── Canvas.tsx (área de edição)
  ├── BlockLibrary.tsx (blocos disponíveis)
  ├── ToolPalette.tsx (ferramentas)
  ├── PropertiesPanel.tsx (edição de propriedades)
  └── hooks/
      ├── useDragAndDrop.ts
      ├── useUndo.ts
      └── useBlockSelection.ts

// Extensão ao lib/page-editor.ts
- moveBlock(pageId, blockId, position)
- duplicateBlock(pageId, blockId)
- recordBlockHistory(pageId, action)
- undoLastChange(pageId)
- redoLastChange(pageId)
```

### Endpoints Novos
- `PATCH /api/pages/{id}/blocks/{blockId}/move` — Mover bloco
- `POST /api/pages/{id}/blocks/{blockId}/duplicate` — Duplicar bloco
- `POST /api/pages/{id}/history/undo` — Desfazer
- `POST /api/pages/{id}/history/redo` — Refazer
- `GET /api/pages/{id}/history` — Histórico de alterações

### Estimativa
- **Dias:** 3-4 dias
- **Tamanho:** ~800-1000 LOC (React + TypeScript)
- **Dependências:** react-beautiful-dnd, zustand (state management)
- **Prioridade:** ALTA

### Benefício de Negócio
- UX dramatically improved
- Merchant experience 10x melhor
- Reduz time-to-market para páginas
- Lower barrier to entry (visual > code)

---

## 🎯 FEATURE 2: TEMPLATE MARKETPLACE

### Escopo
- Browse templates com categorização
- Search e filtering
- Template preview em tempo real
- Clone template para nova página
- Template ratings + reviews
- Trending templates

### Arquitetura
```typescript
// Novo componente React
components/TemplateMarketplace/
  ├── Marketplace.tsx (container)
  ├── TemplateGrid.tsx (lista de templates)
  ├── TemplateCard.tsx (card individual)
  ├── TemplatePreview.tsx (preview modal)
  ├── SearchBar.tsx (busca + filtros)
  └── hooks/
      ├── useTemplateSearch.ts
      └── useTemplateFilter.ts

// Extensão ao lib/template-engine.ts
- getTemplateStats(templateId) — Visualizações, clones, rating
- getTrendingTemplates(limit) — Templates trending
- rateTemplate(templateId, rating, review)
- getTemplateReviews(templateId)
- cloneTemplateToPage(templateId, pageId)

// Novo modelo Prisma
model TemplateReview {
  id String @id @default(cuid())
  templateId String @db.VarChar(255)
  userId String @db.VarChar(255)
  rating Int @db.SmallInt
  review String?
  createdAt DateTime @default(now())
}

model TemplateMetrics {
  id String @id @default(cuid())
  templateId String @db.VarChar(255) @unique
  views Int @default(0)
  clones Int @default(0)
  averageRating Float @default(0)
  updatedAt DateTime @updatedAt
}
```

### Endpoints Novos
- `GET /api/templates/marketplace` — Browse all templates
- `GET /api/templates/marketplace/trending` — Trending templates
- `POST /api/templates/search` — Search com filtros
- `GET /api/templates/{id}/preview` — Template preview
- `POST /api/templates/{id}/clone` — Clone para página
- `POST /api/templates/{id}/reviews` — Adicionar review
- `GET /api/templates/{id}/reviews` — Listar reviews
- `PATCH /api/templates/{id}/metrics` — Update views/clones

### Estimativa
- **Dias:** 3-4 dias
- **Tamanho:** ~1000-1200 LOC
- **Dependências:** react-infinite-scroll, lucide-react (icons)
- **Prioridade:** ALTA

### Benefício de Negócio
- Aumenta template reuse
- Cria comunidade de templates
- Reduz custo de design
- Accelera onboarding merchants

---

## 🎯 FEATURE 3: IMAGE UPLOAD & OPTIMIZATION

### Escopo
- Upload de imagens via drag-and-drop
- Otimização automática (resize, compress)
- Storage em CDN (Cloudinary ou S3)
- Image cropping/editing
- Thumbnail generation

### Arquitetura
```typescript
// Novo lib/image-handler.ts
- uploadImage(file, options) — Upload com otimização
- optimizeImage(file, format) — Compressão
- generateThumbnail(imageUrl, size) — Thumb generation
- cropImage(imageUrl, dimensions) — Cropping
- deleteImage(imageId) — Delete storage

// Novo componente React
components/ImageUploader/
  ├── ImageUploadArea.tsx (drag-drop zone)
  ├── ImageCropper.tsx (crop modal)
  ├── ImageLibrary.tsx (galeria de imagens)
  └── hooks/
      └── useImageUpload.ts

// Novo modelo Prisma
model Image {
  id String @id @default(cuid())
  tenantId String @db.VarChar(255)
  userId String @db.VarChar(255)
  originalUrl String
  optimizedUrl String
  thumbnailUrl String
  width Int
  height Int
  size Int
  format String
  storageId String
  createdAt DateTime @default(now())
}
```

### Endpoints Novos
- `POST /api/images/upload` — Upload com otimização
- `POST /api/images/{id}/crop` — Crop image
- `GET /api/images/library` — Lista de imagens usuário
- `DELETE /api/images/{id}` — Delete image
- `GET /api/images/{id}/thumbnail` — Get thumbnail específica

### Estimativa
- **Dias:** 2-3 dias
- **Tamanho:** ~600-800 LOC
- **Dependências:** sharp (image processing), multer, cloudinary SDK
- **Prioridade:** ALTA

### Benefício de Negócio
- Visual content quality dramatically improved
- Faster page load times (optimization)
- Better UX (in-browser cropping)
- Professional look para merchant pages

---

## 🎯 FEATURE 4: MERCHANT DASHBOARD

### Escopo
- Overview de negócio (stats, metrics)
- Pages management interface
- Analytics visualization
- Publishing status
- Activity timeline

### Arquitetura
```typescript
// Novo componente React
components/MerchantDashboard/
  ├── Dashboard.tsx (container)
  ├── StatsCard.tsx (KPI cards)
  ├── PagesPanel.tsx (pages list)
  ├── AnalyticsChart.tsx (charts)
  ├── ActivityTimeline.tsx (recent activity)
  └── hooks/
      ├── useDashboardStats.ts
      └── useDashboardRefresh.ts

// Novo lib/dashboard.ts
- getDashboardStats(tenantId) — All KPIs
- getPagePerformance(pageId) — Page analytics
- getRecentActivity(tenantId, limit)
- getTopPerformingPages(tenantId, limit)
- getTrendData(tenantId, dateRange)

// Novo modelo Prisma
model DashboardWidget {
  id String @id @default(cuid())
  tenantId String @db.VarChar(255)
  widgetType String
  position Int
  size String
  config Json
}
```

### Endpoints Novos
- `GET /api/dashboard/stats` — KPIs principais
- `GET /api/dashboard/pages-summary` — Resumo de páginas
- `GET /api/dashboard/activity` — Timeline de atividades
- `GET /api/dashboard/performance` — Gráficos de performance
- `GET /api/dashboard/top-pages` — Páginas top
- `PATCH /api/dashboard/widgets` — Configurar widgets

### Estimativa
- **Dias:** 4-5 dias
- **Tamanho:** ~1200-1500 LOC
- **Dependências:** recharts (charts), date-fns
- **Prioridade:** MUITO ALTA

### Benefício de Negócio
- Central hub para merchant manage negócio
- Data-driven decisions
- Engagement metric visibility
- Higher platform stickiness

---

## 🎯 FEATURE 5: SEO AUTOMATION ENGINE

### Escopo
- Meta tags generation (title, description)
- Open Graph tags
- Schema markup (JSON-LD)
- Sitemap generation
- SEO best practices validation
- Mobile-friendly check

### Arquitetura
```typescript
// Novo lib/seo-automation.ts
- generateMetaTags(page) → {title, description, keywords}
- generateOpenGraphTags(page) → og: tags
- generateSchemaMarkup(page) → JSON-LD
- generateSitemap(tenantId) → sitemap.xml
- validateSEOScore(page) → score + recommendations
- generateRobotsTxt(tenantId)
- checkMobileFriendly(pageUrl)

// Novo modelo Prisma
model SEOMetadata {
  id String @id @default(cuid())
  pageId String @db.VarChar(255) @unique
  title String
  description String
  keywords String
  openGraphImage String?
  schemaMarkup Json
  seoScore Int
  recommendations String[]
  checkedAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Endpoints Novos
- `POST /api/pages/{id}/seo/generate` — Gerar SEO metadata
- `GET /api/pages/{id}/seo/score` — SEO score + recommendations
- `GET /api/seo/sitemap.xml` — Sitemap XML
- `GET /api/seo/robots.txt` — Robots.txt
- `POST /api/seo/validate-mobile` — Mobile check

### Estimativa
- **Dias:** 2-3 dias
- **Tamanho:** ~700-900 LOC
- **Dependências:** cheerio (HTML parsing), lighthouse-ci
- **Prioridade:** MÉDIA

### Benefício de Negócio
- Merchants pages ranking better
- Organic traffic increase
- Competitive advantage
- Automatic best practices

---

## 🎯 FEATURE 6: STATIC EXPORT & DEPLOYMENT

### Escopo
- Export pages como HTML estático
- SSG generation (Next.js static export)
- Deploy para CDN (Vercel, Netlify, S3)
- Custom domain support
- Deployment automation

### Arquitetura
```typescript
// Extensão lib/publishing.ts
- exportPageAsHTML(pageId) → HTML file
- generateStaticSite(tenantId) → SSG build
- deployToVercel(siteId, build)
- deployToNetlify(siteId, build)
- deployToS3(siteId, build)
- setupCustomDomain(siteId, domain)
- autoDeployOnPublish(pageId)

// Novo modelo Prisma
model StaticDeployment {
  id String @id @default(cuid())
  pageId String @db.VarChar(255)
  deploymentPlatform String // vercel, netlify, s3
  deploymentUrl String
  customDomain String?
  buildStatus String // pending, building, success, failed
  buildLog String?
  deployedAt DateTime?
  updatedAt DateTime @updatedAt
}

model CustomDomain {
  id String @id @default(cuid())
  tenantId String @db.VarChar(255)
  domain String @unique
  provider String // aws, cloudflare, etc
  dnsRecords Json
  verifiedAt DateTime?
  status String // pending, verified
}
```

### Endpoints Novos
- `POST /api/pages/{id}/export/html` — Export como HTML
- `POST /api/sites/{id}/deploy` — Deploy to platform
- `GET /api/sites/{id}/deployment-status` — Status
- `POST /api/custom-domains` — Setup custom domain
- `DELETE /api/custom-domains/{id}` — Remove domain
- `POST /api/auto-deploy/toggle` — Enable/disable auto-deploy

### Estimativa
- **Dias:** 3-4 dias
- **Tamanho:** ~800-1000 LOC
- **Dependências:** vercel SDK, aws-sdk, sharp
- **Prioridade:** MUITO ALTA

### Benefício de Negócio
- Complete deployment solution
- Multiple hosting options
- Zero-downtime deployments
- Custom branding capability

---

## 📊 TIMELINE & ESTIMATIVAS

### Cronograma Proposto

| Feature | Dias | Horas | Start | End | Priority |
|---------|------|-------|-------|-----|----------|
| Planning + Setup | 0.5 | 4 | Day 1 AM | Day 1 PM | CRÍTICA |
| Editor Visual | 3-4 | 24-32 | Day 1 | Day 4 | ALTA |
| Template Marketplace | 3-4 | 24-32 | Day 3 | Day 6 | ALTA |
| Image Upload | 2-3 | 16-24 | Day 5 | Day 7 | ALTA |
| Merchant Dashboard | 4-5 | 32-40 | Day 6 | Day 11 | MUITO ALTA |
| SEO Automation | 2-3 | 16-24 | Day 10 | Day 13 | MÉDIA |
| Static Deploy | 3-4 | 24-32 | Day 12 | Day 15 | MUITO ALTA |
| Testing + QA | 2-3 | 16-24 | Day 14 | Day 17 | CRÍTICA |
| Deployment | 1 | 8 | Day 17 | Day 18 | CRÍTICA |

**Total:** 2.5-3 weeks (18 calendar days, ~16-18 development days)

### Resourcing
- **Developer:** 1 FTE (você - leading arquitetura + codificação)
- **QA:** Part-time (final 2 days)
- **Designer:** Consulta (UI guidelines já existem)

---

## 🛠️ TECHNICAL STACK (ADIÇÕES)

### Novas Dependencies
```json
{
  "react-beautiful-dnd": "^13.1.1",
  "zustand": "^4.4.0",
  "recharts": "^2.10.0",
  "react-infinite-scroll-component": "^6.1.0",
  "sharp": "^0.32.6",
  "multer": "^1.4.5-lts.1",
  "cloudinary": "^1.40.0",
  "cheerio": "^1.0.0-rc.12",
  "date-fns": "^2.30.0",
  "react-easy-crop": "^4.7.3"
}
```

### Architecture Decisions
1. **State Management:** Zustand (simpler than Redux para este caso)
2. **Charts:** Recharts (lightweight, React-native)
3. **Image Processing:** Sharp (Node.js) + Cloudinary (CDN)
4. **Drag-and-drop:** react-beautiful-dnd (proven, accessible)
5. **SEO:** Custom implementation + external APIs (lighthouse)

---

## 🚀 PRÓXIMAS AÇÕES (IMEDIATAS)

### Today (Next 1-2 hours)
1. ✅ Este roadmap criado
2. → Criar skeleton files para Feature 1 (Editor Visual)
3. → Setup Zustand store structure
4. → Create base components (Canvas, BlockLibrary, etc)
5. → Start API endpoints para block movement

### Tomorrow (Full Day 1)
1. → Complete Editor Visual (prototipo)
2. → Start Template Marketplace design
3. → Setup image upload infrastructure

### Day 2-3
1. → Refine Editor Visual (drag-drop polish)
2. → Complete Template Marketplace (prototipo)
3. → Complete Image Upload (prototipo)

---

## ✅ SUCCESS CRITERIA

### End of Sprint 2
- [ ] Todas 6 features com prototipo funcional
- [ ] ~45-60 novos endpoints
- [ ] ~50+ testes para novas features
- [ ] Zero TypeScript errors
- [ ] 90%+ code coverage
- [ ] Documentation completa
- [ ] Ready para deployment
- [ ] Merchant-ready UX

### Code Quality
- [ ] All tests passing (novo + existentes)
- [ ] ESLint conformance
- [ ] Lighthouse score > 90
- [ ] No console errors/warnings
- [ ] Security audit passed

---

## 📚 PROTOTIPAGEM COMEÇANDO AGORA

Status: **INICIANDO EM 5 MINUTOS**

Próximo passo: Começar Feature 1 (Editor Visual)
