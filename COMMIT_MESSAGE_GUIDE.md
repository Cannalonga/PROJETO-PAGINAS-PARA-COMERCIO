# Commit Message Guide

## Padrão Semântico (Conventional Commits)

Todos os commits devem seguir o padrão:

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Tipos Permitidos

| Tipo | Uso | Exemplo |
|------|-----|---------|
| **feat** | Nova funcionalidade | `feat(users): add GET /api/users endpoint` |
| **fix** | Correção de bug | `fix(auth): resolve IDOR in user routes` |
| **docs** | Documentação | `docs: update SECURITY.md with new gates` |
| **style** | Formatação, sem mudança de código | `style: format middleware.ts with prettier` |
| **refactor** | Refatoração (sem feat/fix) | `refactor(audit): simplify PII masking logic` |
| **perf** | Melhoria de performance | `perf(db): add index to tenantId column` |
| **test** | Testes | `test(users): add unit tests for GET endpoint` |
| **chore** | Tarefas (deps, build) | `chore(deps): upgrade Next.js to 14.1.1` |
| **ci** | CI/CD config | `ci: fix GitHub Actions workflow` |
| **security** | Segurança | `security: implement rate limiting` |
| **build** | Build system | `build: configure Jest for testing` |

## Scopes Comuns

```
(users)          - User management endpoints
(tenants)        - Tenant management endpoints
(pages)          - Pages management endpoints
(auth)           - Authentication & authorization
(middleware)     - Middleware stack
(audit)          - Audit logging
(schema)         - Prisma schema
(config)         - Configuration files
(deps)           - Dependencies
(ci)             - CI/CD pipeline
(security)       - Security-related changes
```

## Exemplos de Commits Bons

### Feature
```
feat(users): implement GET /api/users endpoint

- Add paginated user listing for tenant scope
- Apply tenant isolation middleware
- Validate query params with Zod
- Add unit tests for edge cases
- Log access to audit table with PII masking

Closes #1
```

### Fix
```
fix(auth): prevent IDOR in tenant context

Previously, users could override tenantId via query params.
Now tenantId is validated from session only.

Reviewed-by: @Cannalonga
Fixes #123
```

### Documentation
```
docs(security): add IDOR prevention guide

Includes:
- Middleware pattern
- Test cases with curl examples
- Audit logging for attempts
```

## Commit Message Checklist

- [ ] Tipo correto (feat, fix, docs, etc)
- [ ] Escopo descritivo entre parênteses
- [ ] Subject em minúsculas, sem ponto final
- [ ] Subject ≤ 72 caracteres
- [ ] Corpo explica WHAT e WHY (não HOW)
- [ ] Corpo quebrado em linhas ≤ 72 chars
- [ ] Linha em branco antes do body
- [ ] Referencia issues: "Closes #N" ou "Fixes #N"
- [ ] Sem warnings do commitlint

## Exemplos Ruins

❌ `Update users`  
❌ `fix: fixed stuff`  
❌ `feat: implemented all endpoints for week 2`  
❌ `docs: updated all documentation files`

## Exemplos Bons

✅ `feat(users): add GET /api/users endpoint`  
✅ `fix(auth): resolve IDOR in tenant validation`  
✅ `docs(security): add IDOR prevention checklist`  
✅ `test(audit): add PII masking unit tests`

## Usando Commitlint

Commitlint valida automaticamente:

```bash
# Teste um commit message
echo "feat(users): add endpoint" | npx commitlint

# Output:
# ⧖   input: feat(users): add endpoint
# ✔   found 0 problems, 0 warnings
# [input is valid]
```

## GitHub PR Title

PR titles devem seguir o mesmo padrão:

```
feat(users): implement user CRUD endpoints
fix(auth): prevent IDOR vulnerabilities
docs: update Week 2 roadmap
```

## Rebase & Squash

Ao fazer merge, prefira **Squash and merge**:

```
git checkout main
git pull origin main
git merge --squash feature/users-crud
git commit -m "feat(users): implement user CRUD endpoints

- GET /api/users (paginated, tenant-scoped)
- GET /api/users/[id]
- POST /api/users (create)
- PUT /api/users/[id] (update)
- DELETE /api/users/[id]
- POST /api/users/[id]/change-password

All endpoints include:
- Authentication middleware
- Tenant isolation
- Rate limiting (5/15min)
- Audit logging with PII masking
- Unit tests

Closes #1 #2 #3 #4 #5 #6"
```

## Versioning

Após major features, crie tags:

```bash
git tag -a v0.2.0 -m "Release: Week 2 Complete - User & Tenant Management"
git push origin v0.2.0
```

**Tag Format:** `vMAJOR.MINOR.PATCH`

| Bump | Quando | Exemplo |
|------|--------|---------|
| **MAJOR** | Breaking changes | v1.0.0 |
| **MINOR** | Nova funcionalidade | v0.1.0 → v0.2.0 |
| **PATCH** | Bug fix | v0.1.0 → v0.1.1 |

## Referências Úteis

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint Rules](https://commitlint.js.org/#/reference-rules)
- [GitHub PR Linking](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
