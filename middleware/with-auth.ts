import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

// Verify JWT signature
function verifyTokenSignature(token: string, secret: string): boolean {
  try {
    const crypto = require('crypto');
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const encodedHeader = parts[0];
    const encodedPayload = parts[1];
    const signature = parts[2];

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return signature === expectedSignature;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();

  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      logger.warn({ requestId, path: request.nextUrl.pathname }, 'Missing authorization header');
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 },
      );
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.warn({ requestId }, 'Invalid authorization header format');
      return NextResponse.json(
        { error: 'Invalid authorization header format' },
        { status: 401 },
      );
    }

    const token = parts[1];

    // Verify token signature
    if (!verifyTokenSignature(token, JWT_SECRET)) {
      logger.warn({ requestId }, 'Token signature verification failed');
      return NextResponse.json(
        { error: 'Invalid token signature' },
        { status: 401 },
      );
    }

    // Decode the token
    const decoded = decodeToken(token);
    if (!decoded) {
      logger.warn({ requestId }, 'Token decode failed');
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

    logger.debug(
      {
        requestId,
        userId: decoded.userId,
        tenantId: decoded.tenantId,
      },
      'Authentication successful',
    );

    // Store decoded token in headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-tenant-id', decoded.tenantId);
    requestHeaders.set('x-user-role', decoded.role);
    requestHeaders.set('x-correlation-id', requestId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    logger.error(
      {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Auth middleware error',
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const config = {
  matcher: ['/api/protected/:path*', '/dashboard/:path*'],
};
