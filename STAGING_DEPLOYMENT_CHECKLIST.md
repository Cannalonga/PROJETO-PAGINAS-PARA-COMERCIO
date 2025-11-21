# 🚀 Staging Deployment Checklist

**Status**: ✅ Local Validation Complete (655/655 tests, build OK)  
**Objetivo**: Deploy para staging com DB novo, Stripe test, env vars configuradas  
**Tempo Estimado**: 30-60 minutos

---

## ✅ PASSO 1: Criar DB Staging Novo

### 1.1 - Escolha do Provedor
Opções recomendadas:
- **Supabase** (PostgreSQL managed, gratuito tier generoso)
- **Neon** (PostgreSQL serverless, gratuito)
- **Railway** (PostgreSQL included, pay-as-you-go)

### 1.2 - Criar Instância Staging
1. Acesse o painel do provedor
2. Crie nova database: **paginas_comercio_staging**
3. Configure:
   - Username: seu-username-staging
   - Password: senha-complexa-32-chars
   - Region: Mais próxima do seu usuário final
4. **Salve a DATABASE_URL** (será usado no .env staging)

Exemplo de DATABASE_URL:
```
postgresql://user_staging:senha@db.neon.tech:5432/paginas_comercio_staging?sslmode=require
```

### 1.3 - Teste de Conexão (Opcional)
```bash
# Testar conexão
psql "postgresql://user_staging:senha@db.neon.tech:5432/paginas_comercio_staging?sslmode=require" -c "SELECT version();"
```

---

## ✅ PASSO 2: Executar Prisma Migrate Deploy

### 2.1 - Atualizar .env.local Temporário
Crie arquivo `.env.staging.local` com:
```dotenv
DATABASE_URL=postgresql://user_staging:senha@db.neon.tech:5432/paginas_comercio_staging?sslmode=require
DIRECT_URL=postgresql://user_staging:senha@db.neon.tech:5432/paginas_comercio_staging?sslmode=require
```

### 2.2 - Executar Migrate
```bash
# Terminal no projeto
# Backup: listar migrations pendentes
npx prisma migrate status

# Deploy migrations no staging DB
npx prisma migrate deploy
```

### 2.3 - Validar Schema
```bash
# Conectar ao DB staging e validar tabelas
npx prisma studio
```

✅ Verificar que existem:
- `Tenant` (campos: id, slug, plan, billingStatus, stripeCustomerId, stripeSubscriptionId)
- `Page` (campos: id, slug, seoTitle, seoDescription, seoKeywords, seoImage, seoNoIndex)
- Outras tabelas (User, AuditLog, etc.)

---

## ✅ PASSO 3: Configurar Environment Variables Staging

### 3.1 - Listar Variáveis Obrigatórias

Copie essas variáveis para o painel de deploy (Vercel/Render):

```dotenv
# === Application ===
NEXT_PUBLIC_APP_URL=https://app-staging.seu-dominio.com
NEXT_PUBLIC_APP_NAME="Páginas para o Comércio (Staging)"
NODE_ENV=production

# === NextAuth ===
NEXTAUTH_URL=https://app-staging.seu-dominio.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32-chars

# === Database ===
DATABASE_URL=postgresql://user_staging:senha@db.neon.tech:5432/paginas_comercio_staging?sslmode=require
DIRECT_URL=postgresql://user_staging:senha@db.neon.tech:5432/paginas_comercio_staging?sslmode=require

# === Storage (S3/DigitalOcean Spaces) ===
NEXT_PUBLIC_STORAGE_TYPE=s3
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_REGION=nyc3
S3_BUCKET=paginas-comercio-staging
S3_ACCESS_KEY_ID=seu-access-key-staging
S3_SECRET_ACCESS_KEY=seu-secret-key-staging
NEXT_PUBLIC_S3_URL=https://paginas-comercio-staging.nyc3.digitaloceanspaces.com

# === Payment (Stripe TEST MODE) ===
STRIPE_SECRET_KEY=sk_test_seu_secret_key_test
STRIPE_PUBLISHABLE_KEY=pk_test_seu_publishable_key_test
STRIPE_WEBHOOK_SECRET=whsec_test_seu_webhook_secret_test

# === Optional (Analytics, Redis, Email) ===
SENTRY_DSN=https://sua-chave@sentry.io/seu-projeto
REDIS_URL=redis://seu-redis-staging:6379
SMTP_HOST=seu-smtp-host
SMTP_PORT=587
```

