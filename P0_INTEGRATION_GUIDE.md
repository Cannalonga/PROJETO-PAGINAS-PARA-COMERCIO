# 🔗 P0 INTEGRATION GUIDE — Como aplicar em outros endpoints

**Objetivo:** Integrar CSRF + Tenant Isolation + Audit Logging em ALL endpoints  
**Tempo estimado:** 30 minutos para todos os endpoints  
**Complexidade:** Low — Copy-paste com pequenas adaptações

---

## 📋 Pré-requisitos Confirmados

✅ lib/csrf.ts — CSRF token generation + validation  
✅ lib/tenant-isolation.ts — getTenantScopedDb() helper  
✅ lib/audit.ts — logAuditEvent() wrapper  
✅ app/api/tenants/route.ts — Exemplo implementado  

---

## 🔄 Padrão de Integração (Template)

### Antes (Vulnerável):

```typescript
// ❌ ANTES: Sem CSRF, sem isolamento de tenant
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Nenhuma validação de CSRF
  // Sem isolamento de tenant
  
  const result = await prisma.page.create({
    data: body,  // ❌ Pode incluir tenantId de outro!
  });
  
  return Response.json(result);
}
```

### Depois (Seguro):

```typescript
// ✅ DEPOIS: Com CSRF, isolamento, audit
import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfToken } from '@/lib/csrf';
import { getTenantScopedDb } from '@/lib/tenant-isolation';
import { logAuditEvent } from '@/lib/audit';
import { safeHandler, requireAuth, extractContext } from '@/lib/api-helpers';

export const POST = safeHandler(async (req: NextRequest, ctx) => {
  // 1️⃣ CSRF Validation (primeiro!)
  const csrfError = verifyCsrfToken(req);
  if (csrfError) return csrfError;
  
  // 2️⃣ Auth Check
  const authError = requireAuth(req);
  if (authError) return authError;
  
  // 3️⃣ Get tenant-scoped DB
  const db = getTenantScopedDb(ctx.tenantId);
  
  // 4️⃣ Create resource
  const body = await req.json();
  const page = await db.page.create({
    data: {
      ...body,
      tenantId: ctx.tenantId,  // ✅ Força tenant
    },
  });
  
  // 5️⃣ Audit Log
  await logAuditEvent({
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    action: 'CREATE',
    entity: 'page',
    entityId: page.id,
    newValues: page,
    ipAddress: req.ip,
    userAgent: req.headers.get('user-agent') || undefined,
    requestId: ctx.requestId,
  });
  
  return NextResponse.json(page, { status: 201 });
});
```

---

## 🎯 Endpoints a Integrar

### 1️⃣ app/api/users/route.ts

```typescript
// Imports
import { verifyCsrfToken } from '@/lib/csrf';
import { getTenantScopedDb } from '@/lib/tenant-isolation';
import { logAuditEvent } from '@/lib/audit';

// GET /api/users — Sem CSRF (só lê dados)
export const GET = safeHandler(async (req: NextRequest, ctx) => {
  const db = getTenantScopedDb(ctx.tenantId);
  const users = await db.user.findMany();
  return NextResponse.json(users);
});

// POST /api/users — Com CSRF
export const POST = safeHandler(async (req: NextRequest, ctx) => {
  const csrfError = verifyCsrfToken(req);
  if (csrfError) return csrfError;
  
  const db = getTenantScopedDb(ctx.tenantId);
  const body = await req.json();
  
  const user = await db.user.create({
    data: {
      ...body,
      tenantId: ctx.tenantId,
    },
  });
  
  await logAuditEvent({
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    action: 'CREATE',
    entity: 'user',
    entityId: user.id,
    newValues: { email: user.email, role: user.role },
    ipAddress: req.ip,
    requestId: ctx.requestId,
  });
  
  return NextResponse.json(user, { status: 201 });
});
```

### 2️⃣ app/api/users/[id]/route.ts

```typescript
// PUT /api/users/[id] — Com CSRF + isolamento
export const PUT = safeHandler(async (req: NextRequest, ctx) => {
  const csrfError = verifyCsrfToken(req);
  if (csrfError) return csrfError;
  
  const { id } = ctx.params;
  const db = getTenantScopedDb(ctx.tenantId);
  const body = await req.json();
  
  // getTenantScopedDb garante que user pertence ao tenant
  const oldUser = await db.user.findUnique({ where: { id } });
  
  const updatedUser = await db.user.update({
    where: { id },
    data: body,
  });
  
  await logAuditEvent({
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    action: 'UPDATE',
    entity: 'user',
    entityId: id,
    oldValues: oldUser,
    newValues: updatedUser,
    ipAddress: req.ip,
    requestId: ctx.requestId,
  });
  
  return NextResponse.json(updatedUser);
});

// DELETE /api/users/[id] — Com CSRF + isolamento
export const DELETE = safeHandler(async (req: NextRequest, ctx) => {
  const csrfError = verifyCsrfToken(req);
  if (csrfError) return csrfError;
  
  const { id } = ctx.params;
  const db = getTenantScopedDb(ctx.tenantId);
  
  // getTenantScopedDb valida que user pertence ao tenant
  await db.user.delete({ where: { id } });
  
  await logAuditEvent({
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    action: 'DELETE',
    entity: 'user',
    entityId: id,
    ipAddress: req.ip,
    requestId: ctx.requestId,
  });
  
  return NextResponse.json({ success: true });
});
```

### 3️⃣ app/api/pages/route.ts (se existir)

