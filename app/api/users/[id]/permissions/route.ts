import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logAuditEvent } from '@/lib/audit';

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

const UserIdParamSchema = z.string().uuid('Invalid user ID format');

const UserPermissionsResponseSchema = z.object({
  userId: z.string(),
  tenantId: z.string(),
  userRole: z.enum(['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER']),
  permissions: z.array(z.enum([
    'MANAGE_TENANT',
    'MANAGE_USERS',
    'MANAGE_PAGES',
    'VIEW_ANALYTICS',
    'MANAGE_BILLING',
  ])),
});

type UserPermissionsResponse = z.infer<typeof UserPermissionsResponseSchema>;

// ============================================================================
// PERMISSIONS MAPPING BY ROLE
// ============================================================================

const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  SUPERADMIN: [
    'MANAGE_TENANT',
    'MANAGE_USERS',
    'MANAGE_PAGES',
    'VIEW_ANALYTICS',
    'MANAGE_BILLING',
  ],
  OPERADOR: [
    'MANAGE_PAGES',
    'VIEW_ANALYTICS',
  ],
  CLIENTE_ADMIN: [
    'MANAGE_USERS',
    'MANAGE_PAGES',
    'VIEW_ANALYTICS',
  ],
  CLIENTE_USER: [
    'VIEW_ANALYTICS',
  ],
};

// ============================================================================
// GET /api/users/:id/permissions
// Returns user's role and associated permissions
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<UserPermissionsResponse | { error: string }>> {
  try {
    // ====== Layer 1: Authentication ======
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userTenantId = request.headers.get('x-tenant-id');

    if (!userId || !userRole || !userTenantId) {
      await logAuditEvent({
        userId: userId || 'unknown',
        tenantId: userTenantId || 'unknown',
        action: 'GET_USER_PERMISSIONS_DENIED_AUTH',
        entity: 'USER_PERMISSIONS',
        entityId: params.id,
        metadata: { reason: 'Missing authentication headers' },
      });

      return NextResponse.json(
        { error: 'Unauthorized: Missing authentication headers' },
        { status: 401 }
      );
    }

    // ====== Layer 2: Authorization (RBAC) ======
    const ALLOWED_ROLES = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER'];

    if (!ALLOWED_ROLES.includes(userRole)) {
      await logAuditEvent({
        userId,
        tenantId: userTenantId,
        action: 'GET_USER_PERMISSIONS_DENIED_RBAC',
        entity: 'USER_PERMISSIONS',
        entityId: params.id,
        metadata: { reason: 'Unauthorized role', role: userRole },
      });

      return NextResponse.json(
        { error: 'Forbidden: Role not authorized' },
        { status: 403 }
      );
    }

    // ====== Layer 3: Parameter Validation ======
    const parsedUserId = UserIdParamSchema.safeParse(params.id);

    if (!parsedUserId.success) {
      await logAuditEvent({
        userId,
        tenantId: userTenantId,
        action: 'GET_USER_PERMISSIONS_DENIED_PARAM',
        entity: 'USER_PERMISSIONS',
        entityId: params.id,
        metadata: { reason: 'Invalid user ID format', id: params.id },
      });

      return NextResponse.json(
        { error: 'Bad Request: Invalid user ID format' },
        { status: 400 }
      );
    }

    // ====== Layer 4: Tenant Validation ======
    const targetUserId = parsedUserId.data;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        role: true,
        tenantId: true,
        isActive: true,
      },
    });

    if (!targetUser) {
      await logAuditEvent({
        userId,
        tenantId: userTenantId,
        action: 'GET_USER_PERMISSIONS_DENIED_NOT_FOUND',
        entity: 'USER_PERMISSIONS',
        entityId: targetUserId,
        metadata: { reason: 'User not found' },
      });

      return NextResponse.json(
        { error: 'Not Found: User does not exist' },
        { status: 404 }
      );
    }

    if (userRole !== 'SUPERADMIN' && targetUser.tenantId !== userTenantId) {
      await logAuditEvent({
        userId,
        tenantId: userTenantId,
        action: 'GET_USER_PERMISSIONS_DENIED_TENANT',
        entity: 'USER_PERMISSIONS',
        entityId: targetUserId,
        metadata: {
          reason: 'Cross-tenant access denied',
          targetTenantId: targetUser.tenantId || 'null',
        },
      });

      return NextResponse.json(
        { error: 'Forbidden: Cannot access permissions from other tenant' },
        { status: 403 }
      );
    }

    // ====== Layer 5: Safe Query Construction (Parameterized) ======
    // Already done via Prisma with parameterized queries

    // ====== Layer 6: Safe Field Selection (Whitelisting) ======
    // Already done via Prisma select

    // Determine permissions based on user role
    const permissions = ROLE_PERMISSIONS_MAP[targetUser.role] || [];

    // ====== Layer 7: Response Validation (Zod) ======
    const responseData = {
      userId: targetUser.id,
      tenantId: targetUser.tenantId || 'unknown',
      userRole: targetUser.role,
      permissions,
    };

    const validatedResponse = UserPermissionsResponseSchema.safeParse(responseData);

    if (!validatedResponse.success) {
      await logAuditEvent({
        userId,
        tenantId: userTenantId,
        action: 'GET_USER_PERMISSIONS_ERROR_VALIDATION',
        entity: 'USER_PERMISSIONS',
        entityId: targetUserId,
        metadata: { reason: 'Response validation failed' },
      });

      return NextResponse.json(
        { error: 'Internal Server Error: Response validation failed' },
        { status: 500 }
      );
    }

    // ====== Layer 8: Audit Logging (Non-blocking) ======
    await logAuditEvent({
      userId,
      tenantId: userTenantId,
      action: 'GET_USER_PERMISSIONS_SUCCESS',
      entity: 'USER_PERMISSIONS',
      entityId: targetUserId,
      metadata: {
        role: targetUser.role,
        permissionCount: permissions.length,
      },
    });

    return NextResponse.json(validatedResponse.data);
  } catch (error: unknown) {
    const tenantId = request.headers.get('x-tenant-id') || 'unknown';
    const userId = request.headers.get('x-user-id') || 'unknown';

    await logAuditEvent({
      userId,
      tenantId,
      action: 'GET_USER_PERMISSIONS_ERROR',
      entity: 'USER_PERMISSIONS',
      entityId: params.id,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/users/:id/permissions
// Returns user's role and associated permissions
// Detailed endpoint - intentionally removed second implementation
// ============================================================================
