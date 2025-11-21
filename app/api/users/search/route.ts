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

const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query required').max(100, 'Query too long').optional(),
  field: z.enum(['email', 'firstName', 'all']).default('all'),
  role: z.enum(VALID_ROLES).optional(),
  status: z.enum(['active', 'inactive', 'deleted']).default('active'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['email', 'firstName', 'createdAt', 'role']).default('email'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

type SearchQuery = z.infer<typeof SearchQuerySchema>;

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
// LAYER 3: QUERY PARAMETER VALIDATION
// ============================================================================

function validateSearchQuery(params: Record<string, string | string[] | undefined>) {
  try {
    return SearchQuerySchema.parse(params);
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
// LAYER 4: AUTHORIZATION & RBAC
// ============================================================================

function authorizeSearch(
  requestingUserRole: UserRoleType,
  filterRole?: UserRoleType
): { success: boolean; error?: string; status?: number } {
  // SUPERADMIN can search any role, others can only search lower roles
  if (filterRole && requestingUserRole !== 'SUPERADMIN') {
    const requestingRoleLevel = ROLE_HIERARCHY[requestingUserRole];
    const filterRoleLevel = ROLE_HIERARCHY[filterRole];

    if (filterRoleLevel >= requestingRoleLevel) {
      return {
        success: false,
        error: 'Unauthorized: cannot search users of equal or higher role',
        status: 403,
      };
    }
  }

  return { success: true };
}

// ============================================================================
// LAYER 5: SEARCH QUERY BUILDER
// ============================================================================

function buildSearchQuery(
  searchParams: SearchQuery,
  tenantId: string
) {
  const where: any = {
    tenantId: tenantId,
  };

  // Status filtering
  if (searchParams.status === 'deleted') {
    where.deletedAt = { not: null };
  } else if (searchParams.status === 'active') {
    where.deletedAt = null;
  } else if (searchParams.status === 'inactive') {
    where.isActive = false;
    where.deletedAt = null;
  }

  // Role filtering
  if (searchParams.role) {
    where.role = searchParams.role;
  }

  // Multi-field search
  if (searchParams.q) {
    if (searchParams.field === 'email') {
      where.email = { contains: searchParams.q, mode: 'insensitive' };
    } else if (searchParams.field === 'firstName') {
      where.firstName = { contains: searchParams.q, mode: 'insensitive' };
    } else if (searchParams.field === 'all') {
      where.OR = [
        { email: { contains: searchParams.q, mode: 'insensitive' } },
        { firstName: { contains: searchParams.q, mode: 'insensitive' } },
        { lastName: { contains: searchParams.q, mode: 'insensitive' } },
      ];
    }
  }

  // Determine sort order
  const orderBy: any = {};
  orderBy[searchParams.sortBy] = searchParams.sortOrder;

  return {
    where,
    orderBy,
    skip: (searchParams.page - 1) * searchParams.limit,
    take: searchParams.limit,
  };
}

// ============================================================================
// LAYER 6: DATABASE QUERY WITH PAGINATION
// ============================================================================

async function searchUsers(
  searchParams: SearchQuery,
  tenantId: string
): Promise<{
  users: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRoleType;
    isActive: boolean;
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} | null> {
  try {
    const query = buildSearchQuery(searchParams, tenantId);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: query.where,
        orderBy: query.orderBy,
        skip: query.skip,
        take: query.take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where: query.where }),
    ]);

    return {
      users: users.map((u) => ({
        ...u,
        role: u.role as UserRoleType,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page: searchParams.page,
      limit: searchParams.limit,
      totalPages: Math.ceil(total / searchParams.limit),
    };
  } catch (error) {
    console.error('[CRITICAL] Database error in searchUsers:', error);
    return null;
  }
}

// ============================================================================
// LAYER 7: RESPONSE FORMATTING
// ============================================================================

function formatSearchResponse(data: {
  users: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRoleType;
    isActive: boolean;
    createdAt: string;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}) {
  return {
    success: true,
    data: {
      users: data.users.map((u) => ({
        id: u.id,
        email: u.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
        hasNextPage: data.page < data.totalPages,
        hasPrevPage: data.page > 1,
      },
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

export async function GET(request: AuthenticatedRequest) {
  const startTime = performance.now();

  try {
    // LAYER 1: Authentication
    const authResult = authenticateRequest(request);
    if (!authResult.success) {
      return errorResponse(authResult.error!, authResult.status!);
    }

    // LAYER 2: Query Parameter Validation
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const queryValidation = validateSearchQuery(queryParams);
    if ('success' in queryValidation && !queryValidation.success) {
      return errorResponse(queryValidation.error!, queryValidation.status!);
    }
    const searchParams = queryValidation as SearchQuery;

    // LAYER 3: Authorization & RBAC
    const authorizationResult = authorizeSearch(
      request.user!.userRole as UserRoleType,
      searchParams.role as UserRoleType | undefined
    );
    if (!authorizationResult.success) {
      return errorResponse(authorizationResult.error!, authorizationResult.status!);
    }

    // LAYER 4: Database Query with Pagination
    const result = await searchUsers(searchParams, request.user!.tenantId);

    if (!result) {
      return errorResponse('Failed to search users (database error)', 500);
    }

    // LAYER 5: Response Formatting
    const response = formatSearchResponse(result);

    // LAYER 6: Success Response with Performance Metrics
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
    console.error('GET /api/users/search error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {
      message: 'Use GET method to search users',
      method: 'GET',
      queryParams: {
        q: 'Search query (optional)',
        field: 'Search field: email, name, all (default: all)',
        role: 'Filter by role (optional)',
        status: 'Filter by status: active, inactive, deleted (default: active)',
        page: 'Page number (default: 1)',
        limit: 'Results per page, max 100 (default: 10)',
        sortBy: 'Sort by: email, name, createdAt, role (default: email)',
        sortOrder: 'Sort order: asc, desc (default: asc)',
      },
    },
    { status: 405 }
  );
}
