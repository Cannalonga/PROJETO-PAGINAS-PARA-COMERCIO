/**
 * Analytics Library
 * Handles page views, events, and analytics data
 */

export interface PageViewEvent {
  id: string;
  pageId: string;
  tenantId: string;
  userAgent: string;
  ipAddress: string;
  referrer?: string;
  timestamp: Date;
}

export interface PageEvent {
  id: string;
  pageId: string;
  tenantId: string;
  eventType: 'PAGE_VIEW' | 'BUTTON_CLICK' | 'FORM_SUBMISSION' | 'PHONE_CALL' | 'WHATSAPP_CLICK';
  eventData?: Record<string, any>;
  timestamp: Date;
}

export interface AnalyticsMetrics {
  totalViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ slug: string; views: number }>;
  topReferrers: Array<{ referrer: string; views: number }>;
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
}

/**
 * Record page view
 */
export function recordPageView(
  pageId: string,
  tenantId: string,
  userAgent: string,
  ipAddress: string,
  referrer?: string,
): PageViewEvent {
  return {
    id: `view-${Date.now()}`,
    pageId,
    tenantId,
    userAgent,
    ipAddress,
    referrer,
    timestamp: new Date(),
  };
}

/**
 * Record event
 */
export function recordEvent(
  pageId: string,
  tenantId: string,
  eventType: PageEvent['eventType'],
  eventData?: Record<string, any>,
): PageEvent {
  return {
    id: `event-${Date.now()}`,
    pageId,
    tenantId,
    eventType,
    eventData,
    timestamp: new Date(),
  };
}

/**
 * Detect device type from user agent
 */
export function detectDeviceType(
  userAgent: string,
): 'mobile' | 'desktop' | 'tablet' {
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile';
  }
  if (/ipad|android|tablet/i.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Calculate bounce rate
 */
export function calculateBounceRate(events: PageEvent[], views: number): number {
  if (views === 0) return 0;
  const bounces = events.filter((e) => e.eventType === 'PAGE_VIEW').length;
  return (bounces / views) * 100;
}

/**
 * Group events by date
 */
export function groupEventsByDate(
  events: PageEvent[],
): Record<string, number> {
  const grouped: Record<string, number> = {};

  events.forEach((event) => {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  return grouped;
}

/**
 * Calculate engagement score
 */
export function calculateEngagementScore(
  views: number,
  clicks: number,
  submissions: number,
): number {
  const clickRate = views > 0 ? (clicks / views) * 100 : 0;
  const submissionRate = clicks > 0 ? (submissions / clicks) * 100 : 0;
  return Math.round((clickRate + submissionRate) / 2);
}

/**
 * Get top performing pages
 */
export function getTopPages(
  views: Map<string, number>,
  limit: number = 5,
): Array<{ slug: string; views: number }> {
  return Array.from(views.entries())
    .map(([slug, views]) => ({ slug, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}
