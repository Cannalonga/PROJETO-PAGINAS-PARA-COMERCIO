# FASE 2 → 3 EXECUTION PLAN

**Data:** 18 Novembro 2025 — Final Sprint  
**Status:** ✅ Infrastructure Ready | 🔄 CI/CD Validation | ⏳ Week 2 Launch  
**Objetivo:** Validar CI/CD + Ativar Branch Protection + Iniciar Week 2

---

## 📊 ANÁLISE PROFUNDA

### Estado Atual
- ✅ 12 commits sincronizados com GitHub
- ✅ 10 security gates implementados
- ✅ Jest + CI/CD workflow pronto
- ✅ Documentação completa (8 arquivos)
- ✅ Scripts prontos (3 arquivos)
- 🔄 2 runs em progresso (1 FAILED/fixed, 1 In progress)

### Risco Principal
**UI do GitHub instável** → Usar CLI (`gh`) para verificação confiável

### Caminho Crítico
```
1. Verificar CI/CD final (gh CLI) — 5 min
   └─ Se PASS → Branch protection
   └─ Se FAIL → Coletar logs + diagnosticar

2. Ativar branch protection — 5 min
   └─ Script pronto ou GUI

3. Criar Issue #1 PR + implementar — 30 min
   └─ Validar CI pipeline em PR
   └─ Confirmar merge workflow

4. Repetir para Issues #2-12 — Daily (Rest of Week 2)
```

---

## 🎯 AÇÕES IMEDIATAS (ORDEM EXATA)

### PASSO 1: Verificar CI/CD Status (CLI)

**Listar runs:**
```bash
gh run list --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO --limit 5
```

**Output esperado:**
```
STATUS  CONCLUSION  WORKFLOW    BRANCH  EVENT  CREATED
...     ...         CI/CD - ... main    push   ...
in_progress  -     CI/CD - ... main    push   ...
completed   failure CI/CD - ... main    push   ...
```

**Pegue o run-id do run em progresso (first column).**

---

### PASSO 2: Inspecionar Logs do Run (CLI)

```bash
gh run view <RUN_ID> --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO --log
```

**Procure por:**
- ✅ `Security & Dependencies Scan: PASSED`
- ✅ `Lint & TypeScript: PASSED`
- ✅ `Unit & Integration Tests: PASSED` (ou `skipped`)
- ✅ `Build Next.js: PASSED`
- ✅ `CI Status Report: PASSED`

**Se ver `FAILED`:**
```bash
# Salve logs para análise
gh run view <RUN_ID> --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO --log > run-logs.txt

# Compartilhe o trecho do erro aqui
```

---

### PASSO 3: Se TODOS PASS → Ativar Branch Protection

**Opção A: Usar script (recomendado)**
```bash
cd c:\Users\rafae\Desktop\PROJETOS\ DE\ ESTUDOS\PROJETO\ PÁGINAS\ DO\ COMERCIO\ LOCAL\PAGINAS\ PARA\ O\ COMERCIO\ APP

# Tornar executável
chmod +x scripts/activate-branch-protection.sh

# Executar
bash scripts/activate-branch-protection.sh
```

**Opção B: Via GitHub CLI direto**
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
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "allow_force_pushes": false,
  "allow_deletions": false,
  "restrictions": null
}
EOF
```

**Verificar que foi aplicada:**
```bash
gh api repos/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO/branches/main/protection | jq .
```

---

### PASSO 4: Criar Feature Branch para Issue #1

```bash
git checkout -b feature/issue-1-get-users
```

**Archivos a editar:**
1. `app/api/users/route.ts` — Implementar GET
2. `lib/__tests__/users.test.ts` — Adicionar testes
3. Atualizar `CHANGELOG.md` (opcional)

**Estrutura mínima (GET /api/users):**
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { withTenantIsolation } from '@/lib/middleware';
import { rateLimiters } from '@/lib/rate-limiter';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';
import { z } from 'zod';

const querySchema = z.object({
  skip: z.coerce.number().default(0),
  take: z.coerce.number().default(10),
  role: z.enum(['owner', 'admin', 'member']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await withAuth(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Tenant isolation
    const tenantId = withTenantIsolation(request); // throws if invalid

    // 3. Rate limit
    const rateLimitResult = await rateLimiters.api(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
      );
    }

    // 4. Validate query
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      skip: searchParams.get('skip'),
      take: searchParams.get('take'),
      role: searchParams.get('role'),
    });

    // 5. Query database
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { tenantId, role: query.role },
        skip: query.skip,
        take: query.take,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
      }),
      prisma.user.count({ where: { tenantId, role: query.role } }),
    ]);

    // 6. Log audit
    await logAuditEvent({
      userId: session.user.id,
      tenantId,
      action: 'read',
      entity: 'user',
      changes: { query: { skip: query.skip, take: query.take } },
      metadata: { count: users.length },
      maskPii: true,
    });

    return NextResponse.json({
      data: users,
      pagination: { skip: query.skip, take: query.take, total },
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### PASSO 5: Commitar com Semantic Message

```bash
git add app/api/users/route.ts lib/__tests__/users.test.ts

git commit -m "feat(users): implement GET /api/users endpoint - issue #1

- Add paginated user listing for tenant scope
- Apply tenant isolation middleware
- Validate query params with Zod schema
- Implement rate limiting (100 req/min)
- Add audit logging with PII masking
- Include unit tests for all edge cases