### 3.2 - Gerar NEXTAUTH_SECRET
```bash
# No terminal local
openssl rand -base64 32
# Copie o output para NEXTAUTH_SECRET no env staging
```

### 3.3 - Copiar para Provedor Deploy
**Se usando Vercel:**
1. Vercel Dashboard → Settings → Environment Variables
2. Cole cada variável acima
3. Marque como "Production" (vai ser usada em staging)

**Se usando Render:**
1. Render Dashboard → Environment → Add Environment Variable
2. Cole cada uma

---

## ✅ PASSO 4: Configurar Stripe Test Mode

### 4.1 - Acessar Stripe Dashboard Test Mode
1. Acesse https://dashboard.stripe.com
2. Toggle superior: **Test mode** (ON)
3. Menu esquerdo: **Products**

### 4.2 - Criar Products & Prices

**Product 1: BASIC**
- Name: "Plano Básico"
- Billing: Recurring
- Price: 29,90/mês (ou seu valor em USD: 5.99)
- Billing period: Monthly
- **Salve o Price ID** → copie para `STRIPE_PRICE_BASIC_ID`

**Product 2: PRO**
- Name: "Plano Profissional"
- Price: 99,90/mês (ou USD: 19.99)
- **Salve o Price ID** → `STRIPE_PRICE_PRO_ID`

**Product 3: PREMIUM**
- Name: "Plano Premium"
- Price: 299,90/mês (ou USD: 49.99)
- **Salve o Price ID** → `STRIPE_PRICE_PREMIUM_ID`

### 4.3 - Criar Webhook Endpoint

1. Stripe Dashboard → Developers → Webhooks
2. Click: **Add an endpoint**
3. Endpoint URL: `https://app-staging.seu-dominio.com/api/stripe/webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. **Copie o Signing Secret** → `STRIPE_WEBHOOK_SECRET`
6. Salve no env staging

### 4.4 - Adicionar Secret ao .env Staging
```dotenv
STRIPE_PRICE_BASIC_ID=price_test_abc123
STRIPE_PRICE_PRO_ID=price_test_def456
STRIPE_PRICE_PREMIUM_ID=price_test_ghi789
STRIPE_WEBHOOK_SECRET=whsec_test_xyz789
```

---

## ✅ PASSO 5: Deploy para Staging

### 5.1 - Conectar Repositório ao Provedor Deploy

**Se Vercel:**
1. Vercel Dashboard → Add New → Project
2. Conecte o GitHub: `Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO`
3. Branch: `main`
4. Framework: Next.js
5. Environment variables: Copie as do PASSO 3
6. Deploy

**Se Render:**
1. Render Dashboard → New → Web Service
2. Conecte repo GitHub
3. Branch: `main`
4. Environment: Node
5. Build command: `npm run build`
6. Start command: `npm start`
7. Environment variables: Copie as do PASSO 3
8. Deploy

### 5.2 - Monitorar Build
- Verifique logs: Build deve completar sem erros
- Acesse staging URL (ex: `app-staging.seu-dominio.com`)
- Deve renderizar página inicial OK

### 5.3 - Validar Health Check
```bash
# No terminal ou navegador
curl https://app-staging.seu-dominio.com/api/health

