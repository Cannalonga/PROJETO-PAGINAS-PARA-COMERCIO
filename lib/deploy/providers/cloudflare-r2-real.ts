import {
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { createR2Client, getR2PublicDomain, getR2BucketName } from '../r2-client.js';
import type { DeployProvider, DeployFile, DeployProviderUploadResult, CacheInvalidationResult } from './base-provider.js';

export interface CloudflareR2DeployContext {
  tenantId: string;
  pageId: string;
  slug: string;
  version: string;
}

/**
 * Cloudflare R2 Provider Implementation
 * Uses S3-compatible API for object storage and retrieval
 */
export const cloudflareR2Provider: DeployProvider = {
  name: 'cloudflare-r2',

  /**
   * Upload files to Cloudflare R2 bucket
   * Each file is stored with tenant/slug/filename structure
   *
   * @param files Array of files to upload
   * @param options Upload metadata (tenantId, pageId, version)
   * @returns Upload result with deployed URLs
   */
  async uploadFiles(
    files: DeployFile[],
    options: { tenantId: string; pageId: string; version: string }
  ): Promise<DeployProviderUploadResult> {
    const client = createR2Client();
    const bucket = getR2BucketName();
    const publicDomain = getR2PublicDomain();

    // Construct base path: /tenant-id/page-id/
    const basePath = `${options.tenantId}/${options.pageId}`;

    try {
      for (const file of files) {
        const key = `${basePath}/${file.path}`;

        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.contentType,
          // Cache immutable assets for 1 year
          CacheControl: 'public, max-age=31536000, immutable',
          // Add custom headers for security
          Metadata: {
            'x-tenant-id': options.tenantId,
            'x-page-id': options.pageId,
            'x-version': options.version,
          },
        });

        await client.send(command);
      }

      // Return public URL
      const deployedUrl = `${publicDomain}/${basePath}/index.html`;

      console.log(
        `[Cloudflare R2] Successfully uploaded ${files.length} files to ${deployedUrl}`
      );

      return {
        deployedUrl,
        success: true,
        deployedAt: new Date(),
      };
    } catch (error) {
      console.error('[Cloudflare R2] Upload failed:', error);
      throw new Error(
        `Failed to upload files to Cloudflare R2: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  },

  /**
   * Invalidate cache for deployment
   * R2 doesn't require explicit cache invalidation
   * (Cache-Control headers handle it automatically)
   *
   * @param paths Paths to invalidate
   * @returns Cache invalidation result
   */
  async invalidateCache(paths: string[]): Promise<CacheInvalidationResult> {
    // R2 respects Cache-Control headers automatically
    // No explicit purge needed like CloudFlare CDN
    console.log(
      `[Cloudflare R2] Cache invalidation not needed (uses Cache-Control headers)`
    );

    return {
      success: true,
      invalidatedPaths: paths,
      timestamp: new Date(),
    };
  },

  /**
   * Delete specific version from storage
   * @param version Version identifier to delete
   */
  async deleteVersion(version: string): Promise<void> {
    const client = createR2Client();
    const bucket = getR2BucketName();

    try {
      // List and delete all objects with version prefix
      const listCommand = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: `${version}/`,
      });

      const response = await client.send(listCommand);
      if (response.Contents) {
        for (const obj of response.Contents) {
          if (obj.Key) {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: bucket,
              Key: obj.Key,
            });
            await client.send(deleteCommand);
          }
        }
      }

      console.log(`[Cloudflare R2] Successfully deleted version ${version}`);
    } catch (error) {
      console.error('[Cloudflare R2] Delete version failed:', error);
      throw new Error(
        `Failed to delete version from Cloudflare R2: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  },
};

export default cloudflareR2Provider;
