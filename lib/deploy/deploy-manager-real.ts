import { prisma } from '@/lib/prisma.js';
import { cloudflareR2Provider } from './providers/cloudflare-r2-real.js';
import { generateStaticPageArtifacts } from '@/lib/static-export/generate-static-page.js';
import { generateDeploymentVersion } from '@/lib/static-export/versioning.js';
import type { DeploymentStatus } from '@prisma/client';

export interface ExecuteDeploymentInput {
  tenantId: string;
  pageId: string;
  slug: string;
  pageTitle?: string;
  pageDescription?: string;
}

export interface DeploymentResult {
  id: string;
  version: string;
  status: DeploymentStatus;
  deployedUrl: string | null;
  previewUrl: string | null;
  provider: string;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  metadata: any;
}

/**
 * Execute a complete deployment workflow
 * 1. Create deployment record (status: PENDING)
 * 2. Generate static artifacts
 * 3. Upload to Cloudflare R2 (status: UPLOADING)
 * 4. Update deployment record (status: COMPLETED)
 * 5. Record metrics
 *
 * @param input Deployment parameters
 * @returns Deployment result with URLs and metadata
 * @throws Error if any step fails
 */
export async function executeDeployment(
  input: ExecuteDeploymentInput
): Promise<DeploymentResult> {
  const { tenantId, pageId, slug, pageTitle, pageDescription } = input;

  const startTime = Date.now();

  // Step 1: Create initial deployment record
  const deployment = await prisma.deploymentRecord.create({
    data: {
      tenantId,
      pageId,
      slug,
      version: 'PENDING', // Will update after generation
      status: 'GENERATING',
      provider: 'cloudflare-r2',
      startedAt: new Date(),
      logs: {
        step: 'GENERATING',
        startedAt: new Date().toISOString(),
      },
    },
  });

  try {
    // Step 2: Generate static page artifacts
    console.log(`[Deploy] Generating artifacts for ${slug}...`);

    const artifacts = await generateStaticPageArtifacts({
      tenantId,
      pageId,
      slug,
      title: pageTitle,
      description: pageDescription,
    });

    // Generate version string
    const version = generateDeploymentVersion(tenantId, slug, pageId);

    // Update deployment record with version and status
    await prisma.deploymentRecord.update({
      where: { id: deployment.id },
      data: {
        version,
        status: 'UPLOADING',
        logs: {
          step: 'UPLOADING',
          artifactCount: 1, // index.html
          artifactSize: Buffer.byteLength(artifacts.html, 'utf-8'),
          previousStep: 'GENERATING',
        },
      },
    });

    // Step 3: Upload to Cloudflare R2
    console.log(`[Deploy] Uploading to Cloudflare R2...`);

    const uploadResult = await cloudflareR2Provider.uploadFiles(
      [
        {
          filename: 'index.html',
          contentType: 'text/html; charset=utf-8',
          contents: Buffer.from(artifacts.html, 'utf-8'),
        },
      ],
      {
        tenantId,
        pageId,
        slug,
        version,
      }
    );

    // Step 4: Update deployment record with success
    const finishedAt = new Date();
    const duration = (finishedAt.getTime() - startTime) / 1000;

    const result = await prisma.deploymentRecord.update({
      where: { id: deployment.id },
      data: {
        status: 'COMPLETED',
        deployedUrl: uploadResult.deployedUrl,
        previewUrl: uploadResult.previewUrl || artifacts.previewUrl,
        finishedAt,
        metadata: {
          provider: uploadResult,
          artifacts,
          duration,
          uploadedAt: finishedAt.toISOString(),
        } as any,
        logs: {
          step: 'COMPLETED',
          status: 'SUCCESS',
          completedAt: finishedAt.toISOString(),
          duration,
          uploadedUrl: uploadResult.deployedUrl,
        },
      },
    });

    // Step 5: Update metrics
    await updateDeploymentMetrics(tenantId, pageId, true, duration);

    console.log(
      `[Deploy] ✅ Deployment successful: ${result.deployedUrl} (${duration.toFixed(2)}s)`
    );

    return result;
  } catch (error) {
    const finishedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(`[Deploy] ❌ Deployment failed:`, error);

    // Update deployment record with failure
    const failedRecord = await prisma.deploymentRecord.update({
      where: { id: deployment.id },
      data: {
        status: 'FAILED',
        finishedAt,
        error: errorMessage,
        errorStack,
        logs: {
          step: 'FAILED',
          status: 'ERROR',
          error: errorMessage,
          failedAt: finishedAt.toISOString(),
          duration: (finishedAt.getTime() - startTime) / 1000,
        },
      },
    });

    // Record error
    await prisma.deploymentError.create({
      data: {
        deploymentId: deployment.id,
        message: errorMessage,
        stack: errorStack,
        context: {
          tenantId,
          pageId,
          slug,
        },
      },
    });

    // Update metrics
    const duration = (finishedAt.getTime() - startTime) / 1000;
    await updateDeploymentMetrics(tenantId, pageId, false, duration);

    throw error;
  }
}

