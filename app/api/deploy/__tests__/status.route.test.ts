// app/api/deploy/__tests__/status.route.test.ts
import { GET } from '../status/route';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { getTenantFromSession } from '@/lib/tenant-session';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/prisma');
jest.mock('@/lib/tenant-session');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockGetTenantFromSession = getTenantFromSession as jest.MockedFunction<typeof getTenantFromSession>;

describe('GET /api/deploy/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when session is missing', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/status?pageId=page-1'));
    const response = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 when pageId is missing', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/status'));
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing pageId');
  });

  it('should return 403 when tenant is not found', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue(null);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/status?pageId=page-1'));
    const response = await GET(request);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Tenant not found');
  });

  it('should return deployments successfully', async () => {
    const mockDeployments = [
      {
        id: 'deploy-1',
        pageId: 'page-1',
        tenantId: 'tenant-1',
        startedAt: new Date('2025-11-19T10:00:00Z'),
        completedAt: new Date('2025-11-19T10:05:00Z'),
        status: 'SUCCESS',
        version: 'v1.0.0-20251119100000',
      },
      {
        id: 'deploy-2',
        pageId: 'page-1',
        tenantId: 'tenant-1',
        startedAt: new Date('2025-11-19T09:00:00Z'),
        completedAt: new Date('2025-11-19T09:03:00Z'),
        status: 'SUCCESS',
        version: 'v1.0.0-20251119090000',
      },
    ];

    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    (prisma.deployment.findMany as jest.Mock).mockResolvedValue(mockDeployments);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/status?pageId=page-1&limit=10'));
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.deployments).toHaveLength(2);
    expect(data.deployments[0].status).toBe('SUCCESS');
    expect(data.total).toBe(2);
  });

  it('should respect limit parameter', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    (prisma.deployment.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/status?pageId=page-1&limit=5'));
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(prisma.deployment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
      })
    );
  });

  it('should handle database errors', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    (prisma.deployment.findMany as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/status?pageId=page-1'));
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Database connection failed');
  });

  it('should use default limit of 10 when not provided', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    (prisma.deployment.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/status?pageId=page-1'));
    const response = await GET(request);

    expect(prisma.deployment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
      })
    );
  });

  it('should filter deployments by tenantId', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    (prisma.deployment.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/status?pageId=page-1'));
    await GET(request);

    expect(prisma.deployment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          pageId: 'page-1',
        }),
      })
    );
  });

  it('should order deployments by startedAt descending', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    (prisma.deployment.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/status?pageId=page-1'));
    await GET(request);

    expect(prisma.deployment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { startedAt: 'desc' },
      })
    );
  });

  it('should return empty list for page with no deployments', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    (prisma.deployment.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/status?pageId=page-no-deployments'));
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.deployments).toEqual([]);
    expect(data.total).toBe(0);
  });
});
