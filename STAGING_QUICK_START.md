# 🎯 Staging Deployment - Quick Start

**Status**: ✅ Local validation complete (655 tests passing, build OK)

## Fluxo Direto (Copie & Cole)

### 1️⃣ Criar Database Staging
```
Opção: Supabase | Neon | Railway
Resultado esperado: DATABASE_URL_STAGING
```

### 2️⃣ Deploy Migrations
```bash
# Criar .env.staging.local com DATABASE_URL staging
npx prisma migrate status
npx prisma migrate deploy
```

✅ Deve listar: Tenant, Page, User, AuditLog, etc.

### 3️⃣ Configurar Env Staging (no provedor - Vercel/Render)
```
DATABASE_URL = [sua db staging]
NEXTAUTH_SECRET = [gerar com: openssl rand -base64 32]
STRIPE_SECRET_KEY = sk_test_...
STRIPE_WEBHOOK_SECRET = whsec_test_...
STRIPE_PRICE_BASIC_ID = price_test_...
STRIPE_PRICE_PRO_ID = price_test_...
STRIPE_PRICE_PREMIUM_ID = price_test_...
NEXT_PUBLIC_APP_URL = https://app-staging.seu-dominio.com
NEXT_PUBLIC_PUBLIC_BASE_URL = https://pages-staging.seu-dominio.com
(+ S3, Redis, etc do .env.example)
```

### 4️⃣ Setup Stripe Test
- Dashboard → Test Mode
- Criar 3 Products: BASIC, PRO, PREMIUM
- Webhook: POST /api/stripe/webhook
- Copiar signing secret

### 5️⃣ Deploy
```
Git push main → Vercel/Render auto-deploy
```

### 6️⃣ Validar
```bash
# Health check
curl https://app-staging.seu-dominio.com/api/health
# Esperado: { "status": "ok", "checks": { "app": "ok", "db": "ok" } }
```

### 7️⃣ Testes Manuais
- [ ] Signup tenant
- [ ] Upgrade para PRO (Stripe test card: 4242...)
- [ ] Webhook processa ✅
- [ ] DB atualiza (plan=PRO, billingStatus=ACTIVE)
- [ ] Página pública tem SEO tags
- [ ] Rate limit: 4 requests → 429

### 8️⃣ Erro?
Copie o stack trace aqui. Vou classificar e te dar patch pronto pra executar.

---

## Arquivos de Referência
- `STAGING_DEPLOYMENT_CHECKLIST.md` - Passo a passo detalhado
- `lib/staging-notes.ts` - Notas técnicas sobre features staging

---

**Próximo**: Após staging validado → Production deployment 🚀
