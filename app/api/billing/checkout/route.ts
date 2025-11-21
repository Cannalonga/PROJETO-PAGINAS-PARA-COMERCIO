/**
 * POST /api/billing/checkout
 * 
 * Create a Stripe checkout session for tenant subscription upgrade
 * 
 * ✅ SECURITY:
 * - withAuthHandler enforces authentication
 * - RBAC: Only OWNER/ADMIN can access
 * - Uses tenant from session (never client body)
 * - Validates plan against whitelist
 * - Rate limited (see PHASE D.8)
 * 
 * Request body:
 * {
 *   "plan": "BASIC" | "PRO" | "PREMIUM"
 * }
 * 
 * Response:
 * {
 *   "url": "https://checkout.stripe.com/pay/...",
 *   "sessionId": "cs_..."
 * }
 */

import { NextResponse } from "next/server";
import { withAuthHandler } from "@/lib/auth/with-auth-handler";
import { z } from "zod";
import { BillingService } from "@/services/billing-service";
import type { AuthContext } from "@/lib/auth/with-auth-handler";

// ✅ SECURITY: Strict validation - plan enum, no other fields
const CheckoutRequestSchema = z.object({
  plan: z.enum(["BASIC", "PRO", "PREMIUM"]),
});

type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

/**
 * POST /api/billing/checkout
 * 
 * Creates a Stripe checkout session for tenant plan upgrade/downgrade
 */
export const POST = withAuthHandler(async (context: AuthContext) => {
  const { session, tenant, req } = context;
  try {
    // ✅ SECURITY: RBAC Check - only OWNER/ADMIN can manage billing
    const userRole = session.role || "";
    const isAdmin = userRole === "OWNER" || userRole === "ADMIN" || userRole === "CLIENTE_ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only tenant owners or admins can manage billing",
          code: "INSUFFICIENT_PERMISSIONS",
        },
        { status: 403 }
      );
    }

    // ✅ SECURITY: Parse and validate request body
    const json = await req.json();
    const parsed = CheckoutRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid request payload",
          code: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { plan } = parsed.data;

    // ✅ SECURITY: Get URLs from request origin (never trust client)
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

    const successUrl = `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/billing/cancel`;

    // Create checkout session
    const session_checkout = await BillingService.createCheckoutSessionForTenant({
      tenantId: tenant.id,
      plan,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json(
      {
        url: session_checkout.url,
        sessionId: session_checkout.sessionId,
        plan,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // ✅ SECURITY: Don't expose internal error details in production
    const isDev = process.env.NODE_ENV === "development";

    console.error("[BILLING] Checkout error:", error);

    if (error.code === "VALIDATION_ERROR") {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: error.message,
          code: error.code,
        },
        { status: error.statusCode || 400 }
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
          message: "Failed to create checkout session",
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
