# 🛡️ GitHub Branch Protection - Guia Completo

**Objetivo**: Proteger `main` branch contra acidentes e garantir qualidade  
**Tempo**: ~5 minutos  
**Status**: Passo a passo com explicações

---

## 📋 PASSO 1: Abrir Configurações

1. Vai para seu repo: https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO
2. Clica em **"Settings"** (aba superior)
3. Menu esquerdo → **"Code and automation"** → **"Branches"**
4. Clica em **"Add rule"** ou **"New branch ruleset"**

---

## ✅ PASSO 2: Configurar o Ruleset

### 2.1 Ruleset Name
```
Nome: "Protect Main Branch"
ou
Nome: "Production Safety"
```

### 2.2 Enforcement Status
```
☑ Enable (deixa como "Enabled")
```

### 2.3 Target Branches
```
Branch targeting criteria: 
- Tipo: "Include default branch"
  ou
- Digita: main
```

**→ Clica "Add target"**

---

## 🔒 PASSO 3: Configurar Regras de Proteção

### Opção A: Recomendado (O que você deve fazer)

```
✅ MARCAR TODAS ESSAS:

1. ☑ Require a pull request before merging
   └─ Require approvals: 1
   └─ ☑ Dismiss stale pull requests
   └─ ☑ Require code owner approval
   
2. ☑ Require status checks to pass before merging
   └─ ☑ Require branches to be up to date
   
3. ☑ Require commit signatures
   
4. ☑ Restrict who can push to matching branches
   └─ Only allow specified actors to push
   └─ Seleciona você mesmo
   
5. ☑ Block force pushes
   
6. ☑ Block deletions
```

### Opção B: Padrão (Mais permissivo)

```
✅ MARCAR ESSAS:

1. ☑ Require a pull request before merging
   └─ Require approvals: 1
   
2. ☑ Require status checks to pass before merging
   └─ ☑ Require branches to be up to date
   
3. ☑ Block force pushes
   
4. ☑ Block deletions
```

---

## 🚨 PASSO 4: Explicação de Cada Opção

### 1️⃣ "Require a pull request before merging"
**O que faz**: Proíbe push direto em `main`, obriga abrir Pull Request

```
❌ Sem proteção: git push origin main (vai direto)
✅ Com proteção: Obriga abrir PR e revisar
```

**Configurações internas**:
- **"Require approvals"**: Quantas pessoas aprovam antes de merge (recomendado: 1)
- **"Dismiss stale pull requests"**: Invalida PR se houver novo commit (bom para sigurança)

### 2️⃣ "Require status checks to pass before merging"
**O que faz**: Obriga testes passarem antes de merge

```
Seu app tem:
✅ npm test (655/655 testes)
✅ npm run build (build success)

Se qualquer um falhar → não deixa merge
```

**"Require branches to be up to date"**: Força atualizar branch com `main` antes de merge

### 3️⃣ "Require commit signatures"
**O que faz**: Força assinar commits com GPG (segurança avançada)

```
Opcional para você agora, mas recomendado depois
```

### 4️⃣ "Block force pushes"
**O que faz**: Proíbe `git push --force` que perde histórico

```
❌ Sem: git push --force (apaga commits)
✅ Com: Impossível fazer isso em main
```

### 5️⃣ "Block deletions"
**O que faz**: Proíbe deletar o branch `main` acidentalmente

```
✅ Ninguém consegue: git push origin :main
```

---

## 🎯 RECOMENDAÇÃO PARA VOCÊ

**Para começar, marque ISSO:**

```
☑ Require a pull request before merging
  └─ Require approvals: 1
  └─ ☑ Dismiss stale pull requests

☑ Require status checks to pass before merging
  └─ ☑ Require branches to be up to date

☑ Block force pushes

☑ Block deletions
```

**Deixa desmarcado**:
- Require commit signatures (depois você aprende)
- Restrict who can push (você é o dono, não precisa)

---

## ⚡ PASSO 5: Salvar a Configuração

1. Scroll para baixo
2. Clica **"Create"** ou **"Save changes"**
3. ✅ Pronto! Branch protegido!

---

## 🧪 COMO FICA O WORKFLOW DEPOIS

### ❌ Antes (sem proteção)
```bash
git checkout -b minha-feature
git commit -m "nova coisa"
git push origin minha-feature
git push origin main  # ← DIRETO! Perigoso!
```

### ✅ Depois (com proteção)
```bash
git checkout -b minha-feature
git commit -m "nova coisa"
git push origin minha-feature

# GitHub: "Clica para abrir PR"
# PR aberto → testes rodam automaticamente
# Se passar → você faz merge
# Se falhar → precisa consertar antes
```

---

## 📊 O Que Muda Para Você

### Antes
- Qual pessoa podia fazer push em main? **Qualquer uma**
- Testes rodavam? **Não automático**
- Alguém delete main acidentalmente? **Possível**

### Depois
- Qual pessoa pode fazer push em main? **Só via PR aprovado**
- Testes rodam? **Sempre, antes de merge**
- Alguém delete main acidentalmente? **IMPOSSÍVEL**

---

## 🔄 Bypass (Emergência)

Se der problema crítico em produção e precisa fazer bypass:
1. Vai em **"Settings"** → **"Branches"**
2. Clica no ruleset
3. Clica **"Bypass list"**
4. Adiciona você como exceção temporária
5. Depois remove

---

## ✅ Checklist de Configuração

- [ ] Entrei em Settings → Branches
- [ ] Criei novo ruleset: "Protect Main Branch"
- [ ] Selecionei "Include default branch" (main)
- [ ] Marcou: "Require pull request before merging" (1 approval)
- [ ] Marcou: "Dismiss stale pull requests"
- [ ] Marcou: "Require status checks to pass"
- [ ] Marcou: "Require branches to be up to date"
- [ ] Marcou: "Block force pushes"
- [ ] Marcou: "Block deletions"
- [ ] Clicou "Create" e salvou
- [ ] ✅ Branch protegido!

---

## 🆘 Precisa de Ajuda?

**Dúvida comum 1**: "Mas e se eu for o único desenvolvedor?"
- Mesmo assim protege! Acidentes acontecem com todos

**Dúvida comum 2**: "E se meu CI falhar e for bug do CI, não do código?"
- Pode fazer bypass temporário (vê section acima)

**Dúvida comum 3**: "Posso remover depois?"
- Sim, Settings → Branches → Delete ruleset

---

## 🎬 Próximo Passo

Depois de proteger o branch:

1. **Seu próximo branch será diferente**:
   ```bash
   git checkout -b feature/neon-db-setup
   # faz mudanças
   git push origin feature/neon-db-setup
   # Abre PR no GitHub
   # Testes rodam automaticamente
   # Se passar, aprova e faz merge
   ```

2. **Vercel detecta merge em main**
   - Deploy automático em staging ✨

3. **Monitoramento ativo**
   - Sentry monitora erros
   - Logs estruturados
   - Alertas em tempo real

---

**Status**: 🛡️ PRONTO PARA CONFIGURAR
**Próximo**: Siga os passos acima no GitHub!

