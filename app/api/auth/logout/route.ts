import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();

  try {
    logger.info(
      {
        requestId,
        path: request.nextUrl.pathname,
        method: request.method,
      },
      'Logout request received',
    );

    // Clear authentication token (client-side would handle this)
    const res = NextResponse.json(
      { message: 'Logged out successfully' },
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
      'Logout endpoint error',
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
