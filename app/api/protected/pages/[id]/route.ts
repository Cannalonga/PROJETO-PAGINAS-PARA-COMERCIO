import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = request.headers.get('x-tenant-id');
  const pageId = params.id;

  try {
    logger.info({ requestId, pageId }, 'Fetching page details');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await (prisma as any).page.findFirst({
      where: { id: pageId, tenantId },
    });

    if (!page) {
      logger.warn({ requestId, pageId }, 'Page not found');
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    logger.info({ requestId, pageId }, 'Page fetched successfully');

    const res = NextResponse.json(page, { status: 200 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        pageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching page',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface UpdatePageRequest {
  title?: string;
  description?: string;
  content?: Record<string, any>[];
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const pageId = params.id;

  try {
    logger.info({ requestId, pageId }, 'Updating page');

    const body = (await request.json()) as UpdatePageRequest;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await (prisma as any).page.update({
      where: { id: pageId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info({ requestId, pageId }, 'Page updated successfully');

    const res = NextResponse.json(page, { status: 200 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        pageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error updating page',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const pageId = params.id;

  try {
    logger.info({ requestId, pageId }, 'Deleting page');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).page.delete({
      where: { id: pageId },
    });

    logger.info({ requestId, pageId }, 'Page deleted successfully');

    const res = NextResponse.json(
      { message: 'Page deleted successfully' },
      { status: 200 },
    );
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        pageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error deleting page',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
