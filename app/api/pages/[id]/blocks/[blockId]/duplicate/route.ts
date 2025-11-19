import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { duplicatePageBlock } from '@/lib/page-editor';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; blockId: string } }
) {
  try {
    // Authenticate request
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: pageId, blockId } = params;

    // Fetch page with tenant check
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }

    // Fetch user
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || (user.tenantId && user.tenantId !== page.tenantId)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Parse page content
    const content = (page.content as any) || [];
    const blocks = Array.isArray(content) ? content : [];

    // Validate block exists
    if (!blocks.some((b) => b.id === blockId)) {
      return NextResponse.json({ success: false, error: 'Block not found' }, { status: 404 });
    }

    // Duplicate block
    const updatedBlocks = duplicatePageBlock(blocks, blockId);

    // Update page
    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: { content: updatedBlocks as any },
    });

    // Record audit log
    await logAuditEvent({
      userId: user.id,
      tenantId: page.tenantId,
      action: 'page_editor_block_duplicate',
      entity: 'page_block',
      entityId: blockId,
      metadata: { pageId },
    });

    return NextResponse.json({
      success: true,
      data: updatedPage,
      message: 'Block duplicated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error duplicating block:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
