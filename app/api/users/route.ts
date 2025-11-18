import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateUserSchema, type CreateUserInput } from '@/lib/validations';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/helpers';
import * as bcrypt from 'bcryptjs';

/**
 * GET /api/users
 * List users with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
    const tenantId = searchParams.get('tenantId');
    const role = searchParams.get('role');

    // Get user from headers (set by auth middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userTenantId = request.headers.get('x-tenant-id');

    if (!userId) {
      return NextResponse.json(
        errorResponse('Não autenticado'),
        { status: 401 }
      );
    }

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // RBAC: SUPERADMIN sees all users, others see only their tenant
    if (userRole !== 'SUPERADMIN') {
      where.tenantId = userTenantId;
    } else if (tenantId) {
      where.tenantId = tenantId;
    }

    if (role) {
      where.role = role;
    }

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
