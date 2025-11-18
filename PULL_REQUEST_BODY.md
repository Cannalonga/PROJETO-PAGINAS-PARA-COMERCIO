## Descrição

Implementação do primeiro endpoint crítico da Week 2: **GET /api/users** com suporte a tenant-scoping, RBAC, paginação segura e audit logging.

## Tipo de Mudança

- [x] Novo endpoint
- [ ] Correção de bug
- [ ] Refatoração
- [ ] Documentação

## Alterações Realizadas

### 1. Endpoint GET /api/users (`app/api/users/route.ts`)
- **Autenticação:** Validação obrigatória via headers `x-user-id`, `x-user-role`, `x-tenant-id`
- **Autorização (RBAC):** Apenas roles `SUPERADMIN`, `OPERADOR` e `CLIENTE_ADMIN` podem acessar
- **Tenant-scoping:** tenantId derivado do registro do usuário no BD (IDOR prevention)
- **Validação Zod:** Query parameters validados com estritos limites
  - `page`: ≥ 1 (padrão: 1)
  - `pageSize`: 1-100 (padrão: 20, DoS prevention)
  - `search`: até 100 caracteres (opcional)
  - `sortBy`: whitelisted (createdAt, firstName, email)
  - `sortDir`: asc/desc
  - `roleFilter`: opcional, enum de roles
- **Campos de Retorno:** Apenas campos seguros (sem passwordHash, tokens, sensitive info)
- **Paginação:** Offset-based com skip=(page-1)*pageSize
- **Audit Logging:** Registra acesso com metadados (page, pageSize, resultCount) sem valores PII
- **Rate Limiting:** Middleware global aplicado

### 2. Testes Completos (`lib/__tests__/users.route.test.ts`)
- **41 testes unitários** cobrindo:
  - Validação de query parameters (page, pageSize, search, sortBy, sortDir, roleFilter)
  - Autenticação (missing headers)
  - Autorização (RBAC roles)
  - Tenant-scoping (IDOR prevention)
  - Paginação (skip calculation, limits)
  - Segurança de resposta (sem passwordHash/tokens)
  - Audit logging (metadata, PII masking)
  - SQL injection prevention
- **100% pass rate** ✅

### 3. Configuração Jest
- **jest.config.js** atualizado para suportar ambiente jsdom
- **Transform config** migrado de globals para transform block (new syntax)
- Suporta TypeScript puro com ts-jest preset

## Checklist de Segurança

- [x] Middleware de autenticação (session header validation)
- [x] Tenant-scoping derivado do BD (não confia em client-provided tenantId)
- [x] RBAC implementado com whitelist de roles
- [x] Zod validation em todos os query params
- [x] Nenhum campo sensível retornado (passwordHash, tokens)
- [x] Audit log registra acesso (sem PII valores)
- [x] Rate limiting aplicado globalmente
- [x] SQL injection prevention (Prisma parameterized queries)
- [x] DoS prevention (pageSize max 100)
- [x] Testes cobrindo IDOR attempts

## Checklist de Qualidade

- [x] Código segue padrão de middleware stack (auth → role → tenant → rate-limit → validation)
- [x] Todos os 41 testes passam
- [x] Build Next.js compila sem erros
- [x] TypeScript strict mode mantido
- [x] Comentários descrevem propósito de cada camada de segurança
- [x] Documentação inline para campos-chave

## Testes Realizados Localmente

```bash
# Testes unitários
npm run test -- lib/__tests__/users.route.test.ts
# Result: PASS - 41 passed

# Build
npm run build
# Result: ✓ Compiled successfully

# Linting (TypeScript)
npm run type-check  (se aplicável)
```

## Impacto

- **Novo endpoint:** GET /api/users (safe list)
- **Nenhuma breaking change** (novo endpoint, nenhuma alteração em existentes)
- **Nenhuma migração de BD** necessária
- **Compatível com staging/prod** (usa headers existentes)

## Próximos Passos

1. ✅ CI/CD gates (CodeQL, lint, tests, build) devem passar
2. ⏳ Review de segurança (audit path, tenant-scoping)
3. ⏳ Merge após 1 approval
4. ⏳ Deploy para staging
5. ⏳ E2E testing em staging
6. ⏳ Deploy para production

## Screenshots/Exemplos

### Exemplo de requisição bem-sucedida

```bash
curl -H "x-user-id: user-uuid" \
     -H "x-user-role: CLIENTE_ADMIN" \
     -H "x-tenant-id: tenant-uuid" \
     "https://example.com/api/users?page=1&pageSize=20&search=john"
```

### Exemplo de resposta

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "user-id",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "CLIENTE_ADMIN",
        "isActive": true,
        "createdAt": "2025-11-18T22:00:00.000Z",
        "lastLoginAt": "2025-11-18T21:00:00.000Z",
        "tenantId": "tenant-id"
      }
    ],
    "meta": {
      "total": 150,
      "page": 1,
      "pageSize": 20
    }
  }
}
```

### Exemplo de erro (insufficient role)

```json
{
  "success": false,
  "error": "Acesso negado: papel insuficiente"
}
```

## Notas do Revisor

**Pontos-chave para validação:**

1. Confirmar que tenantId vem do BD, não da query (line ~85 em route.ts)
2. Validar que RBAC rejeita CLIENTE_USER (line ~53)
3. Verificar Zod schema rejeita pageSize > 100 (line ~18-28)
4. Confirmar que audit log NÃO inclui valor da search, apenas boolean `hasSearch` (line ~163-167)
5. Verificar que sem x-user-id header retorna 401 (line ~50-55)

## Arquivos Modificados

- `app/api/users/route.ts` (repositório existente → version completa com segurança)
- `lib/__tests__/users.route.test.ts` (novo arquivo de testes)
- `jest.config.js` (atualizado para jsdom, ts-jest new syntax)

---

**Issue:** #1 - GET /api/users - list users (tenant-scoped, pagination, RBAC)
**Labels:** security, priority:high, week-2-feature
**Reviewers:** @team-security, @backend-lead
