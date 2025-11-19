import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createTimelineEvents, PageMetrics } from '@/lib/dashboard'
import { logAuditEvent } from '@/lib/audit'

/**
 * GET /api/dashboard/timeline
 * Returns recent activity timeline
 */
export async function GET(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const tenantId = req.nextUrl.searchParams.get('tenantId')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10')

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId required' }, { status: 400 })
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'limit must be between 1 and 100' }, { status: 400 })
    }

    // Mock data - replace with Prisma query
    const mockPages: PageMetrics[] = [
      {
        id: 'page-1',
        name: 'Página Principal',
        status: 'PUBLISHED',
        views: 1250,
        conversions: 45,
        engagement: 72,
        createdAt: new Date('2025-11-15'),
        updatedAt: new Date('2025-11-19'),
      },
      {
        id: 'page-2',
        name: 'Sobre Nós',
        status: 'PUBLISHED',
        views: 890,
        conversions: 28,
        engagement: 65,
        createdAt: new Date('2025-11-16'),
        updatedAt: new Date('2025-11-18'),
      },
      {
        id: 'page-3',
        name: 'Contato',
        status: 'DRAFT',
        views: 320,
        conversions: 15,
        engagement: 58,
        createdAt: new Date('2025-11-17'),
        updatedAt: new Date('2025-11-19'),
      },
      {
        id: 'page-4',
        name: 'Serviços',
        status: 'PUBLISHED',
        views: 756,
        conversions: 32,
        engagement: 69,
        createdAt: new Date('2025-11-14'),
        updatedAt: new Date('2025-11-19'),
      },
    ]

    // Create timeline events
    const timelineEvents = createTimelineEvents(mockPages).slice(0, limit)

    // Log audit event
    await logAuditEvent({
      userId: 'mock-user-id',
      tenantId,
      action: 'dashboard_timeline_viewed',
      entity: 'dashboard',
      entityId: tenantId,
      metadata: { limit, eventsReturned: timelineEvents.length },
    })

    return NextResponse.json(
      {
        success: true,
        data: timelineEvents,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
