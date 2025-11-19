import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/password';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = 24 * 60 * 60; // 24 hours

// Simple JWT encoding helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createToken(payload: Record<string, any>, secret: string, expiresIn: number): string {
  const crypto = require('crypto');
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = { ...payload, iat: now, exp: now + expiresIn };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

interface LoginRequest {
  email: string;
  password: string;
  tenantId: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();

  try {
    logger.info(
      {
        requestId,
        path: request.nextUrl.pathname,
        method: request.method,
      },
      'Login request received',
    );

    const body = (await request.json()) as LoginRequest;
    const { email, password, tenantId } = body;

    // Validate input
    if (!email || !password || !tenantId) {
      logger.warn({ requestId, email }, 'Missing required fields');
      return NextResponse.json(
        { error: 'Email, password, and tenantId are required' },
        { status: 400 },
      );
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        role: true,
        tenantId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      logger.warn({ requestId, email }, 'User not found or inactive');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn({ requestId, email }, 'Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Generate JWT token
    const token = createToken(
      {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      },
      JWT_SECRET,
      JWT_EXPIRATION,
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info({ requestId, email, userId: user.id }, 'User logged in successfully');

    const response: LoginResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role,
        tenantId: user.tenantId || '',
      },
    };

    const res = NextResponse.json(response, { status: 200 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Login endpoint error',
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
