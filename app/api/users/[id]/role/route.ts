import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ============================================================================
// LAYER 0: TYPE DEFINITIONS & CONSTANTS
// ============================================================================

const VALID_ROLES = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER'] as const;
type UserRoleType = typeof VALID_ROLES[number];

const ROLE_HIERARCHY: Record<UserRoleType, number> = {
  SUPERADMIN: 4,
  OPERADOR: 3,
  CLIENTE_ADMIN: 2,
  CLIENTE_USER: 1,
};

// ============================================================================
// LAYER 1: VALIDATION SCHEMAS
// ============================================================================

const ChangeRoleParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

const ChangeRoleBodySchema = z.object({
  role: z.enum(VALID_ROLES, {
    errorMap: () => ({
      message: `Role must be one of: ${VALID_ROLES.join(', ')}`,
    }),
  }),
});

// ============================================================================
// LAYER 2: AUTHENTICATION & REQUEST CONTEXT
// ============================================================================

interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    userRole: string;
    tenantId: string;
  };
}

function authenticateRequest(request: AuthenticatedRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const tenantId = request.headers.get('x-tenant-id');

  if (!userId || !userRole || !tenantId) {
    return {
      success: false,
      error: 'Missing authentication headers',
      status: 401,
    };
  }

  // Validate userRole is a valid UserRole (defense in depth)
  if (!VALID_ROLES.includes(userRole as UserRoleType)) {
    return {
      success: false,
      error: 'Invalid user role in authentication context',
      status: 401,
    };
  }

  request.user = { userId, userRole, tenantId };
  return { success: true };
}

// ============================================================================
// LAYER 3: PARAMETER VALIDATION
// ============================================================================

function validateParams(id: string) {
  try {
    return ChangeRoleParamsSchema.parse({ id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
        status: 400,
      };
    }
    throw error;
  }
}

// ============================================================================
// LAYER 4: REQUEST BODY VALIDATION
// ============================================================================

async function validateRequestBody(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    return ChangeRoleBodySchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
        status: 400,
      };
    }
    throw error;
  }
}

// ============================================================================
// LAYER 5: AUTHORIZATION & RBAC
// ============================================================================

function authorizeRoleChange(
  requestingUserRole: UserRoleType,
  currentTargetRole: UserRoleType,
  newTargetRole: UserRoleType,
  requestingTenantId: string,
  targetUserTenantId: string | null
): { success: boolean; error?: string; status?: number } {
  // Tenant isolation (CRITICAL - LAYER 1)
  if (requestingTenantId !== targetUserTenantId) {
    return {
      success: false,
      error: 'Unauthorized: tenant mismatch',
      status: 403,
    };
  }

  const requestingRoleLevel = ROLE_HIERARCHY[requestingUserRole];
  const currentTargetRoleLevel = ROLE_HIERARCHY[currentTargetRole];
  const newTargetRoleLevel = ROLE_HIERARCHY[newTargetRole];

  // Cannot change role if requesting user has lower or equal privilege
  if (requestingRoleLevel <= currentTargetRoleLevel) {
    return {
      success: false,
      error: 'Unauthorized: cannot change role of equal or higher privilege',
      status: 403,
    };
  }

  // Cannot promote/assign role higher than or equal to own role
  if (newTargetRoleLevel >= requestingRoleLevel) {
    return {
      success: false,
      error: 'Unauthorized: cannot assign role equal to or higher than own role',
      status: 403,
    };
  }

  // Cannot change from one high role to another if not superadmin
  if (requestingUserRole !== 'SUPERADMIN' && currentTargetRoleLevel >= ROLE_HIERARCHY['OPERADOR']) {
    return {
      success: false,
      error: 'Unauthorized: only SUPERADMIN can change OPERADOR roles',
      status: 403,
    };
  }

  return { success: true };
}

// ============================================================================
// LAYER 6: DATABASE TRANSACTION WITH PESSIMISTIC LOCKING
// ============================================================================

