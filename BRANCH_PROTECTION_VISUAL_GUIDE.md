# 🎨 PREENCHIMENTO VISUAL - Baseado na Sua Screenshot

**Sua tela atual**: Settings → Rulesets → New branch ruleset  
**O que preencher**: Vejo na screenshot

---

## 📸 PASSO 1: Ruleset Name

Na tela você vê:
```
Ruleset Name *
[____________________]  ← Campo vazio
```

**Digite aqui:**
```
Protect Main Branch
```

---

## 📸 PASSO 2: Enforcement Status

Na tela você vê:
```
Enforcement status

[Disabled ▼]  ← Mude para "Enabled"
```

**Clica no dropdown** e seleciona:
```
☑ Enabled
```

---

## 📸 PASSO 3: Bypass List

Na tela você vê:
```
Bypass list
Exempt roles, teams, and apps from this ruleset by adding them to the bypass list.

[+ Add bypass]
```

**DEIXA COMO ESTÁ** (vazio por enquanto)

---

## 📸 PASSO 4: Target branches

Na tela você vê:
```
Target branches
Which branches should be matched?

Branch targeting criteria
[+ Add target]

Branch targeting has not been configured
```

**Clica em "+ Add target"** e escolhe:

### Opção A (Mais fácil - RECOMENDADO)
```
Branch targeting criteria: 
☑ Include default branch
```

### Opção B (Mais específico)
```
Branch targeting criteria:
☑ Matches
   "main"
```

---

## 📸 PASSO 5: Scroll para BAIXO

Depois de preencher os acima, scroll para baixo...

---

## 📸 PASSO 6: Rules (AQUI MARCA AS CAIXAS!)

Você vai ver várias seções. **MARCA ESSAS:**

### 1️⃣ Require a pull request before merging
```
☑ Require a pull request before merging
  ☑ Require approvals
    [1]  ← deixa como 1
  ☑ Dismiss stale pull requests
  (deixa desmarcado: "Require code owner review")
```

### 2️⃣ Require status checks to pass before merging
```
☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
```

### 3️⃣ Block force pushes
```
☑ Block force pushes
```

### 4️⃣ Block deletions
```
☑ Block deletions
```

### Deixa DESMARCADO:
- ☐ Require commit signatures (por enquanto)
- ☐ Restrict who can push to matching branches
- ☐ Require linear history
- ☐ Require deployment to succeed before merging

---

## 🎬 PASSO 7: Salvar

No final da página:
```
[Save changes]  ou  [Create]
```

Clica e ✅ **PRONTO!**

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────────┐
│         NEW BRANCH RULESET                  │
├─────────────────────────────────────────────┤
│ Ruleset Name: Protect Main Branch           │
│ Enforcement:  ☑ Enabled                    │
│ Target:       ☑ Include default branch     │
│              │
│ RULES:        │
│ ├─ ☑ Require PR before merging (1 approval)│
│ ├─ ☑ Dismiss stale PRs                     │
│ ├─ ☑ Require status checks pass           │
│ ├─ ☑ Require branches up to date          │
│ ├─ ☑ Block force pushes                   │
│ └─ ☑ Block deletions                      │
│              │
│ [Save changes]                              │
└─────────────────────────────────────────────┘
```

---

## ✅ Checklist Visual

Quando tiver preenchido TUDO, antes de salvar:

- [ ] Campo "Ruleset Name" preenchido: "Protect Main Branch"
- [ ] "Enforcement status" mudado para "Enabled"
- [ ] "Target branches" tem "Include default branch" ☑
- [ ] "Require a pull request before merging" ☑
- [ ] "Require approvals" = 1
- [ ] "Dismiss stale pull requests" ☑
- [ ] "Require status checks to pass before merging" ☑
- [ ] "Require branches to be up to date" ☑
- [ ] "Block force pushes" ☑
- [ ] "Block deletions" ☑
- [ ] Clica "Save changes" ou "Create"
- [ ] ✅ Branch protegido!

---

## 🎯 Pronto!

Se seguiu tudo isso, sua `main` branch está segura! 🛡️

**Próximo passo**: Volta para o Vercel deployment!

