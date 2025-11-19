// app/api/deploy/__tests__/generate.route.test.ts
import { POST } from '../generate/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { generateStaticPageArtifacts } from '@/lib/static-export/generate-static-html';
import { getTenantFromSession } from '@/lib/tenant-session';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/static-export/generate-static-html');
jest.mock('@/lib/tenant-session');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockGenerateStaticPageArtifacts = generateStaticPageArtifacts as jest.MockedFunction<
  typeof generateStaticPageArtifacts
>;
const mockGetTenantFromSession = getTenantFromSession as jest.MockedFunction<typeof getTenantFromSession>;

describe('POST /api/deploy/generate', () => {
  const mockArtifacts = {
    version: 'v1.0.0-20251119100000',
    html: '<html>...</html>',
    previewHtml: '<html>...</html>',
    sitemapEntry: '<url><loc>https://pages.example.com/tenant-1/my-page</loc></url>',
    assets: [
      { 
        path: '/style.css', 
        contentType: 'text/css',
        size: 2048, 
        buffer: Buffer.from('/* css */') 
      },
      { 
        path: '/script.js', 
        contentType: 'application/javascript',
        size: 4096, 
        buffer: Buffer.from('// js') 
      },
    ],
    previewUrl: 'https://preview.example.com/page-1',
    deployedUrl: 'https://deploy.example.com/page-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when session is missing', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', slug: 'my-page' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 when pageId is missing', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ slug: 'my-page' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing pageId or slug');
  });

  it('should return 400 when slug is missing', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing pageId or slug');
  });

  it('should return 403 when tenant is not found', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue(null);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', slug: 'my-page' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Tenant not found');
  });

  it('should generate artifacts successfully', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    mockGenerateStaticPageArtifacts.mockResolvedValue(mockArtifacts);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', slug: 'my-page' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.version).toBe('v1.0.0-20251119100000');
    expect(mockGenerateStaticPageArtifacts).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        pageId: 'page-1',
        slug: 'my-page',
      })
    );
  });

  it('should return correct HTML and preview sizes', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    mockGenerateStaticPageArtifacts.mockResolvedValue(mockArtifacts);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', slug: 'my-page' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.htmlSize).toBe(mockArtifacts.html.length);
    expect(data.previewSize).toBe(mockArtifacts.previewHtml.length);
  });

  it('should return assets count and total size', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    mockGenerateStaticPageArtifacts.mockResolvedValue(mockArtifacts);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', slug: 'my-page' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.assetsCount).toBe(2);
    expect(data.assetsTotalSize).toBe(6144); // 2048 + 4096
  });

  it('should include preview and deployed URLs in metadata', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    mockGenerateStaticPageArtifacts.mockResolvedValue(mockArtifacts);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', slug: 'my-page' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.metadata.previewUrl).toBe('https://preview.example.com/page-1');
    expect(data.metadata.deployedUrl).toBe('https://deploy.example.com/page-1');
  });

  it('should include generated timestamp in metadata', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    mockGenerateStaticPageArtifacts.mockResolvedValue(mockArtifacts);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', slug: 'my-page' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.metadata.generatedAt).toBeDefined();
  });

  it('should handle no assets gracefully', async () => {
    const artifactsNoAssets = {
      ...mockArtifacts,
      assets: [],
    };

    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    mockGenerateStaticPageArtifacts.mockResolvedValue(artifactsNoAssets);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', slug: 'my-page' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.assetsCount).toBe(0);
    expect(data.assetsTotalSize).toBe(0);
  });

  it('should handle generation errors', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    mockGenerateStaticPageArtifacts.mockRejectedValue(new Error('Failed to generate HTML'));

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', slug: 'my-page' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to generate HTML');
  });

  it('should handle generation errors with default message', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    mockGenerateStaticPageArtifacts.mockRejectedValue(new Error());

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', slug: 'my-page' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to generate artifacts');
  });

  it('should pass correct parameters to generation function', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    mockGenerateStaticPageArtifacts.mockResolvedValue(mockArtifacts);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-123', slug: 'special-page' }),
    });

    await POST(request);

    expect(mockGenerateStaticPageArtifacts).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      pageId: 'page-123',
      slug: 'special-page',
    });
  });

  it('should handle large asset counts', async () => {
    const largeAssets = Array.from({ length: 50 }, (_, i) => ({
      path: `/asset-${i}.js`,
      contentType: 'application/javascript',
      size: 1024 * (i + 1),
      buffer: Buffer.from(`// asset ${i}`),
    }));

    const artifactsLarge = {
      ...mockArtifacts,
      assets: largeAssets,
    };

    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    mockGenerateStaticPageArtifacts.mockResolvedValue(artifactsLarge);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', slug: 'my-page' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.assetsCount).toBe(50);
    expect(data.assetsTotalSize).toBeGreaterThan(0);
  });

  it('should handle special characters in slug', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);
    mockGetTenantFromSession.mockResolvedValue('tenant-1');
    mockGenerateStaticPageArtifacts.mockResolvedValue(mockArtifacts);

    const request = new NextRequest(new URL('http://localhost:3000/api/deploy/generate'), {
      method: 'POST',
      body: JSON.stringify({ pageId: 'page-1', slug: 'página-especial-ç-ã' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockGenerateStaticPageArtifacts).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'página-especial-ç-ã',
      })
    );
  });
});
