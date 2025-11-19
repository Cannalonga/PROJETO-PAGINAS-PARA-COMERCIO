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

export async function GET(_req: NextRequest, { params }: RouteParams) {
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
    const ogTitle = page.seoTitle || page.title;
    const ogDescription = page.description || '';

    const preview = {
      // Open Graph (Facebook, LinkedIn, etc)
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        image: null,
        url: url,
        type: 'website',
        site_name: 'Seu Negócio',
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
        image: null,
        creator: '@seunegocio',
      },

      // WhatsApp (uses Open Graph)
      whatsapp: {
        title: ogTitle,
        description: ogDescription,
        image: null,
      },

      // Instagram (uses Open Graph)
      instagram: {
        title: ogTitle,
        description: ogDescription,
        image: null,
      },

      // Validation
      issues: [] as Array<{ platform: string; type: string; message: string; severity: 'error' | 'warning' }>,

      // Metrics
      metrics: {
        ogTitleLength: ogTitle.length,
        ogDescriptionLength: ogDescription.length,
        hasImage: false,
        hasTwitterCard: false,
      },

      // Tags for reference
      tags: {
        openGraph: [
          { name: 'og:title', content: ogTitle },
          { name: 'og:description', content: ogDescription },
          { name: 'og:image', content: '' },
          { name: 'og:url', content: url },
          { name: 'og:type', content: 'website' },
        ],
        twitter: [
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: ogTitle },
          { name: 'twitter:description', content: ogDescription },
          { name: 'twitter:image', content: '' },
        ],
      },
    };

    // Validation
    if (ogDescription.length < 20) {
      preview.issues.push({
        platform: 'all',
        type: 'missing_image',
        message: 'Descrição muito curta. Mínimo 20 caracteres recomendado',
        severity: 'warning',
      });
    }

    const ogTitleLen = ogTitle.length;
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

    const ogDescLen = ogDescription.length;
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
