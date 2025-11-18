# ⚡ NEXT STEPS - FASE 2 EM ANDAMENTO

## 📍 Status Atual (18/Nov/2025)

✅ **Fase 1 (Week 1):** 100% Completa
- Scaffold com Next.js 14 + TypeScript
- 34 arquivos criados
- 17,777 linhas de código
- Build: Passing

✅ **Fase 2 (Week 2):** 100% Preparada
- 7 novos arquivos criados
- 1,053 linhas de código de segurança
- Middleware + Validação + Auditoria
- Build: Passing (zero errors)

⏳ **GitHub:** Awaiting sync (GitHub 500 error - retry later)

---

## 🔧 Como Prosseguir

### 1️⃣ Sincronizar com GitHub (Assim que o serviço recuperar)

```bash
cd "c:\Users\rafae\Desktop\PROJETOS DE ESTUDOS\PROJETO PÁGINAS DO COMERCIO LOCAL\PAGINAS PARA O COMERCIO APP"

# Verificar remote configurado
git remote -v

# Fazer push (retentar se falhar)
git push -u origin main

# Esperar resposta (pode levar alguns minutos)
```

**Status Esperado:**
```
Enumerating objects: 68, done.
Counting objects: 100% (68/68), done.
Compressing objects: 100% (42/42), done.
Writing objects: 100% (68/68), 123.45 KiB | 1.23 MiB/s
Resolving deltas: 100% (15/15)
To https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

### 2️⃣ Começar Week 2 (Depois do GitHub sync)

**Semana 2 - 7 dias de desenvolvimento**

#### 📅 Dia 1-2: User Management (Endpoints)
```bash
# Você vai criar:
✅ PUT /api/users/[id]         # Atualizar usuário
✅ DELETE /api/users/[id]      # Deletar (soft delete)
✅ POST /api/users/[id]/change-password
✅ Rate limiting em login

# Arquivos a criar:
- app/api/users/[id]/route.ts (PUT/DELETE - 120 linhas)
- app/api/auth/change-password/route.ts (POST - 80 linhas)
- lib/constants.ts (Rate limit configs - 20 linhas)

# Testes:
- Testar RBAC para cada operação
- Verificar IDOR prevention
- Validar audit logging
```

**Template para PUT /api/users/[id]:**
```typescript
export async function PUT(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const { id } = params; // user ID from URL
  
  // 1. Validate auth
  if (!userId) return errorResponse('Unauthenticated', 401);
  
  // 2. IDOR check - users can only update themselves unless SUPERADMIN
  if (userId !== id && userRole !== 'SUPERADMIN') {
    return errorResponse('Forbidden', 403);
  }
  
  // 3. Parse and validate request
  const body = await request.json();
  const validation = UpdateUserSchema.safeParse(body);
  if (!validation.success) return errorResponse('Invalid data', 400);
  
  // 4. Get old values (for audit)
  const oldUser = await prisma.user.findUnique({ where: { id } });
  
  // 5. Update
  const updated = await prisma.user.update({
    where: { id },
    data: validation.data,
  });
  
  // 6. Log audit
  await logAuditEvent({
    userId, tenantId: userTenantId,
    action: 'UPDATE', entity: 'USER', entityId: id,
    oldValues: oldUser,
    newValues: updated,
  });
  
  return successResponse(updated, 'User updated');
}
```

#### 📅 Dia 3-4: Tenant Management (Endpoints)
```bash
# Você vai criar/melhorar:
✅ PUT /api/tenants/[id]       # Melhorar com validação + audit
✅ DELETE /api/tenants/[id]    # Melhorar com cascade checks
✅ GET /api/tenants/[id]/users # Novo - listar usuários do tenant

# Executar também:
$ npx prisma migrate dev      # Criar migration para AuditLog changes
$ npx prisma db seed          # Seed com dados de teste
```

#### 📅 Dia 5-6: Pages API
```bash
# Você vai criar:
✅ GET /api/pages             # List com filtering
✅ POST /api/pages            # Create com validation
✅ PUT /api/pages/[id]        # Update
✅ DELETE /api/pages/[id]     # Soft delete
✅ GET /api/pages/[slug]      # Public endpoint (sem auth)

# Relacionamentos:
- Cada page pertence a um tenant (IDOR)
- Slug deve ser único por tenant
- Soft delete (add deletedAt field)
```

#### 📅 Dia 7: Testing & Refinement
```bash
# Você vai fazer:
✅ npm test -- --coverage    # Unit tests + coverage
✅ Testar todos endpoints com curl ou Postman
✅ Verificar rate limiting
✅ Verificar IDOR em todas operações
✅ Revisar audit logs
✅ Performance profiling
```

---

## 🧪 Como Testar Endpoints

### Terminal 1: Iniciar servidor
```bash
npm run dev
# Server running at http://localhost:3000
```

### Terminal 2: Fazer requisições

**1. Criar usuário (signup)**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "SecurePass123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "SUPERADMIN"
  }'
```

**2. Login (obter token)**
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "SecurePass123!"
  }'
