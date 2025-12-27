# ⚙️ CONFIGURAR GITHUB SECRETS - PASSO A PASSO

**Status**: 🔴 Aguardando Configuração | Tempo: 5 minutos

---

## 📍 PASSO 1: Ir para Settings

1. Abra seu repositório no GitHub:
   ```
  
   ```

2. Clique em **Settings** (no topo)

3. No menu lateral esquerdo, clique em **Secrets and variables**

4. Clique em **Actions**

Você deve ver uma tela assim:
```
┌─────────────────────────────────────────┐
│ Repository secrets                      │
│ "New repository secret"  [Botão azul]   │
│                                         │
│ (ainda vazio - nenhum secret criado)    │
└─────────────────────────────────────────┘
```

---

## 🔑 PASSO 2: Criar os 4 Secrets

### Secret #1: DATABASE_URL

1. Clique **"New repository secret"** (botão azul)

2. Preencha:
   - **Name**: `DATABASE_URL`
   - **Secret**: Cole aqui sua connection string do Supabase
     ```
     
     ```

3. Clique **"Add secret"** (botão verde)

✅ Pronto! Aparecerá na lista como um ponto (`●`) cinzento

---

### Secret #2: NEXTAUTH_SECRET

1. Clique **"New repository secret"** novamente

2. Gere um secret seguro (execute no terminal):
   ```bash
   openssl rand -base64 32
   ```
   
   Exemplo de output:
   ```
   
   ```

3. Preencha:
   - **Name**: `NEXTAUTH_SECRET`
   - **Secret**: Cole o valor gerado acima

4. Clique **"Add secret"**

✅ Pronto!

---

### Secret #3: NEXT_PUBLIC_APP_URL

1. Clique **"New repository secret"** novamente

2. Preencha:
   - **Name**: `NEXT_PUBLIC_APP_URL`
   - **Secret**: Seu domínio de produção
     ```
     https://suaapp.com
     ```
     ⚠️ Sem `/` no final!

3. Clique **"Add secret"**

✅ Pronto!

---

### Secret #4: NEXTAUTH_URL

1. Clique **"New repository secret"** novamente

2. Preencha:
   - **Name**: `NEXTAUTH_URL`
   - **Secret**: Mesmo valor do anterior
     ```
     https://suaapp.com
     ```
     ⚠️ Sem `/` no final!

3. Clique **"Add secret"**

✅ Pronto!

---

## ✅ VERIFICAÇÃO

Após adicionar os 4 secrets, você deve ver na tela:

```
┌─────────────────────────────────────────┐
│ Repository secrets                      │
│ "New repository secret"  [Botão azul]   │
│                                         │
│ ● DATABASE_URL                  [Edit]  │
│ ● NEXTAUTH_SECRET              [Edit]  │
│ ● NEXT_PUBLIC_APP_URL          [Edit]  │
│ ● NEXTAUTH_URL                 [Edit]  │
└─────────────────────────────────────────┘
```

---

## 🚀 PRÓXIMO PASSO

Após configurar os secrets:

1. GitHub Actions **rodará automaticamente** no próximo push

2. Vá para a aba **Actions** do repositório

3. Você verá o workflow "Security" rodando com 8 jobs:
   - ✅ npm audit
   - ✅ gitleaks
   - ✅ prettier
   - ✅ tsc (TypeScript)
   - ✅ eslint
   - ✅ jest
   - ✅ build
   - ✅ snyk

4. Todos devem ficar ✅ **verde**

---

## 🆘 ERROS COMUNS

### Erro: "Secrets not found"
**Solução**: Certifique-se que configurou os 4 secrets corretamente

### Erro: "DATABASE_URL is invalid"
**Solução**: Verifique que copiou a connection string completa do Supabase

### Erro: "NEXTAUTH_SECRET is too short"
**Solução**: Use `openssl rand -base64 32` para gerar um secret seguro

### Workflow não rodando
**Solução**: Faça um novo push para ativar:
```bash
git add .
git commit -m "chore: trigger workflow"
git push origin main
```

---

## 📞 SUPORTE

Documentos relacionados:
- 📄 `PRODUCTION_READY_CHECKLIST.md` - Checklist completo
- 📄 `FINAL_ACTION_PLAN.md` - Plano de ação
- 📄 `GITHUB_SETUP.md` - Setup detalhado

---

**⏱️ Tempo estimado**: 5 minutos

**Status após completar**: 🟢 Pronto para Produção

🎉 Depois de fazer isso, tudo estará configurado para produção!
