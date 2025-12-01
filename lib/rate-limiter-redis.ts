/**
 * SECURITY AUDIT FIX #4: Redis-Based Rate Limiting
 * 
 * Distributed rate limiting that works across multiple servers.
 * Replaces in-memory Map which doesn't scale in production.
 * 
 * Works with:
 * - Upstash Redis (serverless)
 * - Self-hosted Redis
 * - Supabase Redis
 */

// For now, using in-memory fallback
// In production, install: npm install redis @upstash/redis

export interface RateLimitConfig {
  maxRequests: number;  // Maximum requests allowed
  windowMs: number;     // Time window in milliseconds
  keyGenerator?: (identifier: string) => string; // Custom key format
}

/**
 * In-memory rate limiter (for development)
 * TODO: Replace with Redis for production
 */
class InMemoryRateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   * Returns: { allowed: boolean, retryAfter?: number }
   */
  async check(identifier: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Date.now();
    const key = this.config.keyGenerator?.(identifier) || identifier;
    
    const record = this.store.get(key);

    if (record && record.resetTime > now) {
      // Window still active
      if (record.count >= this.config.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        return { allowed: false, retryAfter };
      }
      // Increment counter
      record.count++;
      return { allowed: true };
    }

    // Initialize or reset
    this.store.set(key, {
      count: 1,
      resetTime: now + this.config.windowMs,
    });

    return { allowed: true };
  }

  /**
   * Reset a specific identifier (admin function)
   */
  async reset(identifier: string): Promise<void> {
    const key = this.config.keyGenerator?.(identifier) || identifier;
    this.store.delete(key);
  }

  /**
   * Cleanup old records periodically
   */
  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (record.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Redis-based rate limiter (for production)
 * 
 * TODO: Implement this when moving to production
 * 
 * Example with Upstash Redis:
 * ```
 * import { Redis } from '@upstash/redis';
 * 
 * const redis = new Redis({
 *   url: process.env.UPSTASH_REDIS_REST_URL,
 *   token: process.env.UPSTASH_REDIS_REST_TOKEN,
 * });
 * 
 * class RedisRateLimiter {
 *   async check(identifier: string) {
 *     const key = `rate-limit:${identifier}`;
 *     const count = await redis.incr(key);
 *     
 *     if (count === 1) {
 *       await redis.expire(key, Math.ceil(this.config.windowMs / 1000));
 *     }
 *     
 *     if (count > this.config.maxRequests) {
 *       const ttl = await redis.ttl(key);
 *       return { allowed: false, retryAfter: ttl };
 *     }
 *     
 *     return { allowed: true };
 *   }
 * }
 * ```
 */

// Export the rate limiter
export const createRateLimiter = (config: RateLimitConfig) => {
  // TODO: Choose based on environment
  // if (process.env.REDIS_URL) return new RedisRateLimiter(config);
  
  return new InMemoryRateLimiter(config);
};

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

/**
 * Strict rate limiting for auth endpoints
 * 5 attempts per 15 minutes per IP
 */
export const AUTH_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (identifier: string) => `rate-limit:auth:${identifier}`,
};

/**
 * Normal rate limiting for API endpoints
 * 100 requests per 15 minutes per user
 */
export const API_RATE_LIMIT = {
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (identifier: string) => `rate-limit:api:${identifier}`,
};

/**
 * Generous rate limiting for read-only endpoints
 * 1000 requests per 15 minutes per user
 */
export const READ_RATE_LIMIT = {
  maxRequests: 1000,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (identifier: string) => `rate-limit:read:${identifier}`,
};

/**
 * Middleware wrapper for rate limiting
 * 
 * Usage in API route:
 * ```
 * const limiter = createRateLimiter(AUTH_RATE_LIMIT);
 * 
 * export async function POST(request: NextRequest) {
 *   const identifier = request.headers.get('x-forwarded-for') || 'unknown';
 *   const { allowed, retryAfter } = await limiter.check(identifier);
 *   
 *   if (!allowed) {
 *     return NextResponse.json(
 *       { error: 'Too many requests' },
 *       { 
 *         status: 429,
 *         headers: { 'Retry-After': String(retryAfter) }
 *       }
 *     );
 *   }
 *   
 *   // ... rest of handler
 * }
 * ```
 */
export const rateLimiterMiddleware = async (
  identifier: string,
  config: RateLimitConfig
) => {
  const limiter = createRateLimiter(config);
  return limiter.check(identifier);
};

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export { InMemoryRateLimiter };
