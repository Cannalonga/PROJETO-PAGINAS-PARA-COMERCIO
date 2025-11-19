import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { validateSlug, generateSlug } from '@/lib/page-editor';

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = request.headers.get('x-tenant-id');

  try {
    if (!tenantId) {
      logger.warn({ requestId }, 'Missing tenantId header');
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    logger.info({ requestId, tenantId }, 'Fetching pages for tenant');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pages = await (prisma as any).page.findMany({
      where: { tenantId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    logger.info({ requestId, count: pages.length }, 'Pages fetched successfully');

    const res = NextResponse.json(pages, { status: 200 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching pages',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface CreatePageRequest {
  title: string;
  slug?: string;
  template: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = request.headers.get('x-tenant-id');

  try {
    if (!tenantId) {
      logger.warn({ requestId }, 'Missing tenantId header');
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const body = (await request.json()) as CreatePageRequest;
    let { title, slug, template, description } = body;

    if (!title || !template) {
      logger.warn({ requestId }, 'Missing required fields');
      return NextResponse.json(
        { error: 'title and template are required' },
        { status: 400 },
      );
    }

    // Generate slug if not provided
    if (!slug) {
      slug = generateSlug(title);
    }

    if (!validateSlug(slug)) {
      logger.warn({ requestId, slug }, 'Invalid slug format');
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 },
      );
    }

    // Check if slug already exists for this tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingPage = await (prisma as any).page.findFirst({
      where: { tenantId, slug },
    });

    if (existingPage) {
      logger.warn({ requestId, slug }, 'Page slug already exists');
      return NextResponse.json(
        { error: 'Page slug already exists' },
        { status: 409 },
      );
    }

    logger.info({ requestId, tenantId, title }, 'Creating new page');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newPage = await (prisma as any).page.create({
      data: {
        tenantId,
        title,
        slug,
        template,
        description,
        status: 'DRAFT',
        content: [],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        template: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info({ requestId, pageId: newPage.id }, 'Page created successfully');

    const res = NextResponse.json(newPage, { status: 201 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error creating page',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
