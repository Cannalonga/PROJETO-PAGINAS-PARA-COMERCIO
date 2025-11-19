import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sortPagesByMetric, filterPagesByStatus, PageMetrics } from '@/lib/dashboard'
import { logAuditEvent } from '@/lib/audit'

/**
 * GET /api/dashboard/pages
 * Returns paginated list of pages with metrics
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
    const statusFilter = req.nextUrl.searchParams.get('status') || 'ALL'
    const sortBy = (req.nextUrl.searchParams.get('sortBy') as any) || 'recent'
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0')

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId required' }, { status: 400 })
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
      {
        id: 'page-5',
        name: 'Portfólio',
        status: 'PUBLISHED',
        views: 620,
        conversions: 22,
        engagement: 61,
        createdAt: new Date('2025-11-13'),
        updatedAt: new Date('2025-11-17'),
      },
    ]

    // Filter and sort
    let filtered = filterPagesByStatus(mockPages, statusFilter)
    const sorted = sortPagesByMetric(filtered, sortBy, limit + offset)

    // Paginate
    const paginated = sorted.slice(offset, offset + limit)
    const total = filtered.length

    // Log audit event
    await logAuditEvent({
      userId: 'mock-user-id',
      tenantId,
      action: 'dashboard_pages_viewed',
      entity: 'dashboard',
      entityId: tenantId,
      metadata: { statusFilter, sortBy, limit, offset },
    })

    return NextResponse.json(
      {
        success: true,
        data: paginated,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
