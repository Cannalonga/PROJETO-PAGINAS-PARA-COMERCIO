# 💻 POWERSCRIPT COMMANDS - CI/CD MONITORING & MERGE

**Plataforma:** Windows PowerShell v5.1  
**Ambiente:** projeto na pasta: `c:\Users\rafae\Desktop\PROJETOS DE ESTUDOS\...`  
**Objetivo:** Comandos prontos para colar e executar

---

## 📌 CONFIGURAÇÃO RÁPIDA

### 1. Definir Variáveis (Cole uma vez)

```powershell
$repo = "Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO"
$branch = "feature/issue-01-get-users"
$projectDir = "c:\Users\rafae\Desktop\PROJETOS DE ESTUDOS\PROJETO PÁGINAS DO COMERCIO LOCAL\PAGINAS PARA O COMERCIO APP"
```

---

## 🔍 MONITORAMENTO DE WORKFLOW

### 2. Verificar Commit Local Mais Recente

```powershell
cd $projectDir
git log --oneline -1
```

**Esperado:** `c5bd46c (HEAD -> feature/issue-01-get-users) ci(security): update CodeQL v3...`

---

### 3. Abrir GitHub Actions (Navegador)

```powershell
# Opção A: Abrir no navegador
Start-Process "https://github.com/$repo/actions?query=branch%3A$branch"

# Ou copie manualmente: 
# https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/actions?query=branch%3Afeature%2Fissue-01-get-users
```

---

### 4. Verificar Status Git Local

```powershell
cd $projectDir
git status
git log --oneline -3
```

**Esperado:**
```
On branch feature/issue-01-get-users
Your branch is up to date with 'origin/feature/issue-01-get-users'
Working tree clean
```

---

## 📊 VERIFICAR LOCALMENTE (Antes de PR)

### 5. Build Local (Final Verification)

```powershell
cd $projectDir
npm run build 2>&1 | Select-Object -Last 30
```

**Procure por:** `✓ Compiled successfully` ✅

---

### 6. Tests Locais (41/41)

```powershell
cd $projectDir
npm run test -- lib/__tests__/users.route.test.ts 2>&1 | Select-Object -Last 50
```

**Procure por:** `Tests:       41 passed, 41 total` ✅

---

### 7. Audit (Zero Vulnerabilities)

```powershell
cd $projectDir
npm audit --audit-level=high 2>&1
```

**Esperado:** `found 0 vulnerabilities` ✅

---

## 🎬 CRIAR PR (Se ainda não foi criado)

### 8. Opção A: Abrir Link Direto do PR

```powershell
# Abre no navegador padrão
Start-Process "https://github.com/$repo/pull/new/$branch"
```

**Então preencha:** (conforme documento PULL_REQUEST_BODY.md)

---

### 9. Opção B: Verificar PRs Existentes

```powershell
# Se gh estiver disponível:
# gh pr list --repo $repo --head $branch

# Ou abrir a página de PRs:
Start-Process "https://github.com/$repo/pulls"
```

---

## ⏱️ MONITORAMENTO EM TEMPO REAL

### 10. Verificar Runs Recentes (Se gh instalado)

```powershell
# Nota: gh pode não estar disponível, mas aqui está o comando:
# gh run list --repo $repo --branch $branch --limit 5

# Alternativa: Abrir a página de Actions
Start-Process "https://github.com/$repo/actions?query=branch%3A$branch"
```

---

### 11. Loop de Monitoramento (Executar a cada 1-2 min)

```powershell
while ($true) {
    Write-Host "=== WORKFLOW STATUS ===" -ForegroundColor Cyan
    Write-Host "Timestamp: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Yellow
    Write-Host "Branch: $branch"
    Write-Host ""
    Write-Host "Para ver status atual:"
    Write-Host "1. Abra: https://github.com/$repo/actions"
    Write-Host "2. Procure pela branch: $branch"
    Write-Host "3. Verifique os 5 gates (Security, Lint, Tests, Build, Report)"
    Write-Host ""
    Write-Host "Quando todos forem VERDES, passe para MERGE"
    Write-Host ""
    Write-Host "Próxima check em 60 segundos... (Ctrl+C para sair)"
    Start-Sleep -Seconds 60
}
```

**Executar:** Cole e execute  
**Parar:** Pressione `Ctrl+C`

---

## ✅ QUANDO TODOS OS GATES FOREM VERDES

### 12. Verificação Final PRÉ-MERGE

```powershell
# Verificar que branch está limpa
cd $projectDir
git status

# Esperado: "Working tree clean"
```

---

### 13. Sincronizar com Main (Seg segura)

```powershell
cd $projectDir
git fetch origin main
git status
```

**Esperado:** "Your branch is up to date with 'origin/feature/issue-01-get-users'"

---

## 🚀 MERGE (Quando tudo estiver verde ✅)

### 14. Merge via GitHub Web (Recomendado)

```powershell
# Abrir a página do PR no navegador
Start-Process "https://github.com/$repo/pulls"

# Então manualmente:
# 1. Clique no PR criado
# 2. Scroll até "Merge pull request"
# 3. Clique dropdown → "Squash and merge"
# 4. Confirme mensagem (auto-preenchida)
# 5. Clique "Confirm squash and merge"
# 6. Marque "Delete branch"
```

---

### 15. Sincronizar Local com Main (Após Merge)

```powershell
cd $projectDir
git checkout main
git pull origin main
git log --oneline -1
```

