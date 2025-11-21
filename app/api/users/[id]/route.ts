import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
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

// UPDATE USER SCHEMAS
const UpdateUserBodySchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  role: z.enum(['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER']).optional(),
});

const UpdateUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: z.enum(['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER']),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
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
  error?: string
) {
  // Non-blocking audit - fire and forget
  logAuditEvent({
    userId: authenticatedUser.id,
    tenantId: authenticatedUser.tenantId,
    action: 'VIEW_USER_DETAIL',
    entity: 'user',
    entityId: targetUserId,
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
// PUT-SPECIFIC LAYERS
// ============================================================================

// FIELD-LEVEL RBAC FOR UPDATES
type UpdateableFields = Partial<Record<keyof z.infer<typeof UpdateUserBodySchema>, boolean>>;

const FIELD_PERMISSIONS: Record<string, UpdateableFields> = {
  SUPERADMIN: {
    firstName: true,
    lastName: true,
    email: true,
    isActive: true,
    role: true,
  },
  OPERADOR: {
    firstName: true,
    lastName: true,
    email: true,
    isActive: true,
  },
  CLIENTE_ADMIN: {
    firstName: true,
    lastName: true,
    email: true,
  },
};

function validateFieldPermissions(
  requestedFields: Record<string, unknown>,
  userRole: string
): { valid: boolean; error?: string; allowedFields?: Record<string, unknown> } {
  const allowedFields = FIELD_PERMISSIONS[userRole];

  if (!allowedFields || Object.keys(allowedFields).length === 0) {
    return {
      valid: false,
      error: `Role '${userRole}' is not authorized to update any user fields`,
    };
  }

  const allowedUpdates: Record<string, unknown> = {};
  const forbiddenFields: string[] = [];

  for (const [field, value] of Object.entries(requestedFields)) {
    if (allowedFields[field as keyof UpdateableFields]) {
      allowedUpdates[field] = value;
    } else if (value !== undefined) {
      forbiddenFields.push(field);
    }
  }

  if (forbiddenFields.length > 0) {
    return {
      valid: false,
      error: `Role '${userRole}' cannot update fields: ${forbiddenFields.join(', ')}`,
    };
  }

  return {
    valid: true,
    allowedFields: allowedUpdates,
  };
}

async function validateUpdateBody(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = UpdateUserBodySchema.parse(body);
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

const SAFE_RESPONSE_FIELDS = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  tenantId: true,
};

async function auditUpdateLog(
  authenticatedUser: { id: string; tenantId: string },
  targetUserId: string,
  action: 'ATTEMPT' | 'UPDATE' | 'FAILURE',
  metadata: {
    requestedFields?: Record<string, unknown>;
    allowedFields?: Record<string, unknown>;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    error?: string;
  }
) {
  logAuditEvent({
    userId: authenticatedUser.id,
    tenantId: authenticatedUser.tenantId,
    action: action === 'UPDATE' ? 'UPDATE_USER' : `UPDATE_USER_${action}`,
    entity: 'user',
    entityId: targetUserId,
    metadata: {
      endpoint: 'PUT /api/users/:id',
      targetUserId,
      requestedFields: metadata.requestedFields,
      allowedFields: metadata.allowedFields,
      oldValues: metadata.oldValues,
      newValues: metadata.newValues,
      error: metadata.error,
    },
  }).catch((err) => {
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
        'Authentication failed'
      );
      return NextResponse.json(
        { error: auth.error, timestamp: new Date().toISOString() },
        { status: auth.status }
      );
    }

    const { authenticatedUser, userRole } = auth;

    // LAYER 3: AUTHORIZATION
    const authz = authorizeRequest(userRole!);
    if (!authz.authorized) {
      // Type guard: authenticatedUser.tenantId is non-null after authentication
      await auditLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        resolvedParams.id,
        authz.error || undefined
      );
      return NextResponse.json(
        { error: authz.error, timestamp: new Date().toISOString() },
        { status: authz.status }
      );
    }

    // LAYER 4: PARAMETER VALIDATION
    const paramValidation = validateParams({ id: resolvedParams.id });
    if ('valid' in paramValidation && !paramValidation.valid) {
      await auditLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        resolvedParams.id,
        paramValidation.error
      );
      return NextResponse.json(
        { error: paramValidation.error, timestamp: new Date().toISOString() },
        { status: paramValidation.status }
      );
    }

    const { id: targetUserId } = paramValidation as { id: string };

    // LAYER 5: TENANT VALIDATION
    // Type guard: ensure tenantId is non-null (should be guaranteed by authentication)
    if (!authenticatedUser!.tenantId) {
      throw new Error('Invalid authenticated user state: tenantId is null');
    }

    const tenantCheck = await validateTenantAccess(
      targetUserId,
      {
        id: authenticatedUser!.id,
        tenantId: authenticatedUser!.tenantId,
        role: authenticatedUser!.role as string,
      }
    );
    if (!tenantCheck.authorized) {
      await auditLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        targetUserId,
        tenantCheck.error || undefined
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
    const whereClause = buildSafeQuery(targetUserId, {
      id: authenticatedUser!.id,
      tenantId: authenticatedUser!.tenantId!,
      role: authenticatedUser!.role as string,
    });

    // LAYER 7: SAFE FIELD SELECTION + Execute Query
    const user = await prisma.user.findUnique({
      where: whereClause,
      select: SAFE_FIELDS,
    });

    if (!user) {
      await auditLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        targetUserId,
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
    await auditLog(
      { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
      targetUserId
    );

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

// ============================================================================
// PUT HANDLER - UPDATE USER
// ============================================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    // LAYER 2: AUTHENTICATION
    const auth = await authenticateRequest(request);
    if (auth.error) {
      await auditUpdateLog(
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

    const { authenticatedUser, userRole } = auth;

    // LAYER 3: AUTHORIZATION (Role-based access)
    const authz = authorizeRequest(userRole!);
    if (!authz.authorized) {
      await auditUpdateLog(
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
      await auditUpdateLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        resolvedParams.id,
        'FAILURE',
        { error: paramValidation.error || undefined }
      );
      return NextResponse.json(
        { error: paramValidation.error, timestamp: new Date().toISOString() },
        { status: paramValidation.status }
      );
    }

    const { id: targetUserId } = paramValidation as { id: string };

    // LAYER 5: REQUEST BODY VALIDATION
    const bodyValidation = await validateUpdateBody(request);
    if (!bodyValidation.valid) {
      await auditUpdateLog(
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

    const requestedFields = bodyValidation.data as Record<string, unknown>;

    // Check if at least one field is being updated
    if (Object.keys(requestedFields).length === 0) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update', timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    // LAYER 3b: FIELD-LEVEL RBAC
    const fieldPermission = validateFieldPermissions(requestedFields, userRole!);
    if (!fieldPermission.valid) {
      await auditUpdateLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        targetUserId,
        'ATTEMPT',
        {
          requestedFields,
          error: fieldPermission.error || undefined,
        }
      );
      return NextResponse.json(
        { error: fieldPermission.error, timestamp: new Date().toISOString() },
        { status: 403 }
      );
    }

    const allowedFields = fieldPermission.allowedFields as Record<string, unknown>;

    // LAYER 6: TENANT VALIDATION
    if (!authenticatedUser!.tenantId) {
      throw new Error('Invalid authenticated user state: tenantId is null');
    }

    const tenantCheck = await validateTenantAccess(
      targetUserId,
      {
        id: authenticatedUser!.id,
        tenantId: authenticatedUser!.tenantId,
        role: authenticatedUser!.role as string,
      }
    );
    if (!tenantCheck.authorized) {
      await auditUpdateLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        targetUserId,
        'FAILURE',
        { error: tenantCheck.error || undefined }
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

    // LAYER 7: SAFE QUERY CONSTRUCTION - Get current user
    const whereClause = buildSafeQuery(targetUserId, {
      id: authenticatedUser!.id,
      tenantId: authenticatedUser!.tenantId!,
      role: authenticatedUser!.role as string,
    });

    const currentUser = await prisma.user.findUnique({
      where: whereClause,
      select: {
        ...SAFE_RESPONSE_FIELDS,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        role: true,
      },
    });

    if (!currentUser) {
      await auditUpdateLog(
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

    // Store old values for audit trail
    const oldValues: Record<string, unknown> = {};
    for (const field of Object.keys(allowedFields)) {
      oldValues[field] = currentUser[field as keyof typeof currentUser];
    }

    // Perform update with Prisma
    const updatedUser = await prisma.user.update({
      where: whereClause,
      data: allowedFields,
      select: SAFE_RESPONSE_FIELDS,
    });

    // Store new values for audit trail
    const newValues: Record<string, unknown> = {};
    for (const field of Object.keys(allowedFields)) {
      newValues[field] = updatedUser[field as keyof typeof updatedUser];
    }

    // Validate response matches safe schema
    const validatedUser = UpdateUserResponseSchema.parse(updatedUser);

    // LAYER 8: AUDIT LOGGING (Success with change tracking)
    await auditUpdateLog(
      { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
      targetUserId,
      'UPDATE',
      {
        requestedFields,
        allowedFields,
        oldValues,
        newValues,
      }
    );

    return NextResponse.json(
      {
        data: validatedUser,
        changes: {
          oldValues,
          newValues,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/users/:id error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';

    await auditUpdateLog(
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

// ============================================================================
// DELETE HANDLER - DELETE USER
// ============================================================================

// DELETE-SPECIFIC: RBAC for deletion
const DELETE_ALLOWED_ROLES: Record<string, string[]> = {
  SUPERADMIN: ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER'],
  OPERADOR: ['CLIENTE_ADMIN', 'CLIENTE_USER'],
  CLIENTE_ADMIN: ['CLIENTE_USER'],
};

function validateDeletePermissions(
  targetUserRole: string,
  authenticatedUserRole: string
): { allowed: boolean; error?: string } {
  const allowedTargetRoles = DELETE_ALLOWED_ROLES[authenticatedUserRole];

  if (!allowedTargetRoles || allowedTargetRoles.length === 0) {
    return {
      allowed: false,
      error: `Role '${authenticatedUserRole}' is not authorized to delete any users`,
    };
  }

  if (!allowedTargetRoles.includes(targetUserRole)) {
    return {
      allowed: false,
      error: `Role '${authenticatedUserRole}' cannot delete users with role '${targetUserRole}'`,
    };
  }

  return { allowed: true };
}

async function auditDeleteLog(
  authenticatedUser: { id: string; tenantId: string },
  targetUserId: string,
  action: 'ATTEMPT' | 'DELETE' | 'FAILURE',
  metadata: {
    targetUserRole?: string;
    targetUserEmail?: string;
    error?: string;
  }
) {
  logAuditEvent({
    userId: authenticatedUser.id,
    tenantId: authenticatedUser.tenantId,
    action: action === 'DELETE' ? 'DELETE_USER' : `DELETE_USER_${action}`,
    entity: 'user',
    entityId: targetUserId,
    metadata: {
      endpoint: 'DELETE /api/users/:id',
      targetUserId,
      targetUserRole: metadata.targetUserRole,
      targetUserEmail: metadata.targetUserEmail,
      error: metadata.error,
    },
  }).catch((err) => {
    console.error('Audit logging failed:', err);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    // LAYER 2: AUTHENTICATION
    const auth = await authenticateRequest(request);
    if (auth.error) {
      await auditDeleteLog(
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

    const { authenticatedUser, userRole } = auth;

    // LAYER 3: AUTHORIZATION (Role-based access)
    const ALLOWED_ROLES = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN'];
    if (!ALLOWED_ROLES.includes(userRole!)) {
      await auditDeleteLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        resolvedParams.id,
        'FAILURE',
        { error: `User role '${userRole}' not authorized to delete users` }
      );
      return NextResponse.json(
        { error: 'Forbidden: Not authorized to delete users', timestamp: new Date().toISOString() },
        { status: 403 }
      );
    }

    // LAYER 4: PARAMETER VALIDATION
    const paramValidation = validateParams({ id: resolvedParams.id });
    if ('valid' in paramValidation && !paramValidation.valid) {
      await auditDeleteLog(
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

    // LAYER 6: TENANT VALIDATION + TARGET USER INFO RETRIEVAL
    if (!authenticatedUser!.tenantId) {
      throw new Error('Invalid authenticated user state: tenantId is null');
    }

    const whereClause = buildSafeQuery(targetUserId, {
      id: authenticatedUser!.id,
      tenantId: authenticatedUser!.tenantId!,
      role: authenticatedUser!.role as string,
    });

    // Fetch target user for deletion checks
    const targetUser = await prisma.user.findUnique({
      where: whereClause,
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
      },
    });

    if (!targetUser) {
      await auditDeleteLog(
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

    // LAYER 3b: ROLE-BASED DELETION VALIDATION
    const deletePermission = validateDeletePermissions(
      targetUser.role as string,
      userRole!
    );
    if (!deletePermission.allowed) {
      await auditDeleteLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        targetUserId,
        'ATTEMPT',
        {
          targetUserRole: targetUser.role as string,
          targetUserEmail: targetUser.email,
          error: deletePermission.error,
        }
      );
      return NextResponse.json(
        { error: deletePermission.error, timestamp: new Date().toISOString() },
        { status: 403 }
      );
    }

    // LAYER 7: PREVENT SELF-DELETION
    if (targetUserId === authenticatedUser!.id) {
      await auditDeleteLog(
        { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
        targetUserId,
        'ATTEMPT',
        {
          targetUserRole: targetUser.role as string,
          targetUserEmail: targetUser.email,
          error: 'Cannot delete own user account',
        }
      );
      return NextResponse.json(
        { error: 'Cannot delete your own user account', timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    // LAYER 8: SAFE DELETE OPERATION
    const deletedUser = await prisma.user.delete({
      where: whereClause,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        tenantId: true,
      },
    });

    // LAYER 9: AUDIT LOGGING (Success)
    await auditDeleteLog(
      { id: authenticatedUser!.id, tenantId: authenticatedUser!.tenantId as string },
      targetUserId,
      'DELETE',
      {
        targetUserRole: deletedUser.role as string,
        targetUserEmail: deletedUser.email,
      }
    );

    return NextResponse.json(
      {
        data: {
          id: deletedUser.id,
          email: deletedUser.email,
          message: 'User deleted successfully',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/users/:id error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';

    await auditDeleteLog(
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
