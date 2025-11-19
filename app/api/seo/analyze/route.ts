import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  generateMetaTags,
  calculateSeoScore,
  suggestImprovements,
  analyzePage,
  PageAnalysis,
} from '@/lib/seo-automation'
import { logAuditEvent } from '@/lib/audit'

/**
 * POST /api/seo/analyze
 * Analyze page for SEO score and recommendations
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const { pageTitle, pageDescription, keywords, pageContent, pageUrl, tenantId } = body

    if (!pageTitle || !pageDescription || !pageUrl || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields: pageTitle, pageDescription, pageUrl, tenantId' },
        { status: 400 }
      )
    }

    // Generate meta tags
    const metaTags = generateMetaTags(pageTitle, pageDescription, keywords || [])

    // Analyze page
    const analysis = analyzePage(pageContent || '', pageUrl)

    // Calculate SEO score
    const seoScore = calculateSeoScore(analysis as PageAnalysis, metaTags)

    // Get recommendations
    const recommendations = suggestImprovements(metaTags, analysis as PageAnalysis)

    // Log audit event
    await logAuditEvent({
      userId: 'mock-user-id',
      tenantId,
      action: 'page_seo_analyzed',
      entity: 'page',
      entityId: pageUrl,
      metadata: { score: seoScore.overall, issueCount: seoScore.issues.length },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          score: seoScore,
          recommendations,
          metaTags,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error analyzing SEO:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
