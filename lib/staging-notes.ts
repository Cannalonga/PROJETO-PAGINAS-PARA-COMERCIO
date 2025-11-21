/**
 * Staging Deployment Notes
 * 
 * This file documents staging-specific considerations for the deployment process.
 */

export const STAGING_NOTES = {
  // generateStaticParams is disabled during build (no database available)
  // In staging/production environments, enable it by removing the early return:
  // 
  // export async function generateStaticParams(): Promise<PageParams[]> {
  //   const pages = await prisma.page.findMany({
  //     where: { status: "PUBLISHED" },
  //     select: { slug: true, tenantId: true },
  //     take: 100,
  //   });
  //   const tenants = await prisma.tenant.findMany({
  //     select: { id: true, slug: true },
  //   });
  //   const tenantMap = Object.fromEntries(tenants.map((t) => [t.id, t.slug]));
  //   return pages.map((page) => ({
  //     tenantSlug: tenantMap[page.tenantId] || "",
  //     pageSlug: page.slug,
  //   }));
  // }
  //
  // This enables ISR (Incremental Static Regeneration) for popular pages.
  
  billing_webhook: {
    // Stripe webhook endpoint configured at: /api/stripe/webhook
    // Events subscribed: customer.subscription.created|updated|deleted
    // Remember to set STRIPE_WEBHOOK_SECRET in environment variables
    test_url: "/api/stripe/webhook",
  },
  
  rate_limiting: {
    // Rate limiter configured per IP for: /api/billing/checkout
    // Limit: 3 requests per minute
    // Test: Send 4 requests rapidly, should get 429 on 4th
    test_endpoint: "/api/billing/checkout",
  },
  
  health_check: {
    // Simple health endpoint that checks:
    // - App is running
    // - Database is accessible
    test_url: "/api/health",
    expected_response: { status: "ok", checks: { app: "ok", db: "ok" } },
  },
};

export default STAGING_NOTES;
