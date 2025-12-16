// app/(public)/t/[tenantSlug]/[pageSlug]/page.tsx
/**
 * Public Page Route
 *
 * Displays publicly accessible pages from multi-tenant stores.
 * Integrates SEO metadata generation for:
 * - Title & description
 * - Open Graph tags (social sharing)
 * - Twitter Card tags
 * - Canonical URLs
 * - Robots meta tag (noindex support)
 *
 * URL Format: /t/[tenantSlug]/[pageSlug]
 * Example: /t/meu-comercio/sobre-nos
 *
 * Security:
 * - Tenant isolation by slug
 * - Page validation by tenant
 * - All strings rendered as plain text (no XSS)
 * - Canonical URL prevents duplicate content
 *
 * @route GET /t/[tenantSlug]/[pageSlug]
 * @param {string} tenantSlug - Tenant unique slug
 * @param {string} pageSlug - Page unique slug within tenant
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { disableMiddleware, enableMiddleware } from "@/lib/prisma-middleware";
import { buildSeoForPage, buildSeoForErrorPage } from "@/lib/seo/seo-engine";
import type { BuildSeoParams } from "@/types/seo";

/**
 * Incremental Static Regeneration (ISR)
 * Revalidate cached pages every 3600 seconds (1 hour)
 * 
 * - Pages served from cache after first visit
 * - Background regeneration triggered after 1 hour
 * - Fallback: On-demand generation for cache misses
 * - Scales infinitely without database overload
 */
export const revalidate = 3600; // 1 hour

interface PageParams {
  tenantSlug: string;
  pageSlug: string;
}

/**
 * Generate metadata for the page
 *
 * Called by Next.js before rendering to generate <head> tags
 * Essential for SEO and social media sharing
 *
 * Flow:
 * 1. Fetch tenant by slug
 * 2. Fetch page by tenant + slug
 * 3. Merge SEO config (tenant defaults + page overrides)
 * 4. Build canonical URL
 * 5. Return Next.js Metadata
 *
 * If tenant/page not found, return 404 metadata
 */
export async function generateMetadata(
  { params }: { params: PageParams }
): Promise<Metadata> {
  const { tenantSlug, pageSlug } = params;

  try {
    // Fetch tenant by slug
    const tenant = await prisma.tenant.findFirst({
      where: {
        slug: tenantSlug.toLowerCase(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!tenant) {
      return buildSeoForErrorPage(404, "Loja não encontrada");
    }

    // Fetch page by tenant + slug (published only)
    const page = await prisma.page.findFirst({
      where: {
        tenantId: tenant.id,
        slug: pageSlug.toLowerCase(),
        status: "PUBLISHED",
      },
    });

    if (!page) {
      return buildSeoForErrorPage(404, "Página não encontrada");
    }

    // Build canonical URL
    const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://app.example.com"}/t/${tenant.slug}/${page.slug}`;

    // Build SEO parameters
    const seoParams: BuildSeoParams = {
      tenantDefaults: {
        siteName: tenant.name,
        defaultTitleSuffix: undefined,
        defaultDescription: page.description || undefined,
      },
      page: {
        title: page.title,
        slug: page.slug,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        seoImage: page.seoImage,
        seoNoIndex: false,
      },
      baseUrl,
    };

    // Generate metadata
    return buildSeoForPage(seoParams);
  } catch (error) {
    console.error("Error generating metadata:", error);
    return buildSeoForErrorPage(500, "Erro ao carregar página");
  }
}

/**
 * Page component
 *
 * Renders the public page content
 * All strings are plain text (no dangerouslySetInnerHTML)
 *
 * Future enhancement: Rich text editor support with sanitization
 */
export default async function PublicPage({ params }: { params: PageParams }) {
  const { tenantSlug, pageSlug } = params;

  try {
    // Fetch tenant
    const tenant = await prisma.tenant.findFirst({
      where: {
        slug: tenantSlug.toLowerCase(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!tenant) {
      notFound();
    }

    // Fetch page
    const page = await prisma.page.findFirst({
      where: {
        tenantId: tenant.id,
        slug: pageSlug.toLowerCase(),
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        seoImage: true,
        updatedAt: true,
      },
    });

    if (!page) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              {page.title}
            </h1>
            <div className="flex items-center justify-between border-t border-b border-gray-200 py-4">
              <div>
                <p className="text-sm text-gray-600">
                  Última atualização:{" "}
                  <time dateTime={new Date(page.updatedAt).toISOString()}>
                    {new Date(page.updatedAt).toLocaleDateString("pt-BR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </p>
                <p className="text-sm text-gray-600">Loja: {tenant.name}</p>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {page.seoImage && (
            <div className="mb-8">
              <img
                src={page.seoImage}
                alt={page.title}
                className="h-auto w-full rounded-lg object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none text-gray-700">
            {page.description ? (
              <p className="whitespace-pre-wrap">{page.description}</p>
            ) : (
              <p className="text-gray-500">Conteúdo não disponível</p>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-center text-sm text-gray-600">
              © {new Date().getFullYear()} {tenant.name}. Todos os direitos
              reservados.
            </p>
          </footer>
        </article>
      </div>
    );
  } catch (error) {
    console.error("Error rendering page:", error);
    notFound();
  }
}

/**
 * Generate static paths for common pages
 *
 * Pre-renders popular pages at build time for faster loading.
 * Uses Incremental Static Regeneration (ISR) for scalability:
 *
 * - Initial request to unseen pages: generates on-demand
 * - Regenerates every 3600 seconds (1 hour) if requested
 * - Reduces database queries during build
 * - Improves Time to First Byte (TTFB) for popular pages
 *
 * Strategy:
 * 1. Generate top 100 most recently published pages at build time
 * 2. Fallback: On-demand generation for pages not in initial set
 * 3. Revalidate: Background regeneration every hour if requested
 */
export async function generateStaticParams(): Promise<PageParams[]> {
  // Disable middleware during build-time to allow queries without tenant context
  disableMiddleware();

  try {
    // Suppress Prisma errors during build - database may not be available
    // Errors will be silent (catch block will handle them)
    const pages = await Promise.resolve()
      .then(async () => {
        try {
          return await prisma.page.findMany({
            where: {
              status: "PUBLISHED",
            },
            select: {
              slug: true,
              tenantId: true,
            },
            orderBy: {
              updatedAt: "desc", // Most recently updated first
            },
            take: 100, // Limit to 100 pages for build time
          });
        } catch {
          // Silently fail - database not available during build
          return [];
        }
      });

    // Fetch tenant slugs
    const tenants = await Promise.resolve()
      .then(async () => {
        try {
          return await prisma.tenant.findMany({
            select: {
              id: true,
              slug: true,
            },
          });
        } catch {
          // Silently fail - database not available during build
          return [];
        }
      });

    if (pages.length === 0) {
      console.info(
        `[generateStaticParams] Database unavailable during build - using on-demand generation`
      );
      return [];
    }

    const tenantMap = Object.fromEntries(
      tenants.map((t) => [t.id, t.slug])
    );

    // Map to [tenantSlug]/[pageSlug] format
    const params = pages.map((page) => ({
      tenantSlug: tenantMap[page.tenantId] || "",
      pageSlug: page.slug,
    }));

    console.info(
      `[generateStaticParams] Generated ${params.length} static page routes`
    );

    return params;
  } finally {
    // Re-enable middleware after build
    enableMiddleware();
  }
}
