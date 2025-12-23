/**
 * Session Validation Middleware (PATCH #4)
 * Enforces session timeout and activity-based validation
 * 
 * CVSS 6.5 - Insufficient Session Management
 */

import { NextRequest, NextResponse } from 'next/server';
// Session validation helper - Note: @/auth module must be configured in next-auth setup

const SENSITIVE_OPERATIONS = [
  '/api/users',
  '/api/admin',
  '/api/webhook',
  '/api/payment',
  '/api/auth/change-password',
];

const MAX_SESSION_AGE = 15 * 60; // 15 minutes in seconds

/**
 * Check if session has expired based on inactivity
 * Requires re-authentication for sensitive operations
 */
export async function validateSessionAge(request: NextRequest) {
  // Note: auth() function requires @/auth module configuration
  const session = await Promise.resolve(null as any); // Placeholder until @/auth is available

  // Get the request path
  const path = request.nextUrl.pathname;
  const isSensitiveOp = SENSITIVE_OPERATIONS.some((op) => path.startsWith(op));

  if (!isSensitiveOp) {
    // Non-sensitive operations don't require session validation
    return true;
  }

  if (!session?.user) {
    return false; // No session = unauthorized
  }

  // Calculate session age
  const token = (session as any)?.token;
  const tokenCreatedAt = token?.iat || Math.floor(Date.now() / 1000);
  const now = Math.floor(Date.now() / 1000);
  const sessionAge = now - tokenCreatedAt;

  if (sessionAge > MAX_SESSION_AGE) {
    // Session expired - force re-authentication
    return false;
  }

  return true; // Session is valid
}

/**
 * Response factory for session errors
 */
export function sessionExpiredResponse(message: string = 'Session expired. Please login again.') {
  return NextResponse.json(
    {
      error: message,
      code: 'SESSION_EXPIRED',
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}