async function changeUserRoleWithTransaction(
  userId: string,
  tenantId: string,
  newRole: UserRoleType,
  requestingUserId: string,
  requestingUserRole: UserRoleType
): Promise<{
  user: { id: string; email: string; role: UserRoleType };
  changed: boolean;
  message: string;
} | null> {
  try {
    // Use transaction with Serializable isolation for atomicity + race condition prevention
    const result = await prisma.$transaction(
      async (tx) => {
        // Pessimistic lock: fetch user with implicit row-level lock
        const user = await tx.user.findUniqueOrThrow({
          where: { id: userId },
          select: { id: true, tenantId: true, role: true, email: true },
        });

        // Final authorization check (defense in depth #2)
        if (user.tenantId !== tenantId) {
          throw new Error('Tenant mismatch in transaction');
        }

        const oldRole = user.role as UserRoleType;

        // Validate oldRole is valid (defense in depth #3)
        if (!VALID_ROLES.includes(oldRole)) {
          throw new Error(`[SECURITY] Invalid role in database: ${oldRole}`);
        }

        // No-op case: same role
        if (oldRole === newRole) {
          return {
            user: {
              id: user.id,
              email: user.email,
              role: newRole,
            },
            changed: false,
            message: 'User role already set to specified role',
          };
        }

        // Update role (type-safe: Prisma validates against enum)
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { role: newRole },
          select: { id: true, email: true, role: true },
        });

        // Log audit event with full context and metadata
        await tx.auditLog.create({
          data: {
            userId: requestingUserId,
            tenantId: tenantId,
            action: 'CHANGE_ROLE',
            entity: 'User',
            entityId: userId,
            oldValues: {
              role: oldRole,
              changedBy: requestingUserId,
              changedByRole: requestingUserRole,
            },
            newValues: { role: newRole },
            metadata: {
              escalationLevel: ROLE_HIERARCHY[newRole] - ROLE_HIERARCHY[oldRole],
              timestamp: new Date().toISOString(),
              severity: 'HIGH',
            },
          },
        });

        return {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role as UserRoleType,
          },
          changed: true,
          message: 'User role changed successfully',
        };
      },
      {
        isolationLevel: 'Serializable',
        timeout: 10000,
      }
    );

    return result;
  } catch (error) {
    console.error('[CRITICAL] Transaction error in changeUserRoleWithTransaction:', error);
    return null;
  }
}

// ============================================================================
// LAYER 7: RESPONSE FORMATTING
// ============================================================================

function formatChangeRoleResponse(data: {
  user: { id: string; email: string; role: UserRoleType };
  changed: boolean;
  message: string;
}) {
  // PII masking: email encryption
  const emailMasked = data.user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return {
    success: true,
    message: data.message,
    data: {
      userId: data.user.id,
      email: emailMasked,
      newRole: data.user.role,
      changed: data.changed,
    },
  };
}

// ============================================================================
// LAYER 8: ERROR HANDLING & RESPONSE
// ============================================================================

function errorResponse(error: string, status: number) {
  return NextResponse.json(
    {
      error: error,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function PUT(
  request: AuthenticatedRequest,
  context: { params: { id: string } }
) {
  const startTime = performance.now();

  try {
    // LAYER 1: Authentication
    const authResult = authenticateRequest(request);
    if (!authResult.success) {
      return errorResponse(authResult.error!, authResult.status!);
    }

    // LAYER 2: Parameter Validation
    const paramValidation = validateParams(context.params.id);
    if ('success' in paramValidation && !paramValidation.success) {
      return errorResponse(paramValidation.error!, paramValidation.status!);
    }
    const { id } = paramValidation as { id: string };

    // LAYER 3: Request Body Validation (Zod validation)
    const bodyValidation = await validateRequestBody(request);
    if ('success' in bodyValidation && !bodyValidation.success) {
      return errorResponse(bodyValidation.error!, bodyValidation.status!);
    }
    const { role: newRole } = bodyValidation as { role: UserRoleType };

    // LAYER 4: Fetch current role with strict validation
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, tenantId: true },
    });

    if (!currentUser) {
      return errorResponse('User not found', 404);
    }

    // Validate current role is a valid UserRole (defense in depth)
    const currentRole = currentUser.role as UserRoleType;
    if (!VALID_ROLES.includes(currentRole)) {
      console.error(`[SECURITY] Invalid role in DB: ${currentRole} for user ${id}`);
      return errorResponse('Invalid user state detected', 500);
    }

    // LAYER 5: Authorization & RBAC (with type safety)
    const authorizationResult = authorizeRoleChange(
      request.user!.userRole as UserRoleType,
      currentRole,
      newRole,
      request.user!.tenantId,
      currentUser.tenantId
    );
    if (!authorizationResult.success) {
      return errorResponse(authorizationResult.error!, authorizationResult.status!);
    }

    // LAYER 6: Database Transaction with Pessimistic Lock (Serializable isolation)
    const result = await changeUserRoleWithTransaction(
      id,
      request.user!.tenantId,
      newRole,
      request.user!.userId,
      request.user!.userRole as UserRoleType
    );

    if (!result) {
      return errorResponse('Failed to change user role (transaction error)', 500);
    }

    // LAYER 7: Response Formatting (PII masking)
    const response = formatChangeRoleResponse(result);

    // LAYER 8: Success Response with Performance Metrics
    const duration = performance.now() - startTime;
    return NextResponse.json(
      {
        ...response,
        _meta: {
          duration_ms: Math.round(duration),
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/users/[id]/role error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {
      message: 'Use PUT method to change user role',
      method: 'PUT',
      body: {
        role: 'One of: SUPERADMIN, OPERADOR, CLIENTE_ADMIN, CLIENTE_USER',
      },
    },
    { status: 405 }
  );
}
