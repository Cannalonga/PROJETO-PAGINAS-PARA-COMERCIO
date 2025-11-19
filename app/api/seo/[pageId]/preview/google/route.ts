/**
 * GET /api/seo/[pageId]/preview/google
 * Returns Google search preview simulation
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
    const isAllowed = await rateLimit(`seo-preview-google-${ip}`, 60);
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

    // Calculate metrics
    const title = page.seoMetadata.title || page.title;
    const description = page.seoMetadata.description || '';
    const url = new URL(page.url);

    const titleLength = title.length;
    const descriptionLength = description.length;

    // Status indicators
    const titleStatus = titleLength >= 30 && titleLength <= 60 ? 'good' : titleLength < 30 ? 'short' : 'long';
    const descriptionStatus =
      descriptionLength >= 120 && descriptionLength <= 155
        ? 'good'
        : descriptionLength < 120
          ? 'short'
          : 'long';

    const preview = {
      // Metadata
      url: url.href,
      domain: url.hostname,
      protocol: url.protocol,

      // SERP appearance
      title: title,
      description: description,
      breadcrumbs: `${url.hostname} > ${url.pathname.split('/').filter(Boolean).slice(0, 2).join(' > ')}`,

      // Metrics
      titleLength: titleLength,
      descriptionLength: descriptionLength,

      // Status
      titleStatus: titleStatus,
      descriptionStatus: descriptionStatus,

      // Validation
      issues: [] as Array<{ type: string; message: string; severity: 'error' | 'warning' }>,

      // Tips
      tips: {
        title: 'Título deve ter entre 30-60 caracteres para aparecer completo no Google',
        description: 'Descrição deve ter entre 120-155 caracteres para aparecer sem truncamento',
        keywords: 'Inclua palavras-chave principais no título e descrição',
        unique: 'Cada página deve ter título e descrição únicos',
      },
    };

    // Add issues if any
    if (titleLength < 30) {
      preview.issues.push({
        type: 'title_too_short',
        message: `Título muito curto (${titleLength}/30 mínimo)`,
        severity: 'warning',
      });
    }
    if (titleLength > 60) {
      preview.issues.push({
        type: 'title_too_long',
        message: `Título será truncado no Google (${titleLength}/60 máximo visível)`,
        severity: 'warning',
      });
    }
    if (descriptionLength < 120) {
      preview.issues.push({
        type: 'description_too_short',
        message: `Descrição muito curta (${descriptionLength}/120 mínimo)`,
        severity: 'warning',
      });
    }
    if (descriptionLength > 155) {
      preview.issues.push({
        type: 'description_too_long',
        message: `Descrição será truncada (${descriptionLength}/155 máximo visível)`,
        severity: 'warning',
      });
    }
    if (!title) {
      preview.issues.push({
        type: 'missing_title',
        message: 'Título não definido',
        severity: 'error',
      });
    }
    if (!description) {
      preview.issues.push({
        type: 'missing_description',
        message: 'Meta descrição não definida',
        severity: 'error',
      });
    }

    // Cache for 10 minutes
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600, s-maxage=1200',
    };

    return NextResponse.json(preview, { headers });
  } catch (error) {
    console.error('[SEO Google Preview API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
