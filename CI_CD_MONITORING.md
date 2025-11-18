# CI/CD MONITORING & ACTION PLAN

**Data:** 18 Novembro 2025  
**Status:** 🔄 GitHub Actions em execução  
**Ação:** Monitorar completion → Branch protection → Week 2

---

## 📊 STATUS ATUAL

### Runs em Progresso
- **Run #1:** CI/CD - Security Gates | Status: `In progress`
- **Run #2:** CI/CD - Security Gates | Status: `In progress`

**O que significa:** Seus 11 commits dispararam o workflow. GitHub está executando os 5 gates agora.

### Esperado em cada run

```
Stage 1: Security & Dependencies Scan
  ├─ Checkout code
  ├─ Setup Node 20
  ├─ Secret Scanner
  ├─ Dependency Audit (npm audit)
  ├─ CodeQL Initialize
  ├─ Build for CodeQL
  └─ CodeQL Analysis

Stage 2: Lint & TypeScript
  ├─ Checkout
  ├─ Setup Node
  ├─ npm ci
  ├─ ESLint
  └─ TypeScript Check (npx tsc --noEmit)

Stage 3: Tests
  ├─ Checkout
  ├─ Setup PostgreSQL service
  ├─ Setup Node
  ├─ npm ci
  ├─ Prisma Generate
  ├─ Prisma Push (shadow DB)
  └─ npm test

Stage 4: Build
  ├─ (depends on stages 1-3)
  ├─ npm ci
  ├─ npm run build
  └─ Upload artifacts

Stage 5: CI Status Report
  ├─ Check all gates
  └─ Report results
```

---

## 🎯 O QUE FAZER AGORA

### Opção A: Monitorar via GitHub Web UI (Mais Fácil)

1. **Abra:** https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/actions
2. **Procure:** "CI/CD - Security Gates" workflow
3. **Veja:** Os 2 runs em progresso
4. **Aguarde:** Até completar (5-10 minutos típico)
5. **Resultado esperado:**
   - ✅ All jobs PASSED
   - ❌ Se falhar: Veja logs abaixo

**⚠️ Se a UI mostrar erro:** Use CLI (Opção B)

---

### Opção B: Inspecionar via GitHub CLI (Recomendado)

**Pré-requisito:** GitHub CLI instalado (`gh`)

```bash
# Listar últimos runs
gh run list --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO --limit 5

# Ver detalhes de um run específico (substitua <run-id>)
gh run view <run-id> --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO

# Ver logs completos
gh run view <run-id> --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO --log

# Re-run se necessário
gh run rerun <run-id> --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO

# Cancelar
gh run cancel <run-id> --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO
```

---

### Opção C: Inspecionar via cURL (Se gh não disponível)

```bash
# Exportar seu token (obtenha em https://github.com/settings/tokens)
export GH_TOKEN="ghp_your_token_here"

# Listar runs
curl -H "Authorization: token $GH_TOKEN" \
  "https://api.github.com/repos/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/actions/runs?per_page=5" \
  | jq '.workflow_runs[] | {id, name, status, conclusion}'

# Ver jobs de um run
curl -H "Authorization: token $GH_TOKEN" \
  "https://api.github.com/repos/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/actions/runs/<run-id>/jobs" \
  | jq '.jobs[] | {name, status, conclusion}'

# Checar Dependabot alerts
curl -H "Authorization: token $GH_TOKEN" \
  "https://api.github.com/repos/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/dependabot/alerts" \
  | jq '.[] | {number, state, security_advisory}'
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após o run completar, verificar:

```
[ ] Security & Dependencies Scan: PASSED
    ├─ CodeQL check: OK
    ├─ npm audit: 0 vulnerabilities
    └─ Secret scan: No credentials found

[ ] Lint & TypeScript: PASSED
    ├─ ESLint: No errors
    └─ TypeScript strict: 0 errors

[ ] Unit & Integration Tests: PASSED
    ├─ Prisma migrations: OK
    └─ jest tests: OK (or skipped if not configured)

[ ] Build Next.js: PASSED
    ├─ npm run build: Success
    └─ Artifacts uploaded: OK

