/**
 * GET /api/seo/[pageId]/preview/google
 * Returns Google search preview simulation
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

    // Calculate metrics from page data
    const title = page.seoTitle || page.title;
    const description = page.description || '';
    const url = `https://example.com/${page.slug}`;

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
      url: url,
      domain: 'example.com',

      // SERP appearance
      title: title,
      description: description,
      breadcrumbs: `example.com > ${page.slug}`,

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
