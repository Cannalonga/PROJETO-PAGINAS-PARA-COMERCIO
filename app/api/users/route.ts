import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { CreateUserSchema, type CreateUserInput } from '@/lib/validations';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/helpers';
import { logAuditEvent } from '@/lib/audit';
import * as bcrypt from 'bcryptjs';

/**
 * Query validation schema for GET /api/users
 * - Enforces pagination limits (page >= 1, pageSize 1-100)
 * - Validates sort field against whitelist (createdAt, firstName, email)
 * - Validates sort direction (asc/desc)
 * - Optional search string (trimmed, max 100 chars)
 */
const UsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'email']).optional().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
  roleFilter: z.enum(['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER']).optional(),
});

/**
 * Allowed roles to access user listing endpoint
 * - SUPERADMIN: sees all users across all tenants
 * - OPERADOR: sees all users (platform-wide operator)
 * - CLIENTE_ADMIN: sees users in their tenant only
 */
const ALLOWED_ROLES = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN'];

/**
 * GET /api/users
 * 
 * List users with pagination, filtering, and tenant-scoping
 * 
 * Security features:
 * - Tenant-scoping: tenantId derived from authenticated user record (not client-provided)
 * - RBAC: Only authorized roles can access; CLIENTE_USER role blocked
 * - Zod validation: Query parameters validated strictly (page, pageSize, search, sort)
 * - No sensitive fields: response excludes passwordHash, tokens
 * - Audit logging: Records access attempt with page/pageSize/search (no PII values)
 * - Pagination: Safe limits (max 100 per page)
 * - SQL injection prevention: Using Prisma parameterized queries
 * 
 * @param request - NextRequest object containing query parameters and session headers
 * @returns JSON response with user list, pagination metadata
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. AUTHENTICATION: Verify user is authenticated
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userTenantId = request.headers.get('x-tenant-id');

    if (!userId) {
      return NextResponse.json(
        errorResponse('Não autenticado'),
        { status: 401 }
      );
    }

    // 2. AUTHORIZATION: Verify user has required role
    if (!ALLOWED_ROLES.includes(userRole || '')) {
      // Log RBAC rejection attempt
      try {
        await logAuditEvent({
          userId,
          tenantId: userTenantId || 'unknown',
          action: 'users.list.denied',
          entity: 'users',
          entityId: 'bulk',
          metadata: { reason: 'insufficient_role', userRole },
          maskPii: false,
        });
      } catch (auditErr) {
        console.warn('[AUDIT] Failed to log RBAC denial:', auditErr);
      }

      return NextResponse.json(
        errorResponse('Acesso negado: papel insuficiente'),
        { status: 403 }
      );
    }

    // 3. TENANT VALIDATION: Get user record from DB to ensure tenantId is valid
    const authenticatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        tenantId: true,
        role: true,
        email: true,
      },
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        errorResponse('Usuário não encontrado'),
        { status: 403 }
      );
    }

    // 4. QUERY VALIDATION: Parse and validate query parameters using Zod
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const parsedQuery = UsersQuerySchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros de query inválidos',
          details: parsedQuery.error.format(),
        },
        { status: 400 }
      );
    }

    const { page, pageSize, search, sortBy, sortDir, roleFilter } = parsedQuery.data;

    // 5. BUILD WHERE CLAUSE: Tenant-scoped query (IDOR prevention)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // TENANT SCOPING: Only SUPERADMIN sees cross-tenant users
    if (userRole !== 'SUPERADMIN') {
      where.tenantId = authenticatedUser.tenantId;
    }

    // ROLE FILTERING: Optional role filter (whitelisted values via Zod)
    if (roleFilter) {
      where.role = roleFilter;
    }

    // SEARCH: Case-insensitive search on email/firstName/lastName
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 6. EXECUTE QUERY: Fetch users with pagination and safe field selection
    const skip = (page - 1) * pageSize;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    orderBy[sortBy] = sortDir;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          tenantId: true,
          // IMPORTANT: NEVER include passwordHash, tokens, or sensitive fields
        },
        orderBy,
      }),
      prisma.user.count({ where }),
    ]);

    // 7. AUDIT LOGGING: Log the access without PII values
    try {
      await logAuditEvent({
        userId: authenticatedUser.id,
        tenantId: authenticatedUser.tenantId || 'global',
        action: 'users.list',
        entity: 'users',
        entityId: 'bulk',
        metadata: {
          page,
          pageSize,
          hasSearch: !!search,
          roleFilter: roleFilter || null,
          resultCount: users.length,
          totalCount: total,
          durationMs: Date.now() - startTime,
        },
        maskPii: false, // Meta fields are safe, no PII values
      });
    } catch (auditErr) {
      // IMPORTANT: Audit failure should NOT block response
      console.warn('[AUDIT] Failed to log users.list:', auditErr);
    }

    // 8. RETURN RESPONSE: Paginated user data
    return NextResponse.json(
      paginatedResponse(users, total, page, pageSize),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    
    try {
      // Attempt to audit the error
      const userId = request.headers.get('x-user-id');
      const userTenantId = request.headers.get('x-tenant-id');
      if (userId) {
        await logAuditEvent({
          userId,
          tenantId: userTenantId || 'unknown',
          action: 'users.list.error',
          entity: 'users',
          entityId: 'bulk',
          metadata: { errorMessage: error instanceof Error ? error.message : String(error) },
          maskPii: false,
        });
      }
    } catch (auditErr) {
      console.warn('[AUDIT] Failed to log error:', auditErr);
    }

    return NextResponse.json(
      errorResponse('Erro ao buscar usuários'),
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create new user
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userTenantId = request.headers.get('x-tenant-id');

    if (!userId) {
      return NextResponse.json(
        errorResponse('Não autenticado'),
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('Dados inválidos'),
        { status: 400 }
      );
    }

    const data: CreateUserInput = validation.data;

    // RBAC: Only SUPERADMIN, OPERADOR can create users
    if (!['SUPERADMIN', 'OPERADOR'].includes(userRole || '')) {
      return NextResponse.json(
        errorResponse('Sem permissão para criar usuários'),
        { status: 403 }
      );
    }

    // Ensure non-SUPERADMIN users can only create users in their tenant
    if (userRole !== 'SUPERADMIN') {
      data.tenantId = userTenantId || undefined;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        errorResponse('Usuário com este email já existe'),
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        tenantId: data.tenantId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        tenantId: true,
      },
    });

    return NextResponse.json(
      successResponse(newUser, 'Usuário criado com sucesso'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      errorResponse('Erro ao criar usuário'),
      { status: 500 }
    );
  }
}
