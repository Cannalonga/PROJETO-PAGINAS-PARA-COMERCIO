import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

interface PublishPageRequest {
  message?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = request.headers.get('x-tenant-id');
  const userId = request.headers.get('x-user-id');
  const pageId = params.id;

  try {
    logger.info({ requestId, pageId }, 'Publishing page');

    const body = (await request.json()) as PublishPageRequest;

    // Fetch current page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await (prisma as any).page.findFirst({
      where: { id: pageId, tenantId },
    });

    if (!page) {
      logger.warn({ requestId, pageId }, 'Page not found');
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Update page status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedPage = await (prisma as any).page.update({
      where: { id: pageId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
      },
    });

    logger.info(
      {
        requestId,
        pageId,
        userId,
        message: body.message,
      },
      'Page published successfully',
    );

    const res = NextResponse.json(
      {
        ...updatedPage,
        message: 'Page published successfully',
      },
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
      'Error publishing page',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
