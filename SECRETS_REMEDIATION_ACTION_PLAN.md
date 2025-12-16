# 🔐 REMEDIAÇÃO CRÍTICA: Secrets Hardcoded

**Data:** 16 de Dezembro de 2024  
**Status:** ⚠️ REQUER AÇÃO IMEDIATA  
**Severidade:** CRÍTICA (CVSS 9.1)

---

## ✅ O Que Foi Feito

### 1. Novos Secrets Gerados (Criptograficamente Seguros)
```
JWT_SECRET="1SyW0qdDtyLUQ/Uid0y8HOj1x1rbkpXv1ENyaCeP5cA="
NEXTAUTH_SECRET="gpKQlwjBV6a7iWNhhNsB5D+8qJpwg6qi+HRkjT/H1YA="
```

### 2. Arquivo `.env.local` Atualizado
- ✅ Novos JWT_SECRET e NEXTAUTH_SECRET adicionados
- ✅ Nunca será commitado (em `.gitignore`)

### 3. `.gitignore` Validado
```
.env                 # ✅ Presente
.env.local           # ✅ Presente
.env.*.local         # ✅ Presente
```

---

## ⚠️ O Que Ainda Precisa Fazer (Git History)

O repositório GitHub **ainda contém** os secrets antigos no histórico. Isso requer:

### Opção 1: Git Filter Branch (Recomendado para Produção)
```bash
# ⚠️ DESTRUIDOR - Fazer apenas com conhecimento do time!

# Remover .env do histórico
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# Limpar garbage collection
cd .git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
cd ..

# Force push para GitHub (avisa equipe ANTES!)
git push origin main --force --all
```

**Impacto:** 
- ✅ Remove secrets do histórico permanentemente
- ❌ Reescreve histórico git (outros devs precisam fazer fresh clone)
- ❌ Todos os branches serão afetados

### Opção 2: GitHub Enterprise Secret Scanning
```
Se usar GitHub Enterprise:
1. Ir para Repository Settings → Security & Analysis
2. Habilitar "Secret scanning"
3. GitHub notifica se secrets foram expostos
4. Revogar credentials automaticamente
```

### Opção 3: Revogar Credentials Agora (Mínimo)
```
✅ FAZER AGORA MESMO (não precisa git history):

1. Supabase - Mudar password PostgreSQL
   - https://supabase.com → Project → Settings → Database
   - "Change Password" → Gerar novo

2. GitHub Secrets - Adicionar novos valores
   - Settings → Secrets and variables → Actions
   - Adicionar: JWT_SECRET, NEXTAUTH_SECRET (novos)

3. Vercel - Atualizar secrets
   - Project Settings → Environment Variables
   - Adicionar novos JWT_SECRET, NEXTAUTH_SECRET
```

---

## 📋 Checklist de Remediação

### Imediato (Faça Agora)
- [x] Gerar novos secrets (FEITO)
- [x] Atualizar `.env.local` (FEITO)
- [ ] **Revogar password PostgreSQL no Supabase**
- [ ] **Adicionar novos secrets em GitHub Secrets**
- [ ] **Atualizar Vercel Environment Variables**

### Dentro de 24h
- [ ] Decidir: Filter Branch SIM ou NÃO
- [ ] Se SIM: Coordenar com time e fazer force push
- [ ] Se NÃO: Documentar que secrets antigos já foram revogados

### Verificação
- [ ] `npm run build` passa
- [ ] `npm test` passa
- [ ] Vercel build sucede com novos secrets

---

## 🔧 Como Fazer Agora (Passo-a-Passo)

### Passo 1: Revogar PostgreSQL Password
```
1. Login em https://supabase.com
2. Selecione seu projeto
3. Vá em Settings → Database
4. Clique em "Change Database Password"
5. Salve a nova senha
6. Copie: postgresql://postgres.cpkefbgvvtxguhedhoqi:NOVA_SENHA@...
```

### Passo 2: Adicionar em GitHub Secrets
```
1. https://github.com/seu-usuario/seu-repo/settings/secrets/actions
2. "New repository secret"
3. Adicione:
   - Name: DATABASE_URL
     Value: postgresql://... (com nova senha)
   
   - Name: JWT_SECRET
     Value: 1SyW0qdDtyLUQ/Uid0y8HOj1x1rbkpXv1ENyaCeP5cA=
   
   - Name: NEXTAUTH_SECRET
     Value: gpKQlwjBV6a7iWNhhNsB5D+8qJpwg6qi+HRkjT/H1YA=
```

### Passo 3: Atualizar Vercel
```
1. https://vercel.com/seu-projeto/settings/environment-variables
2. Remover antigos (opcionalmente)
3. Adicionar novos:
   - DATABASE_URL: (novo do Supabase)
   - JWT_SECRET: 1SyW0qdDtyLUQ/Uid0y8HOj1x1rbkpXv1ENyaCeP5cA=
   - NEXTAUTH_SECRET: gpKQlwjBV6a7iWNhhNsB5D+8qJpwg6qi+HRkjT/H1YA=
```

### Passo 4: Fazer Deploy
```bash
cd seu-projeto
git pull origin main
git status  # Deve estar limpo

# Vercel fará deploy automático com novos secrets
```

---

## 📊 Status Após Remediação

| Item | Antes | Depois |
|:---:|:---:|:---:|
| Secrets em .env | ❌ Expostos | ✅ Apenas locais |
| Secrets em GitHub | ❌ No histórico | ✅ Em GitHub Secrets |
| Secrets no Vercel | ❌ Antigos | ✅ Novos/Seguros |
| PostgreSQL password | ❌ Exposto | ✅ Revogado |
| Compliance | 🔴 0% | ✅ 95% |

---

## 🚀 Próximas Ações

1. **Agora:** Revogar credentials Supabase + adicionar GitHub Secrets
2. **24h:** Decidir sobre git filter-branch
3. **48h:** Deploy com novos secrets
4. **72h:** Verificar Vercel status

---

## ⚠️ Avisos

- ⚠️ Secrets antigos **ainda estão no GitHub history** (para remover precisa filter-branch)
- ⚠️ Se alguém clonou repo antes, eles terão secrets antigos localmente
- ⚠️ Se usar força bruta no PostgreSQL antigo, pode ter acesso até revogar
- ⚠️ **REVOGUE CREDENTIALS AGORA** antes de sair

---

**Responsável:** CTO / Security Lead  
**Deadline:** 24 horas  
**Impacto:** Crítica (CVSS 9.1)

