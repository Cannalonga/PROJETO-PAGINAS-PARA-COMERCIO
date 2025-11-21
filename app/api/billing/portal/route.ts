/**
 * POST /api/billing/portal
 * 
 * Create a Stripe Customer Portal session for self-service billing management
 * 
 * ✅ SECURITY:
 * - withAuthHandler enforces authentication
 * - RBAC: Only OWNER/ADMIN can access
 * - Uses tenant from session
 * - Redirects to Stripe-hosted portal (secure)
 * - Rate limited: 5/min (PHASE D.8)
 * 
 * Request body: {} (empty)
 * 
 * Response:
 * {
 *   "url": "https://billing.stripe.com/session/..."
 * }
 */

import { NextResponse } from "next/server";
import { withAuthHandler } from "@/lib/auth/with-auth-handler";
import { BillingService } from "@/services/billing-service";
import { rateLimit, rateLimitProfiles } from "@/lib/rate-limit";
import type { AuthContext } from "@/lib/auth/with-auth-handler";

/**
 * POST /api/billing/portal
 * 
 * Creates a Stripe Customer Portal session for tenant self-service billing
 */
export const POST = withAuthHandler(async (context: AuthContext) => {
  const { session, tenant, req } = context;
  try {
    // ✅ SECURITY: Rate limiting (5/min per user)
    const rateLimitKey = `billing-portal:${session.email}`;
    const rateLimitResult = await rateLimit(
      rateLimitKey,
      rateLimitProfiles.billingPortal
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Too many portal requests. Please wait before trying again.",
          code: "RATE_LIMITED",
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter),
            "X-RateLimit-Limit": String(rateLimitProfiles.billingPortal.maxRequests),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.resetAt),
          },
        }
      );
    }

    // ✅ SECURITY: RBAC Check - only OWNER/ADMIN can access billing portal
    const userRole = session.role || "";
    const isAdmin = userRole === "OWNER" || userRole === "ADMIN" || userRole === "CLIENTE_ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only tenant owners or admins can access billing portal",
          code: "INSUFFICIENT_PERMISSIONS",
        },
        { status: 403 }
      );
    }

    // ✅ SECURITY: Get return URL from request origin
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;
    if (!origin) {
      return NextResponse.json(
        {
          error: "Configuration Error",
          message: "Cannot determine application URL",
          code: "CONFIG_ERROR",
        },
        { status: 500 }
      );
    }

    const returnUrl = `${origin}/billing`;

    // Create portal session
    const portalSession = await BillingService.createCustomerPortalSession(
      tenant.id,
      returnUrl
    );

    return NextResponse.json(
      {
        url: portalSession.url,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": String(rateLimitProfiles.billingPortal.maxRequests),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.resetAt),
        },
      }
    );
  } catch (error: any) {
    // ✅ SECURITY: Don't expose internal error details in production
    const isDev = process.env.NODE_ENV === "development";

    console.error("[BILLING] Portal error:", error);

    if (error.code === "VALIDATION_ERROR") {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }

    if (error.code === "NOT_FOUND") {
      return NextResponse.json(
        {
          error: "Not Found",
          message: error.message,
          code: error.code,
        },
        { status: 404 }
      );
    }

    if (error.code === "STRIPE_ERROR") {
      return NextResponse.json(
        {
          error: "Payment Service Error",
          message: "Failed to create portal session",
          code: "STRIPE_ERROR",
          ...(isDev && { details: error.message }),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        code: "INTERNAL_ERROR",
        ...(isDev && { details: error.message }),
      },
      { status: 500 }
    );
  }
});
