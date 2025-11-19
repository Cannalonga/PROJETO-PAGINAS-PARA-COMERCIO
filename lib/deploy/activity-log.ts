// lib/deploy/activity-log.ts
/**
 * Deployment activity logging and audit trail persistence
 * Records all deployment attempts for monitoring, debugging, and compliance
 */

import type { DeploymentRecord, StaticDeployStatus } from "@/lib/static-export/types";

/**
 * Create new deployment activity log entry
 * Called when deployment starts
 *
 * @param _id - Deployment ID
 * @param _pageId - Page ID
 * @param _tenantId - Tenant ID
 * @param data - Deployment record data
 * @returns Created deployment record with id and timestamp
 */
export async function logDeploymentActivity(
  _id: string,
  _pageId: string,
  _tenantId: string,
  data: Omit<DeploymentRecord, "id" | "startedAt">
): Promise<DeploymentRecord> {
  // TODO: Uncomment when Prisma is configured
  /*
  return prisma.deploymentRecord.create({
    data: {
      ...data,
      startedAt: new Date(),
    },
  });
  */

  // Placeholder for development
  const id = `deploy_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    startedAt: new Date(),
    ...data,
  } as DeploymentRecord;
}

/**
 * Update deployment status
 * Called during deployment progress or on completion/failure
 *
 * @param _id - Deployment record ID
 * @param status - New status (RUNNING, SUCCESS, FAILED, ROLLED_BACK)
 * @param extra - Additional fields to update (URLs, errors, metadata)
 * @returns Updated deployment record
 */
export async function updateDeploymentStatus(
  _id: string,
  status: StaticDeployStatus,
  extra?: {
    deployedUrl?: string;
    previewUrl?: string;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<DeploymentRecord> {
  // TODO: Uncomment when Prisma is configured
  /*
  return prisma.deploymentRecord.update({
    where: { id },
    data: {
      status,
      finishedAt: status === 'SUCCESS' || status === 'FAILED' ? new Date() : undefined,
      ...extra,
    },
  });
  */

  // Placeholder for development
  return {
    id: _id,
    tenantId: "tenant_placeholder",
    pageId: "page_placeholder",
    version: "v-placeholder",
    status,
    provider: "cloudflare-r2",
    startedAt: new Date(),
    finishedAt: status === "SUCCESS" || status === "FAILED" ? new Date() : undefined,
    ...extra,
  } as DeploymentRecord;
}

/**
 * Get deployment by ID
 * Used for status checking and retrieval
 *
 * @param _id - Deployment record ID
 * @returns Deployment record or null if not found
 */
export async function getDeploymentById(_id: string): Promise<DeploymentRecord | null> {
  // TODO: Uncomment when Prisma is configured
  /*
  return prisma.deploymentRecord.findUnique({
    where: { id },
  });
  */

  return null;
}

/**
 * Get deployment history for a page
 * Useful for timeline, rollback options, and monitoring
 *
 * @param _pageId - Page identifier
 * @param _tenantId - Tenant identifier (for multi-tenant isolation)
 * @param _limit - Maximum number of records to return
 * @returns Array of deployment records, newest first
 */
export async function getDeploymentHistory(
  _pageId: string,
  _tenantId: string,
  _limit: number = 10
): Promise<DeploymentRecord[]> {
  // TODO: Uncomment when Prisma is configured
  /*
  return prisma.deploymentRecord.findMany({
    where: {
      pageId,
      tenantId,
    },
    orderBy: { startedAt: "desc" },
    take: limit,
  });
  */

  return [];
}

/**
 * Get last successful deployment
 * Used for rollback target identification
 *
 * @param _pageId - Page identifier
 * @param _tenantId - Tenant identifier
 * @returns Last successful deployment or null
 */
export async function getLastSuccessfulDeployment(
  _pageId: string,
  _tenantId: string
): Promise<DeploymentRecord | null> {
  // TODO: Uncomment when Prisma is configured
  /*
  return prisma.deploymentRecord.findFirst({
    where: {
      pageId,
      tenantId,
      status: "SUCCESS",
    },
    orderBy: { startedAt: "desc" },
  });
  */

  return null;
}

/**
 * Log deployment error
 * Separate handler for error logging with extra context
 *
 * @param deploymentId - Deployment ID
 * @param error - Error object or message
 * @param context - Additional context
 * @returns Updated deployment record
 */
export async function logDeploymentError(
  deploymentId: string,
  error: Error | string,
  context?: Record<string, unknown>
): Promise<DeploymentRecord> {
  const errorMessage = error instanceof Error ? error.message : String(error);

  return updateDeploymentStatus(deploymentId, "FAILED", {
    errorMessage,
    metadata: {
      errorContext: context,
      failedAt: new Date(),
    },
  });
}
