// types/seo.ts
/**
 * SEO Type System
 *
 * Defines all types for SEO configuration, validation, and generation.
 * Supports multi-tenant SEO with tenant-level defaults and page-level overrides.
 */

/**
 * Basic SEO configuration for a page
 *
 * @property title - SEO title (fallback to page.title if not set)
 * @property description - Meta description (160 chars max)
 * @property noIndex - Whether to disallow indexing
 * @property keywords - SEO keywords (deprecated in modern SEO but kept for reference)
 */
export type BasicSeoConfig = {
  title: string;
  description?: string;
  noIndex?: boolean;
  keywords?: string;
};

/**
 * Tenant-level SEO defaults
 *
 * All pages in a tenant inherit these settings unless overridden
 *
 * @property siteName - Business/tenant name
 * @property defaultTitleSuffix - Suffix added to all page titles (e.g., " - Loja X")
 * @property defaultDescription - Default meta description for pages without override
 */
export type TenantSeoDefaults = {
  siteName: string;
  defaultTitleSuffix?: string;
  defaultDescription?: string;
};

/**
 * Page-level SEO overrides
 *
 * These override tenant defaults for specific pages
 *
 * @property seoTitle - Custom title (overrides page.title + suffix)
 * @property seoDescription - Custom meta description
 * @property seoNoIndex - Whether to disallow indexing
 */
export type PageSeoOverrides = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoNoIndex?: boolean | null;
};

/**
 * SEO input from admin panel
 *
 * Validated with Zod before saving to DB
 * Can be null/undefined to remove overrides
 */
export type SeoInput = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoNoIndex?: boolean | null;
};

/**
 * Complete SEO configuration for generateMetadata
 *
 * Result of merging tenant defaults + page overrides
 */
export type FinalSeoConfig = BasicSeoConfig & {
  url: string;
  siteName: string;
  ogImage?: string;
};

/**
 * Parameters for SEO engine buildSeoForPage
 */
export type BuildSeoParams = {
  tenantDefaults: TenantSeoDefaults;
  page: {
    title: string;
    slug: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoNoIndex?: boolean | null;
    seoImage?: string | null;
  };
  baseUrl: string; // Full URL to the page
};

/**
 * Metadata response structure
 *
 * Matches Next.js Metadata type
 */
export type SeoMetadata = {
  title: string;
  description: string;
  robots?: {
    index: boolean;
    follow: boolean;
  };
  canonical?: string;
  openGraph?: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    type: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
  twitter?: {
    card: string;
    title: string;
    description: string;
    image?: string;
  };
};
