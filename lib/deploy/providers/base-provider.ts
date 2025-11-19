// lib/deploy/providers/base-provider.ts
/**
 * Base deployment provider interface
 * Defines the contract for all deployment providers (R2, S3, Supabase, etc.)
 */

/**
 * Single file to be deployed
 */
export interface DeployFile {
  path: string;
  contentType: string;
  buffer: Buffer;
  cacheControl?: string;
}

/**
 * Result of uploading files to provider
 */
export interface DeployProviderUploadResult {
  deployedUrl: string;
  previewUrl?: string;
  success: boolean;
  deployedAt?: Date;
}

/**
 * Result of cache invalidation
 */
export interface CacheInvalidationResult {
  success: boolean;
  invalidatedPaths?: string[];
  timestamp: Date;
}

/**
 * Base interface for all deployment providers
 * Implementations should handle uploading, caching, and cleanup
 */
export interface DeployProvider {
  name: string;

  /**
   * Upload files to the provider storage
   * @param files - Array of files to upload
   * @param options - Upload metadata (tenantId, pageId, version)
   * @returns Upload result with deployed URLs
   */
  uploadFiles(
    files: DeployFile[],
    options: { tenantId: string; pageId: string; version: string }
  ): Promise<DeployProviderUploadResult>;

  /**
   * Invalidate CDN cache for specific paths
   * @param paths - Paths to invalidate (e.g., ['/index.html', '/preview.html'])
   * @returns Cache invalidation result
   */
  invalidateCache(paths: string[]): Promise<CacheInvalidationResult>;

  /**
   * Optional: Delete specific version from storage
   * Useful for cleanup and space management
   * @param version - Version identifier
   * @returns void
   */
  deleteVersion(version: string): Promise<void>;
}
