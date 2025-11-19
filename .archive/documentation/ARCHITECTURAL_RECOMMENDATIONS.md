# 🏗️ RECOMENDAÇÕES ARQUITETURAIS & ROADMAP TÉCNICO

## 1️⃣ Análise Profunda do Projeto

### Visão Geral
Você está construindo uma **Plataforma SaaS Multi-Tenant** para criar páginas web profissionais para pequenos comércios locais. Isso é um projeto **COMPLEXO** que requer atenção em:

- ✅ Isolamento de dados entre tenants
- ✅ Performance de queries com múltiplos tenants
- ✅ Segurança em níveis (RBAC)
- ✅ Escalabilidade para 1000s de tenants
- ✅ Billing & webhooks confiáveis
- ✅ SEO & cache estratégico

---

## 2️⃣ Problemas Encontrados (ATUAIS)

### ⚠️ **Crítico**
1. **DATABASE_URL não está configurada** → Banco não conecta
2. **Prisma migrations não foram executadas** → Schema não existe no DB
3. **Sem autenticação ativa** → APIs estão abertas
4. **Sem validação de input** → SQLi / XSS risks
5. **Sem rate limiting** → Brute force vulnerability

### ⚠️ **Alto**
1. **Storage não está configurado** → Uploads falharão
2. **Stripe não está configurado** → Billing não funciona
3. **Redis não está configurado** → Jobs não executam
4. **Sem CORS configurado** → Chamadas cross-origin falharão
5. **Sem logging centralizado** → Não conseguirá debugar erros em produção

### ⚠️ **Médio**
1. **Sem testes unitários** → Coverage 0%
2. **Sem E2E tests** → Fluxos críticos não validados
3. **Sem monitoramento** → Sentry não está integrado
4. **Sem cache strategy** → N+1 queries possíveis
5. **Sem compression** → Assets não estão gzipped

---

## 3️⃣ Vulnerabilidades & Riscos Potenciais

### 🔴 **CRÍTICAS (Fix immediately)**

#### 1. SQL Injection (Potencial)
**Risk:** Query parameters não validadas  
**Status:** Prisma parameterizado ✅, mas falta validação em DTOs  
**Fix Semana 2:**
```typescript
// ✅ ANTES (não fazer)
const tenant = await prisma.tenant.findMany({
  where: { status: req.query.status } // ❌ Sem validação!
});

// ✅ DEPOIS (fazer assim)
const statusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']);
const { status } = statusSchema.parse(req.query.status);
const tenant = await prisma.tenant.findMany({
  where: { status }
});
```

#### 2. XSS (Cross-Site Scripting)
**Risk:** Conteúdo user-generated sem sanitização  
**Status:** Helper `sanitizeString()` criado ✅, mas não usado em todos os places  
**Fix Semana 2:**
```typescript
// Aplicar em TODOS os campos editáveis
const sanitizedContent = sanitizeString(req.body.title);
```

#### 3. CSRF (Cross-Site Request Forgery)
**Risk:** Mutações sem proteção  
**Status:** NextAuth protege automaticamente ✅ (middleware required)  
**Fix Semana 2:**
```typescript
// Adicionar middleware de CSRF check
export const middleware = (req: NextRequest) => {
  if (req.method !== 'GET') {
    validateCSRFToken(req.headers.get('x-csrf-token'));
  }
  return NextResponse.next();
};
```

#### 4. Broken Authentication
**Risk:** Sessão sem rate limit  
**Status:** NextAuth ✅, mas sem rate limiting no login  
**Fix Semana 2:**
```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máx 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente depois.',
});

app.post('/api/auth/signin', loginLimiter, ...);
```

#### 5. Insecure Direct Object Reference (IDOR)
**Risk:** Usuário poderia acessar outro tenant  
**Status:** ✅ Schema pronto (tenantId em todas as tables)  
**Fix Semana 2:**
```typescript
// ✅ CORRETO: Sempre validar tenantId
export async function GET(req, { params }) {
  const { id } = params;
  const user = await getUser(req); // Get from session
  
  const page = await prisma.page.findUnique({
    where: { id },
  });
  
  // ✅ VERIFICAR: O page pertence ao tenant do user?
  if (page.tenantId !== user.tenantId && user.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized'); // ✅ Bloquear!
  }
  
  return Response.json(page);
}
```

#### 6. Insufficient Logging & Monitoring
**Risk:** Não conseguir detectar ataques  
**Status:** Sentry configurada, mas não integrada  
**Fix Semana 2:**
```typescript
import * as Sentry from "@sentry/nextjs";

// Log TUDO que é importante
Sentry.captureMessage('User login failed', 'warning', {
  userId: user.id,
  timestamp: new Date(),
  ipAddress: req.headers.get('x-forwarded-for'),
});
```

---

### 🟠 **ALTAS (Fix por Semana 2-3)**

#### 7. Sensitive Data Exposure
**Risk:** Passwords / tokens em logs  
**Status:** Bcrypt ✅, mas sem data masking em logs  
**Fix:**
```typescript
// ❌ Nunca fazer isso
console.log({ password: user.password }); // NÃO!

// ✅ Fazer assim
const safeUser = { id: user.id, email: user.email }; // Sem senha!
console.log(safeUser);
```

