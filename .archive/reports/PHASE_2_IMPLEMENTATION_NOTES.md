# 🔥 PHASE 2 — Segurança e Observabilidade

**Data Início:** 19 de Novembro de 2025  
**Status:** Em Implementação  
**Branch:** `feature/fase-2-seguranca-observabilidade`  
**Desenvolvedor:** GitHub Copilot — GOD MODE

---

## 📊 Objetivo

Implementar segurança profunda + observabilidade em produção para o projeto "Páginas para o Comércio Local"

### P0 (Crítico — Obrigatório):
- [x] CSRF Protection (double submit cookie)
- [x] Tenant Isolation Enforcement
- [x] Audit Logging (model + helper)

### P1 (Alto — Esta Semana):
- [x] Structured Logging (Pino)
- [x] Rate Limiting (Redis)
- [x] Sentry Integration

---

## 🗺️ Ordem de Execução

```
1. Tenant Isolation Enforcement ← Começa por aqui
   └─ Garantir tenantId em TODAS queries
   
2. CSRF Protection
   └─ Double submit cookie middleware
   
3. Audit Logging
   └─ Model AuditLog + helper logAudit
   
4. Structured Logging (Pino)
   └─ Substituir console.log
   
5. Rate Limiting (Redis)
   └─ Proteger rotas sensíveis
   
6. Sentry Integration
   └─ Error tracking + performance
```

---

## 📋 Decisões Arquiteturais

### Auth Context
```typescript
interface AuthContext {
  userId: string;
  tenantId: string;
  role: "superadmin" | "operador" | "admin" | "user";
}
```
**Origem:** JWT token via NextAuth (já implementado em Fase 1)

### Tenant Isolation Strategy
- **Pattern:** getTenantScopedDb() helper
- **Fallback:** Prisma middleware com $use
- **Verificação:** Toda query valida tenantId

### CSRF Token Geração
- **Method:** double submit cookie
- **Geração:** crypto.randomBytes(32).toString("hex")
- **Armazenamento:** Cookie (httpOnly: false, sameSite: strict)
- **Validação:** Header x-csrf-token deve igualar cookie

### Audit Log Granularidade
- **Registra:** PAGE_UPDATED, USER_CREATED, TENANT_DELETED, etc
- **Captura:** IP, User-Agent, mudanças (metadata)
- **Retenção:** Indefinida (considerar arquivamento depois)

### Logging Structure
- **Transport:** Pino com pino-pretty em dev
- **Nível:** info/warn/error com contexto
- **Correlação:** requestId em todos os logs

### Rate Limiting Limites
- Login: 5 tentativas / 60 segundos (bloqueia 300s)
- Reset Password: 3 tentativas / 3600 segundos
- API Public: 100 reqs / 60 segundos por IP

### Sentry Configuration
- **Trace Sample Rate:** 0.1 (10% em prod)
- **Environment:** development | staging | production
- **Capture:** Todos errors, selected transactions

---

## 📁 Arquivos a Criar/Modificar

### Novos Arquivos:

```
lib/
├── csrf.ts                  ← CSRF helpers (P0.1)
├── tenant-isolation.ts      ← Tenant scoping (P0.2)
├── audit.ts                 ← Audit logging (P0.3)
├── logger.ts                ← Pino setup (P1.1)
└── rate-limiter.ts          ← Redis limiter (P1.2)

middleware/
├── csrf.middleware.ts       ← CSRF middleware
├── rate-limit.middleware.ts ← Rate limit middleware
└── auth.middleware.ts       ← Update com tenant context

app/api/
├── audit-logs/route.ts      ← Endpoint de auditoria
└── (demais) - atualizar com tenant isolation
```

### Modificar:

```
db/prisma/
├── schema.prisma            ← Adicionar model AuditLog

package.json                 ← Adicionar dependências

.env.example                 ← Adicionar REDIS_URL, SENTRY_DSN
```

---

## 🔐 Checklist de Implementação

### P0.1 - CSRF Protection
- [ ] Criar lib/csrf.ts (createCsrfToken, setCsrfCookie)
- [ ] Criar middleware/csrf.middleware.ts
- [ ] Aplicar middleware em rotas POST/PUT/DELETE
- [ ] Front-end integração (se houver)
- [ ] Testar double submit

### P0.2 - Tenant Isolation
- [ ] Criar lib/tenant-isolation.ts (getTenantScopedDb)
- [ ] Atualizar lib/auth.ts para extrair tenantId
- [ ] Verificar TODOS endpoints - adicionar tenantId filtering
- [ ] Criar testes de isolation (um tenant não vê outro)
- [ ] Audit: registrar tentativas de bypass

