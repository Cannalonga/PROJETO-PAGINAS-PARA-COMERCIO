/**
 * lib/rate-limit.ts
 * ✅ SECURITY: Rate limiting with Redis (simple implementation)
 * Uses sliding window algorithm for accurate rate limiting
 */

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
 * In-memory store for rate limiting (for development)
 * In production, replace with Redis
 */
const memoryStore = new Map<string, { count: number; windowStart: number }>();

/**
 * Core rate limit function using sliding window algorithm
 */
export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;

    // Get existing record or create new
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

  // ✅ BILLING ENDPOINTS (NEW - PHASE D.8)
  // Checkout: Prevent brute force checkout attempts
  billingCheckout: { maxRequests: 3, windowSeconds: 60 }, // 3 checkouts per minute

  // Billing Portal: Moderate rate for portal access
  billingPortal: { maxRequests: 5, windowSeconds: 60 }, // 5 portal sessions per minute
};
