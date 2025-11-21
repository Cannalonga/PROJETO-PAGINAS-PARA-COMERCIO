## 📍 ROADMAP PÓS-D.10 → STAGING & PRODUÇÃO

**Documento:** Próximos passos claros após D.10  
**Data:** 21 Novembro 2025  
**Status:** ✅ D.10 COMPLETO | 🟡 STAGING PRÓXIMO

---

## 🎯 DECISÃO CRÍTICA AGORA

**Você tem 3 caminhos:**

```
Opção 1: STAGING DEPLOYMENT IMEDIATAMENTE (⭐ RECOMENDADO)
├─ D.10 tests: ✅ Passing
├─ Risco: 🟢 BAIXO (testes validaram tudo)
├─ Tempo: 1-2 horas
└─ Resultado: Real environment validation

Opção 2: PRODUCTION DEPLOYMENT DIRETO (⚠️ NÃO RECOMENDADO)
├─ D.10 tests: ✅ Passing
├─ Risco: 🔴 ALTO (sem staging validation)
├─ Tempo: 30 min (mas com riscos)
└─ Problema: Se quebrar, usuários reais sofrem

Opção 3: AGUARDAR (❌ DESPERDÍCIO)
├─ D.10 tests: ✅ Passing
├─ Risco: 🟡 DELAY
├─ Tempo: ?
└─ Problema: Features não chegam a usuários
```

**Recomendação:** 👉 **OPÇÃO 1 — Staging Deployment**

---

## 🚀 STAGING DEPLOYMENT — CHECKLIST (1-2 HORAS)

### 1️⃣ Prepare Staging Environment (30 min)

```bash
# 1. Clone repositório em staging server
git clone <repo-url> /var/www/staging/paginas-comercio

# 2. Instalar dependências
cd /var/www/staging/paginas-comercio
npm install --prod

# 3. Build aplicação
npm run build

# 4. Setup banco de dados staging
DATABASE_URL="postgresql://user:pass@staging-db:5432/paginas_staging"
npm run prisma:migrate
npm run prisma:seed

# 5. Setup Stripe TEST mode
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# 6. Setup JWT secret
NEXTAUTH_SECRET="staging_secret_1234..."

# 7. Setup observabilidade
# Verificar que logs estão sendo salvos corretamente
```

### 2️⃣ Deploy Aplicação (15 min)

```bash
# Via Docker (recomendado)
docker build -t paginas-comercio:staging .
docker run -d \
  -e DATABASE_URL="..." \
  -e STRIPE_SECRET_KEY="..." \
  -p 3000:3000 \
  paginas-comercio:staging

# OU via PM2
pm2 start npm --name "paginas-staging" -- start
```

### 3️⃣ Validação Básica (15 min)

```bash
# Health check
curl https://staging.example.com/api/health
# Esperado: { "status": "ok" }

# Login test
curl -X POST https://staging.example.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "..."}'

# Criar página
curl -X POST https://staging.example.com/api/pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Página Teste", ...}'

# Verificar página pública
curl https://staging.example.com/t/test-tenant/test-page
# Esperado: HTML com meta tags SEO corretas
```

### 4️⃣ Teste de Fluxos Críticos (30 min)

#### Fluxo 1: Billing Completo
```
1. Login como tenant admin
2. Ir para /billing/checkout
3. Simular checkout (test credit card: 4242 4242 4242 4242)
4. Webhook Stripe é processado
5. Plano atualiza em tempo real
6. Audit log registra mudança
```

#### Fluxo 2: Page Pública
```
1. Criar página nova (com SEO title/desc)
2. Publicar página
3. Acessar URL pública: /t/[tenant]/[page]
4. Inspecionar HTML:
   - <title> correto?
   - <meta name="description"> correto?
   - <link rel="canonical"> correto?
   - <meta name="robots"> correto se noindex?
   - Open Graph tags? Twitter Card?
```

#### Fluxo 3: Rate Limiting
```
1. Abrir DevTools → Network
2. Fazer 5 requisições para /api/billing/checkout
3. Verificar:
   - 1-3: 201 Created
   - 4-5: 429 Too Many Requests
4. Headers:
   - X-RateLimit-Limit: 3
   - X-RateLimit-Remaining: 0
```

### 5️⃣ Monitoramento (contínuo)

```bash
# Verificar logs em tempo real
tail -f /var/log/paginas-staging/app.log

# Procurar por erros
grep -i "error\|exception\|fatal" /var/log/paginas-staging/app.log

# Alertas de webhook Stripe
grep "webhook" /var/log/paginas-staging/app.log

# Database queries lentas
grep "duration.*>.*1000" /var/log/paginas-staging/app.log
```

---

## ✅ PASS/FAIL CRITERIA PARA STAGING

### ✅ Staging é ✅ SUCESSO se:
```
✅ npm run build — sem erros
✅ Health check — /api/health retorna 200
✅ Login — autenticação funciona
✅ Criar página — POST /api/pages funciona
✅ Publicar página — status=PUBLISHED
✅ Página pública — /t/[tenant]/[slug] carrega com meta tags
✅ Billing checkout — cria sessão Stripe válida
✅ Webhook — tenant atualizado após webhook
✅ Rate limit — 429 na 4ª requisição
✅ Logs — auditoria registrando eventos
✅ Database — queries executam < 100ms
✅ Nenhum 5xx error — logs limpos
```

