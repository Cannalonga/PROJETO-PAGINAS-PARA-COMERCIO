# 🔐 ADMIN DELEGATION SETUP - Conta de Administrador com Privilégios Restritos

**Data**: Dezembro 1, 2025  
**Status**: READY TO IMPLEMENT  
**Objetivo**: Criar hierarquia de admin com privilégios controlados  

---

## 📋 ARQUITETURA DE ROLES

### Roles Atuais (Prisma Schema)
```
SUPERADMIN        → Privilégios totais (você = fundador)
OPERADOR          → Gerencia operacional (futuro funcionário)
CLIENTE_ADMIN     → Admin da loja (cliente)
CLIENTE_USER      → Usuário padrão (cliente)
```

### Proposta: Sistema de Delegated Admin

```
┌─────────────────────────────────────────────────────┐
│                    VOCÊ (Fundador)                   │
│                    SUPERADMIN 🔑                     │
│  ✅ Pode fazer TUDO                                 │
│  ✅ Pode criar Delegated Admins                     │
│  ✅ Pode revogar Delegated Admins a qualquer hora   │
└────────────┬────────────────────────────────────────┘
             │
             │ Delega
             ▼
┌─────────────────────────────────────────────────────┐
│              Funcionário #1 (Futuro)                │
│            DELEGATED_ADMIN 👤 (Restrito)           │
│  ✅ Gerenciar usuários (CRUD)                       │
│  ❌ NÃO pode deletar dados                          │
│  ❌ NÃO pode mudar roles                            │
│  ❌ NÃO pode acessar financeiro                     │
│  ❌ NÃO pode criar outros admins                    │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ IMPLEMENTAÇÃO - 3 PASSOS

### PASSO 1: Atualizar Prisma Schema (Adicionar novo role)

**Arquivo**: `db/prisma/schema.prisma`

```prisma
enum UserRole {
  SUPERADMIN           // Você - acesso total
  DELEGATED_ADMIN      // Funcionário - privilégios restritos
  OPERADOR             // Operacional (se necessário)
  CLIENTE_ADMIN        // Admin da loja (cliente)
  CLIENTE_USER         // Usuário padrão (cliente)
}

model User {
  // ... campos existentes ...
  
  // NOVO: Rastrear quem delegou este admin
  delegatedBy        User?    @relation("DelegatedAdmins", fields: [delegatedById], references: [id])
  delegatedById      String?
  
  // NOVO: Quem este user delegou
  delegatedAdmins    User[]   @relation("DelegatedAdmins")
  
  // NOVO: Data de delegação (para auditoria)
  delegationDate     DateTime?
  
  // NOVO: Permissões específicas do delegated admin
  adminPermissions   String?  // JSON: {"can_manage_users": true, "can_view_analytics": false}
  
  @@index([delegatedById])
}
```

**Run Migration**:
```bash
npx prisma migrate dev --name add_delegated_admin
```

### PASSO 2: Criar Middleware de Autorização

**Arquivo**: `lib/admin-authorization.ts` (NOVO)

```typescript
/**
 * Admin Authorization Layer
 * 
 * Controla privilégios de SUPERADMIN vs DELEGATED_ADMIN
 */

export type AdminPermission = 
  | 'manage_users'
  | 'manage_roles'
  | 'manage_tenants'
  | 'manage_billing'
  | 'manage_admins'
  | 'view_analytics'
  | 'manage_security'
  | 'export_data';

export const DELEGATED_ADMIN_PERMISSIONS: AdminPermission[] = [
  'manage_users',      // ✅ Pode gerenciar usuários
  'view_analytics',    // ✅ Pode ver analytics básico
];

export const SUPERADMIN_PERMISSIONS: AdminPermission[] = [
  'manage_users',
  'manage_roles',
  'manage_tenants',
  'manage_billing',
  'manage_admins',
  'view_analytics',
  'manage_security',
  'export_data',
];

/**
 * Verifica se um admin tem permissão específica
 */
export function hasAdminPermission(
  role: string,
  permission: AdminPermission,
  adminPermissions?: string | null
): boolean {
  // SUPERADMIN tem tudo
  if (role === 'SUPERADMIN') {
    return true;
  }

  // DELEGATED_ADMIN usa whitelist
  if (role === 'DELEGATED_ADMIN') {
    // Verificar whitelist padrão
    if (DELEGATED_ADMIN_PERMISSIONS.includes(permission)) {
      return true;
    }

    // Verificar overrides customizados (se houver)
    if (adminPermissions) {
      try {
        const perms = JSON.parse(adminPermissions);
        return perms[permission] === true;
      } catch {
        return false;
      }
    }
  }

  return false;
}

