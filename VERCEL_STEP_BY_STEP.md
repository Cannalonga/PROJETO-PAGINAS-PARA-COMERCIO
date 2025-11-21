# 🎬 VERCEL DEPLOY - GUIA PASSO A PASSO (Você está aqui!)

**Sua situação**: Você está em https://vercel.com/new  
**O que fazer**: Seguir EXATAMENTE os passos abaixo

---

## 📍 PASSO 1: Você vê essa tela?

Procura por um campo que diz:

```
┌─────────────────────────────────────────┐
│ Import Git Repository                   │
│                                         │
│ [Procurar repositório...]              │
│                                         │
│ Ou paste a URL do GitHub                │
└─────────────────────────────────────────┘
```

**SE SIM:** Cola essa URL:
```
https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO
```

**SE NÃO:** Clica em **"GitHub"** ou **"Select a Git Provider"**

---

## 📍 PASSO 2: GitHub Authorization

Se pedir para autorizar:

```
Vercel wants to access your GitHub
[Authorize Vercel]
```

Clica em **"Authorize"**

---

## 📍 PASSO 3: Procura seu Repositório

Você vai ver uma lista. Procura por:

```
PROJETO-PAGINAS-PARA-COMERCIO
```

Clica nele.

---

## 📍 PASSO 4: Configure o Projeto

Você vai ver um formulário:

```
┌──────────────────────────────────────┐
│ Project Settings                     │
├──────────────────────────────────────┤
│ Project Name *                       │
│ [paginas-comercio-staging]           │
│                                      │
│ Framework Preset                     │
│ [Next.js] ← detectado automaticamente│
│                                      │
│ Root Directory                       │
│ [./] ← deixa assim                   │
└──────────────────────────────────────┘
```

**DEIXA TUDO COMO ESTÁ!**

Clica **"Continue"** (ou próximo botão)

---

## 📍 PASSO 5: Environment Variables (CRÍTICO!)

Agora você vai ver:

```
┌──────────────────────────────────────┐
│ Environment Variables (optional)     │
│                                      │
│ Add your env vars here               │
│ Name        Value                    │
│ [_____]     [_____________________]  │
│                                      │
│ [+ Add Another]                      │
└──────────────────────────────────────┘
```

**AQUI VOCÊ PRECISA ADICIONAR 7 VARIÁVEIS!**

---

## 🔧 VARIÁVEL #1: DATABASE_URL

**Campo "Name":**
```
DATABASE_URL
```

**Campo "Value":**
```
postgresql://neondb_owner:npg_Ubgz5prifHY4@ep-flat-hill-ad89p5h7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Clica **"+ Add Another"** (ou similar)

---

## 🔧 VARIÁVEL #2: DIRECT_URL

**Campo "Name":**
```
DIRECT_URL
```

**Campo "Value":**
```
postgresql://neondb_owner:npg_Ubgz5prifHY4@ep-flat-hill-ad89p5h7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Clica **"+ Add Another"**

---

## 🔧 VARIÁVEL #3: REDIS_URL

**Campo "Name":**
```
REDIS_URL
```

**Campo "Value":**
```
redis://default:AYa6AAIncDI3YmFlNzBkNDM0MmI0NzU4OTg4MDkwYmJhNmE4ODFhN3AyMzQ0OTA@normal-dolphin-34490.upstash.io:6379
```

Clica **"+ Add Another"**

---

## 🔧 VARIÁVEL #4: NEXTAUTH_SECRET

**Campo "Name":**
```
NEXTAUTH_SECRET
```

**Campo "Value":**
```
ZCaS8WXrsUnQ7a++RibVQFTc6Sbq14Fc5yCbTXtCFzY=
```

Clica **"+ Add Another"**

---

## 🔧 VARIÁVEL #5: NEXTAUTH_URL

**Campo "Name":**
```
NEXTAUTH_URL
```

**Campo "Value":**
```
https://paginas-comercio-staging.vercel.app
```

Clica **"+ Add Another"**

---

## 🔧 VARIÁVEL #6: NEXT_PUBLIC_SITE_URL

**Campo "Name":**
```
NEXT_PUBLIC_SITE_URL
```

**Campo "Value":**
```
https://paginas-comercio-staging.vercel.app
```

Clica **"+ Add Another"**

---

## 🔧 VARIÁVEL #7: NODE_ENV

**Campo "Name":**
```
NODE_ENV
```

**Campo "Value":**
```
staging
```

**NÃO CLICA MAIS EM "Add Another"**

---

## 🎬 PASSO 6: FAZER DEPLOY!

Depois que adicionar TODAS as 7 variáveis:

Procura por um botão GRANDE que diz:

```
[Deploy]
ou
[Create]
ou
[Deploy Project]
```

**CLICA NELE!**

---

## ⏳ Aguarde

Você vai ver:

```
🔨 Building your project...
📦 Installing packages...
✅ Build successful
🚀 Deploying...
```

**ESPERA TERMINAR (~5 minutos)**

---

## 🎉 QUANDO TERMINAR

Você vai ver:

```
✅ Deployment successful!

Your app is live at:
https://paginas-comercio-staging.vercel.app

[Visit]
```

---

## ✅ Pronto!

**Seu app está ONLINE!** 🎉

---

## 📋 CHECKLIST

Enquanto você faz, marca aqui:

- [ ] Entrei em https://vercel.com/new
- [ ] Conectei GitHub (autorizei)
- [ ] Selecionei PROJETO-PAGINAS-PARA-COMERCIO
- [ ] Deixei Project Name como padrão
- [ ] Adicionei DATABASE_URL ✓
- [ ] Adicionei DIRECT_URL ✓
- [ ] Adicionei REDIS_URL ✓
- [ ] Adicionei NEXTAUTH_SECRET ✓
- [ ] Adicionei NEXTAUTH_URL ✓
- [ ] Adicionei NEXT_PUBLIC_SITE_URL ✓
- [ ] Adicionei NODE_ENV ✓
- [ ] Cliquei [Deploy]
- [ ] Esperou terminar
- [ ] ✅ App ao vivo!

---

**Começou? Me avisa quando terminar!** 🚀

