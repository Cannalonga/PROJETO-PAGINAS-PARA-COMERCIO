/**
 * Dashboard Business Logic
 * Aggregates metrics, calculates KPIs, generates analytics data
 */

export interface DashboardStats {
  totalPages: number
  totalViews: number
  totalConversions: number
  averageEngagement: number
  monthlyGrowth: number
}

export interface PageMetrics {
  id: string
  name: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  views: number
  conversions: number
  engagement: number
  createdAt: Date
  updatedAt: Date
}

export interface AnalyticsPoint {
  date: string
  views: number
  conversions: number
  engagement: number
}

export interface TimelineEvent {
  id: string
  type: 'PAGE_CREATED' | 'PAGE_PUBLISHED' | 'PAGE_UPDATED' | 'PAGE_ARCHIVED'
  title: string
  description: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface DashboardSettings {
  autoPublish: boolean
  emailNotifications: boolean
  analyticsFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  theme: 'LIGHT' | 'DARK'
}

/**
 * Calculate dashboard statistics
 * Aggregates page metrics into KPIs
 */
export function calculateDashboardStats(pages: PageMetrics[]): DashboardStats {
  if (pages.length === 0) {
    return {
      totalPages: 0,
      totalViews: 0,
      totalConversions: 0,
      averageEngagement: 0,
      monthlyGrowth: 0,
    }
  }

  const totalPages = pages.length
  const totalViews = pages.reduce((sum, page) => sum + (page.views || 0), 0)
  const totalConversions = pages.reduce((sum, page) => sum + (page.conversions || 0), 0)
  const averageEngagement =
    pages.reduce((sum, page) => sum + (page.engagement || 0), 0) / pages.length

  // Calculate growth: pages published this month vs last month
  const now = new Date()
  const thisMonth = pages.filter((p) => {
    const pageDate = new Date(p.createdAt)
    return pageDate.getMonth() === now.getMonth() && pageDate.getFullYear() === now.getFullYear()
  })

  const lastMonth = pages.filter((p) => {
    const pageDate = new Date(p.createdAt)
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1)
    return pageDate.getMonth() === lastMonthDate.getMonth()
  })

  const monthlyGrowth = lastMonth.length > 0 ? ((thisMonth.length - lastMonth.length) / lastMonth.length) * 100 : 0

  return {
    totalPages,
    totalViews,
    totalConversions,
    averageEngagement: Math.round(averageEngagement * 100) / 100,
    monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
  }
}

/**
 * Sort pages by metric
 */
export function sortPagesByMetric(
  pages: PageMetrics[],
  sortBy: 'views' | 'conversions' | 'engagement' | 'recent',
  limit: number = 10
): PageMetrics[] {
  let sorted = [...pages]

  switch (sortBy) {
    case 'views':
      sorted.sort((a, b) => (b.views || 0) - (a.views || 0))
      break
    case 'conversions':
      sorted.sort((a, b) => (b.conversions || 0) - (a.conversions || 0))
      break
    case 'engagement':
      sorted.sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
      break
    case 'recent':
      sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      break
  }

  return sorted.slice(0, limit)
}

/**
 * Filter pages by status
 */
export function filterPagesByStatus(pages: PageMetrics[], status: string): PageMetrics[] {
  if (status === 'ALL') return pages
  return pages.filter((page) => page.status === status)
}

/**
 * Generate analytics time series
 * Simulates analytics data for chart display
 */
export function generateAnalyticsData(
  pages: PageMetrics[],
  days: number = 30
): AnalyticsPoint[] {
  const data: AnalyticsPoint[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // Distribute metrics across days (simulated)
    const dayPages = pages.filter((p) => {
      const pageDate = new Date(p.updatedAt)
      return pageDate.toISOString().split('T')[0] === dateStr || i === 0 // Add all to last day
    })

    const totalViews = dayPages.reduce((sum, p) => sum + (p.views || 0), 0)
    const totalConversions = dayPages.reduce((sum, p) => sum + (p.conversions || 0), 0)
    const avgEngagement =
      dayPages.length > 0
        ? dayPages.reduce((sum, p) => sum + (p.engagement || 0), 0) / dayPages.length
        : 0

    data.push({
      date: dateStr,
      views: Math.max(10, Math.round(totalViews / Math.max(1, pages.length))),
      conversions: Math.max(0, Math.round(totalConversions / Math.max(1, pages.length))),
      engagement: Math.round(avgEngagement * 100) / 100,
    })
  }

  return data
}

