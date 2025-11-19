// src/lib/deploy/providers/base-provider.ts
/**
 * Base provider interface for deployment to static hosting services.
 * Defines the contract that all deployment providers must implement.
 */

/**
 * Single file to be deployed
 */
export interface DeployFile {
  path: string; // ex: "tenants/x/pages/y/v123/index.html"
  contentType: string; // ex: "text/html", "text/css", "application/json"
  buffer: Buffer; // raw file content
}

/**
 * Result of successful file upload
 */
export interface DeployProviderUploadResult {
  deployedUrl: string; // production URL of deployed page
  previewUrl?: string; // preview URL (if available)
  version: string; // version identifier
  metadata?: Record<string, unknown>; // provider-specific metadata
}

/**
 * Result of cache invalidation
 */
export interface CacheInvalidationResult {
  success: boolean;
  message?: string;
}

/**
 * Provider interface - all deployment providers must implement this
 */
export interface DeployProvider {
  /**
   * Unique provider name (ex: "cloudflare-r2", "aws-s3")
   */
  name: string;

  /**
   * Upload files to provider's storage
   *
   * @param files - Array of files to upload
   * @param options - Context: tenantId, pageId, version
   * @returns Upload result with URLs and metadata
   */
  uploadFiles(
    files: DeployFile[],
    options?: {
      tenantId: string;
      pageId: string;
      version: string;
    }
  ): Promise<DeployProviderUploadResult>;

  /**
   * Invalidate cache for deployed URLs
   * Used after updates to force cache refresh
   *
   * @param params - URLs to invalidate
   * @returns Invalidation result
   */
  invalidateCache(params: {
    tenantId: string;
    pageId: string;
    urls: string[];
  }): Promise<CacheInvalidationResult>;

  /**
   * Delete a specific version (optional, for cleanup)
   *
   * @param params - Version to delete
   * @returns Deletion result
   */
  deleteVersion?(params: {
    tenantId: string;
    pageId: string;
    version: string;
  }): Promise<{ success: boolean }>;
}
