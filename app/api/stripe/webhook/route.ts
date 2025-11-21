/**
 * POST /api/stripe/webhook
 * 
 * Stripe webhook endpoint for subscription events
 * 
 * ✅ SECURITY CRITICAL:
 * - Validates Stripe signature using stripe.webhooks.constructEvent
 * - No authentication required (public endpoint)
 * - Maps customerId → tenant using DB lookup (never trusts client)
 * - Handles: subscription.created, subscription.updated, subscription.deleted
 * - Idempotent: safe to replay multiple times
 * - Logs all events for audit trail
 * 
 * Stripe sends these events:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 * 
 * DEPLOYMENT:
 * 1. Configure in Stripe Dashboard → Webhooks
 * 2. Endpoint: https://your-domain.com/api/stripe/webhook
 * 3. Events to receive: customer.subscription.*, invoice.*
 * 4. Set STRIPE_WEBHOOK_SECRET in .env
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { BillingService } from "@/lib/services/billing-service";
import type Stripe from "stripe";

/**
 * Config for handling raw request body (Stripe signature verification)
 * New syntax for Next.js 14+
 */
export const runtime = 'nodejs';

/**
 * POST /api/stripe/webhook
 * 
 * Handles webhook events from Stripe
 */
export async function POST(req: NextRequest) {
  // ✅ SECURITY: Extract Stripe signature from headers
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.warn("[WEBHOOK] Missing stripe-signature header");
    return new NextResponse("Missing signature", { status: 400 });
  }

  // ✅ SECURITY: Ensure webhook secret is configured
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    console.error(
      "[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured in environment"
    );
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  // ✅ SECURITY: Read raw buffer for signature verification
  let buf: Buffer;
  try {
    const arrayBuffer = await req.arrayBuffer();
    buf = Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("[WEBHOOK] Failed to read request body:", error);
    return new NextResponse("Failed to read body", { status: 400 });
  }

  // ✅ SECURITY CRITICAL: Verify Stripe signature
  // This ensures the webhook genuinely came from Stripe, not a spoofed request
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    console.error(
      "[WEBHOOK] Signature verification failed:",
      err.message
    );
    // Return 400 to signal Stripe the webhook was rejected
    // Stripe will retry later
    return new NextResponse(
      JSON.stringify({
        error: "Invalid signature",
        message: err.message,
      }),
      { status: 400 }
    );
  }

  console.log(
    `[WEBHOOK] Received event: ${event.type} (id: ${event.id})`
  );

  try {
    // ✅ SECURITY: Handle each event type
    switch (event.type) {
      // Subscription created (first payment successful)
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          `[WEBHOOK] Subscription created: ${subscription.id} for customer ${subscription.customer}`
        );
        await BillingService.handleSubscriptionUpdated(subscription);
        break;
      }

      // Subscription updated (plan changed, status changed, etc.)
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          `[WEBHOOK] Subscription updated: ${subscription.id} status=${subscription.status}`
        );
        await BillingService.handleSubscriptionUpdated(subscription);
        break;
      }

      // Subscription deleted (canceled)
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          `[WEBHOOK] Subscription deleted: ${subscription.id}`
        );
        await BillingService.handleSubscriptionDeleted(subscription);
        break;
      }

      // Invoice paid
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(
          `[WEBHOOK] Invoice payment succeeded: ${invoice.id} amount=${invoice.amount_paid}`
        );
        // Could implement additional logic here (send receipt, etc.)
        break;
      }

      // Invoice payment failed
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(
          `[WEBHOOK] Invoice payment failed: ${invoice.id} error=${invoice.paid}`
        );
        // Could implement notification logic here
        break;
      }

      // Ignore other events
      default:
        console.log(`[WEBHOOK] Ignoring event type: ${event.type}`);
        break;
    }

    // ✅ SECURITY: Return 200 OK to acknowledge receipt
    // Stripe will stop retrying once it sees 200
    return new NextResponse("ok", { status: 200 });
  } catch (err: any) {
    // ✅ SECURITY: Log error but don't expose details to client
    console.error(
      "[WEBHOOK] Error processing event:",
      err.message || err
    );

    // Return 500 to signal Stripe to retry
    // This prevents data loss if we have a temporary DB issue
    return new NextResponse(
      JSON.stringify({
        error: "Webhook processing error",
        ...(process.env.NODE_ENV === "development" && {
          details: err.message,
        }),
      }),
      { status: 500 }
    );
  }
}