/**
 * Check deployment status
 */
export async function checkDeploymentStatus(deploymentId: string) {
  return prisma.deploymentRecord.findUnique({
    where: { id: deploymentId },
  });
}

/**
 * Get deployment history for a page
 */
export async function getDeploymentHistory(
  tenantId: string,
  pageId: string,
  limit: number = 20,
  offset: number = 0
) {
  const [deployments, total] = await Promise.all([
    prisma.deploymentRecord.findMany({
      where: { tenantId, pageId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.deploymentRecord.count({
      where: { tenantId, pageId },
    }),
  ]);

  return {
    deployments,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}

/**
 * Get latest successful deployment
 */
export async function getLastSuccessfulDeployment(
  tenantId: string,
  pageId: string
) {
  return prisma.deploymentRecord.findFirst({
    where: {
      tenantId,
      pageId,
      status: 'COMPLETED',
    },
    orderBy: { finishedAt: 'desc' },
  });
}

/**
 * Initiate rollback to previous version
 */
export async function rollbackDeployment(
  tenantId: string,
  pageId: string,
  slug: string,
  targetVersion?: string
) {
  // Find target deployment
  const targetDeployment = targetVersion
    ? await prisma.deploymentRecord.findFirst({
        where: {
          tenantId,
          pageId,
          version: targetVersion,
          status: 'COMPLETED',
        },
      })
    : await prisma.deploymentRecord.findFirst({
        where: {
          tenantId,
          pageId,
          status: 'COMPLETED',
          createdAt: {
            lt: new Date(),
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 1, // Skip latest (current)
      });

  if (!targetDeployment) {
    throw new Error('Target deployment not found for rollback');
  }

  // Create new deployment record for rollback
  const rollbackDeployment = await prisma.deploymentRecord.create({
    data: {
      tenantId,
      pageId,
      slug,
      version: targetDeployment.version,
      status: 'ROLLING_BACK',
      provider: targetDeployment.provider,
      deployedUrl: targetDeployment.deployedUrl,
      previewUrl: targetDeployment.previewUrl,
      metadata: {
        rolledBackFrom: {
          version: targetDeployment.version,
          deploymentId: targetDeployment.id,
          timestamp: new Date().toISOString(),
        },
      },
    },
  });

  // TODO: Implement actual re-upload from R2
  // For now, just mark as completed if source URL exists
  if (targetDeployment.deployedUrl) {
    await prisma.deploymentRecord.update({
      where: { id: rollbackDeployment.id },
      data: {
        status: 'COMPLETED',
        finishedAt: new Date(),
      },
    });
  }

  return rollbackDeployment;
}

/**
 * Update deployment metrics
 */
async function updateDeploymentMetrics(
  tenantId: string,
  pageId: string,
  success: boolean,
  duration: number
) {
  const existing = await prisma.deploymentMetrics.findUnique({
    where: {
      tenantId_pageId: {
        tenantId,
        pageId,
      },
    },
  });

  if (!existing) {
    // Create new metrics record
    await prisma.deploymentMetrics.create({
      data: {
        tenantId,
        pageId,
        totalDeploys: 1,
        successfulDeploys: success ? 1 : 0,
        failedDeploys: success ? 0 : 1,
        averageDuration: duration,
        lastDeployedAt: success ? new Date() : null,
      },
    });
  } else {
    // Update existing metrics
    const newTotalDeploys = existing.totalDeploys + 1;
    const newSuccessful = existing.successfulDeploys + (success ? 1 : 0);
    const newFailed = existing.failedDeploys + (success ? 0 : 1);
    const newAverage =
      (existing.averageDuration * existing.totalDeploys + duration) /
      newTotalDeploys;

    await prisma.deploymentMetrics.update({
      where: {
        tenantId_pageId: {
          tenantId,
          pageId,
        },
      },
      data: {
        totalDeploys: newTotalDeploys,
        successfulDeploys: newSuccessful,
        failedDeploys: newFailed,
        averageDuration: newAverage,
        lastDeployedAt: success ? new Date() : undefined,
      },
    });
  }
}