```typescript
// Mesmo padrão que users
export const GET = safeHandler(async (req: NextRequest, ctx) => {
  const db = getTenantScopedDb(ctx.tenantId);
  return NextResponse.json(await db.page.findMany());
});

export const POST = safeHandler(async (req: NextRequest, ctx) => {
  const csrfError = verifyCsrfToken(req);
  if (csrfError) return csrfError;
  
  const db = getTenantScopedDb(ctx.tenantId);
  const body = await req.json();
  
  const page = await db.page.create({
    data: { ...body, tenantId: ctx.tenantId },
  });
  
  await logAuditEvent({
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    action: 'CREATE',
    entity: 'page',
    entityId: page.id,
    newValues: { title: page.title, slug: page.slug },
    ipAddress: req.ip,
    requestId: ctx.requestId,
  });
  
  return NextResponse.json(page, { status: 201 });
});
```

### 4️⃣ app/api/users/[id]/permissions/route.ts (se existir)

```typescript
export const POST = safeHandler(async (req: NextRequest, ctx) => {
  const csrfError = verifyCsrfToken(req);
  if (csrfError) return csrfError;
  
  const { id } = ctx.params;
  const body = await req.json();
  
  // Valida que user pertence ao tenant
  const db = getTenantScopedDb(ctx.tenantId);
  const user = await db.user.findUnique({ where: { id } });
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
  
  // Lógica de permissions...
  const updatedUser = await db.user.update({
    where: { id },
    data: { permissions: body.permissions },
  });
  
  await logAuditEvent({
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    action: 'UPDATE',
    entity: 'user_permissions',
    entityId: id,
    newValues: { permissions: body.permissions },
    ipAddress: req.ip,
    requestId: ctx.requestId,
  });
  
  return NextResponse.json(updatedUser);
});
```

---

## 📝 Checklist de Integração

### Para CADA endpoint POST/PUT/DELETE:

- [ ] Adicione imports:
  ```typescript
  import { verifyCsrfToken } from '@/lib/csrf';
  import { getTenantScopedDb } from '@/lib/tenant-isolation';
  import { logAuditEvent } from '@/lib/audit';
  ```

- [ ] Na primeira linha do handler:
  ```typescript
  const csrfError = verifyCsrfToken(req);
  if (csrfError) return csrfError;
  ```

- [ ] Antes de usar prisma:
  ```typescript
  const db = getTenantScopedDb(ctx.tenantId);
  const result = await db.model.operation(args);  // Em vez de prisma.model
  ```

- [ ] Após sucesso:
  ```typescript
  await logAuditEvent({
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    action: 'CREATE|UPDATE|DELETE',
    entity: 'model_name',
    entityId: result.id,
    newValues: result,
    ipAddress: req.ip,
    requestId: ctx.requestId,
  });
  ```

### Para GET endpoints:

- [ ] Nenhum CSRF necessário
- [ ] Use `getTenantScopedDb()` para validar isolamento
- [ ] Opcional: log de leitura se for acesso a dados sensíveis

---

## 🧪 Teste Cada Integração

```bash
# 1. Obter CSRF token
TOKEN=$(curl -s http://localhost:3000/api/csrf-token | jq -r '.csrfToken')

# 2. Tentar POST COM token
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT}" \
  -H "x-csrf-token: $TOKEN" \
  -d '{"name":"Test User"}'
# Espera: 201 com dados

# 3. Verificar audit log
curl http://localhost:3000/api/audit-logs \
  -H "Authorization: Bearer {JWT}"
# Espera: Lista com novo evento CREATE
```

---

## 📊 Status de Integração

```
✅ app/api/tenants/route.ts         — FEITO
⏳ app/api/users/route.ts            — TODO
⏳ app/api/users/[id]/route.ts       — TODO
⏳ app/api/users/[id]/permissions/route.ts — TODO
⏳ app/api/pages/route.ts (se existir) — TODO
⏳ app/api/audit-logs/route.ts       — TODO (exposição de logs)
```

---

## 🚀 Performance Notes

**CSRF Validation:**
- ⚡ O(1) — Apenas comparação de strings

**Tenant Isolation:**
- ⚡ O(1) — Força tenantId no where cláusula
- 💡 Índice PostgreSQL em (tenantId, id) recomendado

**Audit Logging:**
- ⚡ Async — Não bloqueia request
- 💡 Considere batch inserts se volume > 1000 logs/min

---

## 🎯 Meta Final

Após integrar todos os endpoints:

```bash
echo "✅ CSRF Protection — EM TODOS os POST/PUT/DELETE"
echo "✅ Tenant Isolation — EM TODOS os endpoints"
echo "✅ Audit Logging — EM TODOS os endpoints que modificam dados"
echo ""
echo "🟢 P0 SECURITY LAYER — TOTALMENTE IMPLEMENTADO"
```

---

## 📞 Referência Rápida

### Imports Padrão:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfToken } from '@/lib/csrf';
import { getTenantScopedDb } from '@/lib/tenant-isolation';
import { logAuditEvent } from '@/lib/audit';
import { safeHandler, requireAuth } from '@/lib/api-helpers';
```

### Template Mínimo POST:
```typescript
export const POST = safeHandler(async (req: NextRequest, ctx) => {
  const csrfError = verifyCsrfToken(req);
  if (csrfError) return csrfError;
  
  const db = getTenantScopedDb(ctx.tenantId);
  const body = await req.json();
  
  const result = await db.model.create({
    data: { ...body, tenantId: ctx.tenantId },
  });
  
  await logAuditEvent({
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    action: 'CREATE',
    entity: 'model',
    entityId: result.id,
    newValues: result,
    ipAddress: req.ip,
    requestId: ctx.requestId,
  });
  
  return NextResponse.json(result, { status: 201 });
});
```

---

**Tempo estimado para integrar todos endpoints: 30-45 minutos**  
**Dificuldade: LOW (copy-paste com ajustes menores)**  
**Impacto de Segurança: ALTO — Elimina CSRF + Tenant Isolation Bypasses**
