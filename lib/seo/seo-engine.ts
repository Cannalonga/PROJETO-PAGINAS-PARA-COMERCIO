// lib/seo/seo-engine.ts
/**
 * SEO Engine
 *
 * Core engine for building metadata for pages.
 * Merges tenant-level defaults with page-level overrides.
 * Generates Next.js Metadata for generateMetadata in layouts/pages.
 *
 * Security:
 * - No dangerouslySetInnerHTML
 * - All strings are plain text (no HTML injection)
 * - Canonical URLs prevent cross-tenant issues
 * - Proper robots tag implementation
 */

import type { Metadata } from "next";
import type { BuildSeoParams } from "@/types/seo";

/**
 * Build SEO metadata for a page
 *
 * Merges tenant defaults with page overrides to create complete metadata.
 *
 * Flow:
 * 1. Use seoTitle if provided, otherwise use page title
 * 2. Add defaultTitleSuffix from tenant
 * 3. Use seoDescription if provided, otherwise use defaultDescription
 * 4. Generate canonical URL
 * 5. Set robots tag (index/noindex based on seoNoIndex)
 * 6. Generate Open Graph tags
 * 7. Generate Twitter Card tags
 *
 * @param params Build parameters
 * @returns Next.js Metadata object
 *
 * @example
 * const metadata = buildSeoForPage({
 *   tenantDefaults: {
 *     siteName: "My Store",
 *     defaultTitleSuffix: " - My Store",
 *     defaultDescription: "Find everything you need at My Store"
 *   },
 *   page: {
 *     title: "Home",
 *     slug: "home",
 *     seoTitle: "Welcome to Our Store",
 *     seoDescription: "Discover our products and services",
 *     seoNoIndex: false,
 *     seoImage: "https://cdn.example.com/og-image.jpg"
 *   },
 *   baseUrl: "https://app.example.com/t/my-store/home"
 * });
 * // Returns Metadata with title, description, OG tags, etc.
 */
export function buildSeoForPage(params: BuildSeoParams): Metadata {
  const { tenantDefaults, page, baseUrl } = params;

  // Build title: seoTitle (or page title) + suffix
  const titleBase = page.seoTitle?.trim() || page.title;
  const suffix = tenantDefaults.defaultTitleSuffix ?? "";
  const fullTitle = `${titleBase}${suffix}`;

  // Build description: seoDescription or default
  const description =
    page.seoDescription?.trim() ||
    tenantDefaults.defaultDescription ||
    `Página de ${tenantDefaults.siteName}`;

  // Determine indexing behavior
  const shouldIndex = !page.seoNoIndex;

  // Build Open Graph image if available
  const ogImages = page.seoImage
    ? [
        {
          url: page.seoImage,
          width: 1200,
          height: 630,
          alt: titleBase,
        },
      ]
    : undefined;

  // Build metadata
  const metadata: Metadata = {
    title: fullTitle,
    description,

    // Canonical URL (prevents duplicate content issues)
    alternates: {
      canonical: baseUrl,
    },

    // Robots meta tag
    robots: shouldIndex
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
        }
      : {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        },

    // Open Graph tags (for social media sharing)
    openGraph: {
      title: fullTitle,
      description,
      url: baseUrl,
      siteName: tenantDefaults.siteName,
      type: "website",
      locale: "pt_BR",
      ...(ogImages && { images: ogImages }),
    },

    // Twitter Card tags
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(page.seoImage && { image: page.seoImage }),
    },
  };

  return metadata;
}

/**
 * Build SEO metadata for error pages
 *
 * Used for 404, 500, etc. when page/tenant not found
 * Always noindex these pages
 *
 * @param code HTTP status code (404, 500, etc.)
 * @param message Error message
 * @returns Metadata for error page
 */
export function buildSeoForErrorPage(
  code: number,
  message: string
): Metadata {
  const title = `Erro ${code}`;

  return {
    title,
    description: message,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description: message,
      type: "website",
    },
  };
}

/**
 * Estimate how title will appear in Google
 *
 * Google truncates titles around 55-60 chars depending on device
 *
 * @param title Full title string
 * @returns Truncated title as it appears in search results
 */
export function getTruncatedTitle(title: string): string {
  const maxLength = 60;
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 1) + "…";
}

/**
 * Estimate how description will appear in Google
 *
 * Google truncates descriptions around 155-160 chars depending on device
 *
 * @param description Full description string
 * @returns Truncated description as it appears in search results
 */
export function getTruncatedDescription(description: string): string {
  const maxLength = 160;
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 1) + "…";
}

/**
 * Build JSON-LD for LocalBusiness
 *
 * Helps search engines understand the business
 * Useful for future enhancements (PHASE F.2)
 *
 * @param tenant Tenant data
 * @param page Page data
 * @returns JSON-LD LocalBusiness object
 *
 * @example
 * // Future use in generateMetadata:
 * const jsonLd = buildJsonLdLocalBusiness(tenant, page);
 * return {
 *   // ... other metadata
 *   other: {
 *     "ld+json": JSON.stringify(jsonLd)
 *   }
 * };
 */
export function buildJsonLdLocalBusiness(
  tenant: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    city?: string;
  }
) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: tenant.name,
    ...(tenant.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: tenant.address,
        addressLocality: tenant.city,
        addressCountry: "BR",
      },
    }),
    ...(tenant.phone && { telephone: tenant.phone }),
    ...(tenant.email && { email: tenant.email }),
  };
}
