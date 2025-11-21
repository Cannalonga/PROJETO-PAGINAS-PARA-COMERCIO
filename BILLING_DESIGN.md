# BILLING & STRIPE ARCHITECTURE DESIGN

## Overview

This document describes the billing and Stripe integration architecture for the multi-tenant SaaS platform. The design prioritizes security, idempotency, and auditability.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Model](#data-model)
3. [Security Principles](#security-principles)
4. [Workflows](#workflows)
5. [API Endpoints](#api-endpoints)
6. [Webhook Handling](#webhook-handling)
7. [Adding New Plans](#adding-new-plans)
8. [Failure Scenarios](#failure-scenarios)
9. [Testing Checklist](#testing-checklist)
10. [Deployment Checklist](#deployment-checklist)

---

## Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  - Billing Dashboard                                         │
│  - Checkout Flow (redirect to Stripe)                        │
│  - Subscription Management                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼──────────┐        ┌────────▼────────┐
│  /api/billing/*  │        │ /api/stripe/*   │
│  (Authenticated) │        │ (Public)        │
└───────┬──────────┘        └────────┬────────┘
        │                             │
        │    ┌─────────────────────────┤
        │    │                         │
┌───────▼────▼──────────────────────────────┐
│          BillingService                    │
│  - Customer management                     │
│  - Checkout sessions                       │
│  - Plan mapping                            │
│  - Webhook processing                      │
└───────┬──────────────────────────────────┐
        │                                   │
        │         ┌─────────────────────────┘
        │         │
┌───────▼─────────▼─────────┐    ┌──────────────────┐
│   PostgreSQL (Tenant DB)   │    │  Stripe API      │
│  - stripeCustomerId        │    │  - Customers     │
│  - stripeSubscriptionId    │    │  - Subscriptions │
│  - plan                    │    │  - Checkout      │
│  - billingStatus           │    │  - Portal        │
└────────────────────────────┘    └──────────────────┘
```

### Key Principles

**Tenant Isolation**
- Every operation validates tenant ownership via session context
- Never trust tenantId from request body

**Stripe Integration**
- Single `stripe` client instance (`lib/stripe.ts`)
- Centralized in BillingService
- Metadata stored in Stripe for audit trail

**Idempotency**
- Webhook processing is idempotent
- Safe to replay any webhook event multiple times
- Uses subscription ID for deduplication

**Error Handling**
- Custom error classes: `BillingError`, `BillingValidationError`, `StripeError`
- Detailed logging for audit trail
- Safe error messages to clients (no internal details)

---

## Data Model

### Tenant Model (Prisma)

```prisma
model Tenant {
  // Identity
  id                  String   @id @default(cuid())
  slug                String   @unique
  name                String
  email               String
  
  // ✅ BILLING FIELDS (NEW)
  stripeCustomerId     String?  @unique  // Stripe customer ID
  stripeSubscriptionId String?  @unique  // Current subscription
  plan                 Plan     @default(FREE)
  billingStatus        BillingStatus @default(INACTIVE)
  
  // Timestamps
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

enum Plan {
  FREE       // No paid features
  BASIC      // Entry-level
  PRO        // Mid-tier
  PREMIUM    // Enterprise
}

enum BillingStatus {
  INACTIVE           // No subscription
  TRIALING           // Trial period
  ACTIVE             // Active subscription
  PAST_DUE           // Payment failed
  CANCELED           // Subscription canceled
  INCOMPLETE         // Incomplete payment
  INCOMPLETE_EXPIRED // Trial expired without payment
}
```

### Plan Configuration (types/billing.ts)

```typescript
interface PriceConfig {
  priceId: string;           // Stripe price ID
  name: string;              // Machine-readable name
  displayName: string;       // User-facing name
  monthlyPrice: number;      // In cents (e.g., 2900 = R$ 29)
  currency: string;          // "BRL"
  features: string[];        // List of features
  billingCycle: "monthly" | "yearly" | "one-time";
}
```

### Environment Variables

```env
# Stripe API
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."

# Plan Price IDs (from Stripe Dashboard)
STRIPE_PRICE_BASIC_ID="price_..."
STRIPE_PRICE_PRO_ID="price_..."
STRIPE_PRICE_PREMIUM_ID="price_..."
```

---

## Security Principles

### 1. Never Trust Client Input

❌ **WRONG**
```typescript
// BAD: Trusting tenantId from request body
const tenantId = req.body.tenantId;
```

✅ **RIGHT**
```typescript
// GOOD: Using tenantId from session
const tenantId = session.tenantId;
// VERIFY: Load tenant from DB
const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
```

### 2. Stripe Signature Verification

✅ **CRITICAL for Webhooks**
```typescript
// Verify signature before processing
const event = stripe.webhooks.constructEvent(
  rawBody,      // Raw bytes
  signature,    // From Stripe header
  webhookSecret // From environment
);
```

### 3. RBAC Enforcement

✅ **All billing routes require auth + RBAC**
```typescript
// Only OWNER/ADMIN can manage billing
if (!["OWNER", "ADMIN", "CLIENTE_ADMIN"].includes(session.role)) {
  return 403; // Forbidden
}
```

### 4. Metadata Validation

✅ **Store tenant context in Stripe**
```typescript
metadata: {
  tenantId: tenant.id,
  tenantSlug: tenant.slug,
  plan: "PRO"
}
```

Prevents:
- Tampering with tenant ID
- Mapping wrong subscription to tenant
- Lost audit trail

### 5. Safe Logging

✅ **Log security events without exposing secrets**
```typescript
// GOOD: Auditable without exposing card numbers
console.log(`Payment failed for tenant ${tenantId}, amount: ${amount}`);

// BAD: Expose customer data
console.log(`Payment failed: ${JSON.stringify(stripe_response)}`);
```

---

## Workflows

### Workflow 1: New Subscription

```
1. Tenant Admin clicks "Upgrade to PRO"
   ↓
2. Frontend calls POST /api/billing/checkout
   with { plan: "PRO" }
   ↓
3. Backend:
   a. Verify authentication + RBAC
   b. Load tenant from DB (not from body)
   c. Create/get Stripe customer
   d. Create checkout session with tenant metadata
   ↓
4. Backend returns { url: "https://checkout.stripe.com/..." }
   ↓
5. Frontend redirects to Stripe checkout
   ↓
6. Customer completes payment
   ↓
7. Stripe creates subscription + sends webhook
   ↓
8. Webhook handler:
   a. Verify signature
   b. Map customerId → tenant
   c. Update tenant.plan = "PRO"
   c. Update tenant.billingStatus = "ACTIVE"
   ↓
9. Backend ready to serve PRO features
```

### Workflow 2: Plan Upgrade (via Portal)

```
1. Tenant Admin clicks "Manage Billing"
   ↓
2. Frontend calls POST /api/billing/portal
   ↓
3. Backend:
   a. Verify authentication
   b. Create customer portal session
   ↓
4. Backend returns { url: "https://billing.stripe.com/..." }
   ↓
5. Frontend redirects to Stripe Customer Portal
   ↓
6. Customer changes plan in Stripe
   ↓
7. Stripe sends subscription.updated webhook
   ↓
8. Webhook handler updates tenant.plan in DB
   ↓
9. Frontend refreshes and shows new plan
```

### Workflow 3: Subscription Cancellation

```
1. Tenant cancels subscription in:
   a. Stripe Customer Portal, OR
   b. Platform dashboard (future)
   ↓
2. Stripe sends customer.subscription.deleted webhook
   ↓
3. Webhook handler:
   a. Verify signature
   b. Map customerId → tenant
   c. Set tenant.plan = "FREE"
   c. Set tenant.billingStatus = "CANCELED"
   ↓
4. Frontend reflects cancellation
   ↓
5. Paid features become unavailable
```

---

## API Endpoints

### POST /api/billing/checkout

**Purpose**: Create checkout session for subscription purchase

**Authentication**: Required (withAuthHandler)
**RBAC**: OWNER/ADMIN/CLIENTE_ADMIN only
**Rate Limit**: 3/min

**Request**
```json
{
  "plan": "BASIC" | "PRO" | "PREMIUM"
}
```

**Response (201)**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_...",
  "sessionId": "cs_...",
  "plan": "PRO"
}
```

**Error Responses**
- 400: Invalid plan
- 403: Insufficient permissions
- 500: Stripe API error

**Security Checks**
- ✅ Validate authentication
- ✅ Verify RBAC
- ✅ Load tenant from DB (not body)
- ✅ Validate plan against STRIPE_PRICES
- ✅ Generate URLs from request origin

---

### POST /api/billing/portal

**Purpose**: Create customer portal session for self-service billing

**Authentication**: Required (withAuthHandler)
**RBAC**: OWNER/ADMIN/CLIENTE_ADMIN only
**Rate Limit**: 5/min

**Request**
```json
{}
```

**Response (200)**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

**Error Responses**
- 403: Insufficient permissions
- 404: Tenant has no Stripe customer
- 500: Stripe API error

**Security Checks**
- ✅ Validate authentication
- ✅ Verify RBAC
- ✅ Verify tenant has stripeCustomerId

---

### POST /api/stripe/webhook

**Purpose**: Receive Stripe events (subscription changes, payments, etc.)

**Authentication**: None (public endpoint)
**Signature Verification**: CRITICAL ✅
**Rate Limit**: None (Stripe retry logic)

**Webhook Events Handled**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Security Implementation**
```typescript
// 1. Extract signature from header
const sig = req.headers.get("stripe-signature");

// 2. Verify signature with webhook secret
const event = stripe.webhooks.constructEvent(
  rawBody,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);

// 3. Map stripe customerId → tenant (never trust body)
const tenant = await prisma.tenant.findFirst({
  where: { stripeCustomerId: customerId }
});

// 4. Update tenant billing fields atomically
await prisma.tenant.update({
  where: { id: tenant.id },
  data: { stripeSubscriptionId, plan, billingStatus }
});
```

**Deployment Configuration**

In Stripe Dashboard:
1. Go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy Signing Secret → `STRIPE_WEBHOOK_SECRET`

---

## Webhook Handling

### Idempotency

Webhooks are idempotent:
- Safe to receive same event multiple times
- Uses `subscription.id` as deduplication key
- Atomic DB updates prevent race conditions

```typescript
// Safe to call multiple times
await prisma.tenant.update({
  where: { id: tenant.id },
  data: {
    stripeSubscriptionId: subscription.id, // Idempotent key
    plan,
    billingStatus
  }
});
```

### Failure Scenarios

**Scenario 1: Webhook arrives before customer created**
```typescript
// Graceful handling
const tenant = await prisma.tenant.findFirst({
  where: { stripeCustomerId: customerId }
});

if (!tenant) {
  console.warn("Tenant not found for customer, skipping...");
  // Don't throw - webhook will retry
  return;
}
```

**Scenario 2: Database connection fails**
```typescript
// Return 500 to signal retry
catch (err) {
  console.error("DB error:", err);
  return new NextResponse("Error", { status: 500 });
}
// Stripe will retry in 5 min, 30 min, 2h, 5h, 10h, etc.
```

**Scenario 3: Invalid webhook signature**
```typescript
// Return 400 to prevent retries
catch (err) {
  console.error("Invalid signature:", err);
  return new NextResponse("Invalid", { status: 400 });
}
```

### Retry Logic

Stripe retries webhooks with exponential backoff:
- 1st: 5 minutes
- 2nd: 30 minutes
- 3rd: 2 hours
- 4th: 5 hours
- 5th: 10 hours
- 6th: 10 hours
- (Total: 24 hours)

⚠️ **Critical**: Must return 200 OK on success, otherwise retries continue

---

## Adding New Plans

### Step 1: Create Plan in Stripe Dashboard

1. Go to Products → Create product
   - Name: "Pro Plan"
   - Price: R$ 79/month
   - Billing period: Monthly

2. Copy the Price ID (e.g., `price_1Abc123XYZ`)

### Step 2: Update .env

```env
STRIPE_PRICE_CUSTOM_ID="price_1Abc123XYZ"
```

### Step 3: Update Plan Enum

```prisma
enum Plan {
  FREE
  BASIC
  PRO
  PREMIUM
  CUSTOM    // ← Add new plan
}
```

### Step 4: Update STRIPE_PRICES in types/billing.ts

```typescript
export const STRIPE_PRICES: Record<Plan, PriceConfig | null> = {
  // ... existing plans
  CUSTOM: {
    priceId: process.env.STRIPE_PRICE_CUSTOM_ID!,
    name: "custom",
    displayName: "Custom Plan",
    monthlyPrice: 14900,
    currency: "BRL",
    features: [
      "Everything in PRO",
      "Custom integrations",
      "Dedicated support",
    ],
    billingCycle: "monthly",
  },
};
```

### Step 5: Test

```typescript
// Unit test
test("CUSTOM plan maps correctly", () => {
  const priceId = STRIPE_PRICES.CUSTOM?.priceId;
  expect(priceId).toBe(process.env.STRIPE_PRICE_CUSTOM_ID);
});

// Manual test
POST /api/billing/checkout
{
  "plan": "CUSTOM"
}
```

---

## Failure Scenarios

### Scenario A: Stripe API Down

**What happens**
- Checkout endpoint returns 500
- Webhook temporarily queued by Stripe

**Recovery**
- Frontend retries checkout in 5 seconds
- Stripe retries webhook every 5+ minutes
- Manual webhook replay from Stripe Dashboard if needed

### Scenario B: Database Connection Lost

**During Checkout**
- Returns 500 error
- Frontend can retry

**During Webhook**
- Returns 500 (triggers Stripe retry)
- When DB recovered, webhook replays successfully

### Scenario C: Webhook Duplicate

**Scenario**
- Stripe sends same webhook twice

**Prevention**
- Idempotent update using subscription.id
- No double-charging because Stripe controls subscriptions

### Scenario D: Customer Portal Session Expired

**What happens**
- User clicks "Manage Billing"
- Portal session expires after 24 hours

**Recovery**
- User clicks again to create new session
- Always fresh session guaranteed

### Scenario E: Tenant Deletes Account While Subscribed

**What happens**
- Stripe keeps subscription active
- Stripe sends payment reminder emails
- Webhook handler can't find tenant

**Prevention**
```typescript
// When deleting tenant
await prisma.tenant.update({
  where: { id: tenant.id },
  data: { status: "DELETED" }
});

// When deleting subscription
await stripe.subscriptions.del(tenant.stripeSubscriptionId);
```

---

## Testing Checklist

### Unit Tests (Jest)

- ✅ `BillingService.createOrGetCustomerForTenant`
  - Returns existing customer ID
  - Creates new customer and stores ID
  - Throws for missing tenant

- ✅ `BillingService.mapStripeStatusToBillingStatus`
  - Maps all Stripe statuses correctly
  - Defaults unknown statuses

- ✅ `BillingService.handleSubscriptionUpdated`
  - Updates plan based on price ID
  - Updates billing status
  - Idempotent (can call twice)

- ✅ Error handling for all error types

### Integration Tests (Stripe Test Mode)

- ✅ Create checkout session
  - Valid checkout URL returned
  - Metadata stored in Stripe

- ✅ Complete checkout flow
  - Redirect to Stripe test checkout
  - Simulate payment success
  - Webhook updates tenant

- ✅ Webhook signature verification
  - Valid signature accepted
  - Invalid signature rejected (400)

- ✅ Webhook replay
  - Send same webhook twice
  - Tenant billing fields updated once (idempotent)

### Manual Testing (Postman)

```bash
# 1. Create checkout session
POST http://localhost:3000/api/billing/checkout
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "plan": "PRO"
}

# Expected: 201 with Stripe checkout URL

# 2. Verify webhook endpoint
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "stripe-signature: invalid" \
  -d "{}"

# Expected: 400 (Invalid signature)
```

### E2E Tests (Playwright - Future)

```typescript
test("Full subscription flow", async ({ page }) => {
  // 1. Login as tenant owner
  // 2. Navigate to billing page
  // 3. Click "Upgrade to PRO"
  // 4. Verify checkout URL
  // 5. Simulate Stripe webhook
  // 6. Verify plan changed to PRO
});
```

---

## Deployment Checklist

### Pre-Production (Staging)

- [ ] Database migration applied (`npx prisma migrate deploy`)
- [ ] All env vars configured:
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_WEBHOOK_SECRET
  - [ ] STRIPE_PRICE_BASIC_ID
  - [ ] STRIPE_PRICE_PRO_ID
  - [ ] STRIPE_PRICE_PREMIUM_ID

- [ ] Unit tests passing (Jest)
- [ ] Integration tests passing (Stripe test mode)
- [ ] Webhook endpoint reachable (test from Stripe Dashboard)
- [ ] Rate limiting working for billing routes
- [ ] Error logging configured (console or Sentry)

### Production Deployment

- [ ] All staging tests passed
- [ ] Stripe products created in live mode
- [ ] Live price IDs added to env vars
- [ ] STRIPE_SECRET_KEY updated (live key)
- [ ] STRIPE_WEBHOOK_SECRET updated (live signing secret)
- [ ] Webhook endpoint registered in Stripe Dashboard
- [ ] Monitoring + alerting configured for webhook failures
- [ ] Rollback plan documented
- [ ] Customer support notified

### Post-Deployment

- [ ] Test checkout with real Stripe (in test mode first!)
- [ ] Test webhook delivery from Stripe Dashboard
- [ ] Monitor error logs for first 24 hours
- [ ] Verify webhook retry logic working
- [ ] Send announcement to customers

---

## Monitoring & Observability

### Key Metrics to Track

1. **Checkout Success Rate**
   - `checkout_sessions_created` / `checkout_sessions_completed`
   - Target: > 80%

2. **Webhook Success Rate**
   - `webhooks_received` / `webhooks_processed_success`
   - Target: 100%

3. **Error Rates**
   - `billing_api_errors`
   - `stripe_api_errors`
   - Target: < 1%

### Logging

```typescript
// Log all events for audit trail
console.log(`[BILLING] Action: SUBSCRIPTION_CREATED, tenant: ${tenantId}`);
console.error(`[BILLING] Error: STRIPE_API_DOWN, message: ${err.message}`);
```

### Sentry Integration (Future)

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // ... billing operation
} catch (err) {
  Sentry.captureException(err, {
    tags: {
      module: "billing",
      operation: "checkout",
      tenantId,
    },
  });
}
```

---

## Future Improvements (Phase 2+)

1. **Trials & Discounts**
   - Add coupon support
   - Trial periods configurable per plan

2. **Multiple Add-ons**
   - Extra pages
   - Extra visitors
   - Premium integrations

3. **Usage-Based Billing**
   - Metered pricing for feature X
   - Auto-upgrade on usage threshold

4. **Revenue Analytics**
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - Customer Lifetime Value (LTV)

5. **Self-Service Invoicing**
   - Download past invoices
   - Automatic email receipts
   - Tax compliance

6. **Advanced Logging**
   - Comprehensive audit trail
   - Webhook replay UI
   - Error analytics dashboard

---

## References

- [Stripe Billing API Docs](https://stripe.com/docs/billing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Prisma Relationships](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-19  
**Maintainer**: Engineering Team
