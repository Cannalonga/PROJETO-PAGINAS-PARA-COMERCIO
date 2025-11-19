import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = request.headers.get('x-tenant-id');

  try {
    if (!tenantId) {
      logger.warn({ requestId }, 'Missing tenantId header');
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    logger.info({ requestId, tenantId }, 'Fetching users for tenant');

    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    logger.info({ requestId, count: users.length }, 'Users fetched successfully');

    const res = NextResponse.json(users, { status: 200 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching users',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'CLIENTE_ADMIN' | 'CLIENTE_USER' | 'OPERADOR';
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = request.headers.get('x-tenant-id');

  try {
    if (!tenantId) {
      logger.warn({ requestId }, 'Missing tenantId header');
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const body = (await request.json()) as CreateUserRequest;
    const { email, firstName, lastName, password, role } = body;

    // Validate input
    if (!email || !firstName || !lastName || !password || !role) {
      logger.warn({ requestId }, 'Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 },
      );
    }

    logger.info({ requestId, tenantId, email }, 'Creating new user');

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email, tenantId },
    });

    if (existingUser) {
      logger.warn({ requestId, email }, 'User already exists');
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 },
      );
    }

    // Import password utilities here to avoid circular dependency
    const { hashPassword } = await import('@/lib/password');
    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role,
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
      },
    });

    logger.info({ requestId, userId: newUser.id }, 'User created successfully');

    const res = NextResponse.json(newUser, { status: 201 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error creating user',
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
