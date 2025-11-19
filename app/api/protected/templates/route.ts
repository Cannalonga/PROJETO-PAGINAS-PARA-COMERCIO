import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { validateTemplate } from '@/lib/template-engine';

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const category = request.nextUrl.searchParams.get('category');

  try {
    logger.info({ requestId, category }, 'Fetching templates');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = { isPublic: true };
    if (category) {
      query.category = category;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const templates = await (prisma as any).template.findMany({
      where: query,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        thumbnail: true,
        variables: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    logger.info({ requestId, count: templates.length }, 'Templates fetched successfully');

    const res = NextResponse.json(templates, { status: 200 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching templates',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface CreateTemplateRequest {
  name: string;
  category: string;
  description?: string;
  html: string;
  css?: string;
  variables?: Record<string, any>[];
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-correlation-id') || randomUUID();
  const tenantId = request.headers.get('x-tenant-id');
  const userRole = request.headers.get('x-user-role');

  try {
    // Only admins can create templates
    if (userRole !== 'SUPERADMIN' && userRole !== 'OPERADOR') {
      logger.warn({ requestId, userRole }, 'Insufficient permissions to create template');
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = (await request.json()) as CreateTemplateRequest;
    const { name, category, description, html, css = '', variables = [] } = body;

    // Validate input
    const validation = validateTemplate({ name, category, html });
    if (!validation.valid) {
      logger.warn({ requestId, errors: validation.errors }, 'Invalid template');
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
    }

    logger.info({ requestId, name }, 'Creating new template');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newTemplate = await (prisma as any).template.create({
      data: {
        tenantId,
        name,
        category,
        description,
        html,
        css,
        variables,
        isPublic: false,
      },
      select: {
        id: true,
        name: true,
        category: true,
        createdAt: true,
      },
    });

    logger.info({ requestId, templateId: newTemplate.id }, 'Template created successfully');

    const res = NextResponse.json(newTemplate, { status: 201 });
    res.headers.set('x-correlation-id', requestId);
    return res;
  } catch (error) {
    logger.error(
      {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error creating template',
    );

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
