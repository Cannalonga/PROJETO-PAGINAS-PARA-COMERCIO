/**
 * Publishing System Library
 * Handles page publishing, versioning, and live preview
 */

export interface PageVersion {
  id: string;
  pageId: string;
  versionNumber: number;
  title: string;
  content: Record<string, any>;
  status: 'DRAFT' | 'PUBLISHED';
  publishedBy?: string;
  publishedAt?: Date;
  createdAt: Date;
}

export interface PublishRequest {
  title?: string;
  description?: string;
  content: Record<string, any>;
}

/**
 * Create new page version
 */
export function createPageVersion(
  pageId: string,
  versionNumber: number,
  data: PublishRequest,
  userId?: string,
): PageVersion {
  return {
    id: `version-${Date.now()}`,
    pageId,
    versionNumber,
    title: data.title || '',
    content: data.content,
    status: 'DRAFT',
    publishedBy: userId,
    createdAt: new Date(),
  };
}

/**
 * Publish page version
 */
export function publishPageVersion(version: PageVersion): PageVersion {
  return {
    ...version,
    status: 'PUBLISHED',
    publishedAt: new Date(),
  };
}

/**
 * Compare two page versions
 */
export function compareVersions(
  version1: PageVersion,
  version2: PageVersion,
): {
  changed: boolean;
  differences: string[];
} {
  const differences: string[] = [];

  if (version1.title !== version2.title) {
    differences.push(`Title: "${version1.title}" → "${version2.title}"`);
  }

  const content1 = JSON.stringify(version1.content);
  const content2 = JSON.stringify(version2.content);
  if (content1 !== content2) {
    differences.push('Content updated');
  }

  return {
    changed: differences.length > 0,
    differences,
  };
}

/**
 * Generate page URL slug
 */
export function generatePageUrl(tenantSlug: string, pageSlug: string): string {
  return `https://${tenantSlug}.comerciopago.com/pages/${pageSlug}`;
}

/**
 * Create preview link
 */
export function generatePreviewLink(pageId: string, token?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const query = token ? `?preview_token=${token}` : '';
  return `${baseUrl}/preview/${pageId}${query}`;
}

/**
 * Schedule publication
 */
export interface ScheduledPublication {
  pageId: string;
  versionId: string;
  scheduledFor: Date;
  createdBy: string;
  createdAt: Date;
}

export function createScheduledPublication(
  pageId: string,
  versionId: string,
  scheduledFor: Date,
  userId: string,
): ScheduledPublication {
  return {
    pageId,
    versionId,
    scheduledFor,
    createdBy: userId,
    createdAt: new Date(),
  };
}

/**
 * Check if publication is ready
 */
export function isScheduledPublicationReady(scheduled: ScheduledPublication): boolean {
  return new Date() >= scheduled.scheduledFor;
}
