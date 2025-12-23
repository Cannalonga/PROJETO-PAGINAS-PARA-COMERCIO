# 📋 PATCH PLAN - ROADMAP DE CORREÇÃO

**Prioridade:** Críticas → Altas → Médias  
**Metodologia:** 1 fix por commit, com testes

---

## FASE 1: CRÍTICAS (Fazer HOJE)

### Fix #1: IDOR em /api/users/[id] e Subendpoints
**Esforço:** 8 horas  
**Risco Regressão:** Baixo  
**Teste:** Unit + Integration

#### Status Atual
```
❌ Endpoints vulneráveis:
   - GET /api/users/[id]
   - PUT /api/users/[id]
   - DELETE /api/users/[id]
   - GET /api/users/[id]/permissions
   - PUT /api/users/[id]/role
   - POST /api/users/[id]/restore
   - POST /api/users/[id]/reset-password
```

#### Root Cause
```typescript
// ❌ BAD - No ownership check
const user = await prisma.user.findUnique({ where: { id } });
return NextResponse.json(user); // Expõe ANY user
```

#### Fix
```typescript
// ✅ GOOD - Validate ownership or admin
const authorizedUser = await prisma.user.findFirst({
  where: {
    id: targetUserId,
    tenantId: session.user.tenantId, // ✅ Isolamento
    OR: [
      { id: session.user.id }, // ✅ Pode ver a si mesmo
      { 
        tenant: {
          users: { 
            some: { 
              id: session.user.id, 
              role: { in: ['CLIENTE_ADMIN', 'SUPERADMIN'] }
            }
          }
        }
      } // ✅ Admin do tenant
    ]
  }
});

if (!authorizedUser) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 403 }
  );
}
```

#### Teste
```typescript
// __tests__/integration/idor-users.test.ts
describe('User Endpoints - IDOR Prevention', () => {
  test('User cannot access other user data', async () => {
    const user1 = await createUser({ tenantId: 'tenant1' });
    const user2 = await createUser({ tenantId: 'tenant1' });
    
    const res = await fetch(`/api/users/${user2.id}`, {
      headers: { cookie: await loginAs(user1) }
    });
    
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  test('User can access own data', async () => {
    const user = await createUser({ tenantId: 'tenant1' });
    
    const res = await fetch(`/api/users/${user.id}`, {
      headers: { cookie: await loginAs(user) }
    });
    
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ id: user.id, email: user.email });
  });

  test('Admin can access any user in tenant', async () => {
    const admin = await createUser({ role: 'CLIENTE_ADMIN', tenantId: 'tenant1' });
    const user = await createUser({ tenantId: 'tenant1' });
    
    const res = await fetch(`/api/users/${user.id}`, {
      headers: { cookie: await loginAs(admin) }
    });
    
    expect(res.status).toBe(200);
    expect(await res.json().id).toBe(user.id);
  });

  test('User cannot access user from other tenant', async () => {
    const user1 = await createUser({ tenantId: 'tenant1' });
    const user2 = await createUser({ tenantId: 'tenant2' });
    
    const res = await fetch(`/api/users/${user2.id}`, {
      headers: { cookie: await loginAs(user1) }
    });
    
    expect(res.status).toBe(403);
  });
});
```

---

### Fix #2: BFLA em /api/admin/*
**Esforço:** 8 horas  
**Risco Regressão:** Baixo  
**Teste:** Unit + Integration

#### Status Atual
```
❌ Qualquer usuário pode:
   - POST /api/admin/vip → Dar trial ilimitado
   - POST /api/admin/stores → Acessar stores
   - POST /api/admin/trials → Extend trial
```

#### Root Cause
```typescript
// ❌ BAD - No role check
export async function POST(req: NextRequest) {
  const { tenantId } = await req.json();
  // Sem validar se user é SUPERADMIN/OPERADOR
  await extendTrial(tenantId);
}
```

#### Fix
```typescript
// ✅ GOOD - Admin-only middleware
function requireAdmin(roles: string[]) {
  return (handler: NextApiHandler) => {
    return async (req: NextRequest) => {
      const session = await getSession({ req });
      
      if (!session?.user?.role || !roles.includes(session.user.role)) {
        return NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        );
      }
      
      return handler(req);
    };
  };
}

// Aplicar em todas as rotas /api/admin/*
export const POST = requireAdmin(['SUPERADMIN', 'OPERADOR'])(async (req) => {
  const { tenantId } = await req.json();
  
  // ✅ Validar que tenantId pertence ao org do admin
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      organizationId: session.user.organizationId // ✅ Multi-org support
    }
  });
  
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }
  
  await extendTrial(tenantId);
  return NextResponse.json({ success: true });
});
```

