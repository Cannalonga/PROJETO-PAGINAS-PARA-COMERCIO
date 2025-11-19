// src/lib/static-export/types.ts
/**
 * Core types for static page export and deployment workflow.
 * Used throughout the static export pipeline.
 */

export type StaticDeployStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "ROLLED_BACK";

/**
 * Context for processing a single page in static export.
 * Defines tenant isolation and page routing.
 */
export interface StaticPageContext {
  tenantId: string;
  pageId: string;
  slug: string;
  locale?: string;
}

/**
 * SEO metadata for static pages.
 * Used in HTML head and sitemap generation.
 */
export interface StaticPageSeo {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

/**
 * Complete page data ready for static generation.
 * Combines content, template, and SEO metadata.
 */
export interface StaticPageData {
  id: string;
  tenantId: string;
  slug: string;
  blocks: any[]; // Replace with PageBlock type when available
  template: any; // Replace with Template type when available
  variables?: Record<string, unknown>;
  theme?: Record<string, unknown>;
  seo?: StaticPageSeo;
  updatedAt: Date;
}

/**
 * Binary asset reference for static export.
 * Tracks images, CSS, JS, and other static assets.
 */
export interface StaticAssetReference {
  path: string;
  contentType: string;
  size: number;
  buffer: Buffer;
}

/**
 * Complete set of artifacts generated from a single page.
 * Ready for deployment to static hosting.
 */
export interface StaticPageArtifacts {
  html: string;
  previewHtml: string;
  sitemapEntry: string;
  assets: StaticAssetReference[];
  version: string;
  deployedUrl?: string;
  previewUrl?: string;
}

/**
 * Deployment record for audit trail and rollback capability.
 * Stored in database for deployment history.
 */
export interface DeploymentRecord {
  id: string;
  tenantId: string;
  pageId: string;
  version: string;
  status: StaticDeployStatus;
  provider: string;
  startedAt: Date;
  finishedAt?: Date;
  errorMessage?: string;
  deployedUrl?: string;
  previewUrl?: string;
  metadata?: Record<string, unknown>;
}
