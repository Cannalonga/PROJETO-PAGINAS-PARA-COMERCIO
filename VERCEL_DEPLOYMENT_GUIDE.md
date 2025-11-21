# 🚀 Deploy Vercel - Guia Rápido

**Status**: Ready to Deploy ✅
**Commits**: 39 no GitHub ✅
**Tests**: 655/655 passing ✅

---

## 📋 PASSO 1: Preparação (2 min)

### 1.1 Verifica se está tudo no GitHub
```bash
# Confirme que os commits estão lá
git log --oneline -3
# Deve mostrar os 3 últimos commits
```

### 1.2 Copia informações que vai precisar

Você vai precisar ter na mão:
- [ ] **DATABASE_URL** (PostgreSQL - Neon, Supabase, ou Railway)
- [ ] **NEXTAUTH_SECRET** (gera com: `openssl rand -base64 32`)
- [ ] **REDIS_URL** (Redis - Railway, Upstash, ou outro)
- [ ] **SENTRY_DSN** (se quiser monitoring)
- [ ] **STRIPE_SECRET_KEY** (se tiver conta Stripe)

---

## 🎯 PASSO 2: Deploy no Vercel (5 min)

### 2.1 Acessa Vercel
1. Vai para https://vercel.com/new
2. Clica em **"Import Git Repository"**
3. Digita: `PROJETO-PAGINAS-PARA-COMERCIO` ou cola URL:
   ```
   https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO
   ```
4. Clica **"Import"**

### 2.2 Configura o Projeto
1. **Project Name**: `paginas-comercio-staging` (ou outro nome)
2. **Framework Preset**: Next.js (detecta automaticamente)
3. **Root Directory**: `./` (deixa como está)

### 2.3 Configura Variáveis de Ambiente

Na tela **"Environment Variables"**, adiciona:

```env
DATABASE_URL=postgresql://user:pass@host/db
DIRECT_URL=postgresql://user:pass@host/db
NEXTAUTH_SECRET=seu-secret-base64-aqui
NEXTAUTH_URL=https://paginas-comercio-staging.vercel.app
NEXT_PUBLIC_SITE_URL=https://paginas-comercio-staging.vercel.app
REDIS_URL=redis://user:pass@host:6379
SENTRY_DSN=https://[key]@[domain].ingest.sentry.io/[id]
SENTRY_ENVIRONMENT=staging
STRIPE_SECRET_KEY=sk_test_xxxx (se tiver)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxx (se tiver)
```

### 2.4 Deploy!
Clica em **"Deploy"** e espera (~3-5 minutos)

✅ Pronto! Seu app está em staging!

---

## 🔗 PASSO 3: Configurar Banco de Dados (5 min)

### Opção A: Neon (Recomendado)
1. Vai para https://console.neon.tech
2. Cria novo projeto: `paginas-comercio-staging`
3. Copia a **DATABASE_URL**
4. Na Vercel, adiciona na variável `DATABASE_URL`

### Opção B: Supabase
1. Vai para https://supabase.com
2. Cria novo projeto
3. Copia a connection string
4. Adiciona na Vercel

### Opção C: Railway
1. Vai para https://railway.app
2. Cria novo projeto com PostgreSQL
3. Copia a DATABASE_URL
4. Adiciona na Vercel

---

## 🚨 PASSO 4: Rodar Migrations (2 min)

Depois do deploy, precisa rodar as migrations no novo banco:

### Opção A: Via CLI Vercel
```bash
# No seu PC, no projeto
vercel env pull .env.staging.local
npm run prisma:migrate -- --name "initial"
```

### Opção B: Manual (Mais seguro)
1. Na Vercel, vai em **"Settings" → "Functions"**
2. Clica em **"Inspect"** (ao lado de um deploy)
3. Abre o terminal da função
4. Roda:
```bash
npm run prisma:migrate
```

---

## ✅ PASSO 5: Validação (5 min)

Seu app está em: `https://paginas-comercio-staging.vercel.app`

### Testa as principais features:

1. **Health Check**
   ```
   GET /api/health
   ```
   Espera: `{ "status": "ok" }`

2. **Login**
   - Clica em Login
   - Tenta fazer login
   - Deve funcionar sem erros

3. **Criar um Tenant** (se aplicável)
   - Acessa `/dashboard` ou área protegida
   - Tenta criar novo tenant
   - Deve aparecer no banco

4. **Monitoramento Sentry**
   - Se configurou Sentry DSN
   - Vai em https://sentry.io/organizations/seu-org/
   - Deve ver eventos do staging

5. **Redis Rate Limiting**
   - Faz múltiplas requisições rápidas
   - Deve receber 429 após 5 requisições

---

## 🔄 PASSO 6: Atualizações Futuras

Depois que está em staging, qualquer push para `main` no GitHub faz deploy automático:

```bash
# No seu PC
git commit -m "nova feature"
git push origin main

# Vercel detecta e faz deploy automaticamente ✨
```

---

## 🔙 Se Der Problema

### Deploy falhou?
1. Verifica os **Build Logs** na Vercel
2. Procura por erros do TypeScript ou npm
3. Corrige localmente e faz `git push` novamente

### Banco não conecta?
1. Verifica a `DATABASE_URL` está correta
2. Testa a conexão localmente:
```bash
psql "sua-database-url"
```

### App abre mas da erro?
1. Verifica **Logs** da função (ao lado do deploy)
2. Vê o erro específico
3. Se for problema de migration, roda:
```bash
npm run prisma:migrate
```

---

## 📊 Próximos Passos

✅ Deploy em staging
✅ Validar todas as features (24h)
✅ Monitorar Sentry/logs
✅ Se tudo OK → Deploy em PRODUÇÃO

---

**Status**: 🚀 PRONTO PARA DEPLOY
**URL Staging**: `https://paginas-comercio-staging.vercel.app` (depois do deploy)

