import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  generateMetaTags,
  generateOpenGraph,
  generateTwitterCards,
  generateJsonLd,
  generateSitemap,
  buildRobotsTxt,
} from '@/lib/seo-automation'
import { logAuditEvent } from '@/lib/audit'

/**
 * POST /api/seo/preview
 * Generate SEO preview (meta tags, og tags, schema)
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
    const { pageTitle, pageDescription, keywords, pageUrl, imageUrl, businessName, businessLogo, tenantId, pages } =
      body

    if (!pageTitle || !pageUrl || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields: pageTitle, pageUrl, tenantId' },
        { status: 400 }
      )
    }

    // Generate meta tags
    const metaTags = generateMetaTags(pageTitle, pageDescription || '', keywords || [])

    // Generate OpenGraph tags
    const ogTags = generateOpenGraph(
      pageTitle,
      pageDescription || '',
      pageUrl,
      imageUrl || 'https://via.placeholder.com/1200x630',
      'website',
      businessName
    )

    // Generate Twitter Cards
    const twitterTags = generateTwitterCards(pageTitle, pageDescription || '', imageUrl || '', `@${businessName}`)

    // Generate JSON-LD schema
    const jsonLd = generateJsonLd(pageTitle, pageDescription || '', pageUrl, imageUrl || '', businessName, businessLogo)

    // Generate sitemap (if pages provided)
    let sitemap = null
    if (pages && Array.isArray(pages) && pages.length > 0) {
      sitemap = generateSitemap(pages)
    }

    // Generate robots.txt
    const robotsTxt = buildRobotsTxt()

    // Log audit event
    await logAuditEvent({
      userId: 'mock-user-id',
      tenantId,
      action: 'seo_preview_generated',
      entity: 'page',
      entityId: pageUrl,
      metadata: { includedSitemap: !!sitemap },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          metaTags,
          ogTags,
          twitterTags,
          jsonLd,
          sitemap,
          robotsTxt,
          htmlSnippet: `<!-- Meta Tags -->
<meta charset="${metaTags.charset}">
<meta name="viewport" content="${metaTags.viewport}">
<meta name="description" content="${metaTags.description}">
<meta name="keywords" content="${metaTags.keywords.join(', ')}">
<meta name="robots" content="${metaTags.robots}">
${metaTags.canonical ? `<link rel="canonical" href="${metaTags.canonical}">` : ''}

<!-- Open Graph -->
<meta property="og:title" content="${ogTags['og:title']}">
<meta property="og:description" content="${ogTags['og:description']}">
<meta property="og:url" content="${ogTags['og:url']}">
<meta property="og:image" content="${ogTags['og:image']}">
<meta property="og:type" content="${ogTags['og:type']}">

<!-- Twitter Card -->
<meta name="twitter:card" content="${twitterTags['twitter:card']}">
<meta name="twitter:title" content="${twitterTags['twitter:title']}">
<meta name="twitter:description" content="${twitterTags['twitter:description']}">
<meta name="twitter:image" content="${twitterTags['twitter:image']}">

<!-- JSON-LD Schema -->
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>`,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error generating SEO preview:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