#### Teste
```typescript
// __tests__/integration/bfla-admin.test.ts
describe('Admin Endpoints - BFLA Prevention', () => {
  test('Regular user cannot access /api/admin/vip', async () => {
    const user = await createUser({ role: 'CLIENTE_USER' });
    
    const res = await fetch('/api/admin/vip', {
      method: 'POST',
      headers: { cookie: await loginAs(user) },
      body: JSON.stringify({ tenantId: 'some-id' })
    });
    
    expect(res.status).toBe(403);
  });

  test('Only SUPERADMIN can create VIP', async () => {
    const admin = await createUser({ role: 'CLIENTE_ADMIN' }); // Não admin global
    
    const res = await fetch('/api/admin/vip', {
      method: 'POST',
      headers: { cookie: await loginAs(admin) },
      body: JSON.stringify({ tenantId: 'some-id' })
    });
    
    expect(res.status).toBe(403);
  });

  test('SUPERADMIN can create VIP', async () => {
    const superAdmin = await createUser({ role: 'SUPERADMIN' });
    const tenant = await createTenant();
    
    const res = await fetch('/api/admin/vip', {
      method: 'POST',
      headers: { cookie: await loginAs(superAdmin) },
      body: JSON.stringify({ tenantId: tenant.id })
    });
    
    expect(res.status).toBe(200);
  });
});
```

---

### Fix #3: Implement Comprehensive Audit Logging
**Esforço:** 16 horas  
**Risco Regressão:** Médio  
**Teste:** Unit + Integration

#### Status Atual
```
❌ Nenhum log de eventos de segurança
❌ Impossível rastrear quem fez o quê
❌ Compliance violation (GDPR, PCI-DSS)
```

#### Schema Migration Necessária
```sql
-- db/migrations/2025_12_23_add_audit_logs.sql
CREATE TABLE "AuditLog" (
  "id" SERIAL PRIMARY KEY,
  "userId" STRING NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "tenantId" STRING NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "action" STRING NOT NULL, -- "LOGIN", "ROLE_CHANGE", "USER_DELETE", etc
  "resource" STRING NOT NULL, -- "user_123", "billing_456"
  "oldValue" JSONB,
  "newValue" JSONB,
  "ipAddress" STRING NOT NULL,
  "userAgent" STRING,
  "severity" STRING NOT NULL, -- "INFO", "WARNING", "CRITICAL"
  "status" STRING, -- "SUCCESS", "FAILED"
  "error" STRING,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");
```

#### Implementação
```typescript
// lib/audit-logger.ts
import { prisma } from '@/lib/prisma';

interface AuditLogEntry {
  userId: string;
  tenantId: string;
  action: string;
  resource: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress: string;
  userAgent?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status?: 'SUCCESS' | 'FAILED';
  error?: string;
}

export async function auditLog(entry: AuditLogEntry) {
  try {
    await prisma.auditLog.create({ data: entry });
    
    // Alert pada CRITICAL
    if (entry.severity === 'CRITICAL') {
      await alertSecurityTeam(entry);
    }
  } catch (err) {
    console.error('[AUDIT] Failed to log:', err);
  }
}

async function alertSecurityTeam(entry: AuditLogEntry) {
  // Implementar: Slack, PagerDuty, Email, etc
  console.warn(`[CRITICAL] ${entry.action} on ${entry.resource}:`, entry);
}
```

#### Usar em handlers
```typescript
// app/api/users/[id]/role/route.ts
import { auditLog } from '@/lib/audit-logger';

export const PUT = withAuth(async (req, session) => {
  const { role } = await req.json();
  const userId = req.nextUrl.searchParams.get('id');
  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  
  const oldUser = await prisma.user.findUnique({ where: { id: userId } });
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
  
  // ✅ Log o change
  await auditLog({
    userId: session.user.id,
    tenantId: session.user.tenantId,
    action: 'ROLE_CHANGE',
    resource: `user_${userId}`,
    oldValue: { role: oldUser.role },
    newValue: { role: updatedUser.role },
    ipAddress,
    userAgent: req.headers.get('user-agent'),
    severity: 'CRITICAL',
    status: 'SUCCESS'
  });
  
  return NextResponse.json(updatedUser);
});
```

#### Teste
```typescript
test('Role change is logged with CRITICAL severity', async () => {
  const admin = await createUser({ role: 'CLIENTE_ADMIN' });
  const user = await createUser({ role: 'CLIENTE_USER' });
  
  await fetch(`/api/users/${user.id}/role`, {
    method: 'PUT',
    headers: { cookie: await loginAs(admin) },
    body: JSON.stringify({ role: 'CLIENTE_ADMIN' })
  });
  
  const logs = await prisma.auditLog.findMany({
    where: { action: 'ROLE_CHANGE' }
  });
  
  expect(logs.length).toBeGreaterThan(0);
  expect(logs[0].severity).toBe('CRITICAL');
  expect(logs[0].newValue.role).toBe('CLIENTE_ADMIN');
});
```

