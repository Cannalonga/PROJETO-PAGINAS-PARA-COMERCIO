/**
 * GET /api/seo/[pageId]/summary
 * Returns complete SEO data for a page
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validatePageId } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limiter';

interface RouteParams {
  params: {
    pageId: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const isAllowed = await rateLimit(`seo-summary-${ip}`, 60); // 60 requests per minute
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 },
      );
    }

    // Validate pageId
    const { pageId } = params;
    if (!validatePageId(pageId)) {
      return NextResponse.json(
        { error: 'Invalid page ID' },
        { status: 400 },
      );
    }

    // Fetch page with SEO data
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        seoMetadata: true,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 },
      );
    }

    if (!page.seoMetadata) {
      return NextResponse.json(
        { error: 'SEO data not generated yet' },
        { status: 400 },
      );
    }

    // Build comprehensive summary
    const summary = {
      id: page.id,
      title: page.title,
      url: page.url,
      updatedAt: page.updatedAt,

      // Core SEO metrics
      score: page.seoMetadata.score || 0,
      schemaScore: page.seoMetadata.schemaScore || 0,

      // Meta tags
      title: page.seoMetadata.title,
      description: page.seoMetadata.description,
      keywords: page.seoMetadata.keywords,

      // Open Graph
      openGraphTitle: page.seoMetadata.openGraphTitle,
      openGraphDescription: page.seoMetadata.openGraphDescription,
      openGraphImage: page.seoMetadata.openGraphImage,

      // Twitter Card
      twitterCard: page.seoMetadata.twitterCard,
      twitterTitle: page.seoMetadata.twitterTitle,
      twitterDescription: page.seoMetadata.twitterDescription,
      twitterImage: page.seoMetadata.twitterImage,

      // Structured data
      jsonLd: page.seoMetadata.jsonLd,

      // Warnings & recommendations
      schemaWarnings: page.seoMetadata.schemaWarnings || [],
      schemaRecommendations: page.seoMetadata.schemaRecommendations || [],

      // Additional metadata
      domain: new URL(page.url).hostname,
      lang: page.seoMetadata.lang || 'pt-BR',
      canonical: page.seoMetadata.canonical || page.url,
    };

    // Cache for 5 minutes
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
    };

    return NextResponse.json(summary, { headers });
  } catch (error) {
    console.error('[SEO Summary API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
