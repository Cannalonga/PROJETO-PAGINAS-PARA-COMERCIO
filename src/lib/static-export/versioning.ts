// src/lib/static-export/versioning.ts
/**
 * Version generation for static page deployments.
 * Creates unique, sortable deployment versions with timestamp and identifiers.
 */

import { randomUUID } from "crypto";

/**
 * Generate a unique deployment version string.
 *
 * Format: v-YYYYMMDDHHmm-{tenantId}-{pageId}-{shortHash}
 * Example: v-20251119-1320-tenant123-page456-abc123
 *
 * @param tenantId - Tenant identifier
 * @param pageId - Page identifier
 * @returns Unique version string
 */
export function generateDeploymentVersion(
  tenantId: string,
  pageId: string
): string {
  const now = new Date();

  // ISO 8601 timestamp components
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
  ].join("");

  // Short UUID for collision avoidance
  const shortId = randomUUID().split("-")[0];

  return `v-${stamp}-${tenantId}-${pageId}-${shortId}`;
}

/**
 * Parse a deployment version to extract components.
 * Useful for auditing and rollback scenarios.
 *
 * @param version - Version string (v-YYYYMMDDHHmm-tenantId-pageId-hash)
 * @returns Object with extracted components or null if invalid
 */
export function parseDeploymentVersion(version: string): {
  timestamp: Date;
  tenantId: string;
  pageId: string;
  hash: string;
} | null {
  const pattern =
    /^v-(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})-(.+?)-(.+?)-([a-f0-9]+)$/;
  const match = version.match(pattern);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, tenantId, pageId, hash] = match;

  const timestamp = new Date(
    Date.UTC(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10)
    )
  );

  return {
    timestamp,
    tenantId,
    pageId,
    hash,
  };
}
