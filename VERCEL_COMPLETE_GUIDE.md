# 🚀 VERCEL DEPLOY - GUIA FINAL COM TUDO PRONTO!

**Status**: ✅ 100% PRONTO PARA DEPLOY  
**Tempo**: 10 minutos

---

## 🎯 PASSO 1: Abrir Vercel

Vai para: https://vercel.com/new

---

## 📋 PASSO 2: Conectar GitHub

1. Clica **"Import Git Repository"**
2. Se pedir autorização, clica "Authorize"
3. Procura: `PROJETO-PAGINAS-PARA-COMERCIO`
4. Clica **"Import"**

---

## 📋 PASSO 3: Configurar Projeto

Você vai ver:

```
Project Name: paginas-comercio-staging
Framework: Next.js (detectado automaticamente)
Root Directory: ./
Build Command: npm run build (padrão)
```

**Deixa tudo assim.** Clica **"Continue"**

---

## 📋 PASSO 4: Environment Variables (CRÍTICO!)

### Agora você adiciona as 7 variáveis!

Clica em **"Environment Variables"** (ou já aparece uma seção)

**Para cada variável abaixo:**
1. Cola o **Name** e **Value**
2. Clica **"Add"**
3. Continua com a próxima

---

## 📝 VARIÁVEIS A ADICIONAR

### 1️⃣ DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_Ubgz5prifHY4@ep-flat-hill-ad89p5h7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2️⃣ DIRECT_URL
```
Name: DIRECT_URL
Value: postgresql://neondb_owner:npg_Ubgz5prifHY4@ep-flat-hill-ad89p5h7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3️⃣ REDIS_URL
```
Name: REDIS_URL
Value: redis://default:AYa6AAIncDI3YmFlNzBkNDM0MmI0NzU4OTg4MDkwYmJhNmE4ODFhN3AyMzQ0OTA@normal-dolphin-34490.upstash.io:6379
```

### 4️⃣ NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: ZCaS8WXrsUnQ7a++RibVQFTc6Sbq14Fc5yCbTXtCFzY=
```

### 5️⃣ NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://paginas-comercio-staging.vercel.app
```

### 6️⃣ NEXT_PUBLIC_SITE_URL
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://paginas-comercio-staging.vercel.app
```

### 7️⃣ NODE_ENV
```
Name: NODE_ENV
Value: staging
```

---

## 🎬 PASSO 5: Deploy!

Depois que adicionar **TODAS as 7 variáveis**:

```
[Deploy] ← Clica aqui (botão grande)
```

---

## ⏳ Espera o Deploy

Você vai ver:

```
🔨 Building...
📦 Packages installed...
✅ Build completed
🚀 Deploying...
✅ Live!
```

Demora ~3-5 minutos.

---

## 🎉 Quando Terminar

Você verá:

```
✅ Deployment successful!
🔗 Live URL: https://paginas-comercio-staging.vercel.app
```

---

## ✅ Checklist FINAL

- [ ] Importou repo `PROJETO-PAGINAS-PARA-COMERCIO`
- [ ] PROJECT_NAME: `paginas-comercio-staging`
- [ ] DATABASE_URL adicionada ✓
- [ ] DIRECT_URL adicionada ✓
- [ ] REDIS_URL adicionada ✓
- [ ] NEXTAUTH_SECRET adicionada ✓
- [ ] NEXTAUTH_URL adicionada ✓
- [ ] NEXT_PUBLIC_SITE_URL adicionada ✓
- [ ] NODE_ENV adicionada ✓
- [ ] Clicou [Deploy]
- [ ] Esperou ~5 min
- [ ] ✅ App ao vivo!

---

## 🧪 DEPOIS DO DEPLOY

### Testa seu app em:
```
https://paginas-comercio-staging.vercel.app
```

**Procura por:**
1. ✅ Página carrega sem erros
2. ✅ Botões funcionam
3. ✅ Se tiver login, testa login
4. ✅ Nenhuma mensagem de erro vermelha

---

## 📊 O QUE VAI ACONTECER

1. **Vercel clona** seu repo do GitHub
2. **Instala** npm packages
3. **Roda build** (npm run build)
4. **Deploy** em Vercel CDN
5. **Live** em https://paginas-comercio-staging.vercel.app
6. **Automático**: Qualquer push em `main` faz deploy novo!

---

## 🆘 Se Der Erro

**Erro durante deploy?**
1. Vai em "Deployments" na Vercel
2. Clica no deployment com erro
3. Vê os "Logs"
4. Procura pela mensagem de erro
5. Avisa qual erro

---

## 🎯 Próximo Passo

Depois que estiver ao vivo por 24-48h sem erros:
→ Deploy em PRODUÇÃO (mesma coisa, mas em `main` production)

---

**Pronto para fazer o deploy?** 🚀

Vai para: https://vercel.com/new