```

**3. Listar usuários (com token)**
```bash
curl -X GET "http://localhost:3000/api/users" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**4. Testar validação**
```bash
# Email inválido
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "password": "test", "firstName": "Test", "lastName": "User"}'
# Expected: 400 Bad Request

# Senha fraca
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "weak", "firstName": "Test", "lastName": "User"}'
# Expected: 400 Password too weak
```

---

## 📚 Arquivos de Referência para Week 2

**Leia antes de começar:**
1. `PHASE_2.md` - Roadmap completo com daily tasks
2. `PHASE_2_STATUS.md` - Status report (este arquivo)
3. `ARCHITECTURAL_RECOMMENDATIONS.md` - Security patterns
4. `app/api/users/route.ts` - Template de endpoint

**Use como template:**
```typescript
// Padrão para todos endpoints:
export async function GET(request: NextRequest) {
  // 1. Extract user info from headers
  const userId = request.headers.get('x-user-id');
  if (!userId) return errorResponse('Unauthenticated', 401);
  
  // 2. Check RBAC if needed
  const userRole = request.headers.get('x-user-role');
  if (!allowedRoles.includes(userRole)) return errorResponse('Forbidden', 403);
  
  // 3. Parse & validate input
  const { searchParams } = new URL(request.url);
  // Or: const body = await request.json();
  
  // 4. Execute business logic
  const data = await prisma.model.findMany({ /* ... */ });
  
  // 5. Log if needed
  // await logAuditEvent({ /* ... */ });
  
  // 6. Return response
  return NextResponse.json(successResponse(data, 'Success'), { status: 200 });
}
```

---

## 🚀 Comandos Úteis

```bash
# Ver status git
git status

# Ver últimos commits
git log --oneline -10

# Criar branch para feature
git checkout -b feature/user-management

# Adicionar e commitar
git add .
git commit -m "feat: Add PUT /api/users/[id] endpoint"

# Fazer push de branch
git push -u origin feature/user-management

# Voltar para main e atualizar
git checkout main
git pull origin main

# Build completo
npm run build

# Dev mode com watch
npm run dev

# Testar tipagem
npx tsc --noEmit

# ESLint check
npx eslint app/api/ lib/ --fix
```

---

## ⚠️ Pontos de Atenção

### Security Checklist para cada endpoint:
- [ ] Usuário autenticado? (x-user-id header)
- [ ] Role autorizada? (x-user-role check)
- [ ] Tenant isolation? (x-tenant-id check)
- [ ] Input validado com Zod?
- [ ] Auditado se mutation? (CREATE/UPDATE/DELETE)
- [ ] Rate limiting? (auth endpoints)
- [ ] SQL injection prevention? (Prisma handles)
- [ ] Error messages safe? (não expor detalhes)

### Performance Checklist:
- [ ] Índices criados? (Prisma schema)
- [ ] N+1 queries? (use `include` não queries separadas)
- [ ] Pagination? (limit 100 items max)
- [ ] Caching? (se dados estáticos)
- [ ] Response time < 200ms?

### Testing Checklist:
- [ ] Test happy path (sucesso)
- [ ] Test validation errors (400)
- [ ] Test auth errors (401)
- [ ] Test RBAC errors (403)
- [ ] Test IDOR attempts (should fail)
- [ ] Test rate limiting
- [ ] Test audit logging

---

## 📞 Troubleshooting

**"Build failed: Cannot find module X"**
```bash
npm install
npm run build
```

**"Prisma error: Database not found"**
```bash
# Configurar DATABASE_URL em .env.local
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/paginas_comercio" > .env.local
npx prisma generate
npx prisma db push
```

**"Rate limiter not working"**
- Usar Redis em production (in-memory só para dev)
- Instalar: `npm install redis`

**"Git push fails"**
- Verificar conexão: `ping github.com`
- Verificar SSH key ou HTTPS auth
- Tentar em outro momento

---

## ✅ Definition of Done (Para cada feature)

```
Feature: PUT /api/users/[id]
- [ ] Código escrito + testado localmente
- [ ] TypeScript strict: npm run build ✅
- [ ] ESLint: npx eslint ✅
- [ ] RBAC testado (todas 4 roles)
- [ ] IDOR testado (cross-tenant attempt)
- [ ] Validação Zod testada
- [ ] Audit logging testado
- [ ] Postman/curl test passando
- [ ] Commit com mensagem semântica
- [ ] PR criado para code review
```

---

## 🎯 Metas Week 2

| Dia | Tarefa | Status | Estimado |
|-----|--------|--------|----------|
| 1-2 | User endpoints (PUT/DELETE/CP) | ⏳ | 16h |
| 3-4 | Tenant endpoints (PUT/DELETE/users) | ⏳ | 16h |
| 5-6 | Pages endpoints (CRUD) | ⏳ | 16h |
| 7 | Testing + documentation | ⏳ | 8h |
| **TOTAL** | **Week 2 Complete** | ⏳ | **56h** |

---

## 📈 Próximas Fases (Preview)

- **Week 3:** Admin Dashboard + Páginas Públicas
- **Week 4:** Billing com Stripe
- **Week 5:** Analytics + Templates
- **Week 6:** Testing + Deployment

---

**Última atualização:** 18/Nov/2025  
**Próximo milestone:** GitHub sync ✅ → Week 2 implementation 🚀  
**Contato:** GitHub Copilot (Claude Haiku 4.5)
