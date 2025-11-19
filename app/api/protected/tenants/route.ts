import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const userId = request.headers.get('x-user-id');

  try {
    if (!userId) {
      logger.warn({ requestId }, 'Missing userId header');
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    logger.info({ requestId, userId }, 'Fetching tenants for user');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        tenantId: true,
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
            status: true,
            logoUrl: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      logger.warn({ requestId, userId }, 'User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    logger.info({ requestId, userId }, 'Tenants fetched successfully');

    const res = NextResponse.json(user.tenant, { status: 200 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching tenants',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface CreateTenantRequest {
  name: string;
  slug: string;
  email: string;
  phone?: string;
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const userId = request.headers.get('x-user-id');

  try {
    if (!userId) {
      logger.warn({ requestId }, 'Missing userId header');
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const body = (await request.json()) as CreateTenantRequest;
    const { name, slug, email, phone } = body;

    // Validate input
    if (!name || !slug || !email) {
      logger.warn({ requestId }, 'Missing required fields');
      return NextResponse.json(
        { error: 'name, slug, and email are required' },
        { status: 400 },
      );
    }

    logger.info({ requestId, userId, slug }, 'Creating new tenant');

    // Check if slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      logger.warn({ requestId, slug }, 'Tenant slug already exists');
      return NextResponse.json(
        { error: 'Tenant slug already exists' },
        { status: 409 },
      );
    }

    const newTenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        email,
        phone,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    logger.info({ requestId, tenantId: newTenant.id }, 'Tenant created successfully');

    const res = NextResponse.json(newTenant, { status: 201 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error creating tenant',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
