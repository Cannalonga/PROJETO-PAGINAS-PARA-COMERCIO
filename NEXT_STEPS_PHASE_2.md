# 🎯 PRÓXIMOS PASSOS — ROADMAP FASE 2

**Última atualização**: 19/11/2025  
**Status**: Fase 1 (Bloqueadores) ✅ COMPLETA  
**Próxima Milestone**: Fase 2 (Segurança) — 26/11/2025

---

## 📌 PRIORIDADES (Ordem de Execução)

### CRÍTICO - Fazer hoje
1. ✅ ~~Corrigir health endpoint~~ → FEITO
2. ✅ ~~Implementar validação de entrada~~ → FEITO
3. ✅ ~~Aplicar middleware de auth~~ → FEITO
4. ⏳ **Executar `npm install`** (instalar dependências)
5. ⏳ **Criar `.env.local`** (configurar variáveis)
6. ⏳ **Executar migrations** (criar schema no DB)
7. ⏳ **Testar health endpoint** (validar conectividade)

---

## 🚀 COMO COMEÇAR

### Passo 1: Setup Automático (RECOMENDADO)

```powershell
# No VS Code ou PowerShell, na pasta do projeto
.\setup.ps1

# O script vai:
# 1. Copiar .env.example → .env.local
# 2. Solicitar DATABASE_URL
# 3. Gerar NEXTAUTH_SECRET seguro
# 4. npm install
# 5. npm run prisma:generate
# 6. npm run prisma:migrate
# 7. npm run dev
```

### Passo 2: Validar Funcionamento

```bash
# Terminal 1: Servidor dev
npm run dev
# Esperado: "ready - started server on 0.0.0.0:3000"

# Terminal 2: Testar health check
curl http://localhost:3000/api/health

# Esperado: JSON com status "healthy" e "database: healthy"
```

### Passo 3: Preparar Banco de Dados

Se **nunca rodou**, você precisa:

```bash
# Opção A: PostgreSQL Local (recomendado para dev)
# Instale PostgreSQL: https://www.postgresql.org/download/
# Crie database:
# CREATE DATABASE paginas_comercio;

# Opção B: Supabase (cloud)
# 1. Crie conta em https://supabase.com
# 2. New Project (PostgreSQL)
# 3. Copie CONNECTION_STRING de Settings → Database
# 4. Cole em .env.local como DATABASE_URL

# Opção C: Neon (cloud)
# 1. Crie conta em https://neon.tech
# 2. New Project
# 3. Copie connection string
# 4. Cole em .env.local como DATABASE_URL
```

---

## 🔐 SEGURANÇA — PRÓXIMA FASE

### Ordem de Prioridade

#### 🔴 P0: Hoje
- [ ] CSRF Protection middleware
- [ ] Tenant isolation enforcement (verificar tenant_id em cada request)
- [ ] Audit logging para CREATE/UPDATE/DELETE

#### 🟡 P1: Esta semana
- [ ] Rate limiting com Redis (substituir in-memory)
- [ ] Input sanitization headers (Content-Security-Policy)
- [ ] Sentry integration
- [ ] Structured logging com Pino

#### 🟢 P2: Próxima semana
- [ ] OAuth2 social login (Google, GitHub)
- [ ] Email verification flow
- [ ] 2FA support
- [ ] Encryption at rest (senhas, PII)

---

## 📊 FUNCIONALIDADES — ROADMAP

### Sprint 1 (Semana 1)
- [ ] Admin dashboard básico
- [ ] CRUD de tenants completo
- [ ] CRUD de usuários completo
- [ ] CRUD de páginas básico
- [ ] Login/logout funcionando

### Sprint 2 (Semana 2)
- [ ] Page builder (drag & drop sections)
- [ ] Image upload com resize
- [ ] Template system (LOJA, RESTAURANTE, etc)
- [ ] SEO optimization (meta tags, sitemap)

### Sprint 3 (Semana 3)
- [ ] Stripe integration (criar customer, subscription)
- [ ] Billing dashboard
- [ ] Invoice generation
- [ ] Webhook handling

### Sprint 4 (Semana 4)
- [ ] Analytics (page views, conversions)
- [ ] Custom domains (CNAME, SSL)
- [ ] Email templates (welcome, notifications)
- [ ] Monitoring & alerts

---

## 🏗️ ARQUITETURA — CONSIDERAÇÕES

### Estrutura Recomendada (Próximos Passos)

```
app/
├── api/
│   ├── auth/              # ← Auth routes
│   ├── tenants/           # ✅ Done
│   ├── users/             # ← Users CRUD
│   ├── pages/             # ← Pages CRUD
│   ├── analytics/         # ← Analytics events
│   └── webhooks/          # ← Stripe webhooks
├── (admin)/               # ← Admin dashboard routes
│   ├── layout.tsx
│   ├── page.tsx
│   ├── tenants/
│   ├── users/
│   ├── pages/
│   └── settings/
└── [tenant]/              # ← Public pages (SSG)
    ├── layout.tsx
    ├── [slug]/
    │   └── page.tsx
    └── assets/

lib/
├── api-helpers.ts         # ✅ Done (validação, auth)
├── auth.ts                # ✅ NextAuth config
├── middleware.ts          # ← Enhance com CSRF, rate limit
├── prisma.ts              # ✅ Client
├── validations.ts         # ✅ Zod schemas
├── services/              # ← Business logic
│   ├── tenant.service.ts
│   ├── user.service.ts
│   ├── page.service.ts
│   └── stripe.service.ts
└── utils/
    ├── slugs.ts           # ← Slug generation
    ├── image.ts           # ← Image processing
    ├── email.ts           # ← Email templates
    └── seo.ts             # ← SEO helpers
```

