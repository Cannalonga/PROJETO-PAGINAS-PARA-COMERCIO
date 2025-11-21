# 🛡️ GitHub Branch Protection - GUIA ATUALIZADO (Nova Interface Rulesets)

**URL Correta**: `https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/settings/rules/new`  
**Interface**: GitHub Rulesets (Nova - 2024)  
**Status**: Passo a passo CORRETO

---

## 🎯 RESUMO RÁPIDO

Você está na página certa! A URL mostra que é a **nova interface de Rulesets** do GitHub.

Siga esses passos:

---

## 📋 PASSO 1: Ruleset Name

**Campo que você vê:**
```
Ruleset Name *
[____________________]
```

**Digite:**
```
Protect Main Branch
```

---

## 📋 PASSO 2: Enforcement Status

**Você vê:**
```
Enforcement status

[Disabled ▼]
```

**MUDE PARA:**
```
☑ Enabled
```

---

## 📋 PASSO 3: Target Branches

**Você vê:**
```
Target branches
Which branches should be matched?

[+ Add target]
```

**Clica em "+ Add target"** e escolhe:

### Opção A (Recomendada):
```
Include default branch ☑
```

### Opção B (Específico):
```
Matches: main
```

---

## 📋 PASSO 4: Bypass List

**Você vê:**
```
Bypass list
Exempt roles, teams, and apps...

[+ Add bypass]
```

**DEIXA COMO ESTÁ** (vazio)

---

## 📋 PASSO 5: Rules (AQUI MARCA AS CAIXAS!)

Scroll para BAIXO. Você vai ver várias seções com checkboxes:

### ✅ MARQUE ESSAS:

#### 1️⃣ Require a pull request before merging
```
☑ Require a pull request before merging
  ☑ Require approvals
    [1]  ← deixa como 1
  ☑ Dismiss stale pull request approvals when new commits are pushed
```

#### 2️⃣ Require status checks to pass before merging
```
☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
```

#### 3️⃣ Restrict force pushes
```
☑ Restrict force pushes
   (ou pode ser chamado: "Block force pushes")
```

#### 4️⃣ Restrict deletions
```
☑ Restrict deletions
   (ou pode ser chamado: "Block deletions")
```

### ❌ DEIXA DESMARCADO:

```
☐ Require code owner review
☐ Require commit signatures
☐ Require linear history
☐ Require branches to be up to date before merging (para Push)
☐ Require deployments to succeed before merging
```

---

## 🎬 PASSO 6: Salvar

No final da página:
```
[Create] ← Clica aqui
```

✅ **PRONTO!** Branch protegido!

---

## 📊 O Que Você Vai Ver

**Na interface nova do GitHub, procura por:**

| Opção | Status | Por Quê |
|-------|--------|--------|
| Require a pull request | ☑ | Obriga usar PR |
| Require approvals: 1 | ☑ | Precisa 1 aprovação |
| Dismiss stale PRs | ☑ | Invalida PR se houver novo commit |
| Require status checks | ☑ | Testes devem passar |
| Require update before merge | ☑ | Branch atualizado |
| Restrict force pushes | ☑ | Proíbe `git push --force` |
| Restrict deletions | ☑ | Proíbe deletar branch |

---

## ✅ Checklist FINAL

Antes de clicar "Create", confirme:

- [ ] Ruleset Name: "Protect Main Branch" ✓
- [ ] Enforcement status: "Enabled" ✓
- [ ] Target branches: "Include default branch" ✓
- [ ] ☑ Require a pull request before merging
- [ ] ☑ Require approvals: 1
- [ ] ☑ Dismiss stale PRs
- [ ] ☑ Require status checks to pass
- [ ] ☑ Require branches to be up to date
- [ ] ☑ Restrict force pushes
- [ ] ☑ Restrict deletions
- [ ] Clicou "Create"
- [ ] ✅ Branch protegido!

---

## 🆘 Se Não Achar Uma Opção

A **nova interface pode ter nomes ligeiramente diferentes**. Procure por:

| Se procura... | Pode estar chamado... |
|---|---|
| Block force pushes | Restrict force pushes / Prevent force pushes |
| Block deletions | Restrict deletions / Prevent deletions |
| Dismiss stale PR | Dismiss stale pull request approvals |
| Status checks | Require status checks / Require checks |

Use **CTRL + F** e procure por essas palavras!

---

## 🎯 Próximo Passo

Depois que criar o ruleset:

1. ✅ Branch protegido em main
2. → Ir para **Deploy em Vercel** (próximo passo!)
3. → Validar staging
4. → Deploy produção

---

**Status**: 🟢 PRONTO PARA CRIAR O RULESET
**Próximo**: Siga os passos acima na página do GitHub!

