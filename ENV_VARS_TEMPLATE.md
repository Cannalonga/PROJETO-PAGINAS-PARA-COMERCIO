# 🔐 Environment Variables Template para Vercel

Copie e use na Vercel quando fizer o deploy!

---

## 📋 Variáveis Obrigatórias (CRÍTICAS)

```env
# Database PostgreSQL
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/database?sslmode=require
DIRECT_URL=postgresql://user:password@host.neon.tech:5432/database?sslmode=require

# NextAuth Authentication
NEXTAUTH_SECRET=ZCaS8WXrsUnQ7a++RibVQFTc6Sbq14Fc5yCbTXtCFzY=
NEXTAUTH_URL=https://paginas-comercio-staging.vercel.app

# Application URLs
NEXT_PUBLIC_SITE_URL=https://paginas-comercio-staging.vercel.app
```

---

## 🔴 Variáveis Altamente Recomendadas

```env
# Redis (para Rate Limiting)
REDIS_URL=redis://user:password@host:6379

# Sentry (para Error Tracking)
SENTRY_DSN=https://[key]@[domain].ingest.sentry.io/[id]
SENTRY_ENVIRONMENT=staging
SENTRY_SAMPLE_RATE=0.5
```

---

## 💳 Variáveis Opcionais (Se tiver Stripe)

```env
# Stripe (Modo Teste)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

---

## 📧 Variáveis Opcionais (Se tiver Email)

```env
# Resend (para email)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```

---

## 🛠️ GUIA PASSO A PASSO

### 1. Criar Database (Neon - Gratuito)
```
1. Acessa https://console.neon.tech
2. Clica "+ New Project"
3. Nome: "paginas-comercio-staging"
4. Region: sua região mais próxima
5. Database name: leave default
6. Copia a Connection String (DATABASE_URL)
```

**Exemplo de DATABASE_URL:**
```
postgresql://user12345:9xKsq8mLp2nv@ep-cool-glance-123456.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
```

---

### 2. Criar Redis (Upstash - Gratuito)
```
1. Acessa https://console.upstash.com
2. Clica "+ Create Database"
3. Nome: "paginas-comercio-staging"
4. Region: sua região
5. Copia Redis Connection String (REDIS_URL)
```

**Exemplo de REDIS_URL:**
```
redis://default:ABC123def456ghi789jkl@up-steady-chimpanzee-12345.upstash.io:6379
```

---

### 3. Criar Sentry Project (Gratuito)
```
1. Acessa https://sentry.io
2. Clica "+ Create Project"
3. Platform: "Next.js"
4. Alert Rule Frequency: "As often as possible"
5. Copia o Sentry DSN
```

**Exemplo de SENTRY_DSN:**
```
https://abc123def456@ghi789.ingest.sentry.io/12345
```

---

## ⚡ Deploy no Vercel

### Passo 1: Ir para Vercel
1. Acessa https://vercel.com/new
2. Clica "Import Git Repository"
3. Cola: `https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO`

### Passo 2: Configurar
```
Project Name: paginas-comercio-staging
Framework: Next.js (auto-detectado)
Root Directory: ./
```

### Passo 3: Adicionar Variáveis
Na tela "Environment Variables":
- Copia os valores acima
- Cola cada variável
- Clica "Add"

### Passo 4: Deploy
Clica "Deploy" e espera (3-5 min)

✅ Pronto! URL estará em: `https://paginas-comercio-staging.vercel.app`

---

## 🧪 Testar Depois do Deploy

```bash
# Health check
curl https://paginas-comercio-staging.vercel.app/api/health

# Deve retornar:
# {"status":"ok"}
```

---

## 📝 NOTAS IMPORTANTES

1. **NEXTAUTH_SECRET**: Já gerado acima, pode copiar direto
2. **DATABASE_URL**: OBRIGATÓRIA, sem ela o app não abre
3. **REDIS_URL**: Não crítica mas recomendada (senão usa in-memory)
4. **SENTRY_DSN**: Opcional mas recomendada para monitoring

---

## 🔒 Segurança

✅ Não commita `.env` no Git
✅ Variáveis sensíveis só na Vercel
✅ Regenera secrets regularmente
✅ Usa HTTPS (Vercel faz isso automaticamente)

---

**Status**: 🚀 PRONTO PARA DEPLOAR
**Próximo**: Ir para https://vercel.com/new e começar!

