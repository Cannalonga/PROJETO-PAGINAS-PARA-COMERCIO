import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, calculatePagination } from '@/utils/helpers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'];

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const statusParam = searchParams.get('status');

    const { skip, take } = calculatePagination(page, pageSize);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (statusParam && VALID_STATUSES.includes(statusParam)) {
      where.status = statusParam;
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take,
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, city, state, zipCode, cnpj } = body;

    if (!name || !email) {
      return NextResponse.json(
        errorResponse('INVALID_INPUT', 'Name and email are required'),
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
        phone,
        address,
        city,
        state,
        zipCode,
        cnpj,
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
