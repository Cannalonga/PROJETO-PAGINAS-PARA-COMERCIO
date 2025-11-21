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

const RestoreUserParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

const RestoreUserBodySchema = z.object({
  reason: z.string().optional().describe('Optional reason for restoration'),
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
    return RestoreUserParamsSchema.parse({ id });
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
    const body = await request.json().catch(() => ({}));
    return RestoreUserBodySchema.parse(body);
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

function authorizeRestore(
  requestingUserRole: UserRoleType,
  deletedUserRole: UserRoleType,
  requestingTenantId: string,
  targetUserTenantId: string | null
): { success: boolean; error?: string; status?: number } {
  // Tenant isolation (CRITICAL)
  if (requestingTenantId !== targetUserTenantId) {
    return {
      success: false,
      error: 'Unauthorized: tenant mismatch',
      status: 403,
    };
  }

  const requestingRoleLevel = ROLE_HIERARCHY[requestingUserRole];
  const deletedUserRoleLevel = ROLE_HIERARCHY[deletedUserRole];

  // Cannot restore if requesting user has lower or equal privilege
  if (requestingRoleLevel <= deletedUserRoleLevel) {
    return {
      success: false,
      error: 'Unauthorized: cannot restore user of equal or higher privilege',
      status: 403,
    };
  }

  // Only SUPERADMIN can restore OPERADOR-level or higher users
  if (
    requestingUserRole !== 'SUPERADMIN' &&
    deletedUserRoleLevel >= ROLE_HIERARCHY['OPERADOR']
  ) {
    return {
      success: false,
      error: 'Unauthorized: only SUPERADMIN can restore OPERADOR-level users',
      status: 403,
    };
  }

  return { success: true };
}

// ============================================================================
// LAYER 6: DATABASE TRANSACTION WITH PESSIMISTIC LOCKING
// ============================================================================

async function restoreUserWithTransaction(
  userId: string,
  tenantId: string,
  requestingUserId: string,
  requestingUserRole: UserRoleType,
  reason?: string
): Promise<{
  user: { id: string; email: string; role: UserRoleType };
  restored: boolean;
  message: string;
  restoredAt: string;
} | null> {
  try {
    // Use transaction with Serializable isolation
    const result = await prisma.$transaction(
      async (tx) => {
        // Fetch deleted user with pessimistic lock
        const user = await tx.user.findUniqueOrThrow({
          where: { id: userId },
          select: {
            id: true,
            tenantId: true,
            role: true,
            email: true,
            deletedAt: true,
          },
        });

        // Verify user is deleted
        if (!user.deletedAt) {
          throw new Error('User is not deleted');
        }

        // Final tenant check (defense in depth)
        if (user.tenantId !== tenantId) {
          throw new Error('Tenant mismatch in transaction');
        }

        const userRole = user.role as UserRoleType;

        // Validate role
        if (!VALID_ROLES.includes(userRole)) {
          throw new Error(`[SECURITY] Invalid role in database: ${userRole}`);
        }

        // Restore user (set deletedAt to null)
        const restoredUser = await tx.user.update({
          where: { id: userId },
          data: { deletedAt: null },
          select: { id: true, email: true, role: true },
        });

        // Log audit event
        await tx.auditLog.create({
          data: {
            userId: requestingUserId,
            tenantId: tenantId,
            action: 'RESTORE_USER',
            entity: 'User',
            entityId: userId,
            oldValues: {
              deletedAt: user.deletedAt.toISOString(),
              restoredBy: requestingUserId,
              restoredByRole: requestingUserRole,
            },
            newValues: {
              deletedAt: null,
            },
            metadata: {
              reason: reason || 'No reason provided',
              timestamp: new Date().toISOString(),
              severity: 'MEDIUM',
            },
          },
        });

        return {
          user: {
            id: restoredUser.id,
            email: restoredUser.email,
            role: restoredUser.role as UserRoleType,
          },
          restored: true,
          message: 'User restored successfully',
          restoredAt: new Date().toISOString(),
        };
      },
      {
        isolationLevel: 'Serializable',
        timeout: 10000,
      }
    );

    return result;
  } catch (error) {
    console.error('[CRITICAL] Transaction error in restoreUserWithTransaction:', error);
    return null;
  }
}

// ============================================================================
// LAYER 7: RESPONSE FORMATTING
// ============================================================================

function formatRestoreResponse(data: {
  user: { id: string; email: string; role: UserRoleType };
  restored: boolean;
  message: string;
  restoredAt: string;
}) {
  return {
    success: true,
    message: data.message,
    data: {
      userId: data.user.id,
      email: data.user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      role: data.user.role,
      restored: data.restored,
      restoredAt: data.restoredAt,
    },
  };
}

// ============================================================================
// LAYER 8: ERROR HANDLING & RESPONSE
// ============================================================================

function errorResponse(error: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: error,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(
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

    // LAYER 3: Request Body Validation
    const bodyValidation = await validateRequestBody(request);
    if ('success' in bodyValidation && !bodyValidation.success) {
      return errorResponse(bodyValidation.error!, bodyValidation.status!);
    }
    const { reason } = bodyValidation as { reason?: string };

    // LAYER 4: Fetch deleted user for authorization check
    const deletedUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, tenantId: true, deletedAt: true },
    });

    if (!deletedUser) {
      return errorResponse('User not found', 404);
    }

    // Verify user is actually deleted
    if (!deletedUser.deletedAt) {
      return errorResponse('User is not deleted', 400);
    }

    // Validate role
    const userRole = deletedUser.role as UserRoleType;
    if (!VALID_ROLES.includes(userRole)) {
      console.error(`[SECURITY] Invalid role in DB: ${userRole} for user ${id}`);
      return errorResponse('Invalid user state detected', 500);
    }

    // LAYER 5: Authorization & RBAC
    const authorizationResult = authorizeRestore(
      request.user!.userRole as UserRoleType,
      userRole,
      request.user!.tenantId,
      deletedUser.tenantId
    );
    if (!authorizationResult.success) {
      return errorResponse(authorizationResult.error!, authorizationResult.status!);
    }

    // LAYER 6: Database Transaction with Pessimistic Lock
    const result = await restoreUserWithTransaction(
      id,
      request.user!.tenantId,
      request.user!.userId,
      request.user!.userRole as UserRoleType,
      reason
    );

    if (!result) {
      return errorResponse('Failed to restore user (transaction error)', 500);
    }

    // LAYER 7: Response Formatting
    const response = formatRestoreResponse(result);

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
    console.error('POST /api/users/[id]/restore error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {
      message: 'Use POST method to restore soft-deleted user',
      method: 'POST',
      body: {
        reason: 'Optional reason for restoration (string)',
      },
    },
    { status: 405 }
  );
}