# Esperado:
# { "status": "ok", "checks": { "app": "ok", "db": "ok" } }
```

✅ Se retornar `200 OK` com checks passing → staging DB conectado! 🎉

---

## ✅ PASSO 6: Testes Manuais em Staging

### 6.1 - Teste Billing Flow Completo

**Cenário: Criar tenant e fazer upgrade para PRO**

1. **Login/Signup**: https://app-staging.seu-dominio.com
2. **Criar Tenant**: "Teste Staging", slug "teste-staging"
3. **Ir para Billing**: Deve estar em plano FREE
4. **Clicar: Upgrade para PRO**
   - Redireciona para Stripe Checkout
   - Preencha com **Stripe Test Card**: `4242 4242 4242 4242`, exp: `12/25`, CVC: `123`
   - Clique: Complete Purchase
5. **Webhook deve processar**:
   - Volta para app
   - Tenant agora em plano PRO
   - Verificar DB: `SELECT plan, billingStatus FROM tenant WHERE slug='teste-staging'`
   - Esperado: `plan: 'PRO', billingStatus: 'ACTIVE'`

### 6.2 - Teste Webhook Robustez

1. **Stripe Dashboard → Events**
2. Procure evento `customer.subscription.created`
3. Clique → **Resend event**
4. Verificar em logs que idempotência funcionou (sem erro, sem duplicação)

### 6.3 - Teste SEO - Página Pública

1. **Admin**: Criar page
   - Tenant: "teste-staging"
   - Slug: "sobre-nos"
   - Title: "Sobre Nós"
   - Description: "Conheça nossa história"
   - Status: PUBLISHED
   - SEO Title: "Sobre Nós - Teste Staging"
   - SEO Description: "Descubra quem somos e nossa missão"

2. **Acessar publicamente**: https://pages-staging.seu-dominio.com/t/teste-staging/sobre-nos
   - DevTools → Network → página GET → Response headers
   - Verificar: `<meta name="description" content="Descubra...">`
   - Verificar: `<meta property="og:title" content="Sobre Nós..."`

### 6.4 - Teste Rate Limiting

1. **Terminal**: Envie 5 requests rápidos
```bash
for i in {1..5}; do
  curl -X POST https://app-staging.seu-dominio.com/api/billing/checkout \
    -H "Authorization: Bearer seu-token" \
    -H "Content-Type: application/json" \
    -d '{"tenantId":"seu-tenant-id","plan":"PRO","successUrl":"...","cancelUrl":"..."}'
done
```

2. **Esperado**:
   - Requests 1-3: `200 OK`
   - Request 4: `429 Too Many Requests`
   - Headers: `X-RateLimit-Remaining: 0`, `Retry-After: 60`

### 6.5 - Validar Logs & Observabilidade

1. **Acessar logs** (Vercel Logs ou Render Logs)
2. Procure por atividades (checkout, webhook, etc)
3. **Verificar**:
   - ✅ `requestId` presente em cada log
   - ✅ `tenantId` e `userId` quando aplicável
   - ✅ Nenhum token, senha ou email em logs
   - ✅ Erros estruturados (não stack trace bruto)
   - ✅ Timestamps ISO 8601

---

## ✅ PASSO 7: Erro Detection & Fixing

**Se pipoca erro durante staging, copie aqui:**

```
[ERRO ENCONTRADO]
Arquivo/Função: 
Mensagem de erro:
Stack trace:

Comportamento observado:
(ex: página branca, 500 error, billing não funciona, etc)
```

**Vou classificar e retornar patch para executar.**

---

## ✅ PASSO 8: Validação Final Staging

- [ ] /api/health retorna 200 OK
- [ ] Billing flow completo: FREE → PRO, webhook processa, DB atualiza
- [ ] Webhook replay funciona (idempotência OK)
- [ ] SEO: página pública tem meta tags corretas
- [ ] Rate limiting: 4ª request retorna 429
- [ ] Logs: requestId, tenantId, sem PII
- [ ] Sem erros no build/deploy

**Se tudo ✅**: Staging validado! 🎉

---

## 🚀 PRÓXIMO: Production Deployment

Após staging validado:
1. Criar DB production (separado)
2. Configurar env production (Stripe live keys, URLs reais)
3. Deploy branch main → production
4. Smoke tests (health, billing 1 teste real com cartão)
5. Monitoring & alertas

