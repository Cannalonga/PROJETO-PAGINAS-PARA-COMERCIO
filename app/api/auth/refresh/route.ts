import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

interface RefreshTokenRequest {
  token: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = 24 * 60 * 60; // 24 hours

// Decode JWT without verification (for reading payload)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeToken(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

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

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();

  try {
    logger.info(
      {
        requestId,
        path: request.nextUrl.pathname,
        method: request.method,
      },
      'Token refresh request received',
    );

    const body = (await request.json()) as RefreshTokenRequest;
    const { token } = body;

    if (!token) {
      logger.warn({ requestId }, 'Missing token in refresh request');
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 },
      );
    }

    // Decode the token
    const decoded = decodeToken(token);
    if (!decoded) {
      logger.warn({ requestId }, 'Invalid token format');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 },
      );
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      logger.warn({ requestId }, 'Token is expired');
      return NextResponse.json(
        { error: 'Token is expired' },
        { status: 401 },
      );
    }

    // Generate new token
    const newToken = createToken(
      {
        userId: decoded.userId,
        email: decoded.email,
        tenantId: decoded.tenantId,
        role: decoded.role,
      },
      JWT_SECRET,
      JWT_EXPIRATION,
    );

    logger.info(
      {
        requestId,
        userId: decoded.userId,
      },
      'Token refreshed successfully',
    );

    const res = NextResponse.json(
      { token: newToken },
      { status: 200 },
    );

    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Token refresh endpoint error',
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
