# 🎯 Copy & Paste Commands for Staging

Use esses comandos direto no seu terminal. Adapte URLs/credentials conforme seu provedor.

---

## 1️⃣ Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

**Copie o output para NEXTAUTH_SECRET no env staging**

---

## 2️⃣ Test Database Connection (Staging DB)

```bash
# Após criar DB staging, teste conexão
psql "postgresql://user_staging:password@db.staging.com:5432/paginas_comercio_staging?sslmode=require" -c "SELECT version();"
```

---

## 3️⃣ Deploy Prisma Migrations

```bash
# Criar arquivo .env.staging.local com DATABASE_URL staging
export DATABASE_URL="postgresql://user_staging:password@db.staging.com:5432/paginas_comercio_staging?sslmode=require"

# Listar migrations pendentes
npx prisma migrate status

# Deploy migrations
npx prisma migrate deploy

# Validar schema em Prisma Studio
npx prisma studio
```

---

## 4️⃣ Validate Health Endpoint (Staging)

```bash
# Após deploy em staging
curl -X GET https://app-staging.seu-dominio.com/api/health

# Esperado:
# { "status": "ok", "checks": { "app": "ok", "db": "ok" } }

# Com verbose
curl -v https://app-staging.seu-dominio.com/api/health
```

---

## 5️⃣ Test Billing Flow (Manual)

```bash
# 1. Signup/Login no staging
# 2. Criar tenant (slug: teste-staging)
# 3. Clicar "Upgrade para PRO"
# 4. Stripe checkout - Use test card:
#    Card: 4242 4242 4242 4242
#    Exp: 12/25
#    CVC: 123
# 5. Complete purchase
# 6. Verificar DB:

curl -X POST https://app-staging.seu-dominio.com/api/admin/debug \
  -H "Authorization: Bearer seu-token" \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT plan, billingStatus FROM tenant WHERE slug='\''teste-staging'\''"}' 

# Esperado: plan=PRO, billingStatus=ACTIVE
```

---

## 6️⃣ Test Rate Limiting

```bash
# Teste rate limit em /api/billing/checkout
# Deve aceitar 3 requests, retornar 429 na 4ª

for i in {1..5}; do
  echo "Request $i:"
  curl -X POST https://app-staging.seu-dominio.com/api/billing/checkout \
    -H "Authorization: Bearer seu-token" \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.1" \
    -d '{
      "tenantId": "seu-tenant-id",
      "plan": "PRO",
      "successUrl": "https://app-staging.seu-dominio.com/billing/success",
      "cancelUrl": "https://app-staging.seu-dominio.com/billing/cancel"
    }' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 0.5
done

# Esperado:
# Requests 1-3: 200 OK
# Request 4: 429 Too Many Requests
# Response headers: X-RateLimit-Remaining, Retry-After
```

---

## 7️⃣ Test SEO Metadata (Public Page)

```bash
# 1. Admin: Criar page
#    Tenant: teste-staging
#    Slug: sobre-nos
#    Title: Sobre Nós
#    Status: PUBLISHED
#    SEO Title: Sobre Nós - Staging
#    SEO Description: Descubra quem somos

# 2. Acessar página pública:
curl -X GET "https://pages-staging.seu-dominio.com/t/teste-staging/sobre-nos" \
  -H "User-Agent: Mozilla/5.0" \
  | grep -E "<meta|<link rel" | head -20

# 3. Verificar no navegador DevTools:
# - meta name="description" presente
# - meta property="og:title" presente
# - link rel="canonical" presente
```

---

## 8️⃣ Check Logs (Staging)

```bash
# Vercel Logs
vercel logs --project=seu-projeto-staging --tail

# Ou Render Logs
# Acesse console do Render e veja logs em tempo real

# Procure por:
# ✅ "requestId" em cada log
# ✅ "tenantId" e "userId" quando aplicável
# ✅ Nenhum token/senha/email
# ✅ Timestamps ISO 8601
```

---

## 9️⃣ Webhook Replay (Stripe Dashboard)

```bash
# 1. Acesse: https://dashboard.stripe.com/webhooks (Test Mode)
# 2. Procure webhook para seu staging domain: /api/stripe/webhook
# 3. Clique na webhook
# 4. Procure evento: customer.subscription.created
# 5. Clique nele
# 6. Botão: "Resend event"
# 7. Verifique nos logs: Idempotência funcionou (sem erro)
```

---

## 🔟 Git Push (When Ready)

```bash
# Verificar status
git status

# Add tudo
git add -A

# Commit (se tiver mudanças no staging)
git commit -m "deploy: staging [data/timestamp]"

# Push
git push origin main

# Vercel/Render detecta push e auto-deploys
```

---

## 🚨 Se Tiver Erro

Copie e cole aqui (no chat):

```
[ERRO - STAGING]

Arquivo/Endpoint: [qual arquivo ou rota teve erro]

Mensagem de erro: [copie exatamente]

Stack trace:
[paste stack trace aqui]

Comportamento observado:
[o que aconteceu: página branca? 500? Stripe não chamou? etc]

Logs relevantes:
[copie logs se tiver acesso]
```

**Vou:**
1. Classificar como crítico ou ajuste fino
2. Identificar root cause
3. Gerar patch pronto
4. Você executa

---

## ✅ Checklist Final

- [ ] Database staging criada (DATABASE_URL obtida)
- [ ] Prisma migrations deployed
- [ ] Environment variables configuradas no provider
- [ ] Stripe test products e prices criadas
- [ ] Webhook endpoint configurado
- [ ] Build em staging bem-sucedido
- [ ] /api/health retorna 200 OK
- [ ] Billing flow testado (FREE → PRO)
- [ ] Webhook replay funciona
- [ ] SEO tags presentes em página pública
- [ ] Rate limit retorna 429
- [ ] Logs contêm requestId e tenantId
- [ ] Nenhum erro nos logs

**Quando todos os itens estão marcados ✅:**
→ Staging está pronto! 🎉

---

## 📞 Questions?

Paste error message above format. I'll help immediately.