#### 8. Broken Access Control
**Risk:** User pode fazer operações que não deveria  
**Status:** RBAC schema criado, mas sem middleware de autorização  
**Fix Semana 2:**
```typescript
// Criar middleware de permissões
export async function withAuth(
  handler: (req: NextRequest, context: any) => Promise<Response>
) {
  return async (req: NextRequest, context: any) => {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.user.role !== 'SUPERADMIN' && session.user.role !== 'OPERADOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return handler(req, context);
  };
}
```

---

## 4️⃣ Como Corrigir (Prioridade)

### 🟢 **AGORA (Hoje)**
1. [ ] Configurar DATABASE_URL em .env.local
2. [ ] Rodar `npm run prisma:migrate dev`
3. [ ] Verificar que banco foi criado

### 🟡 **SEMANA 2 (Obrigatório)**
1. [ ] Adicionar validação com Zod em TODAS as APIs
2. [ ] Implementar middleware de autenticação
3. [ ] Implementar middleware de autorização (RBAC)
4. [ ] Adicionar rate limiting
5. [ ] Configurar CORS
6. [ ] Implementar AuditLogging
7. [ ] Adicionar sanitização de inputs
8. [ ] Implementar logging com Sentry

### 🟠 **SEMANA 3-4**
1. [ ] Testes unitários (mínimo 80% coverage)
2. [ ] Testes de integração
3. [ ] Configurar Redis para sessions
4. [ ] Implementar caching strategy
5. [ ] Otimizar queries N+1

### 🔵 **SEMANA 5-6**
1. [ ] Testes E2E com Playwright
2. [ ] Security audit (OWASP Top 10)
3. [ ] Lighthouse audit
4. [ ] WCAG 2.1 AA compliance
5. [ ] Deploy em produção

---

## 5️⃣ Código Corrigido (Exemplo: Tenant API com Security)

### ANTES (Inseguro ❌)
```typescript
export async function GET(req) {
  const tenants = await prisma.tenant.findMany();
  return Response.json(tenants);
}

export async function POST(req) {
  const body = await req.json();
  const tenant = await prisma.tenant.create({ data: body });
  return Response.json(tenant);
}
```

### DEPOIS (Seguro ✅)
```typescript
import { z } from 'zod';
import { withAuth, withAudit } from '@/lib/middleware';
import { sanitizeString, isValidEmail, isValidCNPJ } from '@/utils/helpers';
import * as Sentry from "@sentry/nextjs";

// Validação com Zod
const createTenantSchema = z.object({
  name: z.string().min(3).max(255).transform(sanitizeString),
  email: z.string().email().transform(sanitizeString),
  cnpj: z.string().optional().refine((val) => !val || isValidCNPJ(val)),
  phone: z.string().optional(),
  address: z.string().optional().transform(sanitizeString),
  city: z.string().optional().transform(sanitizeString),
  state: z.string().optional().max(2),
  zipCode: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    // ✅ Autenticação obrigatória
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Apenas SUPERADMIN ou OPERADOR pode listar
    if (!['SUPERADMIN', 'OPERADOR'].includes(session.user.role)) {
      Sentry.captureMessage('Unauthorized tenant list access', 'warning', {
        userId: session.user.id,
        role: session.user.role,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10'), 100); // Max 100
    const status = searchParams.get('status');

    const { skip, take } = calculatePagination(page, pageSize);
    const where: any = {};
    
    if (status && ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'].includes(status)) {
      where.status = status;
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        // ✅ Nunca retornar dados sensíveis
        select: {
          id: true,
          slug: true,
          name: true,
          email: true,
          status: true,
          billingPlan: true,
          createdAt: true,
          // ❌ Excluído: password, stripe keys, etc
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    // ✅ Audit log
    await prisma.auditLog.create({
      data: {
        action: 'TENANT_LIST',
        entity: 'Tenant',
        entityId: 'all',
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      successResponse({
        items: tenants,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      })
    );
  } catch (error) {
    console.error('Error fetching tenants:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch tenants'),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // ✅ Autenticação obrigatória
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Apenas SUPERADMIN pode criar tenants
    if (session.user.role !== 'SUPERADMIN') {
      Sentry.captureMessage('Unauthorized tenant creation attempt', 'warning', {
        userId: session.user.id,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ✅ Validação com Zod
    const body = await req.json();
    const validatedData = createTenantSchema.parse(body);

    // ✅ Verificar se slug já existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: generateSlug(validatedData.name) },
    });

    if (existingTenant) {
      return NextResponse.json(
        errorResponse('SLUG_EXISTS', 'A tenant with this name already exists'),
        { status: 409 }
      );
    }

    // ✅ Criar tenant
    const tenant = await prisma.tenant.create({
      data: {
        ...validatedData,
        slug: generateSlug(validatedData.name),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    // ✅ Audit log
    await prisma.auditLog.create({
      data: {
        action: 'TENANT_CREATE',
        entity: 'Tenant',
        entityId: tenant.id,
        changes: validatedData,
        userId: session.user.id,
      },
    });

    // ✅ Log com Sentry
    Sentry.captureMessage('Tenant created', 'info', {
      tenantId: tenant.id,
      userId: session.user.id,
    });

    return NextResponse.json(
      successResponse(tenant, 'Tenant created successfully'),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Invalid input', error.errors),
        { status: 400 }
      );
    }

    console.error('Error creating tenant:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      errorResponse('INTERNAL_SERVER_ERROR', 'Failed to create tenant'),
      { status: 500 }
    );
  }
}
```