### P0.3 - Audit Logging
- [ ] Adicionar model AuditLog ao schema.prisma
- [ ] Criar lib/audit.ts (logAudit helper)
- [ ] Criar app/api/audit-logs/route.ts (listar)
- [ ] Integrar logAudit em: create, update, delete operations
- [ ] Testar: verificar se logs aparecem no DB

### P1.1 - Structured Logging
- [ ] Instalar pino + pino-pretty
- [ ] Criar lib/logger.ts
- [ ] Substituir console.log/error/warn em pontos críticos
- [ ] Adicionar requestId em todos logs
- [ ] Testar em dev (colorido) e prod (JSON)

### P1.2 - Rate Limiting
- [ ] Instalar rate-limiter-flexible + ioredis
- [ ] Criar lib/rate-limiter.ts
- [ ] Criar middleware/rate-limit.middleware.ts
- [ ] Aplicar em: /api/auth/login, /api/auth/reset-password, etc
- [ ] Testar: simular excesso de requisições

### P1.3 - Sentry Integration
- [ ] Instalar @sentry/node
- [ ] Criar lib/sentry.ts (init + config)
- [ ] Aplicar Sentry.captureException em catch blocks
- [ ] Integrar em middleware global
- [ ] Testar: disparar erro intencional

---

## 🧪 Testes Validação

### CSRF
```bash
# Sem token → 403
curl -X POST http://localhost:3000/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'

# Com token correto → 201
curl -X POST http://localhost:3000/api/admin/create \
  -H "X-CSRF-Token: [token]" \
  -d '{"name": "test"}'
```

### Tenant Isolation
```bash
# Tenant A tenta acessar recurso de Tenant B
# Esperado: 404 ou empty array (não revelando existência)
```

### Audit Log
```bash
# Verificar auditoria
curl http://localhost:3000/api/audit-logs?tenantId=xxx
# Esperado: registros de CREATE, UPDATE, DELETE
```

### Rate Limiting
```bash
# Fazer 6 requisições de login seguidas
# Esperado: 6ª request retorna 429 (Too Many Requests)
```

### Structured Logging
```bash
# Dev mode: logs coloridos com timestamps
# Prod mode: logs em JSON (estruturado)
```

### Sentry
```bash
# Erro capturado no dashboard
# Esperado: error aparece em sentry.io
```

---

## 🔄 Status de Implementação

| Item | Status | Arquivo | Comentário |
|------|--------|---------|-----------|
| CSRF Protection | 🟡 TODO | lib/csrf.ts | Prioridade P0 |
| Tenant Isolation | 🟡 TODO | lib/tenant-isolation.ts | Crítico para segurança |
| Audit Logging | 🟡 TODO | lib/audit.ts | Model + helper |
| Structured Logging | 🟡 TODO | lib/logger.ts | Substituir console |
| Rate Limiting | 🟡 TODO | lib/rate-limiter.ts | Redis setup |
| Sentry | 🟡 TODO | lib/sentry.ts | Error tracking |

---

## 📝 Notas & Decisões

### Decisão #1: Tenant Isolation First
**Por quê:** Se você implementar CSRF mas deixar tenant isolation quebrada, um admin pode acessar dados de outro tenant com CSRF válido.

### Decisão #2: Middleware vs Helper
**Padrão:** Helpers reutilizáveis + middleware fino
**Exemplo:** getTenantScopedDb é helper. CSRF middleware é middleware.

### Decisão #3: Async Logging
**Objetivo:** Não bloquear requisição por falha de log
**Pattern:** `logAudit()` sem await em casos não-críticos

### Decisão #4: Sentry Sampling
**Trace Sample Rate:** 0.1 (10%)
**Por quê:** Evitar custos e ruído de muitas transações

---

## 🚀 Deploy Checklist

- [ ] Todas variáveis de .env setadas (REDIS_URL, SENTRY_DSN)
- [ ] Tests passando
- [ ] Auditoria visual de tenant isolation
- [ ] Rate limiting testado
- [ ] Logs estruturados validados
- [ ] Sentry recebendo eventos
- [ ] Code review
- [ ] Merge para main
- [ ] Deploy staging
- [ ] Smoke tests em staging
- [ ] Deploy produção

---

## 📞 Referências

- CSRF Double Submit: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- Prisma Best Practices: https://www.prisma.io/docs/concepts/components/prisma-client/crud
- Pino Logger: https://getpino.io/
- rate-limiter-flexible: https://github.com/animir/node-rate-limiter-flexible
- Sentry: https://docs.sentry.io/platforms/node/

---

## 🎯 Próximos Passos (Fase 3)

Após Fase 2 completa:
- [ ] OAuth2 (Google, GitHub)
- [ ] Email verification
- [ ] 2FA support
- [ ] Encryption at rest (senhas, PII)
- [ ] Webhook security (hmac validation)

---

**Última atualização:** 19/11/2025  
**Próxima review:** Após implementação de P0