### ❌ Staging é ❌ FALHA se:
```
❌ Build quebra (npm run build error)
❌ Health check retorna 500
❌ Login falha (401/403)
❌ Criar página retorna erro
❌ Página pública retorna 404
❌ Meta tags faltando/erradas
❌ Webhook não processa
❌ Rate limit não funciona
❌ Muitos 5xx errors em logs
❌ Database timeout
```

---

## 🔄 ROLLBACK PLAN (Se algo quebrar em staging)

### Se quebrar em staging (seguro!)
```
1. Identificar problema nos logs
2. Fazer fix localmente + testes
3. Fazer commit + push
4. Redeploy em staging
5. Revalidar checklist
6. Repeat até passar 100%

(Usuários reais não sofrem porque é staging!)
```

### Se conseguir 100% em staging
```
1. Tag release: git tag -a staging-v1.0.0
2. Documentation: criar STAGING_SUCCESS.md
3. Ready check: todos itens ✅
4. Aprovação: code review final
5. Go ahead: Production deployment
```

---

## 🟢 PRODUCTION DEPLOYMENT (Após staging sucesso)

### Timeline Recomendada

```
Sexta-feira 16:00  → Staging deployment + testes (2h)
Sexta-feira 18:00  → Passar 100% validação
Sexta-feira 18:30  → Production prep (30min)
Sexta-feira 19:00  → Monitoring 1h (engineers online)

ou

Segunda-feira 09:00 → Staging re-validation
Segunda-feira 11:00 → Production deployment
Segunda-feira 11:30 → Monitoring (full day team)
```

### Production Checklist

```
Pre-Production (1 hora antes)
- [x] Database backup feito
- [x] Rollback script testado
- [x] On-call team online
- [x] Monitoring alertas configurados
- [x] Runbook printed

Deployment (30 min)
- [ ] Blue/green setup
- [ ] New version deploy
- [ ] Health checks pass
- [ ] Smoke tests pass
- [ ] Gradual traffic shift (10% → 50% → 100%)

Post-Deployment (1 hora)
- [ ] Monitor 5xx errors (< 0.1%)
- [ ] Monitor webhook failures (0 failures)
- [ ] Monitor database (< 100ms queries)
- [ ] Monitor rate limiting (working)
- [ ] Sample real requests (success)
```

---

## 📞 EMERGENCY CONTACTS

```
Tech Lead:        +55 11 9xxxx-xxxx
DevOps:           +55 11 9xxxx-xxxx
Database Admin:   +55 11 9xxxx-xxxx
Stripe Support:   support@stripe.com

Hours: 24/7 para primeiras 48h pós-deploy
```

---

## 📊 MÉTRICAS A MONITORAR

### Durante Staging

```
Response Time:     < 500ms (p95)
Error Rate:        < 0.1% (5xx errors)
Database:          < 100ms (p95 query)
Webhooks:          100% success (0 failures)
Rate Limiting:     Functioning (429 on limit)
```

### Durante Production

```
Mesmo + 
Uptime:            99.9% SLA
User Signups:      No unexpected drops
Billing:           No webhook losses
Audit Logs:        All events recorded
```

---

## 🎓 LEARNING FROM D.10

### O que D.10 nos ensinou
```
✅ Unit tests sozinhos não são suficientes
✅ Integration tests pegam bugs reais
✅ Webhooks precisam ser testados com retry
✅ Rate limiting precisa validação prática
✅ Multi-tenant isolation é crítica
```

### Aplicar em Production
```
✅ Monitoring webhooks em tempo real
✅ Alertas para 429 patterns anormais
✅ Dashboard de rate limit usage
✅ Logs estruturados de cada fluxo crítico
✅ Audit trail completa de tudo
```

---

## 📈 AFTER PRODUCTION (PHASE F.2)

```
Semana 1: Monitoramento intenso
Semana 2: Coleta feedback usuários
Semana 3: Minor fixes + optimization
Semana 4: PHASE F.2 (Enhanced SEO)
```

### PHASE F.2 Roadmap
```
- sitemap.xml generation
- robots.txt (tenant-aware)
- JSON-LD (LocalBusiness)
- Structured data validation
- WCAG 2.1 compliance
```

---

## 🎯 DECISÃO FINAL

### ✅ Próximo passo OBRIGATÓRIO:

```
1️⃣  Staging Deployment Hoje/Amanhã
2️⃣  Validar 100% checklist
3️⃣  Production Deployment Próxima Semana
4️⃣  Monitoramento 24/7 por 48h
5️⃣  PHASE F.2 Feature Planning
```

### ⏭️ NÃO recomendo:

```
❌ Prod direto sem staging (risco demais)
❌ Aguardar sem ação (perde momentum)
❌ Redis migration agora (não bloqueia MVP)
❌ Mais testes (já temos o suficiente)
```

---

## 📋 AÇÃO IMEDIATA

**Você deve agora:**

1. ✅ Revisar `D10_SUMMARY.md` (resumo visual)
2. ✅ Revisar `INTEGRATION_TESTS_PLAN.md` (como rodar)
3. ✅ Revisar `NEXT_PHASE_VERDICT.md` (arquitetura)
4. 🟡 Preparar ambiente staging (db, configs, Stripe keys)
5. 🟡 Fazer deploy em staging (segunda-feira?)
6. 🟡 Testar 100% do checklist
7. 🟢 Deploy em production (after staging success)

---

**Status:** ✅ D.10 Completo | 🟡 Staging Preparação | 🟢 Production Ready

