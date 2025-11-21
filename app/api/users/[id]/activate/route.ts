import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

// ============================================================================
// LAYER 1: REQUEST VALIDATION SCHEMAS
// ============================================================================
const ActivateUserParamsSchema = z.object({
  id: z.string().uuid('User ID must be a valid UUID'),
});

const ActivateUserBodySchema = z.object({
  isActive: z.boolean().describe('true to activate, false to deactivate'),
});

const ActivateUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: z.enum(['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER']),
  isActive: z.boolean(),
  tenantId: z.string(),
});

// ============================================================================
// LAYER 2: AUTHENTICATION
// ============================================================================
async function authenticateRequest(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const tenantId = request.headers.get('x-tenant-id');

  if (!userId || !userRole || !tenantId) {
    return {
      error: 'Unauthorized: Missing authentication headers',
      status: 401,
      authenticatedUser: null,
    };
  }

  const authenticatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      tenantId: true,
      role: true,
      isActive: true,
    },
  });

  if (!authenticatedUser || !authenticatedUser.isActive) {
    return {
      error: 'Unauthorized: Invalid or inactive user',
      status: 401,
      authenticatedUser: null,
    };
  }

  if (authenticatedUser.tenantId !== tenantId) {
    return {
      error: 'Unauthorized: Tenant mismatch',
      status: 401,
      authenticatedUser: null,
    };
  }

  return {
    error: null,
    status: 200,
    authenticatedUser,
  };
}

// ============================================================================
// LAYER 3: AUTHORIZATION (RBAC)
// ============================================================================
const ALLOWED_ROLES = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN'];

function authorizeRequest(userRole: string) {
  if (!ALLOWED_ROLES.includes(userRole)) {
    return {
      authorized: false,
      error: `Forbidden: User role '${userRole}' not authorized to manage user activation`,
      status: 403,
    };
  }

  return {
    authorized: true,
    error: null,
    status: 200,
  };
}

// ============================================================================
// LAYER 3b: ROLE-BASED ACTIVATION CONTROL
// ============================================================================
const ACTIVATION_PERMISSIONS: Record<string, string[]> = {
  SUPERADMIN: ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER'],
  OPERADOR: ['CLIENTE_ADMIN', 'CLIENTE_USER'],
  CLIENTE_ADMIN: ['CLIENTE_USER'],
};

function validateActivationPermissions(
  targetUserRole: string,
  authenticatedUserRole: string
): { allowed: boolean; error?: string } {
  const allowedTargetRoles = ACTIVATION_PERMISSIONS[authenticatedUserRole];

  if (!allowedTargetRoles || allowedTargetRoles.length === 0) {
    return {
      allowed: false,
      error: `Role '${authenticatedUserRole}' is not authorized to manage activation`,
    };
  }

  if (!allowedTargetRoles.includes(targetUserRole)) {
    return {
      allowed: false,
      error: `Role '${authenticatedUserRole}' cannot change activation status of '${targetUserRole}'`,
    };
  }

  return { allowed: true };
}

// ============================================================================
// LAYER 4: PARAMETER VALIDATION
// ============================================================================
function validateParams(params: unknown) {
  try {
    return ActivateUserParamsSchema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: `Invalid parameters: ${error.errors.map((e) => e.message).join(', ')}`,
        status: 400,
      };
    }
    return {
      valid: false,
      error: 'Parameter validation failed',
      status: 400,
    };
  }
}

// ============================================================================
// LAYER 5: REQUEST BODY VALIDATION
// ============================================================================
async function validateActivateBody(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ActivateUserBodySchema.parse(body);
    return {
      valid: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: `Invalid request body: ${error.errors.map((e) => e.message).join(', ')}`,
        status: 400,
      };
    }
    if (error instanceof SyntaxError) {
      return {
        valid: false,
        error: 'Invalid JSON in request body',
        status: 400,
      };
    }
    return {
      valid: false,
      error: 'Request body validation failed',
      status: 400,
    };
  }
}