---

## FASE 2: ALTAS (Próxima Semana)

### Fix #4: Reduce Session Timeout (30d → 15m)
**Esforço:** 2 horas  
**Risco Regressão:** Baixo

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // ✅ 15 minutos ao invés de 30 dias
    updateAge: 5 * 60, // Atualizar a cada 5 min se ativo
  },
  jwt: {
    maxAge: 15 * 60,
    secret: process.env.NEXTAUTH_SECRET,
  },
};

// Usar refresh tokens para sessions longas
// (Implementado em próxima fase)
```

### Fix #5: Add Rate Limiting on Auth Endpoints
**Esforço:** 4 horas  
**Risco Regressão:** Médio

```typescript
// lib/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 tentativas por minuto
  analytics: true,
  prefix: 'ratelimit:auth',
});

// app/api/auth/signin/route.ts
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const ip = getClientIp(req);
  
  const { success, remaining, reset } = await authLimiter.limit(`signin:${email}:${ip}`);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        }
      }
    );
  }
  
  // ... rest of signin logic
}
```

### Fix #6: Remove 'unsafe-*' from CSP
**Esforço:** 4 horas  
**Risco Regressão:** Alto (requer testes extensive)

```typescript
// middleware.ts
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' https://js.stripe.com", // ❌ Remove unsafe-inline, unsafe-eval
  "style-src 'self' https://fonts.googleapis.com", // ❌ Remove unsafe-inline
  "img-src 'self' data: https: blob: https://res.cloudinary.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https: wss:",
  "frame-src https://js.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

// ⚠️ Requer:
// 1. Mover inline scripts para arquivos .ts
// 2. Gerar nonces para scripts dinâmicos
// 3. Usar style modules ao invés de inline styles
```

---

## FASE 3: MÉDIAS (Nas 2 Semanas)

### Fix #7: Email Verification on Registration
**Esforço:** 8 horas  
**Risco Regressão:** Médio

```typescript
// Schema addition
model EmailVerification {
  id        String   @id @default(cuid())
  userId    String   @unique
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// app/api/auth/register/route.ts
export async function POST(req: NextRequest) {
  const { email, password, firstName, lastName } = RegisterSchema.parse(
    await req.json()
  );
  
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 12),
      firstName,
      lastName,
      emailVerifiedAt: null, // ❌ Not verified
    }
  });
  
  // Create verification token
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.emailVerification.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });
  
  // Send email
  await sendVerificationEmail(email, token);
  
  return NextResponse.json({ message: 'Check your email' }, { status: 201 });
}

// GET /api/auth/verify-email?token=ABC123
export async function verifyEmail(token: string) {
  const verification = await prisma.emailVerification.findUnique({
    where: { token }
  });
  
  if (!verification || verification.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
  
  await prisma.user.update({
    where: { id: verification.userId },
    data: { emailVerifiedAt: new Date() }
  });
  
  await prisma.emailVerification.delete({ where: { token } });
  
  return NextResponse.redirect('/auth/login?verified=1');
}
```

### Fix #8-10: Input Validation + Webhook Safety
**Esforço:** 12 horas total

(Ver SECURITY_AUDIT_COMPLETE_2025.md para detalhes)

---

## 📊 CRONOGRAMA DE IMPLEMENTAÇÃO

```
SEMANA 1:
├─ Mon: Fix #1 (IDOR) + testes
├─ Tue: Fix #2 (BFLA) + testes
├─ Wed-Thu: Fix #3 (Logging) + testes
├─ Fri: Integration testing + deployment

SEMANA 2:
├─ Mon-Tue: Fix #4 + #5 (Session + RateLimit)
├─ Wed-Thu: Fix #6 (CSP removal)
├─ Fri: Regression testing

SEMANA 3:
├─ Mon-Tue: Fix #7 (Email verification)
├─ Wed-Thu: Fix #8-10 (Validation)
├─ Fri: Final testing + rollout
```

---

## 🧪 TESTING CHECKLIST

- [ ] Unit tests para cada fix
- [ ] Integration tests (multi-user, multi-tenant)
- [ ] Regression tests (funcionalidade existente)
- [ ] Security tests (verificar fix foi aplicado)
- [ ] Performance tests (logging não deve lentificar)
- [ ] Manual pen testing dos endpoints

---

## 🚀 DEPLOYMENT STRATEGY

```
1. Branch: security/fixes
2. Commits: 1 fix per commit
3. PR: Code review + security review
4. Staging: Full test suite
5. Production: Blue-green deployment
6. Monitoring: Sentry + DataDog alerts
```

---

**Status:** Ready para implementação  
**Próximo Passo:** Começar com Fix #1
