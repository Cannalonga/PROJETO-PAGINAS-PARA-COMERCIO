/**
 * Billing Types
 * 
 * Type definitions for billing-related operations
 */

import type Stripe from "stripe";

// Note: Plan and BillingStatus enums are defined in prisma/schema.prisma
// They will be available in @prisma/client after running: npx prisma generate
export type Plan = "FREE" | "BASIC" | "PRO" | "PREMIUM";
export type BillingStatus =
  | "INACTIVE"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED";

// ============================================================================
// Enums & Constants
// ============================================================================

export const PLANS = {
  FREE: "FREE",
  BASIC: "BASIC",
  PRO: "PRO",
  PREMIUM: "PREMIUM",
} as const;

export const BILLING_STATUSES = {
  INACTIVE: "INACTIVE",
  TRIALING: "TRIALING",
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  CANCELED: "CANCELED",
  INCOMPLETE: "INCOMPLETE",
  INCOMPLETE_EXPIRED: "INCOMPLETE_EXPIRED",
} as const;

// ============================================================================
// Price Configuration
// ============================================================================

export interface PriceConfig {
  priceId: string;
  name: string;
  displayName: string;
  monthlyPrice: number; // in cents
  currency: string;
  features: string[];
  billingCycle: "monthly" | "yearly" | "one-time";
}

export const STRIPE_PRICES: Record<Plan, PriceConfig | null> = {
  FREE: null, // Free tier doesn't have a price in Stripe
  BASIC: {
    priceId: process.env.STRIPE_PRICE_BASIC_ID || "price_basic",
    name: "basic",
    displayName: "Plano Básico",
    monthlyPrice: 2900, // R$ 29/mês
    currency: "BRL",
    features: [
      "Até 3 páginas",
      "Template básico",
      "Suporte via email",
    ],
    billingCycle: "monthly",
  },
  PRO: {
    priceId: process.env.STRIPE_PRICE_PRO_ID || "price_pro",
    name: "pro",
    displayName: "Plano Pro",
    monthlyPrice: 7900, // R$ 79/mês
    currency: "BRL",
    features: [
      "Até 10 páginas",
      "Templates avançados",
      "Analytics em tempo real",
      "Suporte prioritário",
      "Integrações customizadas",
    ],
    billingCycle: "monthly",
  },
  PREMIUM: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_ID || "price_premium",
    name: "premium",
    displayName: "Plano Premium",
    monthlyPrice: 19900, // R$ 199/mês
    currency: "BRL",
    features: [
      "Páginas ilimitadas",
      "Todos os templates",
      "Analytics avançado",
      "Multi-idioma",
      "Suporte 24/7",
      "API access",
      "White-label disponível",
    ],
    billingCycle: "monthly",
  },
};

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreateCheckoutSessionRequest {
  tenantId: string;
  plan: Exclude<Plan, "FREE">;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  url: string | null;
  sessionId: string;
}

export interface CreateCustomerPortalSessionRequest {
  tenantId: string;
  returnUrl: string;
}

export interface CreateCustomerPortalSessionResponse {
  url: string;
}

export interface SyncSubscriptionRequest {
  subscription: Stripe.Subscription;
}

// ============================================================================
// Error Types
// ============================================================================

export class BillingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "BillingError";
  }
}

export class BillingValidationError extends BillingError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "BillingValidationError";
  }
}

export class BillingNotFoundError extends BillingError {
  constructor(message: string) {
    super(message, "NOT_FOUND", 404);
    this.name = "BillingNotFoundError";
  }
}

export class BillingUnauthorizedError extends BillingError {
  constructor(message: string) {
    super(message, "UNAUTHORIZED", 403);
    this.name = "BillingUnauthorizedError";
  }
}

export class StripeError extends BillingError {
  constructor(
    message: string,
    public originalError?: any
  ) {
    super(message, "STRIPE_ERROR", 500);
    this.name = "StripeError";
  }
}

// ============================================================================
// Webhook Event Types
// ============================================================================

export type StripeWebhookEventType =
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_succeeded"
  | "invoice.payment_failed";

export interface WebhookPayload {
  type: StripeWebhookEventType;
  subscription?: Stripe.Subscription;
  invoice?: Stripe.Invoice;
  timestamp: Date;
}

// ============================================================================
// Metadata Types (Stripe Metadata)
// ============================================================================

export interface StripeMetadata {
  tenantId: string;
  tenantSlug?: string;
  plan?: Plan;
  [key: string]: any;
}

// ============================================================================
// Audit Log Types
// ============================================================================

export interface BillingAuditLog {
  id: string;
  tenantId: string;
  action:
    | "SUBSCRIPTION_CREATED"
    | "SUBSCRIPTION_UPDATED"
    | "SUBSCRIPTION_CANCELED"
    | "CHECKOUT_SESSION_CREATED"
    | "WEBHOOK_RECEIVED"
    | "WEBHOOK_PROCESSED"
    | "WEBHOOK_FAILED";
  details: Record<string, any>;
  createdAt: Date;
}