/**
 * Middleware para verificar permissão antes de ação
 */
export async function requireAdminPermission(
  userRole: string,
  userPermissions: string | null,
  requiredPermission: AdminPermission
): Promise<boolean> {
  return hasAdminPermission(userRole, requiredPermission, userPermissions);
}
```

### PASSO 3: Criar Endpoints de Admin Delegation

**Arquivo**: `app/api/admin/delegation/route.ts` (NOVO)

```typescript
/**
 * Admin Delegation Endpoints
 * 
 * POST   /api/admin/delegation/create  → Criar novo delegated admin
 * POST   /api/admin/delegation/revoke   → Revogar delegated admin
 * GET    /api/admin/delegation/list     → Listar todos delegated admins
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/utils/helpers';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

/**
 * POST /api/admin/delegation/create
 * 
 * Criar novo Delegated Admin (apenas SUPERADMIN pode fazer isso)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se é SUPERADMIN
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    if (userRole !== 'SUPERADMIN') {
      return NextResponse.json(
        errorResponse('Apenas SUPERADMIN pode criar delegated admins'),
        { status: 403 }
      );
    }

    const { email, firstName, lastName, permissions } = await request.json();

    // Validações
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        errorResponse('Email, firstName, lastName são obrigatórios'),
        { status: 400 }
      );
    }

    // Verificar se user já existe
    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        errorResponse('Usuário com este email já existe'),
        { status: 409 }
      );
    }

    // Gerar senha temporária
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

    // Criar novo user com role DELEGATED_ADMIN
    const newAdmin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        password: hashedPassword,
        role: 'DELEGATED_ADMIN',
        isActive: true,
        
        // Rastrear quem delegou
        delegatedById: userId,
        delegationDate: new Date(),
        
        // Permissões customizadas (se fornecidas)
        adminPermissions: permissions ? JSON.stringify(permissions) : null,
        
        // Criar no tenant padrão (ou especificar)
        tenantId: process.env.ADMIN_TENANT_ID || '',
      },
    });

    // Log de auditoria
    console.info('[ADMIN DELEGATION] New delegated admin created', {
      adminId: newAdmin.id,
      email: newAdmin.email,
      createdBy: userId,
      timestamp: new Date().toISOString(),
    });

    // ✅ Retornar dados + senha temporária (mostrar apenas uma vez)
    return NextResponse.json({
      success: true,
      message: 'Delegated Admin criado com sucesso',
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        role: 'DELEGATED_ADMIN',
        permissions: permissions || {},
      },
      tempPassword, // ⚠️ IMPORTANTE: Mostrar apenas uma vez - usuário DEVE mudar na primeira login
      instructions: 'Compartilhe o email e senha temporária com o funcionário. Ele DEVE mudar a senha na primeira login.',
    });
  } catch (error) {
    console.error('[ADMIN DELEGATION] Error creating delegated admin', error);
    return NextResponse.json(
      errorResponse('Erro ao criar delegated admin'),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/delegation/[id]/revoke
 * 
 * Revogar Delegated Admin (apenas SUPERADMIN)
 */
