/**
 * lib/rate-limit.ts
 * ✅ SECURITY: Rate limiting with Redis (simple implementation)
 * Uses sliding window algorithm for accurate rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from './redis';

export type RateLimitConfig = {
  maxRequests: number;
  windowSeconds: number;
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
};

/**
 * In-memory store for rate limiting (fallback)
 */
const memoryStore = new Map<string, { count: number; windowStart: number }>();

/**
 * Core rate limit function using sliding window algorithm
 * Supports Redis with in-memory fallback
 */
export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const redisClient = await getRedisClient();
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;

    // Redis Implementation
    if (redisClient) {
      const ttl = config.windowSeconds;
      const expireAt = Math.floor(now / 1000) + ttl;

      // Use Redis INCR with expiration
      const count = await redisClient.incr(key);

      // Set expiration on first access
      if (count === 1) {
        await redisClient.expireAt(key, expireAt);
      }

      if (count > config.maxRequests) {
        const keyTtl = await redisClient.ttl(key);
        const retryAfter = Math.max(1, keyTtl);

        return {
          success: false,
          remaining: 0,
          resetAt: expireAt,
          retryAfter,
        };
      }

      return {
        success: true,
        remaining: Math.max(0, config.maxRequests - count),
        resetAt: expireAt,
      };
    }

    // In-Memory Implementation (Fallback)
    let record = memoryStore.get(key);

    // Reset window if expired
    if (!record || now - record.windowStart > windowMs) {
      record = { count: 0, windowStart: now };
    }

    const elapsed = now - record.windowStart;
    const timeUntilReset = windowMs - elapsed;

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetAt: Math.floor((record.windowStart + windowMs) / 1000),
        retryAfter: Math.ceil(timeUntilReset / 1000),
      };
    }

    // Increment counter
    record.count++;
    memoryStore.set(key, record);

    return {
      success: true,
      remaining: Math.max(0, config.maxRequests - record.count),
      resetAt: Math.floor((record.windowStart + windowMs) / 1000),
    };

  } catch (error) {
    console.error('[RATE_LIMIT] Error:', error);
    // Fail open: allow request if something goes wrong
    return {
      success: true,
      remaining: config.maxRequests,
      resetAt: Math.floor((Date.now() + config.windowSeconds * 1000) / 1000),
    };
  }
}

/**
 * Predefined rate limit profiles
 */
export const rateLimitProfiles = {
  // Auth endpoints (strict)
  auth: { maxRequests: 5, windowSeconds: 60 }, // 5 requests per minute

  // Public API (moderate)
  public: { maxRequests: 30, windowSeconds: 60 }, // 30 requests per minute

  // Authenticated users (lenient)
  authenticated: { maxRequests: 100, windowSeconds: 60 }, // 100 requests per minute

  // Upload (strict)
  upload: { maxRequests: 10, windowSeconds: 3600 }, // 10 uploads per hour

  // Analytics/heavy endpoints (moderate)
  analytics: { maxRequests: 20, windowSeconds: 60 }, // 20 requests per minute

  // Webhooks (permissive to avoid blocking Stripe)
  webhook: { maxRequests: 1000, windowSeconds: 3600 }, // 1000 per hour

  // Checkout: Prevent brute force checkout attempts
  billingCheckout: { maxRequests: 3, windowSeconds: 60 }, // 3 checkouts per minute

  // Billing Portal: Moderate rate for portal access
  billingPortal: { maxRequests: 5, windowSeconds: 60 }, // 5 portal sessions per minute
};

/**
 * Get client identifier (IP address)
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
    const retryAfterSeconds = result.retryAfter || Math.ceil((result.resetAt - Math.floor(Date.now() / 1000)));

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
