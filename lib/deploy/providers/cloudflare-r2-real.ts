import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { createR2Client, getR2PublicDomain, getR2BucketName } from '../r2-client.js';
import type { DeployProvider, DeployFile } from './base-provider.js';

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
  displayName: 'Cloudflare R2',

  /**
   * Upload files to Cloudflare R2 bucket
   * Each file is stored with tenant/slug/filename structure
   *
   * @param files Array of files to upload
   * @param ctx Deployment context (tenant, page, slug, version)
   * @returns Public URL where files are accessible
   */
  async uploadFiles(files: DeployFile[], ctx: CloudflareR2DeployContext) {
    const client = createR2Client();
    const bucket = getR2BucketName();
    const publicDomain = getR2PublicDomain();

    // Construct base path: /tenant-slug/page-slug/
    const basePath = `${ctx.tenantId}/${ctx.slug}`;

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
            'x-tenant-id': ctx.tenantId,
            'x-page-id': ctx.pageId,
            'x-version': ctx.version,
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
        url: deployedUrl,
        bucket,
        basePath,
        filesCount: files.length,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Cloudflare R2] Upload failed:', error);
      throw new Error(
        `Failed to upload files to Cloudflare R2: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  },

  /**
   * Delete files from Cloudflare R2
   * Used for cleanup and removing old versions
   *
   * @param keys Array of file keys to delete
   * @param ctx Deployment context
   */
  async deleteFiles(keys: string[], ctx: CloudflareR2DeployContext) {
    const client = createR2Client();
    const bucket = getR2BucketName();
    const basePath = `${ctx.tenantId}/${ctx.slug}`;

    try {
      for (const key of keys) {
        const fullKey = `${basePath}/${key}`;

        const command = new DeleteObjectCommand({
          Bucket: bucket,
          Key: fullKey,
        });

        await client.send(command);
      }

      console.log(`[Cloudflare R2] Successfully deleted ${keys.length} files`);
    } catch (error) {
      console.error('[Cloudflare R2] Delete failed:', error);
      throw new Error(
        `Failed to delete files from Cloudflare R2: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  },

  /**
   * Invalidate cache for deployment
   * R2 doesn't require explicit cache invalidation
   * (Cache-Control headers handle it automatically)
   *
   * @param ctx Deployment context
   * @returns Success indicator
   */
  async invalidateCache(ctx: CloudflareR2DeployContext) {
    // R2 respects Cache-Control headers automatically
    // No explicit purge needed like CloudFlare CDN
    console.log(
      `[Cloudflare R2] Cache invalidation not needed (uses Cache-Control headers)`
    );
    return { success: true, method: 'automatic' };
  },

  /**
   * Get file from R2
   * Useful for rollback and version management
   */
  async getFile(key: string, ctx: CloudflareR2DeployContext) {
    const client = createR2Client();
    const bucket = getR2BucketName();
    const fullKey = `${ctx.tenantId}/${ctx.slug}/${key}`;

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: fullKey,
      });

      const response = await client.send(command);
      const body = await response.Body?.transformToByteArray();

      return body;
    } catch (error) {
      console.error('[Cloudflare R2] Get file failed:', error);
      throw new Error(
        `Failed to retrieve file from Cloudflare R2: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  },
};

export default cloudflareR2Provider;