// ============================================================================
// LAYER 6: TENANT VALIDATION
// ============================================================================
async function validateTenantAccess(
  targetUserId: string,
  authenticatedUser: { id: string; tenantId: string; role: string }
) {
  if (authenticatedUser.role === 'SUPERADMIN') {
    return {
      authorized: true,
      error: null,
    };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { tenantId: true },
  });

  if (!targetUser) {
    return {
      authorized: false,
      error: 'User not found',
    };
  }

  if (targetUser.tenantId !== authenticatedUser.tenantId) {
    return {
      authorized: false,
      error: 'Forbidden: Access to user in different tenant',
    };
  }

  return {
    authorized: true,
    error: null,
  };
}

// ============================================================================
// LAYER 7: SAFE QUERY CONSTRUCTION
// ============================================================================
function buildSafeQuery(
  targetUserId: string,
  authenticatedUser: { id: string; tenantId: string; role: string }
) {
  const where: { id: string; tenantId?: string } = {
    id: targetUserId,
  };

  if (authenticatedUser.role !== 'SUPERADMIN') {
    where.tenantId = authenticatedUser.tenantId;
  }

  return where;
}

const SAFE_RESPONSE_FIELDS = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  tenantId: true,
};

// ============================================================================
// LAYER 8: AUDIT LOGGING
// ============================================================================
async function auditActivateLog(
  authenticatedUser: { id: string; tenantId: string },
  targetUserId: string,
  action: 'ATTEMPT' | 'ACTIVATE' | 'DEACTIVATE' | 'FAILURE',
  metadata: {
    targetUserRole?: string;
    targetUserEmail?: string;
    oldStatus?: boolean;
    newStatus?: boolean;
    error?: string;
  }
) {
  logAuditEvent({
    userId: authenticatedUser.id,
    tenantId: authenticatedUser.tenantId,
    action: action === 'ACTIVATE' ? 'ACTIVATE_USER' : action === 'DEACTIVATE' ? 'DEACTIVATE_USER' : `ACTIVATE_USER_${action}`,
    entity: 'user',
    entityId: targetUserId,
    metadata: {
      endpoint: 'PATCH /api/users/:id/activate',
      targetUserId,
      targetUserRole: metadata.targetUserRole,
      targetUserEmail: metadata.targetUserEmail,
      oldStatus: metadata.oldStatus,
      newStatus: metadata.newStatus,
      error: metadata.error,
    },
  }).catch((err) => {
    console.error('Audit logging failed:', err);
  });
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    // LAYER 2: AUTHENTICATION
    const auth = await authenticateRequest(request);
    if (auth.error) {
      await auditActivateLog(
        { id: 'unknown', tenantId: 'unknown' },
        resolvedParams.id,
        'FAILURE',
        { error: 'Authentication failed' }
      );
      return NextResponse.json(
        { error: auth.error, timestamp: new Date().toISOString() },
        { status: auth.status }
      );
    }

    const { authenticatedUser } = auth;
    const userRole = request.headers.get('x-user-role')!;

    // LAYER 3: AUTHORIZATION
    const authz = authorizeRequest(userRole);
    if (!authz.authorized) {
      await auditActivateLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        resolvedParams.id,
        'FAILURE',
        { error: authz.error || undefined }
      );
      return NextResponse.json(
        { error: authz.error, timestamp: new Date().toISOString() },
        { status: authz.status }
      );
    }

    // LAYER 4: PARAMETER VALIDATION
    const paramValidation = validateParams({ id: resolvedParams.id });
    if ('valid' in paramValidation && !paramValidation.valid) {
      await auditActivateLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        resolvedParams.id,
        'FAILURE',
        { error: paramValidation.error }
      );
      return NextResponse.json(
        { error: paramValidation.error, timestamp: new Date().toISOString() },
        { status: paramValidation.status }
      );
    }

    const { id: targetUserId } = paramValidation as { id: string };

    // LAYER 5: REQUEST BODY VALIDATION
    const bodyValidation = await validateActivateBody(request);
    if (!bodyValidation.valid) {
      await auditActivateLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        targetUserId,
        'FAILURE',
        { error: bodyValidation.error || undefined }
      );
      return NextResponse.json(
        { error: bodyValidation.error, timestamp: new Date().toISOString() },
        { status: bodyValidation.status }
      );
    }

    const { isActive: newStatus } = bodyValidation.data as { isActive: boolean };

    // Fetch target user before update
    if (!authenticatedUser!.tenantId) {
      throw new Error('Invalid authenticated user state: tenantId is null');
    }

    const whereClause = buildSafeQuery(targetUserId, {
      id: authenticatedUser!.id,
      tenantId: authenticatedUser!.tenantId!,
      role: authenticatedUser!.role as string,
    });

    const currentUser = await prisma.user.findUnique({
      where: whereClause,
      select: {
        ...SAFE_RESPONSE_FIELDS,
        isActive: true,
        role: true,
      },
    });

    if (!currentUser) {
      await auditActivateLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        targetUserId,
        'FAILURE',
        { error: 'User not found' }
      );
      return NextResponse.json(
        { error: 'User not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    // LAYER 6: TENANT VALIDATION
    const tenantCheck = await validateTenantAccess(
      targetUserId,
      {
        id: authenticatedUser!.id,
        tenantId: authenticatedUser!.tenantId,
        role: authenticatedUser!.role as string,
      }
    );
    if (!tenantCheck.authorized) {
      await auditActivateLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        targetUserId,
        'FAILURE',
        { error: tenantCheck.error || undefined }
      );
      return NextResponse.json(
        { error: tenantCheck.error, timestamp: new Date().toISOString() },
        { status: tenantCheck.error === 'User not found' ? 404 : 403 }
      );
    }

    // LAYER 3b: ROLE-BASED ACTIVATION VALIDATION
    const activationPermission = validateActivationPermissions(
      currentUser.role as string,
      userRole
    );
    if (!activationPermission.allowed) {
      await auditActivateLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        targetUserId,
        'ATTEMPT',
        {
          targetUserRole: currentUser.role as string,
          targetUserEmail: currentUser.email,
          oldStatus: currentUser.isActive,
          newStatus,
          error: activationPermission.error,
        }
      );
      return NextResponse.json(
        { error: activationPermission.error, timestamp: new Date().toISOString() },
        { status: 403 }
      );
    }

    // Check if status is already at target
    if (currentUser.isActive === newStatus) {
      return NextResponse.json(
        {
          data: currentUser,
          message: `User is already ${newStatus ? 'active' : 'inactive'}`,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // LAYER 7: SAFE UPDATE
    const updatedUser = await prisma.user.update({
      where: whereClause,
      data: { isActive: newStatus },
      select: SAFE_RESPONSE_FIELDS,
    });

    const validatedUser = ActivateUserResponseSchema.parse(updatedUser);

    // LAYER 8: AUDIT LOGGING (Success)
    const action = newStatus ? 'ACTIVATE' : 'DEACTIVATE';
    await auditActivateLog(
      { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
      targetUserId,
      action as 'ACTIVATE' | 'DEACTIVATE',
      {
        targetUserRole: currentUser.role as string,
        targetUserEmail: currentUser.email,
        oldStatus: currentUser.isActive,
        newStatus,
      }
    );

    return NextResponse.json(
      {
        data: validatedUser,
        message: `User ${action.toLowerCase()}d successfully`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PATCH /api/users/:id/activate error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';

    await auditActivateLog(
      { id: 'unknown', tenantId: 'unknown' },
      'unknown',
      'FAILURE',
      { error: errorMessage }
    );

    return NextResponse.json(
      {
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
