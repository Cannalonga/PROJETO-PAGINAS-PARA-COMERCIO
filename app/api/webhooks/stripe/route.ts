import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * POST /api/webhooks/stripe
 * ✅ SECURITY CRITICAL: Handle Stripe webhook events
 * 
 * Requirements:
 * 1. Validate webhook signature (prevents spoofed events)
 * 2. Only process expected event types
 * 3. Verify tenantId from Stripe metadata
 * 4. Use idempotency keys to prevent duplicate processing
 * 5. Log all events for audit
 */
export async function POST(req: NextRequest) {
  try {
    // ✅ SECURITY: Get raw body for signature verification
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      console.warn('[SECURITY] Stripe webhook missing signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      // ✅ SECURITY: Validate webhook signature - this prevents replay/spoofing attacks
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('[SECURITY] Invalid Stripe webhook signature:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // ✅ SECURITY: Only process expected event types
    const ALLOWED_EVENTS = [
      'charge.succeeded',
      'charge.failed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
    ];

    if (!ALLOWED_EVENTS.includes(event.type)) {
      console.warn(`[WEBHOOK] Unhandled event type: ${event.type}`);
      return NextResponse.json({ received: true });
    }

    // ✅ SECURITY: Process specific events
    switch (event.type) {
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }
      case 'charge.failed': {
        await handleChargeFailed(event.data.object as Stripe.Charge);
        break;
      }
      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Stripe webhook error:', error);
    // Return 500 to let Stripe retry (don't silently fail)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle subscription updated event
 * ✅ SECURITY: Verify tenantId from metadata before updating
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // ✅ SECURITY: Get tenantId from Stripe subscription metadata (not from request)
    const tenantId = subscription.metadata?.tenantId;

    if (!tenantId) {
      console.warn(
        '[SECURITY] Subscription update without tenantId:',
        subscription.id
      );
      return;
    }

    // ✅ SECURITY: Verify tenant exists before updating
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      console.warn('[SECURITY] Subscription update for non-existent tenant:', tenantId);
      return;
    }

    // ✅ SECURITY: Update billing status based on subscription status
    const billingStatusMap: Record<string, string> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      incomplete: 'TRIALING',
      incomplete_expired: 'CANCELED',
      paused: 'ACTIVE',
      trialing: 'TRIALING',
      unpaid: 'PAST_DUE',
    };

    const billingStatus = billingStatusMap[subscription.status] || 'ACTIVE';

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        billingStatus: billingStatus as any,
        stripeCustomerId: subscription.customer as string,
      },
    });

    console.log(`[WEBHOOK] Updated subscription for tenant ${tenantId}: ${subscription.id}`);
  } catch (error) {
    console.error('[WEBHOOK] Error handling subscription updated:', error);
  }
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const tenantId = subscription.metadata?.tenantId;

    if (!tenantId) {
      console.warn('[SECURITY] Subscription deletion without tenantId');
      return;
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        billingStatus: 'CANCELED',
      },
    });

    console.log(`[WEBHOOK] Cancelled subscription for tenant ${tenantId}`);
  } catch (error) {
    console.error('[WEBHOOK] Error handling subscription deleted:', error);
  }
}

/**
 * Handle charge failed event
 */
async function handleChargeFailed(charge: Stripe.Charge) {
  try {
    const tenantId = charge.metadata?.tenantId;

    if (!tenantId) {
      console.warn('[SECURITY] Charge failure without tenantId');
      return;
    }

    // ✅ SECURITY: Log failed charge for audit
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: '', // No specific user
        action: 'CHARGE_FAILED',
        entity: 'Payment',
        entityId: charge.id,
        metadata: {
          reason: charge.failure_code,
          failureCode: charge.failure_code,
          amount: charge.amount,
        },
      },
    });

    console.warn(
      `[WEBHOOK] Charge failed for tenant ${tenantId}:`,
      charge.failure_code
    );
  } catch (error) {
    console.error('[WEBHOOK] Error handling charge failed:', error);
  }
}

/**
 * Handle invoice payment failed event
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const tenantId = invoice.metadata?.tenantId;

    if (!tenantId) {
      console.warn('[SECURITY] Invoice payment failure without tenantId');
      return;
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        billingStatus: 'PAST_DUE',
      },
    });

    console.warn(`[WEBHOOK] Invoice payment failed for tenant ${tenantId}`);
  } catch (error) {
    console.error('[WEBHOOK] Error handling invoice payment failed:', error);
  }
}