/**
 * Create timeline events from pages
 */
export function createTimelineEvents(pages: PageMetrics[]): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // Sort by date descending (most recent first)
  const sortedPages = [...pages].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  for (const page of sortedPages) {
    // Most recent update event
    events.push({
      id: `${page.id}-updated`,
      type: page.status === 'PUBLISHED' ? 'PAGE_PUBLISHED' : 'PAGE_UPDATED',
      title: `${page.status === 'PUBLISHED' ? 'Published' : 'Updated'}: ${page.name}`,
      description: `${page.views} views, ${page.conversions} conversions`,
      timestamp: page.updatedAt,
      metadata: { pageId: page.id, views: page.views, conversions: page.conversions },
    })

    // Creation event
    if (page.createdAt !== page.updatedAt) {
      events.push({
        id: `${page.id}-created`,
        type: 'PAGE_CREATED',
        title: `Created: ${page.name}`,
        description: `New page in ${page.status} status`,
        timestamp: page.createdAt,
        metadata: { pageId: page.id },
      })
    }
  }

  return events.slice(0, 10) // Return last 10 events
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(views: number, conversions: number): number {
  if (views === 0) return 0
  return Math.round((conversions / views) * 100 * 100) / 100 // 2 decimal places
}

/**
 * Calculate engagement score (0-100)
 * Based on views, conversions, and time spent
 */
export function calculateEngagementScore(
  views: number,
  conversions: number,
  avgTimeSpent: number = 30
): number {
  const conversionWeight = (conversions / Math.max(views, 1)) * 50
  const timeWeight = Math.min((avgTimeSpent / 300) * 30, 30)
  const viewWeight = Math.min((views / 1000) * 20, 20)

  return Math.round(conversionWeight + timeWeight + viewWeight)
}

/**
 * Format large numbers for display
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

/**
 * Get page status badge color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-green-100 text-green-800'
    case 'DRAFT':
      return 'bg-yellow-100 text-yellow-800'
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

/**
 * Validate dashboard settings
 */
export function validateDashboardSettings(settings: Partial<DashboardSettings>): boolean {
  if (settings.analyticsFrequency && !['DAILY', 'WEEKLY', 'MONTHLY'].includes(settings.analyticsFrequency)) {
    return false
  }
  if (settings.theme && !['LIGHT', 'DARK'].includes(settings.theme)) {
    return false
  }
  return true
}

/**
 * Get growth direction and color
 */
export function getGrowthIndicator(growth: number): { direction: 'UP' | 'DOWN' | 'NEUTRAL'; color: string } {
  if (growth > 5) return { direction: 'UP', color: 'text-green-600' }
  if (growth < -5) return { direction: 'DOWN', color: 'text-red-600' }
  return { direction: 'NEUTRAL', color: 'text-gray-600' }
}

/**
 * Export dashboard data to CSV format
 */
export function exportDashboardData(pages: PageMetrics[], stats: DashboardStats): string {
  let csv = 'Dashboard Export\n'
  csv += `Generated: ${new Date().toISOString()}\n\n`

  csv += 'STATISTICS\n'
  csv += `Total Pages,${stats.totalPages}\n`
  csv += `Total Views,${stats.totalViews}\n`
  csv += `Total Conversions,${stats.totalConversions}\n`
  csv += `Avg Engagement,${stats.averageEngagement}\n`
  csv += `Monthly Growth,${stats.monthlyGrowth}%\n\n`

  csv += 'PAGES\n'
  csv += 'Name,Status,Views,Conversions,Engagement,Created,Updated\n'

  for (const page of pages) {
    csv += `"${page.name}",${page.status},${page.views},${page.conversions},${page.engagement},${page.createdAt},${page.updatedAt}\n`
  }

  return csv
}