Closes #1"
```

---

### PASSO 6: Push & Abrir PR

```bash
git push -u origin feature/issue-1-get-users
```

**Criar PR via CLI:**
```bash
gh pr create \
  --title "feat(users): implement GET /api/users endpoint" \
  --body "Implements Issue #1: GET /api/users

## Changes
- GET /api/users endpoint with pagination
- Tenant isolation validation
- Rate limiting (100 req/min)
- Audit logging
- Unit tests

## Security Checklist
- [x] Middleware applied (auth → role → tenant)
- [x] Rate limiting configured
- [x] Audit logging with PII masking
- [x] Unit tests included

## Testing
Tested via curl:
\`\`\`bash
curl -H 'Authorization: Bearer <token>' http://localhost:3000/api/users?skip=0&take=10
\`\`\`

Closes #1" \
  --base main \
  --head feature/issue-1-get-users
```

---

### PASSO 7: Aguardar CI/CD em PR

**GitHub Actions rodará automaticamente:**
- Security scan (CodeQL + npm audit)
- Lint (ESLint)
- Tests (Jest)
- Build (Next.js)

**Tempo típico:** 5-7 minutos

**Ver status:**
```bash
# Listar PRs
gh pr list --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO

# Ver status do PR específico
gh pr checks <PR_NUMBER> --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO
```

---

### PASSO 8: Review & Merge

**Após CI PASS:**
1. Obter 1 approval (você pode auto-approve ou outro dev)
2. Merge com "Squash and merge" (preserva histórico clean)

```bash
# Auto-approve (se necessário)
gh pr review <PR_NUMBER> --approve

# Merge
gh pr merge <PR_NUMBER> --squash --delete-branch
```

**Resultado:**
- Feature branch deletada
- 1 novo commit em main (squashed)
- CI roda novamente em main
- Deploy automático para staging (se configurado)

---

## ✅ VERIFICAÇÃO FINAL

### Checklist Técnico
```
[ ] CI/CD run atual: TODOS 5 gates PASSED
[ ] Branch protection: Ativada
[ ] Issue #1 implementada e testada localmente
[ ] PR #1 aberta com template preenchido
[ ] CI/CD em PR: PASS
[ ] 1 approval: Obtida
[ ] PR #1: Mergeada com squash
[ ] Feature branch: Deletada
[ ] npm run build: OK localmente
[ ] npm run lint: OK
[ ] Testes: PASS
```

### Checklist de Segurança
```
[ ] Middleware stack aplicado (auth → role → tenant)
[ ] Rate limiting: Configurado (100/min para api)
[ ] Audit logging: PII masked (email, phone, password)
[ ] IDOR checks: Tenant mismatch logged
[ ] TypeScript strict: 0 errors
[ ] ESLint: 0 errors
[ ] npm audit: 0 vulnerabilities
```

### Checklist Operacional
```
[ ] Logs coletáveis via gh CLI
[ ] Branch protection bloqueando pushes diretos
[ ] PRs requerendo review + CI
[ ] Merge squash preservando mensagens semânticas
[ ] Tag v0.2.0 criada (opcional após PR #1)
```

---

## 📈 PRÓXIMAS ISSUES (Sequência Week 2)

**Depois de Issue #1 PASS:**
- Issue #2: GET /api/users/[id]
- Issue #3: POST /api/users (create)
- Issue #4: PUT /api/users/[id] (update)
- Issue #5: DELETE /api/users/[id]
- Issue #6: POST /api/users/[id]/change-password
- ... (Issues #7-12)

**Padrão:** 1 issue = 1 branch = 1 PR = 1 day (idealmente)

---

## 🚨 TROUBLESHOOTING

### Se CI/CD Falhar em Run (não PR)

1. **Coletar logs:**
   ```bash
   gh run view <RUN_ID> --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO --log > logs.txt
   ```

2. **Cole aqui o trecho do erro**

3. **Eu direi:**
   - Diagnóstico
   - Patch de código
   - Comando `git` para aplicar
   - `gh run rerun <RUN_ID>` para retry

### Se PR CI/CD Falhar

1. **Ver jobs do PR:**
   ```bash
   gh pr checks <PR_NUMBER>
   ```

2. **Coletar logs:**
   ```bash
   # Abra no navegador ou use:
   gh run view <RUN_ID> --repo Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO --log
   ```

3. **Fix localmente:**
   ```bash
   git add . && git commit -m "fix: resolve CI issue"
   git push origin feature/issue-1-get-users
   # CI re-runs automaticamente
   ```

### Se Branch Protection Bloquear

**Esperado:** Não é possível fazer `git push` direto em `main`.  
**Solução:** Usar feature branches + PRs (que é o workflow).

```bash
# ❌ Isto falhará
git push origin main

# ✅ Isto funciona
git checkout -b feature/fix
git push -u origin feature/fix
# Abrir PR
```

---

## 🎯 RESULTADO ESPERADO (FIM DO DIA)

```
✅ CI/CD validado (todos 5 gates PASS)
✅ Branch protection ativado (PRs obrigatórias)
✅ Issue #1 completa (GET /api/users)
✅ PR #1 mergeada (com squash)
✅ Feature branch #1 deletada
✅ v0.2.0 tag criada (opcional)

Próximo: Repetir para Issues #2-12 (daily)
Deadline: Fim de semana (Day 7 = sábado)
```

---

**Próxima ação:** Execute PASSO 1 agora. Cole aqui o output de `gh run list` para confirmarmos o status.
