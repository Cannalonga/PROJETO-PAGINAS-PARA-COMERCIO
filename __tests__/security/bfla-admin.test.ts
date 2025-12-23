/**
 * SECURITY TESTS: BFLA Prevention (Patch #2)
 * Test that admin endpoints require proper authorization
 */

import { POST } from '@/app/api/admin/vip/route';
import { GET } from '@/app/api/admin/stores/route';
import { NextRequest } from 'next/server';

// Mock session for authenticated admin user
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));

describe('PATCH #2: BFLA Prevention - Admin Endpoints', () => {
  const { getSession } = require('next-auth/react');

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/admin/vip - Create VIP Store', () => {
    it('should reject unauthenticated requests with 401', async () => {
      getSession.mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/admin/vip'),
        {
          method: 'POST',
          body: JSON.stringify({
            slug: 'test-store',
            storeName: 'Test Store',
            email: 'test@example.com',
            pageTitle: 'Test Page',
          }),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toContain('Must be logged in');
    });

    it('should reject non-superadmin users with 403', async () => {
      getSession.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'user@example.com',
          role: 'CLIENTE_ADMIN', // Not SUPERADMIN
        },
      });

      const request = new NextRequest(
        new URL('http://localhost:3000/api/admin/vip'),
        {
          method: 'POST',
          body: JSON.stringify({
            slug: 'test-store',
            storeName: 'Test Store',
            email: 'test@example.com',
            pageTitle: 'Test Page',
          }),
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toContain('SUPERADMIN');
    });

    it('should accept superadmin requests', async () => {
      getSession.mockResolvedValue({
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          role: 'SUPERADMIN',
        },
      });

      const request = new NextRequest(
        new URL('http://localhost:3000/api/admin/vip'),
        {
          method: 'POST',
          body: JSON.stringify({
            slug: 'test-store',
            storeName: 'Test Store',
            email: 'test@example.com',
            pageTitle: 'Test Page',
          }),
        }
      );

      // This should not return 401/403
      const response = await POST(request);
      expect([200, 400, 409]).toContain(response.status);
      // 200 = success, 400 = validation error, 409 = slug exists
      // Not 401/403 which would indicate auth failure
    });
  });

  describe('GET /api/admin/stores - List Stores', () => {
    it('should reject unauthenticated requests with 401', async () => {
      getSession.mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/admin/stores'),
        {
          method: 'GET',
        }
      );

      const response = await GET(request);
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toContain('Must be logged in');
    });

    it('should reject users without admin role with 403', async () => {
      getSession.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'user@example.com',
          role: 'CLIENTE_USER', // Not admin
        },
      });

      const request = new NextRequest(
        new URL('http://localhost:3000/api/admin/stores'),
        {
          method: 'GET',
        }
      );

      const response = await GET(request);
      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toContain('Forbidden');
    });
  });
});
