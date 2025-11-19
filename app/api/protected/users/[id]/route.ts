import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = request.headers.get('x-tenant-id');
  const userId = params.id;

  try {
    if (!tenantId) {
      logger.warn({ requestId }, 'Missing tenantId header');
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    logger.info({ requestId, tenantId, userId }, 'Fetching user details');

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.warn({ requestId, userId }, 'User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    logger.info({ requestId, userId }, 'User fetched successfully');

    const res = NextResponse.json(user, { status: 200 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        tenantId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching user',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  role?: 'CLIENTE_ADMIN' | 'CLIENTE_USER' | 'OPERADOR';
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = request.headers.get('x-tenant-id');
  const userId = params.id;

  try {
    if (!tenantId) {
      logger.warn({ requestId }, 'Missing tenantId header');
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    logger.info({ requestId, tenantId, userId }, 'Updating user');

    const body = (await request.json()) as UpdateUserRequest;

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...body,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info({ requestId, userId }, 'User updated successfully');

    const res = NextResponse.json(user, { status: 200 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        tenantId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error updating user',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = request.headers.get('x-tenant-id');
  const userId = params.id;

  try {
    if (!tenantId) {
      logger.warn({ requestId }, 'Missing tenantId header');
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    logger.info({ requestId, tenantId, userId }, 'Deleting user');

    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info({ requestId, userId }, 'User deleted successfully');

    const res = NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 },
    );
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        tenantId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error deleting user',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
