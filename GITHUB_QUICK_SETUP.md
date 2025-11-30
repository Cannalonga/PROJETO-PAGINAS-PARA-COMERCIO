# 🚀 CONFIGURAR GITHUB - GUIA RÁPIDO

**Tempo**: 5 minutos | **Status**: 🔴 Pendente Configuração

---

## ✅ SEU NEXTAUTH_SECRET JÁ ESTÁ GERADO!

```
🔑 NEXTAUTH_SECRET = WyTOfF5tTiCy+bJBW4ajPtQkTi3jAKmP202fofqP+aA=
```

**Copie e guarde esse valor!** ⬆️

---

## 📋 CHECKLIST - O QUE FAZER AGORA

Você precisa configurar **4 secrets** no GitHub:

- [ ] **1. DATABASE_URL** - Sua connection string do Supabase
- [ ] **2. NEXTAUTH_SECRET** - Já gerado acima ✅
- [ ] **3. NEXT_PUBLIC_APP_URL** - Seu domínio de produção
- [ ] **4. NEXTAUTH_URL** - Mesmo do anterior

---

## 🌐 PASSO 1: Abrir GitHub

Clique no link abaixo ou copie a URL:

```
https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/settings/secrets/actions
```

Você vai ver uma tela assim:

```
┌─────────────────────────────────────┐
│ Repository secrets                  │
│ [New repository secret] [Botão Azul]│
│                                     │
│ (Vazio - nenhum secret ainda)       │
└─────────────────────────────────────┘
```

---

## 🔐 PASSO 2: Adicionar Secrets (Um por Um)

### Secret #1️⃣: DATABASE_URL

1. Clique **[New repository secret]** (botão azul)

2. Preencha:
   ```
   Name:   DATABASE_URL
   Secret: postgresql://user:password@db.supabase.co:5432/postgres?schema=public
   ```
   
   ⚠️ **Use sua connection string real do Supabase!**

3. Clique **[Add secret]** (verde)

---

### Secret #2️⃣: NEXTAUTH_SECRET

1. Clique **[New repository secret]** novamente

2. Preencha:
   ```
   Name:   NEXTAUTH_SECRET
   Secret: WyTOfF5tTiCy+bJBW4ajPtQkTi3jAKmP202fofqP+aA=
   ```
   
   (Ou gere um novo: execute `powershell -File scripts/gen-secret.ps1`)

3. Clique **[Add secret]**

---

### Secret #3️⃣: NEXT_PUBLIC_APP_URL

1. Clique **[New repository secret]** novamente

2. Preencha:
   ```
   Name:   NEXT_PUBLIC_APP_URL
   Secret: https://suaapp.com
   ```
   
   ⚠️ **Sem `/` no final!**

3. Clique **[Add secret]**

---

### Secret #4️⃣: NEXTAUTH_URL

1. Clique **[New repository secret]** novamente

2. Preencha:
   ```
   Name:   NEXTAUTH_URL
   Secret: https://suaapp.com
   ```
   
   ⚠️ **Mesmo valor do anterior!**

3. Clique **[Add secret]**

---

## ✅ VERIFICAÇÃO FINAL

Após os 4 passos, você deve ver:

```
┌─────────────────────────────────────┐
│ Repository secrets                  │
│ [New repository secret] [Botão Azul]│
│                                     │
│ ● DATABASE_URL                      │
│ ● NEXTAUTH_SECRET                  │
│ ● NEXT_PUBLIC_APP_URL              │
│ ● NEXTAUTH_URL                     │
└─────────────────────────────────────┘
```

---

## 🎯 PRÓXIMO PASSO AUTOMÁTICO

Após adicionar os secrets:

1. GitHub Actions **rodará automaticamente**

2. Vá para **Actions** no repositório

3. Veja o workflow "Security" rodando

4. Espere todos os 8 jobs ficarem ✅ **verde**

---

## 🆘 PRECISA DE AJUDA?

**Documentação Completa**:
- 📄 `GITHUB_SECRETS_SETUP.md` - Guia detalhado
- 📄 `PRODUCTION_READY_CHECKLIST.md` - Checklist completo
- 📄 `FINAL_ACTION_PLAN.md` - Plano de ação

**Gerar novo NEXTAUTH_SECRET**:
```bash
powershell -File scripts/gen-secret.ps1
```

---

## 🚀 VOCÊ ESTÁ QUASE LÁ!

Faltam só **5 minutos** para tudo estar em produção! 🎉

Depois de configurar os 4 secrets, será só fazer deploy e pronto!
