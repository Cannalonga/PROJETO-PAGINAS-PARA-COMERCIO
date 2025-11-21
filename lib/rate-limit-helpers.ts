/**
 * lib/rate-limit-helpers.ts
 * ✅ SECURITY: Helper functions for enforcing rate limits in route handlers
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimitProfiles, type RateLimitConfig } from './rate-limit';

/**
 * Get client identifier (IP address)
 * Supports X-Forwarded-For header (for proxied requests)
 */
export function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';
  return ip;
}

/**
 * Apply rate limit to a request
 * Returns error response if limit exceeded, otherwise returns null
 */
export async function enforceRateLimit(
  req: NextRequest,
  routeKey: string,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(req);
  const key = `${identifier}:${routeKey}`;

  const result = await rateLimit(key, config);

  if (!result.success) {
    const retryAfterSeconds = Math.ceil((result.resetAt - Math.floor(Date.now() / 1000)));
    
    const res = new NextResponse(
      JSON.stringify({
        error: 'Muitas requisições. Tente novamente mais tarde.',
        statusCode: 429,
      }),
      { status: 429 }
    );

    res.headers.set('Retry-After', String(retryAfterSeconds));
    res.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    res.headers.set('X-RateLimit-Remaining', '0');
    res.headers.set('X-RateLimit-Reset', String(result.resetAt));

    return res;
  }

  return null;
}

/**
 * Apply predefined rate limit profile
 */
export async function enforceRateLimitProfile(
  req: NextRequest,
  routeKey: string,
  profile: keyof typeof rateLimitProfiles
): Promise<NextResponse | null> {
  return enforceRateLimit(req, routeKey, rateLimitProfiles[profile]);
}

/**
 * Apply rate limit by user ID (for authenticated endpoints)
 */
export async function enforceUserRateLimit(
  userId: string,
  routeKey: string,
  config: RateLimitConfig
): Promise<RateLimitResult | null> {
  const key = `user:${userId}:${routeKey}`;
  const result = await rateLimit(key, config);

  if (!result.success) {
    return result;
  }

  return null;
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
};