---

## 6️⃣ Middleware de Segurança (Criar em lib/middleware.ts)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import rateLimit from 'express-rate-limit';

// Rate limiter em memória (em produção usar Redis)
const limiter = rateLimit({
  store: new Map(), // Em prod: RedisStore
  windowMs: 15 * 60 * 1000,
  max: 100,
});

export async function withAuth(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return { session, ok: true };
}

export async function withRole(req: NextRequest, allowedRoles: string[]) {
  const { session, ok } = await withAuth(req);
  
  if (!ok) return { error: 'Unauthorized', status: 401 };

  if (!allowedRoles.includes(session.user.role)) {
    return { error: 'Forbidden', status: 403 };
  }

  return { session, ok: true };
}

export async function withRateLimit(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    await new Promise((resolve, reject) => {
      limiter(req as any, {} as any, (err: any) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });
    return { ok: true };
  } catch (error) {
    return {
      error: 'Too many requests',
      status: 429,
    };
  }
}
```

---

## 7️⃣ Versão Alternativa Otimizada

### Para Queries Complexas (N+1 prevention)

```typescript
// ❌ ANTES: N+1 query problem
const tenants = await prisma.tenant.findMany();
for (const tenant of tenants) {
  const pageCount = await prisma.page.count({
    where: { tenantId: tenant.id }
  }); // ❌ Query por cada tenant!
}

// ✅ DEPOIS: Uma única query
const tenants = await prisma.tenant.findMany({
  include: {
    pages: { select: { id: true } }, // ✅ Traz tudo de uma vez
    users: { select: { id: true } },
    _count: {
      select: { pages: true, users: true }
    }
  },
});

// Acessar sem queries adicionais
tenants.forEach(tenant => {
  console.log(tenant._count.pages); // ✅ Já foi carregado!
});
```

---

## 8️⃣ Checklist de Implementação Semana 2

- [ ] Adicionar Zod em TODAS as APIs
- [ ] Implementar withAuth middleware
- [ ] Implementar withRole middleware
- [ ] Adicionar rate limiting
- [ ] Configurar CORS
- [ ] Implementar AuditLog
- [ ] Sanitizar TODOS os inputs
- [ ] Logar TUDO no Sentry
- [ ] Criar testes para 80% das APIs
- [ ] Performance: evitar N+1 queries

---

## 9️⃣ Recomendações Arquiteturais Finais

### 🎯 **Padrões de Código**

1. **Type Safety**
   - ✅ TypeScript strict mode (já configurado)
   - ✅ Usar Zod para validação de entrada
   - ✅ Return types explícitos em funções

2. **Error Handling**
   - ✅ Sempre capturar erros
   - ✅ Log structured (Sentry)
   - ✅ Retornar erro padronizado

3. **Performance**
   - ✅ Usar `select` em queries (não trazer dados desnecessários)
   - ✅ Usar `include` com cuidado (pode N+1)
   - ✅ Cache em Redis para queries frequentes

4. **Security**
   - ✅ Validar TUDO com Zod
   - ✅ Sanitizar inputs com helpers
   - ✅ Checar permissões (RBAC)
   - ✅ Audit log para operações sensíveis

### 📊 **Estrutura de Pastas Sugerida para Semana 2-3**

```
src/
├── api/
│   ├── tenants/
│   │   ├── route.ts          # GET, POST
│   │   ├── [id]/
│   │   │   └── route.ts      # GET, PUT, DELETE
│   │   └── schemas.ts        # Zod schemas
│   ├── pages/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── schemas.ts
│   ├── users/
│   └── [...mais endpoints]
├── middleware/
│   ├── auth.ts               # withAuth
│   ├── authorization.ts      # withRole
│   ├── rateLimit.ts         # withRateLimit
│   └── audit.ts             # withAudit
├── services/
│   ├── tenantService.ts     # Business logic
│   ├── pageService.ts
│   └── userService.ts
├── validators/
│   └── index.ts             # Zod schemas centralizados
└── lib/
    ├── prisma.ts
    ├── auth.ts
    └── logger.ts
```

---

## 🔟 Conclusão

Você tem uma **base sólida** para começar. Agora foco em:

1. ✅ **Segurança** (Semana 2)
2. ✅ **Validação** (Semana 2)
3. ✅ **Performance** (Semana 3-4)
4. ✅ **Testes** (Semana 4-5)
5. ✅ **Deploy** (Semana 6)

**Próximo passo:** Implementar as correções críticas da Semana 2!

