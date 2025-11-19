// app/api/pages/__tests__/blocks-move.route.test.ts
import { PATCH } from '../[id]/blocks/[blockId]/move/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { moveBlockToPosition } from '@/lib/page-editor';
import { logAuditEvent } from '@/lib/audit';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/prisma');
jest.mock('@/lib/page-editor');
jest.mock('@/lib/audit');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockMoveBlockToPosition = moveBlockToPosition as jest.MockedFunction<typeof moveBlockToPosition>;
const mockLogAuditEvent = logAuditEvent as jest.MockedFunction<typeof logAuditEvent>;

describe('PATCH /api/pages/[id]/blocks/[blockId]/move', () => {
  const mockPage = {
    id: 'page-1',
    tenantId: 'tenant-1',
    content: [
      { id: 'block-1', position: 0, type: 'HEADING' },
      { id: 'block-2', position: 1, type: 'PARAGRAPH' },
      { id: 'block-3', position: 2, type: 'IMAGE' },
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

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/move'), {
      method: 'PATCH',
      body: JSON.stringify({ position: 1 }),
    });

    const response = await PATCH(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 when position is invalid', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/move'), {
      method: 'PATCH',
      body: JSON.stringify({ position: 'invalid' }),
    });

    const response = await PATCH(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid position parameter');
  });

  it('should return 400 when position is negative', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/move'), {
      method: 'PATCH',
      body: JSON.stringify({ position: -1 }),
    });

    const response = await PATCH(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid position parameter');
  });

  it('should return 404 when page is not found', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/move'), {
      method: 'PATCH',
      body: JSON.stringify({ position: 1 }),
    });

    const response = await PATCH(request, {
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

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/move'), {
      method: 'PATCH',
      body: JSON.stringify({ position: 1 }),
    });

    const response = await PATCH(request, {
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

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-999/move'), {
      method: 'PATCH',
      body: JSON.stringify({ position: 1 }),
    });

    const response = await PATCH(request, {
      params: { id: 'page-1', blockId: 'block-999' },
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Block not found');
  });

  it('should move block successfully', async () => {
    const updatedBlocks = [
      { id: 'block-2', position: 0, type: 'PARAGRAPH' },
      { id: 'block-1', position: 1, type: 'HEADING' },
      { id: 'block-3', position: 2, type: 'IMAGE' },
    ];

    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(mockPage);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    mockMoveBlockToPosition.mockReturnValue(updatedBlocks);
    (prisma.page.update as jest.Mock).mockResolvedValue({
      ...mockPage,
      content: updatedBlocks,
    });
    mockLogAuditEvent.mockResolvedValue(undefined);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/move'), {
      method: 'PATCH',
      body: JSON.stringify({ position: 1 }),
    });

    const response = await PATCH(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Block moved successfully');
    expect(mockMoveBlockToPosition).toHaveBeenCalledWith(mockPage.content, 'block-1', 1);
  });

  it('should log audit event on successful move', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(mockPage);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    mockMoveBlockToPosition.mockReturnValue(mockPage.content);
    (prisma.page.update as jest.Mock).mockResolvedValue(mockPage);
    mockLogAuditEvent.mockResolvedValue(undefined);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/move'), {
      method: 'PATCH',
      body: JSON.stringify({ position: 2 }),
    });

    await PATCH(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        tenantId: 'tenant-1',
        action: 'page_editor_block_move',
        entity: 'page_block',
        entityId: 'block-1',
        metadata: expect.objectContaining({
          newPosition: 2,
          pageId: 'page-1',
        }),
      })
    );
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

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/move'), {
      method: 'PATCH',
      body: JSON.stringify({ position: 1 }),
    });

    const response = await PATCH(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Block not found');
  });

  it('should return timestamp in response', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockResolvedValue(mockPage);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    mockMoveBlockToPosition.mockReturnValue(mockPage.content);
    (prisma.page.update as jest.Mock).mockResolvedValue(mockPage);
    mockLogAuditEvent.mockResolvedValue(undefined);

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/move'), {
      method: 'PATCH',
      body: JSON.stringify({ position: 1 }),
    });

    const response = await PATCH(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    const data = await response.json();
    expect(data.timestamp).toBeDefined();
    expect(typeof data.timestamp).toBe('string');
  });

  it('should handle server errors gracefully', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    (prisma.page.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest(new URL('http://localhost:3000/api/pages/page-1/blocks/block-1/move'), {
      method: 'PATCH',
      body: JSON.stringify({ position: 1 }),
    });

    const response = await PATCH(request, {
      params: { id: 'page-1', blockId: 'block-1' },
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Internal server error');
  });
});