---

## 🧪 TESTES — FRAMEWORK

### Unit Tests (Jest)

```typescript
// lib/__tests__/api-helpers.test.ts
import { validateInput, requireRole, generateRequestId } from '@/lib/api-helpers';

describe('API Helpers', () => {
  test('validateInput rejects invalid Zod schema', () => {
    // Test invalid input
  });

  test('requireRole returns 403 for unauthorized', () => {
    // Test role enforcement
  });

  test('generateRequestId creates unique IDs', () => {
    // Test tracing
  });
});
```

### Integration Tests (Jest + Prisma)

```typescript
// app/api/__tests__/tenants.integration.test.ts
import { prisma } from '@/lib/prisma';
import { GET, POST } from '@/app/api/tenants/route';

describe('GET /api/tenants', () => {
  test('returns 401 without auth', () => {
    // Test authentication
  });

  test('returns 403 for non-admin', () => {
    // Test authorization
  });

  test('returns paginated tenants', () => {
    // Test pagination
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/admin.spec.ts
test('Admin can create tenant', async ({ page }) => {
  await page.goto('/admin/tenants');
  await page.fill('input[name="name"]', 'My Store');
  await page.click('button:has-text("Create")');
  await expect(page).toContainText('Tenant created successfully');
});
```

---

## 📈 PERFORMANCE — CHECKLIST

- [ ] Bundle size analysis (`npm run build` → `.next/static/`)
- [ ] Lighthouse score > 90
- [ ] API response time < 200ms (p95)
- [ ] Database query time < 100ms (p95)
- [ ] CSS-in-JS disabled (usar Tailwind)
- [ ] Image optimization (Next.js Image)
- [ ] Font optimization (next/font)

---

## 🚢 DEPLOYMENT — PRÉ-PRODUÇÃO

### Checklist Pré-Deploy

- [ ] All tests passing (`npm run test`)
- [ ] Build successful (`npm run build`)
- [ ] Type checking clean (`npm run type-check`)
- [ ] Lint clean (`npm run lint`)
- [ ] `.env.local` NOT in git
- [ ] Database backups automated
- [ ] Sentry project created
- [ ] Redis cluster provisioned
- [ ] S3 bucket configured

### Deploy Staging

```bash
# 1. Merge to staging branch
git checkout staging
git merge feature-branch

# 2. Run CI pipeline
npm run ci

# 3. Deploy to staging
vercel deploy --prod --target staging

# 4. Run smoke tests
npm run test:e2e -- --reporter=html
```

### Deploy Production

```bash
# 1. Tag release
git tag v0.2.0
git push origin v0.2.0

# 2. GitHub Actions triggered
# .github/workflows/deploy.yml runs:
# - lint
# - type-check
# - test
# - build
# - deploy to Vercel + Render

# 3. Verify production
curl https://api.paginas-comercio.com/api/health
```

---

## 📞 SUPORTE & DOCUMENTAÇÃO

### Documentos Criados
- ✅ README.md (visão geral)
- ✅ .env.example (todas as variáveis)
- ✅ AUDIT_PHASE_1_BLOQUEADORES_CORRIGIDOS.md (detalhes das correções)
- ✅ setup.ps1 (automação)
- ✅ NEXT_STEPS_PHASE_2.md (este arquivo)

### Links Úteis
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Zod Docs](https://zod.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Troubleshooting

**"Database connection refused"**
```bash
# Verifique DATABASE_URL em .env.local
# Verifique se PostgreSQL está rodando
# Teste conexão: psql $DATABASE_URL
```

**"Prisma migration failed"**
```bash
# Reset migrations (DELETA DADOS!)
npm run prisma:reset

# Ou create migrations manually
npm run prisma:migrate
```

**"npm ERR! peer dep missing"**
```bash
# Instale com legacy deps
npm install --legacy-peer-deps
```

---

## 🎯 PRÓXIMA AÇÃO

**Você deve:**

1. ✅ Ler este documento completamente
2. ⏳ Executar `.\setup.ps1` para setup automático
3. ⏳ Testar `curl http://localhost:3000/api/health`
4. ⏳ Criar primeira feature seguindo estrutura em `lib/api-helpers.ts`
5. ⏳ Abrir PR para revisão code

**Tempo estimado**: 30 minutos  
**Resultado**: API rodando localmente e pronta para desenvolvimento

---

**Alguma dúvida? Consulte AUDIT_PHASE_1_BLOQUEADORES_CORRIGIDOS.md para detalhes técnicos.**
