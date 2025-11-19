// app/api/pages/__tests__/blocks-duplicate.route.test.ts
import { POST } from '../[id]/blocks/[blockId]/duplicate/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { duplicatePageBlock } from '@/lib/page-editor';
import { logAuditEvent } from '@/lib/audit';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/prisma');
jest.mock('@/lib/page-editor');
jest.mock('@/lib/audit');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockDuplicatePageBlock = duplicatePageBlock as jest.MockedFunction<typeof duplicatePageBlock>;
const mockLogAuditEvent = logAuditEvent as jest.MockedFunction<typeof logAuditEvent>;

describe('POST /api/pages/[id]/blocks/[blockId]/duplicate', () => {
  const mockPage = {
    id: 'page-1',
    tenantId: 'tenant-1',
    content: [
      { id: 'block-1', position: 0, type: 'HEADING', content: { text: 'Title' } },
      { id: 'block-2', position: 1, type: 'PARAGRAPH', content: { text: 'Content' } },
    ],
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    tenantId: 'tenant-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when session is missing', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/duplicate'), {
      method: 'POST',
    });

    const response = await POST(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 when page is not found', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/duplicate'), {
      method: 'POST',
    });

    const response = await POST(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Page not found');
  });

  it('should return 403 when user tenant does not match page tenant', async () => {
    const differentTenantUser = { ...mockUser, tenantId: 'tenant-2' };

    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(mockPage);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(differentTenantUser);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/duplicate'), {
      method: 'POST',
    });

    const response = await POST(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Forbidden');
  });

  it('should return 404 when block does not exist', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(mockPage);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-999/duplicate'), {
      method: 'POST',
    });

    const response = await POST(request, {
      params: { id: 'page-1', blockId: 'block-999' },
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Block not found');
  });

  it('should duplicate block successfully', async () => {
    const newBlockId = 'block-1-copy';
    const duplicatedBlocks = [
      mockPage.content[0],
      { id: newBlockId, position: 1, type: 'HEADING', content: { text: 'Title' } },
      { ...mockPage.content[1], position: 2 },
    ];

    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(mockPage);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    mockDuplicatePageBlock.mockReturnValue(duplicatedBlocks);
    (prisma.page.update as jest.Mock).mockResolvedValue({
      ...mockPage,
      content: duplicatedBlocks,
    });
    mockLogAuditEvent.mockResolvedValue(undefined);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/duplicate'), {
      method: 'POST',
    });

    const response = await POST(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Block duplicated successfully');
    expect(mockDuplicatePageBlock).toHaveBeenCalledWith(mockPage.content, 'block-1');
  });

  it('should log audit event on successful duplication', async () => {
    const duplicatedBlocks = [...mockPage.content];

    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(mockPage);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    mockDuplicatePageBlock.mockReturnValue(duplicatedBlocks);
    (prisma.page.update as jest.Mock).mockResolvedValue({
      ...mockPage,
      content: duplicatedBlocks,
    });
    mockLogAuditEvent.mockResolvedValue(undefined);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/duplicate'), {
      method: 'POST',
    });

    await POST(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        tenantId: 'tenant-1',
        action: 'page_editor_block_duplicate',
        entity: 'page_block',
        entityId: 'block-1',
      })
    );
  });

  it('should preserve block content when duplicating', async () => {
    const blockToDuplicate = mockPage.content[0];
    const duplicatedBlocks = [
      blockToDuplicate,
      { ...blockToDuplicate, id: 'block-1-copy', position: 1 },
    ];

    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(mockPage);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    mockDuplicatePageBlock.mockReturnValue(duplicatedBlocks);
    (prisma.page.update as jest.Mock).mockResolvedValue({
      ...mockPage,
      content: duplicatedBlocks,
    });
    mockLogAuditEvent.mockResolvedValue(undefined);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/duplicate'), {
      method: 'POST',
    });

    const response = await POST(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    const data = await response.json();
    expect(data.data.content).toHaveLength(2);
    expect(data.data.content[1].content).toEqual(blockToDuplicate.content);
  });

  it('should handle empty content gracefully', async () => {
    const pageWithoutContent = {
      id: 'page-1',
      tenantId: 'tenant-1',
      content: null,
    };

    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(pageWithoutContent);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/duplicate'), {
      method: 'POST',
    });

    const response = await POST(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Block not found');
  });

  it('should return updated page data on success', async () => {
    const duplicatedBlocks = [...mockPage.content];
    const updatedPage = {
      ...mockPage,
      content: duplicatedBlocks,
      updatedAt: new Date().toISOString(),
    };

    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(mockPage);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    mockDuplicatePageBlock.mockReturnValue(duplicatedBlocks);
    (prisma.page.update as jest.Mock).mockResolvedValue(updatedPage);
    mockLogAuditEvent.mockResolvedValue(undefined);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/duplicate'), {
      method: 'POST',
    });

    const response = await POST(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    const data = await response.json();
    expect(data.data).toEqual(updatedPage);
  });

  it('should handle server errors gracefully', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/duplicate'), {
      method: 'POST',
    });

    const response = await POST(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Internal server error');
  });

  it('should allow duplicating the same block multiple times', async () => {
    const firstDuplicate = [...mockPage.content];
    const secondDuplicate = [...firstDuplicate];

    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(mockPage);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    mockDuplicatePageBlock
      .mockReturnValueOnce(firstDuplicate)
      .mockReturnValueOnce(secondDuplicate);
    (prisma.page.update as jest.Mock)
      .mockResolvedValueOnce({ ...mockPage, content: firstDuplicate })
      .mockResolvedValueOnce({ ...mockPage, content: secondDuplicate });
    mockLogAuditEvent.mockResolvedValue(undefined);

    const request1 = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/duplicate'), {
      method: 'POST',
    });
    const response1 = await POST(request1, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    const request2 = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/duplicate'), {
      method: 'POST',
    });
    const response2 = await POST(request2, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  });
});