**Esperado:** Seu commit (squashed) agora em main ✅

---

## 🆘 TROUBLESHOOTING RÁPIDO

### 16. Se Gate Falhar - Ver Log

```powershell
# Se tiver gh:
# gh run view <RUN_ID> --log > workflow-log.txt

# Senão, manualmente:
# 1. Vá a: https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/actions
# 2. Clique no run que falhou
# 3. Clique no job/step que falhou
# 4. Copie o erro (últimas 20-30 linhas)
# 5. Cole aqui → eu gero patch
```

---

### 17. Rerun Workflow (Após Fix)

```powershell
# Se tiver gh:
# gh run rerun <RUN_ID> --repo $repo

# Senão, manualmente:
# Na página do GitHub Actions, clique "Re-run all jobs"
```

---

### 18. Forçar Push Local (Se Necessário)

```powershell
cd $projectDir

# CUIDADO: Apenas se o workflow não disparou após push
git push origin $branch --force-with-lease 2>&1
```

---

## 📝 VERIFICAÇÕES APÓS MERGE

### 19. Confirmar Merge no GitHub

```powershell
# Abrir branch main no GitHub
Start-Process "https://github.com/$repo/tree/main"

# Verificar:
# - Último commit é o seu (squashed)
# - Issue #1 marcada como Closed
```

---

### 20. Verificar Vercel Deploy (Se Configurado)

```powershell
# Abrir Vercel dashboard
Start-Process "https://vercel.com"

# Procure pelo projeto e veja:
# - Production: Novo deploy em progresso
# - Preview: URL do seu endpoint
```

---

## 🎯 ISSUE #2 - SETUP RÁPIDO

### 21. Após Merge de Issue #1 - Começar Issue #2

```powershell
cd $projectDir

# Sincronizar com main
git checkout main
git pull origin main

# Nova branch para Issue #2
git checkout -b feature/issue-02-get-user-by-id

# Verificar
git branch
git log --oneline -1
```

---

### 22. Pedir Skeleton de Issue #2

```powershell
# Copie este texto e envie:
"Generate Issue #2 skeleton - GET /api/users/:id"

# Eu vou fornecer:
# - app/api/users/[id]/route.ts (com 8 security layers)
# - lib/__tests__/users.id.route.test.ts (41+ testes)
# - Instruções prontas
```

---

## 📊 CHEAT SHEET COMPLETO

```powershell
# ========== VERIFICAÇÕES INICIAIS ==========
cd $projectDir
git status                           # Verifica branch
git log --oneline -1                # Vê commit mais recente
npm run build 2>&1 | tail -20       # Build local
npm run test -- lib/__tests__/users.route.test.ts 2>&1 | tail -20  # Tests

# ========== MONITORAMENTO ==========
Start-Process "https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/actions?query=branch%3Afeature%2Fissue-01-get-users"
# Abra acima e observe os 5 gates

# ========== APÓS MERGE ==========
git checkout main
git pull origin main
git log --oneline -1                # Confirma merge

# ========== PRÓXIMA ISSUE ==========
git checkout -b feature/issue-02-get-user-by-id
# Envie: "Generate Issue #2 skeleton"
```

---

## ⏱️ SEQUÊNCIA FINAL (Passo a Passo)

```
1. AGORA:
   └─ Cole comando #8 (Create PR via link)
   └─ Preencha PR (title, description, labels)
   └─ Clique "Create pull request"

2. +1 min:
   └─ Cole comando #11 (Monitor loop)
   └─ Aguarde 5 gates ficarem VERDES (~10 min)

3. +11 min:
   └─ Cole comando #14 (Merge via GitHub Web)
   └─ Manualmente clique "Merge" no site
   └─ Confirme "Squash and merge"

4. +2 min:
   └─ Cole comando #15 (Sync local)
   └─ Verifique merge localmente

5. +1 min:
   └─ Cole comando #21 (Setup Issue #2)
   └─ Envie: "Generate Issue #2 skeleton"
   └─ Receba arquivos prontos para Issue #2

TOTAL TEMPO: ~30 minutos
```

---

## 🎓 REFERÊNCIA RÁPIDA

| Ação | Comando | Tempo |
|------|---------|-------|
| Verificar branch | `git status` | <1s |
| Ver commits | `git log --oneline -3` | <1s |
| Build local | `npm run build` | ~3s |
| Tests (41) | `npm run test --silent` | ~2s |
| Audit sec. | `npm audit --audit-level=high` | ~2s |
| Abrir PR | `Start-Process https://...` | <1s |
| Monitor CI | Manual na web | Contínuo |
| Merge | Manual no GitHub | ~1s |
| Sync local | `git pull origin main` | <1s |
| Nova branch | `git checkout -b feature/...` | <1s |

---

## ✅ CONCLUSÃO

**Seu endpoint está pronto! Próximos passos:**

1. ✅ Executar comando #8 (abrir PR)
2. ✅ Preencher PR (título, descrição, labels)
3. ✅ Monitorar gates (todos ficam verdes)
4. ✅ Merge com squash
5. ✅ Sincronizar local
6. ✅ Começar Issue #2

**Tempo total:** ~30 minutos até pronto para Issue #2

---

*Script Reference: POWERSHELL_COMMANDS.md*  
*Versão: 1.0*  
*Ambiente: Windows PowerShell 5.1*  
*Projeto: PAGINAS PARA O COMERCIO (Week 2)*
