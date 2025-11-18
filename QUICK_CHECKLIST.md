# ⚡ QUICK ACTION CHECKLIST

**Execute em ordem. Tempo total: 30 minutos**

---

## 1️⃣ MONITORAR CI/CD (5-10 min)

### Método A: Web UI (mais visual)
- [ ] Abra: https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/actions
- [ ] Procure: "CI/CD - Security Gates" workflow
- [ ] Veja: 2 runs em progresso
- [ ] Aguarde: Status mudar de "In progress" para "completed"
- [ ] Resultado: ✅ All jobs PASSED (esperado)

### Método B: CLI (mais confiável)
```bash
# Listar runs
gh run list --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO --limit 5

# Ver último run
gh run view --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO --log | head -100

# Ou ver resumo
gh run view --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO
```
- [ ] Todos os jobs: PASSED ✅
- [ ] Se falhar: Cole o erro aqui ↓

```
[ERRO AQUI]
```

---

## 2️⃣ VALIDAR CADA GATE

### Gate 1: Security & Dependencies Scan
```
Expected:
  ✅ Checkout code
  ✅ Setup Node 20
  ✅ Secret Scanner (0 secrets)
  ✅ Dependency Audit (0 vulnerabilities)
  ✅ CodeQL Initialize
  ✅ Build for CodeQL (success)
  ✅ CodeQL Analysis (complete)
```
- [ ] Status: ✅ PASSED

### Gate 2: Lint & TypeScript
```
Expected:
  ✅ npm ci (dependencies installed)
  ✅ ESLint (0 errors)
  ✅ TypeScript Check (0 errors)
```
- [ ] Status: ✅ PASSED

### Gate 3: Unit & Integration Tests
```
Expected:
  ✅ PostgreSQL service started
  ✅ Prisma Generate
  ✅ Prisma Push (shadow DB success)
  ✅ npm test (0 failures or skipped)
```
- [ ] Status: ✅ PASSED

### Gate 4: Build Next.js
```
Expected:
  ✅ npm ci
  ✅ npm run build (success)
  ✅ Artifacts uploaded
```
- [ ] Status: ✅ PASSED

### Gate 5: CI Status Report
```
Expected:
  ✅ All gates checked
  ✅ All gates green
```
- [ ] Status: ✅ PASSED

---

## 3️⃣ ATIVAR BRANCH PROTECTION (5 min)

### Opção A: Via GitHub Settings GUI
- [ ] Abra: https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/settings/branches
- [ ] Clique: "Add rule"
- [ ] Branch name: `main`
- [ ] Checkboxes:
  - [ ] Require a pull request before merging (1 approval)
  - [ ] Require status checks to pass (select all 4)
  - [ ] Include administrators
- [ ] Clique: "Create"

### Opção B: Via CLI
```bash
bash scripts/activate-branch-protection.sh
# ou
gh api repos/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/branches/main/protection \
  --input - << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Security & Dependencies Scan",
      "Lint & TypeScript",
      "Unit & Integration Tests",
      "Build Next.js"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "allow_force_pushes": false,
  "allow_deletions": false,
  "restrictions": null
}
EOF
```
- [ ] Proteção ativada: ✅

---

## 4️⃣ COMEÇAR WEEK 2 (Go!)

```bash
# 1. Pull latest
git pull origin main

# 2. Create feature branch
git checkout -b feature/issue-1-get-users

# 3. Implement Issue #1 (GET /api/users)
# See WEEK_2_ISSUES.md for details

# 4. Commit with semantic message
git add .
git commit -m "feat(users): implement GET /api/users endpoint

- Add paginated user listing
- Apply tenant isolation
- Validate with Zod
- Add unit tests

Closes #1"

# 5. Push
git push origin feature/issue-1-get-users

# 6. Go to GitHub and open PR
# https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/compare/main...feature/issue-1-get-users

# 7. Wait for CI/CD (5 min)
# 8. Get 1 approval
# 9. Merge with "Squash and merge"
```

- [ ] Issue #1 completa
- [ ] PR aberta
- [ ] CI passou
- [ ] Merge com squash
- [ ] Feature branch deletada

---

## ✅ FINAL CHECKLIST

```
[ ] CI/CD Status: Todos 5 gates PASSED ✅
[ ] Branch protection: Ativado ✅
[ ] Primeira feature branch: Criada ✅
[ ] Issue #1: Implementada ✅
[ ] PR #1: Aberta ✅
[ ] CI/CD no PR: Passou ✅
[ ] PR: Mergeada com squash ✅
[ ] Tag criada: v0.2.0 (opcional)
```

---

## 📊 MÉTRICAS ESPERADAS

Após completar tudo:
- ✅ 11 commits em main
- ✅ 1ª PR completada
- ✅ 5 gates sempre passando
- ✅ 0 vulnerabilidades
- ✅ 100% TypeScript strict
- ✅ CI/CD ~5-7 min por run
- ✅ Branch protection forçando PR workflow

---

## 🚨 TROUBLESHOOTING RÁPIDO

| Problema | Ação |
|----------|------|
| UI GitHub travada | Use `gh run list` em vez disso |
| Run em progresso >15 min | `gh run cancel <id>` depois `gh run rerun <id>` |
| Job específico falhou | Envie o log aqui; eu corrijo |
| Branch protection não funciona | Verificar permissões (admin?) |
| Merge bloqueado | Aguarde CI passar + 1 review |

---

## 🎯 PRÓXIMO PASSO

**Abra agora:** https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/actions

Cole aqui o resultado quando terminar de monitorar! ✅