[ ] CI Status Report: PASSED
    └─ All gates green ✅

[ ] Dependabot: ACTIVE
    └─ No critical vulnerabilities
```

---

## 🚨 SE ALGUM GATE FALHAR

### Passo 1: Coletar logs

```bash
# Via gh CLI (recommended)
gh run view <run-id> --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO --log > logs.txt

# Ou abrir no navegador:
# https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/actions/runs/<run-id>
# → Clicar em job que falhou → Ver logs
```

### Passo 2: Identificar o erro

Procurar por padrões:
- `error:` — erro durante build/test
- `Error:` — erro de sistema
- `FAILED` — teste ou validação falhou
- `fatal:` — erro crítico

### Passo 3: Enviar para análise

Cole aqui o trecho relevante (10 linhas antes + 10 depois do erro):

```
[ERRO AQUI]
```

Vou diagnosticar e fornecer:
1. Raiz do problema
2. Patch de código
3. Comando para aplicar
4. Re-run do workflow

### Passo 4: Re-run

```bash
gh run rerun <run-id> --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO
```

---

## 🔐 PRÓXIMO: BRANCH PROTECTION

Após TODOS os jobs PASSAR:

### Opção A: GUI (Via GitHub)

1. Abra: https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/settings/branches
2. Clique: "Add rule"
3. Preenchaa:
   ```
   Branch name pattern: main
   
   ✅ Require a pull request before merging
     ✅ Require approvals: 1
     ✅ Dismiss stale pull request approvals when new commits are pushed
   
   ✅ Require status checks to pass before merging
     ✅ Require branches to be up to date before merging
     Status checks required:
       - Security & Dependencies Scan
       - Lint & TypeScript
       - Unit & Integration Tests
       - Build Next.js
   
   ✅ Include administrators
   ✅ Restrict who can push to matching branches
   ```
4. Clique: "Create"

### Opção B: GitHub CLI

```bash
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
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "allow_force_pushes": false,
  "allow_deletions": false,
  "restrictions": null
}
EOF
```

---

## 📋 SEQUÊNCIA DE AÇÕES

```
1. ⏳ AGORA: Monitorar CI/CD até completar
   └─ Refresh: https://github.com/.../actions a cada 2 min
   └─ Timeout típico: 5-10 minutos

2. ✅ SE TODOS JOBS PASS:
   └─ Ativar branch protection (GUI ou CLI acima)
   └─ Prosseguir para Week 2

3. ❌ SE ALGUM JOB FALHAR:
   └─ Coletar logs (gh run view)
   └─ Enviar aqui o trecho do erro
   └─ Eu forneço patch + comando fix
   └─ Re-run workflow
   └─ Confirmar PASS
   └─ Ativar branch protection

4. 🚀 WEEK 2:
   └─ Criar feature branch: git checkout -b feature/issue-1-get-users
   └─ Implementar Issue #1
   └─ Abrir PR (template auto-preenchido)
   └─ Merge com squash após CI PASS + review
```

---

## 📞 TROUBLESHOOTING RÁPIDO

| Problema | Solução |
|----------|---------|
| **UI GitHub mostrando erro** | Use `gh run list` ou cURL |
| **Run ainda em progresso depois de 15 min** | Algo pode ter travado. Use `gh run cancel <id>` e `gh run rerun <id>` |
| **Job específico falhou** | Coletar logs do job → enviar aqui |
| **Todos os jobs passaram mas CI Status Report falhou** | Confirmar os contextos exatos dos status checks (veja job logs) |
| **Branch protection não aplica** | Verificar permissões (precisa ser admin/owner) |

---

## 🎯 EXPECTATIVA FINAL

Após completar este plano:

✅ CI/CD validado (todos 5 gates passando)  
✅ Branch protection ativado  
✅ Pronto para Week 2 (1 PR por endpoint)  
✅ Semântica de commits validada  
✅ Deploy bloqueado sem PR + CI + review

**Tempo total esperado:** 30 minutos

---

**Próxima ação:** Abra https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/actions e monitore os runs. Cole aqui qualquer erro que encontrar.
