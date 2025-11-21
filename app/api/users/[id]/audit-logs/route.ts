import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ============================================================================
// LAYER 1: VALIDATION SCHEMAS
// ============================================================================

const GetAuditLogsParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

const GetAuditLogsQuerySchema = z.object({
  action: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
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

  request.user = { userId, userRole, tenantId };
  return { success: true };
}

// ============================================================================
// LAYER 3: PARAMETER VALIDATION
// ============================================================================

function validateParams(id: string) {
  try {
    return GetAuditLogsParamsSchema.parse({ id });
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
// LAYER 4: QUERY PARAMETER VALIDATION
// ============================================================================

function validateQueryParams(searchParams: URLSearchParams) {
  try {
    const queryObj = {
      action: searchParams.get('action') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    };
    return GetAuditLogsQuerySchema.parse(queryObj);
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

function authorizeAuditAccess(
  requestingUserId: string,
  requestingUserRole: string,
  targetUserId: string,
  requestingTenantId: string,
  targetUserTenantId: string
) {
  // Tenant isolation: cannot view audit logs outside own tenant
  if (requestingTenantId !== targetUserTenantId) {
    return {
      success: false,
      error: 'Unauthorized: tenant mismatch',
      status: 403,
    };
  }

  // SUPERADMIN & OPERADOR can view any user's audit logs
  if (requestingUserRole === 'SUPERADMIN' || requestingUserRole === 'OPERADOR') {
    return { success: true };
  }
  
  // CLIENTE_ADMIN can view own logs only
  if (requestingUserRole === 'CLIENTE_ADMIN' && requestingUserId === targetUserId) {
    return { success: true };
  }
  
  // CLIENTE_USER can view own logs only
  if (requestingUserRole === 'CLIENTE_USER' && requestingUserId === targetUserId) {
    return { success: true };
  }

  return {
    success: false,
    error: 'Unauthorized: insufficient permissions to view audit logs',
    status: 403,
  };
}

// ============================================================================
// LAYER 6: DATABASE QUERY & TENANT SCOPING
// ============================================================================

async function getUserAuditLogs(
  userId: string,
  tenantId: string,
  filters: {
    action?: string;
    startDate?: string;
    endDate?: string;
    limit: number;
    offset: number;
  }
) {
  // Verify user exists and belongs to tenant
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, tenantId: true },
  });

  if (!user || user.tenantId !== tenantId) {
    return null;
  }

  // Build query with filters
  const whereClause: any = {
    userId: userId,
  };

  if (filters.action) {
    whereClause.action = filters.action;
  }

  if (filters.startDate || filters.endDate) {
    whereClause.timestamp = {};
    if (filters.startDate) {
      whereClause.timestamp.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.timestamp.lte = new Date(filters.endDate);
    }
  }

  // Execute queries
  const [auditLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: filters.limit,
      skip: filters.offset,
      select: {
        id: true,
        userId: true,
        action: true,
        entity: true,
        oldValues: true,
        newValues: true,
        timestamp: true,
      },
    }),
    prisma.auditLog.count({ where: whereClause }),
  ]);

  return {
    logs: auditLogs,
    total,
    limit: filters.limit,
    offset: filters.offset,
    hasMore: filters.offset + filters.limit < total,
  };
}

// ============================================================================
// LAYER 7: RESPONSE FORMATTING & PAGINATION
// ============================================================================

function formatAuditLogResponse(data: any) {
  return {
    data: data.logs.map((log: any) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      oldValues: log.oldValues,
      newValues: log.newValues,
      timestamp: log.timestamp.toISOString(),
    })),
    pagination: {
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      hasMore: data.hasMore,
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

export async function GET(
  request: AuthenticatedRequest,
  context: { params: { id: string } }
) {
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

    // LAYER 3: Query Parameter Validation
    const queryValidation = validateQueryParams(request.nextUrl.searchParams);
    if ('success' in queryValidation && !queryValidation.success) {
      return errorResponse(queryValidation.error!, queryValidation.status!);
    }
    const filters = queryValidation as {
      action?: string;
      startDate?: string;
      endDate?: string;
      limit: number;
      offset: number;
    };

    // LAYER 4: Authorization & RBAC
    const authorizationResult = authorizeAuditAccess(
      request.user!.userId,
      request.user!.userRole,
      id,
      request.user!.tenantId,
      request.user!.tenantId // We'll verify actual tenant in DB query
    );
    if (!authorizationResult.success) {
      return errorResponse(authorizationResult.error!, authorizationResult.status!);
    }

    // LAYER 5: Database Query with Tenant Scoping
    const auditData = await getUserAuditLogs(id, request.user!.tenantId, filters);

    if (auditData === null) {
      return errorResponse('User not found', 404);
    }

    // LAYER 6: Response Formatting
    const response = formatAuditLogResponse(auditData);

    // LAYER 7: Success Response
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('GET /api/users/[id]/audit-logs error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}
