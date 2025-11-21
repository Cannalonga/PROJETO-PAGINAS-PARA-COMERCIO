import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, calculatePagination } from '@/utils/helpers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth, withRole } from '@/lib/middleware';

const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'];

/**
 * GET /api/tenants
 * SECURITY: Requires authentication + SUPERADMIN or OPERADOR role
 * Lists all tenants (SUPERADMIN) or just current tenant (OPERADOR)
 */
export async function GET(req: NextRequest) {
  // ✅ SECURITY: Validate authentication
  const authResponse = await withAuth(req);
  if (authResponse.status !== 200) {
    return authResponse;
  }

  // ✅ SECURITY: Validate RBAC
  const rbacResponse = await withRole(['SUPERADMIN', 'OPERADOR'])(req);
  if (rbacResponse.status !== 200) {
    return rbacResponse;
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '10'));
    const statusParam = searchParams.get('status');

    const { skip, take } = calculatePagination(page, pageSize);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    // RBAC: OPERADOR can only see their own tenant
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'SUPERADMIN') {
      where.id = req.headers.get('x-tenant-id');
    }
    
    if (statusParam && VALID_STATUSES.includes(statusParam)) {
      where.status = statusParam;
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          slug: true,
          name: true,
          status: true,
          email: true,
          createdAt: true,
          billingStatus: true,
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json(
      successResponse(
        {
          items: tenants,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
        'Tenants retrieved successfully'
      )
    );
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch tenants'),
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants
 * SECURITY: Requires authentication + SUPERADMIN role only
 * Creates new tenant
 */
export async function POST(req: NextRequest) {
  // ✅ SECURITY: Validate authentication
  const authResponse = await withAuth(req);
  if (authResponse.status !== 200) {
    return authResponse;
  }

  // ✅ SECURITY: Validate RBAC (only SUPERADMIN can create tenants)
  const rbacResponse = await withRole(['SUPERADMIN'])(req);
  if (rbacResponse.status !== 200) {
    return rbacResponse;
  }

  try {
    const body = await req.json();
    const { name, email, phone, address, city, state, zipCode, cnpj } = body;

    // Input validation
    if (!name || !email) {
      return NextResponse.json(
        errorResponse('INVALID_INPUT', 'Name and email are required'),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        errorResponse('INVALID_EMAIL', 'Invalid email format'),
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug || slug.length < 2) {
      return NextResponse.json(
        errorResponse('INVALID_SLUG', 'Tenant name is too short or invalid'),
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return NextResponse.json(
        errorResponse('SLUG_EXISTS', 'A tenant with this name already exists'),
        { status: 409 }
      );
    }

    const tenant = await prisma.tenant.create({
      data: {
        slug,
        name,
        email,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        cnpj: cnpj || null,
      },
    });

    return NextResponse.json(successResponse(tenant, 'Tenant created successfully'), {
      status: 201,
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_SERVER_ERROR', 'Failed to create tenant'),
      { status: 500 }
    );
  }
}
