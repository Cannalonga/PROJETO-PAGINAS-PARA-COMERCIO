import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateUserSchema, type CreateUserInput } from '@/lib/validations';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/helpers';
import * as bcrypt from 'bcryptjs';
import { withAuth, withRole, getTenantIdFromSession } from '@/lib/middleware';

/**
 * GET /api/users
 * SECURITY: Requires authentication + (SUPERADMIN or OPERADOR)
 * List users with pagination and filtering
 */
export async function GET(request: NextRequest) {
  // ✅ SECURITY: Validate authentication
  const authResponse = await withAuth(request);
  if (authResponse.status !== 200) {
    return authResponse;
  }

  // ✅ SECURITY: Validate RBAC
  const rbacResponse = await withRole(['SUPERADMIN', 'OPERADOR'])(request);
  if (rbacResponse.status !== 200) {
    return rbacResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
    const tenantId = searchParams.get('tenantId');
    const role = searchParams.get('role');

    // Get user from headers (set by auth middleware)
    const userRole = request.headers.get('x-user-role');
    const userTenantId = request.headers.get('x-tenant-id');

    // Build where clause with tenant scoping
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // ✅ SECURITY: IDOR Prevention - SUPERADMIN sees all users, others scoped to tenant
    if (userRole !== 'SUPERADMIN') {
      // Non-SUPERADMIN: can only see users in their own tenant
      where.tenantId = userTenantId;
    } else if (tenantId) {
      // SUPERADMIN with tenantId filter
      where.tenantId = tenantId;
    }

    // ✅ SECURITY: Validate role parameter if provided
    if (role && ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER'].includes(role)) {
      where.role = role;
    }

    // Exclude soft-deleted users
    where.deletedAt = null;

    const skip = (page - 1) * pageSize;

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
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(
      paginatedResponse(users, total, page, pageSize),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      errorResponse('Erro ao buscar usuários'),
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * SECURITY: Requires authentication + (SUPERADMIN or OPERADOR)
 * Create new user with proper password hashing
 */
export async function POST(request: NextRequest) {
  // ✅ SECURITY: Validate authentication
  const authResponse = await withAuth(request);
  if (authResponse.status !== 200) {
    return authResponse;
  }

  // ✅ SECURITY: Validate RBAC
  const rbacResponse = await withRole(['SUPERADMIN', 'OPERADOR'])(request);
  if (rbacResponse.status !== 200) {
    return rbacResponse;
  }

  try {
    const userRole = request.headers.get('x-user-role');
    const userTenantId = request.headers.get('x-tenant-id');

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

    // ✅ SECURITY: Tenant scoping - non-SUPERADMIN can only create users in their tenant
    if (userRole !== 'SUPERADMIN') {
      if (data.tenantId && data.tenantId !== userTenantId) {
        // Attempting IDOR - trying to create user in different tenant
        console.warn(`[SECURITY] IDOR attempt: user tried to create user in tenantId=${data.tenantId} but owns=${userTenantId}`);
        return NextResponse.json(
          errorResponse('Sem permissão para criar usuários em outro tenant'),
          { status: 403 }
        );
      }
      data.tenantId = userTenantId || undefined;
    }

    // Check if user already exists (consider soft-deleted users)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        deletedAt: null, // Only check non-deleted users
      },
    });

    if (existingUser) {
      return NextResponse.json(
        errorResponse('Usuário com este email já existe'),
        { status: 409 }
      );
    }

    // ✅ SECURITY: Use bcrypt with rounds=14+ for password hashing (not 12)
    const hashedPassword = await bcrypt.hash(data.password, 14);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'CLIENTE_USER',
        tenantId: data.tenantId,
        isActive: true,
        emailVerified: false,
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
