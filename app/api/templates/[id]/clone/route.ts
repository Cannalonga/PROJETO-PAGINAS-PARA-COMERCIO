import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cloneTemplateToPage } from '@/lib/template-engine';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: templateId } = params;
    const body = await req.json();
    const { pageId } = body;

    if (!pageId) {
      return NextResponse.json(
        { success: false, error: 'pageId is required' },
        { status: 400 }
      );
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Fetch template
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Fetch page
    const page = await prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    // Check authorization (tenant match)
    if (user.tenantId && user.tenantId !== page.tenantId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Clone template to page
    const clonedData = cloneTemplateToPage(template, pageId, page.tenantId);

    // Update page with template content
    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        content: clonedData.content as any,
      },
    });

    // Update template metrics (increment clones)
    await prisma.templateMetrics?.update({
      where: { templateId },
      data: { clones: { increment: 1 } },
    });

    // Record audit log
    await logAuditEvent({
      userId: user.id,
      tenantId: page.tenantId,
      action: 'template_cloned',
      entity: 'template',
      entityId: templateId,
      metadata: { pageId, pageTitle: page.title },
    });

    return NextResponse.json({
      success: true,
      data: updatedPage,
      message: 'Template cloned successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error cloning template:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
