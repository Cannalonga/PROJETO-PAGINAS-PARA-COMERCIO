import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = request.headers.get('x-tenant-id');
  const pageId = request.nextUrl.searchParams.get('pageId');
  const days = parseInt(request.nextUrl.searchParams.get('days') || '7', 10);

  try {
    if (!tenantId) {
      logger.warn({ requestId }, 'Missing tenantId header');
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    logger.info({ requestId, tenantId, pageId, days }, 'Fetching analytics');

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Mock analytics data
    const mockAnalytics = {
      totalViews: 1250,
      uniqueVisitors: 342,
      avgSessionDuration: 285,
      bounceRate: 42.5,
      conversionRate: 3.2,
      topPages: [
        { slug: 'home', views: 450, clicks: 128 },
        { slug: 'products', views: 320, clicks: 95 },
        { slug: 'contact', views: 280, clicks: 42 },
      ],
      topReferrers: [
        { referrer: 'google.com', views: 580 },
        { referrer: 'facebook.com', views: 340 },
        { referrer: 'direct', views: 330 },
      ],
      deviceBreakdown: {
        mobile: 610,
        desktop: 500,
        tablet: 140,
      },
      events: [
        { date: '2024-11-13', views: 120, clicks: 35, submissions: 8 },
        { date: '2024-11-14', views: 145, clicks: 42, submissions: 12 },
        { date: '2024-11-15', views: 180, clicks: 58, submissions: 15 },
        { date: '2024-11-16', views: 165, clicks: 50, submissions: 10 },
        { date: '2024-11-17', views: 200, clicks: 65, submissions: 18 },
        { date: '2024-11-18', views: 220, clicks: 72, submissions: 20 },
        { date: '2024-11-19', views: 220, clicks: 75, submissions: 22 },
      ],
    };

    logger.info({ requestId }, 'Analytics fetched successfully');

    const res = NextResponse.json(mockAnalytics, { status: 200 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching analytics',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface RecordEventRequest {
  pageId: string;
  eventType: 'PAGE_VIEW' | 'BUTTON_CLICK' | 'FORM_SUBMISSION' | 'PHONE_CALL' | 'WHATSAPP_CLICK';
  eventData?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = request.headers.get('x-tenant-id');

  try {
    if (!tenantId) {
      logger.warn({ requestId }, 'Missing tenantId header');
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const body = (await request.json()) as RecordEventRequest;
    const { pageId, eventType } = body;

    if (!pageId || !eventType) {
      logger.warn({ requestId }, 'Missing required fields');
      return NextResponse.json(
        { error: 'pageId and eventType are required' },
        { status: 400 },
      );
    }

    logger.debug(
      {
        requestId,
        pageId,
        eventType,
      },
      'Event recorded',
    );

    const res = NextResponse.json(
      { message: 'Event recorded successfully' },
      { status: 201 },
    );
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error recording event',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
