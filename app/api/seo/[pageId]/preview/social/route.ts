/**
 * GET /api/seo/[pageId]/preview/social
 * Returns social media preview data (OG tags)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    pageId: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // Validate pageId
    const { pageId } = params;
    if (!pageId || pageId.length < 10) {
      return NextResponse.json(
        { error: 'Invalid page ID' },
        { status: 400 },
      );
    }

    // Fetch page
    const page = await prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 },
      );
    }

    const url = `https://example.com/${page.slug}`;

    // Build social preview data
    const preview = {
      // Open Graph (Facebook, LinkedIn, etc)
      openGraph: {
        title: page.seoTitle || page.title,
        description: page.description || '',
        image: null,
        url: url,
        type: 'website',
        site_name: 'Seu Negócio',
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: page.seoTitle || page.title,
        description: page.description || '',
        image: null,
        creator: '@seunegocio',
      },

      // WhatsApp (uses Open Graph)
      whatsapp: {
        title: page.seoTitle || page.title,
        description: page.description || '',
        image: null,
      },

      // Instagram (uses Open Graph)
      instagram: {
        title: page.seoTitle || page.title,
        description: page.description || '',
        image: null,
      },

      // Validation
      issues: [] as Array<{ platform: string; type: string; message: string; severity: 'error' | 'warning' }>,

      // Metrics
      metrics: {
        ogTitleLength: (page.seoTitle || page.title).length,
        ogDescriptionLength: (page.seoMetadata.openGraphDescription || page.seoMetadata.description || '').length,
        hasImage: !!page.seoMetadata.openGraphImage,
        hasTwitterCard: !!page.seoMetadata.twitterCard,
      },

      // Tags for reference
      tags: {
        openGraph: [
          { name: 'og:title', content: page.seoMetadata.openGraphTitle || page.seoMetadata.title || page.title },
          { name: 'og:description', content: page.seoMetadata.openGraphDescription || page.seoMetadata.description || '' },
          { name: 'og:image', content: page.seoMetadata.openGraphImage || '' },
          { name: 'og:url', content: page.url },
          { name: 'og:type', content: page.seoMetadata.type || 'website' },
        ],
        twitter: [
          { name: 'twitter:card', content: page.seoMetadata.twitterCard || 'summary_large_image' },
          { name: 'twitter:title', content: page.seoMetadata.twitterTitle || page.seoMetadata.openGraphTitle || page.seoMetadata.title || page.title },
          { name: 'twitter:description', content: page.seoMetadata.twitterDescription || page.seoMetadata.openGraphDescription || page.seoMetadata.description || '' },
          { name: 'twitter:image', content: page.seoMetadata.twitterImage || page.seoMetadata.openGraphImage || '' },
        ],
      },
    };

    // Validation
    if (!page.seoMetadata.openGraphImage) {
      preview.issues.push({
        platform: 'all',
        type: 'missing_image',
        message: 'Imagem Open Graph não definida. Use 1200x630px para melhor qualidade',
        severity: 'warning',
      });
    }

    const ogTitleLen = (page.seoMetadata.openGraphTitle || page.seoMetadata.title || page.title).length;
    if (ogTitleLen < 20) {
      preview.issues.push({
        platform: 'facebook',
        type: 'og_title_short',
        message: `Título OG muito curto (${ogTitleLen}/20 mínimo)`,
        severity: 'warning',
      });
    }
    if (ogTitleLen > 90) {
      preview.issues.push({
        platform: 'facebook',
        type: 'og_title_long',
        message: `Título OG pode ser truncado (${ogTitleLen}/90)`,
        severity: 'warning',
      });
    }

    const ogDescLen = (page.seoMetadata.openGraphDescription || page.seoMetadata.description || '').length;
    if (ogDescLen < 20) {
      preview.issues.push({
        platform: 'facebook',
        type: 'og_desc_short',
        message: `Descrição OG muito curta (${ogDescLen}/20 mínimo)`,
        severity: 'warning',
      });
    }
    if (ogDescLen > 200) {
      preview.issues.push({
        platform: 'facebook',
        type: 'og_desc_long',
        message: `Descrição OG pode ser truncada (${ogDescLen}/200)`,
        severity: 'warning',
      });
    }

    if (!page.seoMetadata.twitterCard) {
      preview.issues.push({
        platform: 'twitter',
        type: 'missing_twitter_card',
        message: 'Twitter Card não configurado',
        severity: 'warning',
      });
    }

    // Cache for 10 minutes
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600, s-maxage=1200',
    };

    return NextResponse.json(preview, { headers });
  } catch (error) {
    console.error('[SEO Social Preview API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
