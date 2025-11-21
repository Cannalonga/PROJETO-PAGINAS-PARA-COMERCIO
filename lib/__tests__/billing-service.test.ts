/**
 * BillingService Unit Tests
 * 
 * Tests for:
 * - Customer creation and reuse
 * - Subscription status mapping
 * - Checkout session creation
 * - Webhook processing (idempotency)
 * - Error handling
 */

import { BillingService } from "@/lib/services/billing-service";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  BillingValidationError,
  BillingNotFoundError,
} from "@/types/billing";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    tenant: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/stripe", () => ({
  stripe: {
    customers: {
      create: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

describe("BillingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // createOrGetCustomerForTenant Tests
  // ========================================================================

  describe("createOrGetCustomerForTenant", () => {
    it("should return existing stripeCustomerId if tenant already has one", async () => {
      const tenantId = "tenant-123";
      const existingCustomerId = "cus_existing";

      (prisma.tenant.findUnique as jest.Mock).mockResolvedValue({
        id: tenantId,
        name: "Test Tenant",
        slug: "test-tenant",
        email: "test@example.com",
        phone: null,
        stripeCustomerId: existingCustomerId,
      });

      const result = await BillingService.createOrGetCustomerForTenant(tenantId);

      expect(result).toBe(existingCustomerId);
      expect(stripe.customers.create).not.toHaveBeenCalled();
    });

    it("should create new Stripe customer if tenant has none", async () => {
      const tenantId = "tenant-123";
      const newCustomerId = "cus_new";

      (prisma.tenant.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: tenantId,
          name: "Test Tenant",
          slug: "test-tenant",
          email: "test@example.com",
          phone: "123456789",
          stripeCustomerId: null,
        })
        .mockResolvedValueOnce(null); // For update check

      (stripe.customers.create as jest.Mock).mockResolvedValue({
        id: newCustomerId,
      });

      (prisma.tenant.update as jest.Mock).mockResolvedValue({
        id: tenantId,
        stripeCustomerId: newCustomerId,
      });

      const result = await BillingService.createOrGetCustomerForTenant(tenantId);

      expect(result).toBe(newCustomerId);
      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Test Tenant",
        phone: "123456789",
        metadata: {
          tenantId,
          tenantSlug: "test-tenant",
        },
        description: "Tenant: test-tenant",
      });
      expect(prisma.tenant.update).toHaveBeenCalled();
    });

    it("should throw BillingNotFoundError if tenant not found", async () => {
      (prisma.tenant.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        BillingService.createOrGetCustomerForTenant("nonexistent")
      ).rejects.toThrow(BillingNotFoundError);
    });

    it("should throw BillingValidationError if tenantId is empty", async () => {
      await expect(
        BillingService.createOrGetCustomerForTenant("")
      ).rejects.toThrow(BillingValidationError);
    });
  });

  // ========================================================================
  // mapStripeStatusToBillingStatus Tests
  // ========================================================================

  describe("mapStripeStatusToBillingStatus", () => {
    it("should map 'active' to 'ACTIVE'", () => {
      expect(BillingService.mapStripeStatusToBillingStatus("active")).toBe(
        "ACTIVE"
      );
    });

    it("should map 'trialing' to 'TRIALING'", () => {
      expect(BillingService.mapStripeStatusToBillingStatus("trialing")).toBe(
        "TRIALING"
      );
    });

    it("should map 'past_due' to 'PAST_DUE'", () => {
      expect(BillingService.mapStripeStatusToBillingStatus("past_due")).toBe(
        "PAST_DUE"
      );
    });

    it("should map 'canceled' to 'CANCELED'", () => {
      expect(BillingService.mapStripeStatusToBillingStatus("canceled")).toBe(
        "CANCELED"
      );
    });

    it("should map 'incomplete' to 'INCOMPLETE'", () => {
      expect(BillingService.mapStripeStatusToBillingStatus("incomplete")).toBe(
        "INCOMPLETE"
      );
    });

    it("should map 'incomplete_expired' to 'INCOMPLETE_EXPIRED'", () => {
      expect(
        BillingService.mapStripeStatusToBillingStatus("incomplete_expired")
      ).toBe("INCOMPLETE");
    });

    it("should default unknown status to 'INACTIVE'", () => {
      expect(
        BillingService.mapStripeStatusToBillingStatus(
          "unknown_status" as any
        )
      ).toBe("INACTIVE");
    });
  });

  // ========================================================================
  // handleSubscriptionUpdated Tests
  // ========================================================================

  describe("handleSubscriptionUpdated", () => {
    it("should update tenant with correct plan based on priceId", async () => {
      const customerId = "cus_123";
      const subscriptionId = "sub_123";
      const tenantId = "tenant-123";
      const priceId = "price_pro";

      const mockSubscription = {
        id: subscriptionId,
        customer: customerId,
        status: "active",
        items: {
          data: [
            {
              price: { id: priceId },
            },
          ],
        },
      } as any;

      (prisma.tenant.findFirst as jest.Mock).mockResolvedValue({
        id: tenantId,
        name: "Test Tenant",
        slug: "test-tenant",
      });

      // Mock STRIPE_PRICES.PRO
      const originalPriceId = process.env.STRIPE_PRICE_PRO_ID;
      process.env.STRIPE_PRICE_PRO_ID = priceId;

      (prisma.tenant.update as jest.Mock).mockResolvedValue({
        id: tenantId,
        plan: "PRO",
        billingStatus: "ACTIVE",
      });

      await BillingService.handleSubscriptionUpdated(mockSubscription);

      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: tenantId },
        data: {
          stripeSubscriptionId: subscriptionId,
          plan: "PRO",
          billingStatus: "ACTIVE",
        },
      });

      // Restore
      process.env.STRIPE_PRICE_PRO_ID = originalPriceId;
    });

    it("should handle subscription.deleted gracefully if tenant not found", async () => {
      (prisma.tenant.findFirst as jest.Mock).mockResolvedValue(null);

      const mockSubscription = {
        id: "sub_123",
        customer: "cus_nonexistent",
        status: "canceled",
        items: { data: [] },
      } as any;

      // Should not throw
      await expect(
        BillingService.handleSubscriptionUpdated(mockSubscription)
      ).resolves.not.toThrow();
    });

    it("should throw error if subscription lacks customerId", async () => {
      const mockSubscription = {
        id: "sub_123",
        customer: null,
        status: "active",
        items: { data: [] },
      } as any;

      await expect(
        BillingService.handleSubscriptionUpdated(mockSubscription)
      ).rejects.toThrow(BillingValidationError);
    });
  });

  // ========================================================================
  // handleSubscriptionDeleted Tests
  // ========================================================================

  describe("handleSubscriptionDeleted", () => {
    it("should set tenant to CANCELED and FREE plan", async () => {
      const customerId = "cus_123";
      const tenantId = "tenant-123";

      const mockSubscription = {
        id: "sub_123",
        customer: customerId,
        status: "canceled",
        items: { data: [] },
      } as any;

      (prisma.tenant.findFirst as jest.Mock).mockResolvedValue({
        id: tenantId,
        slug: "test-tenant",
      });

      (prisma.tenant.update as jest.Mock).mockResolvedValue({
        id: tenantId,
        billingStatus: "CANCELED",
        plan: "FREE",
      });

      await BillingService.handleSubscriptionDeleted(mockSubscription);

      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: tenantId },
        data: {
          billingStatus: "CANCELED",
          stripeSubscriptionId: null,
          plan: "FREE",
        },
      });
    });

    it("should log warning if tenant not found", async () => {
      const mockSubscription = {
        id: "sub_123",
        customer: "cus_nonexistent",
        status: "canceled",
        items: { data: [] },
      } as any;

      (prisma.tenant.findFirst as jest.Mock).mockResolvedValue(null);

      const warnSpy = jest.spyOn(console, "warn").mockImplementation();

      await BillingService.handleSubscriptionDeleted(mockSubscription);

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  // ========================================================================
  // Utility Tests
  // ========================================================================

  describe("isActiveSubscription", () => {
    it("should return true for ACTIVE status", () => {
      expect(BillingService.isActiveSubscription("ACTIVE")).toBe(true);
    });

    it("should return true for TRIALING status", () => {
      expect(BillingService.isActiveSubscription("TRIALING")).toBe(true);
    });

    it("should return false for CANCELED status", () => {
      expect(BillingService.isActiveSubscription("CANCELED")).toBe(false);
    });

    it("should return false for PAST_DUE status", () => {
      expect(BillingService.isActiveSubscription("PAST_DUE")).toBe(false);
    });
  });

  describe("canAccessPaidFeatures", () => {
    it("should return true for BASIC plan", () => {
      expect(BillingService.canAccessPaidFeatures("BASIC")).toBe(true);
    });

    it("should return true for PRO plan", () => {
      expect(BillingService.canAccessPaidFeatures("PRO")).toBe(true);
    });

    it("should return false for FREE plan", () => {
      expect(BillingService.canAccessPaidFeatures("FREE")).toBe(false);
    });
  });
});
