import { S3Client } from '@aws-sdk/client-s3';

/**
 * Creates an S3Client configured for Cloudflare R2
 * R2 is S3-compatible, so we use the same AWS SDK
 *
 * @returns Configured S3Client instance
 * @throws Error if required environment variables are missing
 */
export function createR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing required Cloudflare R2 credentials. ' +
      'Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in .env.local'
    );
  }

  return new S3Client({
    region: process.env.R2_REGION ?? 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Get the public domain URL for R2 bucket
 * Used to construct downloadable URLs
 */
export function getR2PublicDomain(): string {
  const domain = process.env.R2_PUBLIC_DOMAIN;
  if (!domain) {
    throw new Error(
      'Missing R2_PUBLIC_DOMAIN environment variable. ' +
      'Set it to your R2 public URL (e.g., https://bucket-name.r2.dev)'
    );
  }
  return domain;
}

/**
 * Get the bucket name
 */
export function getR2BucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error(
      'Missing R2_BUCKET_NAME environment variable. ' +
      'Set it to your R2 bucket name'
    );
  }
  return bucket;
}
