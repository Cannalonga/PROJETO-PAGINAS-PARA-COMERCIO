import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

// ============================================================================
// LAYER 1: REQUEST VALIDATION SCHEMA (Input Validation)
// ============================================================================
const GetUserParamsSchema = z.object({
  id: z.string().uuid('User ID must be a valid UUID'),
});

const UserDetailSchema = z.object({
  // Safe fields only - NO passwordHash, tokens, or sensitive data
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: z.enum(['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER']),
  isActive: z.boolean(),
  createdAt: z.date(),
  lastLoginAt: z.date().nullable(),
  tenantId: z.string(),
});

// ============================================================================
// LAYER 2: AUTHENTICATION (x-user-id, x-user-role headers)
// ============================================================================
async function authenticateRequest(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  if (!userId || !userRole) {
    return {
      error: 'Unauthorized: Missing authentication headers',
      status: 401,
      authenticatedUser: null,
      userRole: null,
    };
  }

  // Validate user exists in database
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
      userRole: null,
    };
  }

  return {
    error: null,
    status: 200,
    authenticatedUser,
    userRole: userRole as string,
  };
}

// ============================================================================
// LAYER 3: AUTHORIZATION (RBAC - Role-Based Access Control)
// ============================================================================
const ALLOWED_ROLES = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN'];

function authorizeRequest(userRole: string) {
  if (!ALLOWED_ROLES.includes(userRole)) {
    return {
      authorized: false,
      error: `Forbidden: User role '${userRole}' not authorized to view user details`,
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
// LAYER 4: PARAMETER VALIDATION (Extract & validate URL params)
// ============================================================================
function validateParams(params: unknown) {
  try {
    return GetUserParamsSchema.parse(params);
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
// LAYER 5: TENANT VALIDATION (User can only access users in same tenant)
// ============================================================================
async function validateTenantAccess(
  targetUserId: string,
  authenticatedUser: { id: string; tenantId: string; role: string }
) {
  // SUPERADMIN can access all tenants
  if (authenticatedUser.role === 'SUPERADMIN') {
    return {
      authorized: true,
      error: null,
      targetUserTenantId: undefined,
    };
  }

  // For non-SUPERADMIN users, fetch target user's tenantId from DB
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { tenantId: true },
  });

  if (!targetUser) {
    // Don't reveal if user exists - just say "not found"
    return {
      authorized: false,
      error: 'User not found',
      targetUserTenantId: undefined,
    };
  }

  // Verify tenant matches
  if (targetUser.tenantId !== authenticatedUser.tenantId) {
    return {
      authorized: false,
      error: 'Forbidden: Access to user in different tenant',
      targetUserTenantId: undefined,
    };
  }

  return {
    authorized: true,
    error: null,
    targetUserTenantId: targetUser.tenantId,
  };
}

// ============================================================================
// LAYER 6: SAFE QUERY CONSTRUCTION (Parameterized, no SQL injection)
// ============================================================================
function buildSafeQuery(
  targetUserId: string,
  authenticatedUser: { id: string; tenantId: string; role: string }
) {
  // Base where clause - ALWAYS use parameterized queries
  const where: { id: string; tenantId?: string } = {
    id: targetUserId,
  };

  // For non-SUPERADMIN, enforce tenant scoping at query level
  if (authenticatedUser.role !== 'SUPERADMIN') {
    where.tenantId = authenticatedUser.tenantId;
  }

  return where;
}

// ============================================================================
// LAYER 7: SAFE FIELD SELECTION (Whitelist only safe fields)
// ============================================================================
const SAFE_FIELDS = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  createdAt: true,
  lastLoginAt: true,
  tenantId: true,
  // NEVER include: passwordHash, hashedPassword, token, refreshToken, secret
};

// ============================================================================
// LAYER 8: AUDIT LOGGING (Non-blocking, PII masked)
// ============================================================================
async function auditLog(
  authenticatedUser: { id: string; tenantId: string },
  targetUserId: string,
  success: boolean,
  error?: string
) {
  // Non-blocking audit - fire and forget
  logAuditEvent({
    userId: authenticatedUser.id,
    tenantId: authenticatedUser.tenantId,
    action: 'VIEW_USER_DETAIL',
    resource: 'user',
    resourceId: targetUserId,
    status: success ? 'SUCCESS' : 'FAILED',
    metadata: {
      endpoint: 'GET /api/users/:id',
      targetUserId, // Masked in audit serialization
      error: error || undefined,
    },
  }).catch((err) => {
    // Log audit failures to console but don't impact request
    console.error('Audit logging failed:', err);
  });
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    // LAYER 2: AUTHENTICATION
    const auth = await authenticateRequest(request);
    if (auth.error) {
      await auditLog(
        { id: 'unknown', tenantId: 'unknown' },
        resolvedParams.id,
        false,
        'Authentication failed'
      );
      return NextResponse.json(
        { error: auth.error, timestamp: new Date().toISOString() },
        { status: auth.status }
      );
    }

    const { authenticatedUser, userRole } = auth;

    // LAYER 3: AUTHORIZATION
    const authz = authorizeRequest(userRole);
    if (!authz.authorized) {
      await auditLog(authenticatedUser!, resolvedParams.id, false, authz.error);
      return NextResponse.json(
        { error: authz.error, timestamp: new Date().toISOString() },
        { status: authz.status }
      );
    }

    // LAYER 4: PARAMETER VALIDATION
    const paramValidation = validateParams({ id: resolvedParams.id });
    if ('valid' in paramValidation && !paramValidation.valid) {
      await auditLog(
        authenticatedUser!,
        resolvedParams.id,
        false,
        paramValidation.error
      );
      return NextResponse.json(
        { error: paramValidation.error, timestamp: new Date().toISOString() },
        { status: paramValidation.status }
      );
    }

    const { id: targetUserId } = paramValidation;

    // LAYER 5: TENANT VALIDATION
    const tenantCheck = await validateTenantAccess(
      targetUserId,
      authenticatedUser!
    );
    if (!tenantCheck.authorized) {
      await auditLog(
        authenticatedUser!,
        targetUserId,
        false,
        tenantCheck.error
      );
      return NextResponse.json(
        {
          error: tenantCheck.error,
          timestamp: new Date().toISOString(),
        },
        {
          status:
            tenantCheck.error === 'User not found'
              ? 404
              : 403,
        }
      );
    }

    // LAYER 6: SAFE QUERY CONSTRUCTION
    const whereClause = buildSafeQuery(targetUserId, authenticatedUser!);

    // LAYER 7: SAFE FIELD SELECTION + Execute Query
    const user = await prisma.user.findUnique({
      where: whereClause,
      select: SAFE_FIELDS,
    });

    if (!user) {
      await auditLog(
        authenticatedUser!,
        targetUserId,
        false,
        'User not found'
      );
      return NextResponse.json(
        { error: 'User not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    // Validate response matches safe schema
    const validatedUser = UserDetailSchema.parse(user);

    // LAYER 8: AUDIT LOGGING (Success)
    await auditLog(authenticatedUser!, targetUserId, true);

    return NextResponse.json(
      {
        data: validatedUser,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/users/:id error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';

    await auditLog(
      { id: 'unknown', tenantId: 'unknown' },
      'unknown',
      false,
      errorMessage
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
