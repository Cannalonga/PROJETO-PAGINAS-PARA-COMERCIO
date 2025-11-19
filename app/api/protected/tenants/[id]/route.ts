import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const userId = request.headers.get('x-user-id');
  const tenantId = params.id;

  try {
    logger.info({ requestId, userId, tenantId }, 'Fetching tenant details');

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        logoUrl: true,
        customDomain: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!tenant) {
      logger.warn({ requestId, tenantId }, 'Tenant not found');
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    logger.info({ requestId, tenantId }, 'Tenant fetched successfully');

    const res = NextResponse.json(tenant, { status: 200 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching tenant',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface UpdateTenantRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  logoUrl?: string;
  customDomain?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = params.id;

  try {
    logger.info({ requestId, tenantId }, 'Updating tenant');

    const body = (await request.json()) as UpdateTenantRequest;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...body,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        logoUrl: true,
        customDomain: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info({ requestId, tenantId }, 'Tenant updated successfully');

    const res = NextResponse.json(tenant, { status: 200 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error updating tenant',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = params.id;

  try {
    logger.info({ requestId, tenantId }, 'Deleting tenant');

    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    logger.info({ requestId, tenantId }, 'Tenant deleted successfully');

    const res = NextResponse.json(
      { message: 'Tenant deleted successfully' },
      { status: 200 },
    );
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error deleting tenant',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