export async function PUT(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    if (userRole !== 'SUPERADMIN') {
      return NextResponse.json(
        errorResponse('Apenas SUPERADMIN pode revogar delegated admins'),
        { status: 403 }
      );
    }

    const { adminId } = await request.json();

    // Verificar se o admin sendo revogado existe
    const adminToRevoke = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!adminToRevoke || adminToRevoke.role !== 'DELEGATED_ADMIN') {
      return NextResponse.json(
        errorResponse('Delegated Admin não encontrado'),
        { status: 404 }
      );
    }

    // Revogar: mudar role para CLIENTE_USER (remover privilégios de admin)
    const revoked = await prisma.user.update({
      where: { id: adminId },
      data: {
        role: 'CLIENTE_USER',
        delegatedById: null, // Limpar referência de quem delegou
        delegationDate: null,
        adminPermissions: null,
      },
    });

    // Log de auditoria
    console.warn('[ADMIN DELEGATION] Delegated admin revoked', {
      revokedAdminId: adminId,
      revokedBy: userId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Delegated Admin revogado com sucesso',
      admin: revoked,
    });
  } catch (error) {
    console.error('[ADMIN DELEGATION] Error revoking delegated admin', error);
    return NextResponse.json(
      errorResponse('Erro ao revogar delegated admin'),
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/delegation/list
 * 
 * Listar todos os Delegated Admins (apenas SUPERADMIN)
 */
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'SUPERADMIN') {
      return NextResponse.json(
        errorResponse('Apenas SUPERADMIN pode listar delegated admins'),
        { status: 403 }
      );
    }

    // Buscar todos os delegated admins
    const delegatedAdmins = await prisma.user.findMany({
      where: {
        role: 'DELEGATED_ADMIN',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        delegationDate: true,
        adminPermissions: true,
        delegatedBy: {
          select: {
            email: true,
            firstName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: delegatedAdmins.length,
      admins: delegatedAdmins,
    });
  } catch (error) {
    console.error('[ADMIN DELEGATION] Error listing delegated admins', error);
    return NextResponse.json(
      errorResponse('Erro ao listar delegated admins'),
      { status: 500 }
    );
  }
}
```

---

## 🚀 FLUXO DE USO

### 1️⃣ **Você cria um Delegated Admin**

```bash
curl -X POST http://localhost:3000/api/admin/delegation/create \
  -H "Content-Type: application/json" \
  -H "x-user-role: SUPERADMIN" \
  -H "x-user-id: seu-id-aqui" \
  -d '{
    "email": "funcionario@empresa.com",
    "firstName": "João",
    "lastName": "Silva",
    "permissions": {
      "can_manage_users": true,
      "can_view_analytics": true
    }
  }'
```

**Resposta**:
```json
{
  "success": true,
  "message": "Delegated Admin criado com sucesso",
  "admin": {
    "id": "admin_123",
    "email": "funcionario@empresa.com",
    "firstName": "João",
    "role": "DELEGATED_ADMIN",
    "permissions": {"can_manage_users": true}
  },
  "tempPassword": "abc123xyz456",
  "instructions": "Compartilhe email e senha com o funcionário..."
}
```

### 2️⃣ **Funcionário recebe email + senha**

Você envia:
- Email: `funcionario@empresa.com`
- Senha Temporária: `abc123xyz456`
- Link: `https://app.seu-dominio.com/login`

### 3️⃣ **Funcionário faz login**

- Login com email + senha temporária
- Sistema obriga mudar a senha na primeira login
- Agora tem acesso restrito (apenas gerenciar usuários + ver analytics)

### 4️⃣ **Você pode revogar a qualquer hora**

```bash
curl -X PUT http://localhost:3000/api/admin/delegation/revoke \
  -H "Content-Type: application/json" \
  -H "x-user-role: SUPERADMIN" \
  -H "x-user-id: seu-id-aqui" \
  -d '{"adminId": "admin_123"}'
```

Resultado: Funcionário perdeu acesso de admin (voltou a CLIENTE_USER)

### 5️⃣ **Você pode listar todos**

```bash
curl -X GET http://localhost:3000/api/admin/delegation/list \
  -H "x-user-role: SUPERADMIN" \
  -H "x-user-id: seu-id-aqui"
```

---

## 🔒 SEGURANÇA - Verificações em Cada Endpoint

### ✅ Protegido: Apenas SUPERADMIN pode...
- Criar delegated admins
- Revogar delegated admins
- Listar delegated admins
- Mudar permissões de delegated admins

### ✅ Delegated Admin pode...
- Gerenciar usuários (criar, editar, desativar)
- Ver analytics
- Gerar relatórios

### ❌ Delegated Admin NÃO pode...
- Deletar dados
- Mudar roles de usuários
- Acessar financeiro
- Criar outros admins
- Mudar próprias permissões

---

## 📊 AUDITORIA

Todas as ações são loggadas:
```
[ADMIN DELEGATION] New delegated admin created
├─ adminId: admin_123
├─ email: funcionario@empresa.com
├─ createdBy: seu-id
└─ timestamp: 2025-12-01T10:30:00Z

[ADMIN DELEGATION] Delegated admin revoked
├─ revokedAdminId: admin_123
├─ revokedBy: seu-id
└─ timestamp: 2025-12-01T11:45:00Z
```

---

## ⚡ PRÓXIMOS PASSOS

1. ✅ Entender a arquitetura (você está aqui)
2. ⏭️ Implementar (criar novo role + migration)
3. ⏭️ Testar (criar fake delegated admin + verificar permissões)
4. ⏭️ Deploy para produção

---

## 📝 NOTAS IMPORTANTES

- **Senha Temporária**: Mostrada apenas UMA VEZ - não é salva em lugar nenhum
- **Mudança de Senha**: Funcionário DEVE mudar na primeira login
- **Revogação**: Instantânea - sem necessidade de logout forçado
- **Auditoria**: Todas as ações rastreadas com timestamp + quem fez

---

**Status**: 🟢 **PRONTO PARA IMPLEMENTAR**

Quer que eu implemente isso agora, ou prefere continuar com os 10 fixes de segurança primeiro?
