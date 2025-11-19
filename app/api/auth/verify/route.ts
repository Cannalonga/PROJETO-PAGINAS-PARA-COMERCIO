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

interface VerifyTokenRequest {
  token: string;
}

interface VerifyTokenResponse {
  valid: boolean;
  userId?: string;
  email?: string;
  tenantId?: string;
  role?: string;
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
      'Token verification request received',
    );

    const body = (await request.json()) as VerifyTokenRequest;
    const { token } = body;

    if (!token) {
      logger.warn({ requestId }, 'Missing token in verification request');
      return NextResponse.json(
        { valid: false } as VerifyTokenResponse,
        { status: 200 },
      );
    }

    // Verify token signature
    if (!verifyTokenSignature(token, JWT_SECRET)) {
      logger.warn({ requestId }, 'Token signature verification failed');
      return NextResponse.json(
        { valid: false } as VerifyTokenResponse,
        { status: 200 },
      );
    }

    // Decode the token
    const decoded = decodeToken(token);
    if (!decoded) {
      logger.warn({ requestId }, 'Token decode failed');
      return NextResponse.json(
        { valid: false } as VerifyTokenResponse,
        { status: 200 },
      );
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      logger.warn({ requestId }, 'Token is expired');
      return NextResponse.json(
        { valid: false } as VerifyTokenResponse,
        { status: 200 },
      );
    }

    logger.info(
      {
        requestId,
        userId: decoded.userId,
      },
      'Token verified successfully',
    );

    const response: VerifyTokenResponse = {
      valid: true,
      userId: decoded.userId,
      email: decoded.email,
      tenantId: decoded.tenantId,
      role: decoded.role,
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
      'Token verification endpoint error',
    );

    return NextResponse.json(
      { valid: false } as VerifyTokenResponse,
      { status: 500 },
    );
  }
}
