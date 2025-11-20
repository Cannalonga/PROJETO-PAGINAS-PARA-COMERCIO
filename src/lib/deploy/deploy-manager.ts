// src/lib/deploy/deploy-manager.ts
/**
 * Deployment orchestrator
 * Coordinates static page generation, uploading, and audit logging
 * Integrates BLOCO 1 (generation) with BLOCO 2 (deployment)
 */

import type { DeployFile } from "./providers/base-provider";
import { CloudflareR2Provider } from "./providers/cloudflare-r2";
import { logDeploymentActivity, updateDeploymentStatus, logDeploymentError } from "./activity-log";
import { generateStaticPageArtifacts } from "@/lib/static-export/generate-static-page";

/**
 * Execute complete deployment pipeline
 * 1. Log deployment start
 * 2. Generate static artifacts (HTML, preview, sitemap)
 * 3. Upload to provider (R2)
 * 4. Record success or failure
 * 5. Return deployment URLs
 *
 * @param ctx - Page context: tenantId, pageId, slug
 * @returns Deployment result with URLs and metadata
 * @throws Error if deployment fails
 */
export async function executeDeployment(ctx: {
  tenantId: string;
  pageId: string;
  slug: string;
}) {
  // Step 1: Create deployment record and start logging
  const deploymentRecord = await logDeploymentActivity(
    "deployment-" + ctx.pageId,
    ctx.pageId,
    ctx.tenantId,
    {
      tenantId: ctx.tenantId,
      pageId: ctx.pageId,
      slug: ctx.slug,
      version: "PENDING",
      status: "PENDING" as any,
      provider: "cloudflare-r2",
    } as any
  );

  console.log(
    `[Deploy ${deploymentRecord.id}] Starting deployment for ${ctx.tenantId}/${ctx.pageId}`
  );

  try {
    // Step 2: Generate static artifacts from Bloco 1
    console.log(`[Deploy ${deploymentRecord.id}] Generating static artifacts...`);
    const artifacts = await generateStaticPageArtifacts(ctx);
    console.log(
      `[Deploy ${deploymentRecord.id}] Generated version: ${artifacts.version}`
    );

    // Step 3: Prepare files for upload
    const files: DeployFile[] = [
      {
        path: `${ctx.tenantId}/${ctx.pageId}/${artifacts.version}/index.html`,
        contentType: "text/html; charset=utf-8",
        buffer: Buffer.from(artifacts.html),
      },
      {
        path: `${ctx.tenantId}/${ctx.pageId}/${artifacts.version}/preview.html`,
        contentType: "text/html; charset=utf-8",
        buffer: Buffer.from(artifacts.previewHtml),
      },
    ];

    console.log(`[Deploy ${deploymentRecord.id}] Uploading ${files.length} files to R2...`);

    // Step 4: Upload to provider
    const uploadResult = await CloudflareR2Provider.uploadFiles(files, {
      tenantId: ctx.tenantId,
      pageId: ctx.pageId,
      version: artifacts.version,
    });

    console.log(`[Deploy ${deploymentRecord.id}] Upload successful: ${uploadResult.deployedUrl}`);

    // Step 5: Mark deployment as successful
    const finalRecord = await updateDeploymentStatus(deploymentRecord.id, "SUCCESS", {
      version: artifacts.version,
      deployedUrl: uploadResult.deployedUrl,
      previewUrl: uploadResult.previewUrl,
      metadata: {
        ...uploadResult.metadata,
        filesDeployed: files.length,
        htmlSize: artifacts.html.length,
        deploymentDurationMs: Date.now() - deploymentRecord.startedAt.getTime(),
      },
    });

    console.log(`[Deploy ${deploymentRecord.id}] Deployment complete`);

    return {
      success: true,
      deploymentId: finalRecord.id,
      version: uploadResult.version,
      deployedUrl: uploadResult.deployedUrl,
      previewUrl: uploadResult.previewUrl,
      metadata: finalRecord.metadata,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`[Deploy ${deploymentRecord.id}] Deployment failed:`, errorMessage);

    // Log failure
    await logDeploymentError(deploymentRecord.id, error instanceof Error ? error : new Error(errorMessage));

    return {
      success: false,
      deploymentId: deploymentRecord.id,
      error: errorMessage,
    };
  }
}

/**
 * Check deployment status
 * Useful for polling during deployment or retrieving completion status
 *
 * @param deploymentId - Deployment record ID
 * @returns Current deployment status
 */
export async function checkDeploymentStatus(_deploymentId: string) {
  // TODO: Uncomment when Prisma is configured
  // const record = await getDeploymentById(deploymentId);
  // if (!record) {
  //   return { error: "Deployment not found" };
  // }
  // return {
  //   id: record.id,
  //   status: record.status,
  //   deployedUrl: record.deployedUrl,
  //   previewUrl: record.previewUrl,
  //   errorMessage: record.errorMessage,
  // };

  return {
    error: "Prisma not configured - see activity-log.ts TODO",
  };
}

/**
 * Get deployment history for a page
 * Shows timeline of all deployment attempts
 *
 * @param pageId - Page identifier
 * @param tenantId - Tenant identifier
 * @returns Array of past deployments, newest first
 */
export async function getDeploymentHistory(_pageId: string, _tenantId: string) {
  // TODO: Uncomment when Prisma is configured
  // return getDeploymentHistory(pageId, tenantId, 10);

  return [];
}
