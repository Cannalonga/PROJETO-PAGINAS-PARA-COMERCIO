import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from './redis';

/**
 * Hybrid rate limiter: Uses Redis when available, falls back to in-memory
 * 
 * - Redis: Distributed, multi-instance support (production)
 * - In-memory: Fast, local-only (development, edge)
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Get rate limit key from request
 * Use combination of IP + user ID if authenticated
 */
function getRateLimitKey(request: NextRequest, prefix = 'global'): string {
  const userIdHeader = request.headers.get('x-user-id');
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (userIdHeader) {
    return `${prefix}:user:${userIdHeader}`;
  }
  return `${prefix}:ip:${ip}`;
}

/**
 * Rate limiter middleware (Redis-backed with in-memory fallback)
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @param prefix - Key prefix for this limiter
 */
export function createRateLimiter(
  maxRequests: number = 60,
  windowMs: number = 60 * 1000, // 1 minute default
  prefix: string = 'rate-limit'
) {
  return async (request: NextRequest) => {
    try {
      const key = getRateLimitKey(request, prefix);
      const now = Date.now();
      const redisClient = await getRedisClient();

      // Try Redis first, fall back to in-memory
      if (redisClient) {
        return await checkRedisLimit(
          redisClient,
          key,
          maxRequests,
          windowMs,
          now
        );
      }

      // Fallback to in-memory store
      return checkMemoryLimit(key, maxRequests, windowMs, now);
    } catch (error) {
      console.error('Rate limiter error:', error);
      return { allowed: true }; // Fail open on error
    }
  };
}

/**
 * Check rate limit using Redis (atomic SCRIPT EVAL)
 */
async function checkRedisLimit(
  redisClient: any,
  key: string,
  maxRequests: number,
  windowMs: number,
  now: number
) {
  try {
    // Use Redis INCR with expiration for sliding window
    // This is atomic and safe for distributed systems
    const ttl = Math.ceil(windowMs / 1000);
    const expireAt = Math.floor(now / 1000) + ttl;

    // Get current count
    const count = await redisClient.incr(key);

    // Set expiration on first access
    if (count === 1) {
      await redisClient.expireAt(key, expireAt);
    }

    if (count > maxRequests) {
      // Get TTL to calculate retry-after
      const keyTtl = await redisClient.ttl(key);
      const retryAfter = Math.max(1, keyTtl);

      return {
        allowed: false,
        remaining: 0,
        retryAfter,
        resetTime: new Date((expireAt + 1) * 1000).toISOString(),
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - count,
    };
  } catch (error) {
    console.error('Redis limit check error:', error);
    // Fail open - allow request if Redis fails
    return { allowed: true };
  }
}

/**
 * Check rate limit using in-memory store (fallback)
 */
function checkMemoryLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  now: number
) {
  const entry = store.get(key);

  // Initialize or check if window expired
  if (!entry || now > entry.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // Increment counter
  entry.count++;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      resetTime: new Date(entry.resetTime).toISOString(),
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
  };
}

/**
 * Cleanup old entries from in-memory store (call periodically)
 */
export function cleanupRateLimiter() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
      cleaned++;
    }
  }
  
  return cleaned;
}

// Run cleanup every 5 minutes (in-memory only, Redis handles its own TTL)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cleaned = cleanupRateLimiter();
    if (cleaned > 0 && process.env.NODE_ENV !== 'production') {
      console.log(`[RateLimit] Cleaned ${cleaned} expired entries`);
    }
  }, 5 * 60 * 1000);
}

/**
 * Express-like middleware that returns NextResponse
 * NOTE: This needs to be called from an async context
 */
export function rateLimitResponse(
  limiter: ReturnType<typeof createRateLimiter>
): (request: NextRequest) => Promise<NextResponse | null> {
  return async (request: NextRequest) => {
    const result = await limiter(request);
    
    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Retry after ${result.retryAfter} seconds`,
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter || 60),
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': String(result.remaining || 0),
            'X-RateLimit-Reset': result.resetTime || new Date().toISOString(),
          },
        }
      );
    }
    
    return null; // Allowed - continue
  };
}

/**
 * Preset limiters for common scenarios
 */
export const rateLimiters = {
  // Auth endpoints: 5 attempts per 15 minutes
  auth: createRateLimiter(5, 15 * 60 * 1000, 'auth'),
  
  // API endpoints: 100 per minute
  api: createRateLimiter(100, 60 * 1000, 'api'),
  
  // Upload endpoints: 10 per hour
  upload: createRateLimiter(10, 60 * 60 * 1000, 'upload'),
  
  // Stripe webhooks: 500 per hour (relaxed)
  webhook: createRateLimiter(500, 60 * 60 * 1000, 'webhook'),
};
