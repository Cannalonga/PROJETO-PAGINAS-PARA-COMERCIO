// src/lib/static-export/collect-page-data.ts
/**
 * Adapter layer between Prisma database and static export pipeline.
 * Fetches complete page data with multi-tenant isolation.
 */

import type { StaticPageContext, StaticPageData } from "./types";
// TODO: Adjust import path based on your project structure
// import { getTenantScopedDb } from "@/lib/tenant-isolation";

/**
 * Collect all data needed for static page generation from database.
 * Enforces tenant isolation and validates page accessibility.
 *
 * @param ctx - Page context with tenantId, pageId, and slug
 * @returns Complete StaticPageData ready for rendering
 * @throws Error if page not found or not accessible to tenant
 */
export async function collectStaticPageData(
  _ctx: StaticPageContext
): Promise<StaticPageData> {
  // TODO: Replace with your actual Prisma client setup
  // const db = getTenantScopedDb(ctx.tenantId);
  // const db = prisma; // or your tenant-aware db instance

  // This is a placeholder implementation showing the expected flow
  // Replace the 'db' calls below with your actual Prisma queries

  // Example: const page = await db.page.findUnique({...})
  // For now, throwing an error to indicate this needs implementation
  throw new Error(
    "collectStaticPageData: Please configure Prisma client and update query"
  );

  /*
  // REFERENCE IMPLEMENTATION (uncomment and adapt to your schema):
  
  const page = await db.page.findUnique({
    where: {
      id: ctx.pageId,
      tenantId: ctx.tenantId,
    },
    include: {
      blocks: true,
      template: true,
    },
  });

  if (!page) {
    throw new Error(
      `Page not found: ${ctx.pageId} for tenant ${ctx.tenantId}`
    );
  }

  // Build SEO metadata
  const seo: StaticPageSeo = {
    title: page.title ?? "Página do Comércio",
    description: page.description ?? undefined,
    canonicalUrl: buildCanonicalUrl(ctx),
    ogImageUrl: page.ogImageUrl ?? undefined,
    noIndex: page.noIndex ?? false,
    noFollow: page.noFollow ?? false,
  };

  // Assemble complete page data
  const data: StaticPageData = {
    id: page.id,
    tenantId: ctx.tenantId,
    slug: ctx.slug,
    blocks: page.blocks ?? [],
    template: page.template,
    variables: page.variables ?? {},
    theme: page.theme ?? {},
    seo,
    updatedAt: page.updatedAt ?? new Date(),
  };

  return data;
  */
}

/**
 * Build canonical URL for a page.
 * Used in SEO metadata and sitemap.
 *
 * @param ctx - Page context
 * @returns Full canonical URL
 */
export function buildCanonicalUrl(ctx: StaticPageContext): string {
  // TODO: Update with your actual domain
  const domain = process.env.NEXT_PUBLIC_PAGES_DOMAIN || "pages.example.com";
  const path = `${ctx.tenantId}/${ctx.slug}`;
  return `https://${domain}/${path}`;
}

/**
 * Validate that page data has all required fields.
 * Used before static generation to catch missing data early.
 *
 * @param data - Page data to validate
 * @returns true if valid, throws error otherwise
 */
export function validatePageData(data: StaticPageData): boolean {
  if (!data.id || !data.tenantId || !data.slug) {
    throw new Error("Missing required page identifiers");
  }

  if (!data.seo?.title) {
    throw new Error("Page must have SEO title");
  }

  if (!data.template) {
    throw new Error("Page must have template");
  }

  return true;
}
