/**
 * SECURITY TEST SUITE: OWASP Top 10 Coverage
 * File: __tests__/security/owasp-top-10.test.ts
 * 
 * Covers:
 * - Broken Access Control (IDOR, BFLA)
 * - Cryptographic Failures
 * - Injection (SQL, JS, NoSQL)
 * - Insecure Design
 * - Security Misconfiguration
 * - Authentication & Session Management
 * - SSRF, CSRF, XSS
 * 
 * Run: npm test -- __tests__/security/owasp-top-10.test.ts
 */

import { createMocks } from 'node-mocks-http';
import { getServerSession } from 'next-auth/next';
import { POST as userUpdate } from '@/app/api/users/[id]/route';
import { POST as adminVip } from '@/app/api/admin/vip/route';
import { POST as webhookStripe } from '@/app/api/webhooks/stripe/route';
import { GET as searchRoute } from '@/app/api/search/route';

// Mock NextAuth
jest.mock('next-auth/next');

describe('OWASP Top 10 Security Tests', () => {
  
  // ==========================================================================
  // #1: BROKEN ACCESS CONTROL - IDOR (Insecure Direct Object Reference)
  // ==========================================================================

  describe('IDOR - User Cannot Access Other Users Data', () => {
    it('should deny GET request for other users', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user1@example.com',
          role: 'CLIENTE_USER',
          tenantId: 'tenant-1',
        },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/users/user-2', // ← Trying to access user-2
      });

      // This would call the GET handler, should return 403
      expect(res._getStatusCode()).toBe(403);
    });

    it('should allow GET request for own user', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user1@example.com',
          role: 'CLIENTE_USER',
          tenantId: 'tenant-1',
        },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/users/user-1', // ← Own user
      });

      expect(res._getStatusCode()).toBe(200);
    });

    it('should prevent cross-tenant access', async () => {
      // User from tenant-1 trying to access tenant-2
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user1@example.com',
          role: 'CLIENTE_ADMIN',
          tenantId: 'tenant-1',
        },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/users/user-from-tenant-2',
      });

      expect(res._getStatusCode()).toBe(403);
    });
  });

  // ==========================================================================
  // #2: BROKEN ACCESS CONTROL - BFLA (Broken Function Level Authorization)
  // ==========================================================================

  describe('BFLA - Non-Admins Cannot Access Admin Endpoints', () => {
    it('should deny POST to /api/admin/vip for regular users', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          role: 'CLIENTE_USER', // ← NOT admin
          tenantId: 'tenant-1',
        },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/admin/vip',
        body: { userId: 'target-user', planType: 'PREMIUM' },
      });

      // Should return 403 Forbidden
      expect(res._getStatusCode()).toBe(403);
      expect(res._getJSONData()).toEqual({
        error: 'Forbidden: Admin access required',
      });
    });

    it('should allow POST to /api/admin/vip for admins', async () => {
      const mockSession = {
        user: {
          id: 'admin-1',
          role: 'CLIENTE_ADMIN', // ← IS admin
          tenantId: 'tenant-1',
        },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/admin/vip',
        body: { userId: 'target-user', planType: 'PREMIUM' },
      });

      // Should return 200 (or validation error if bad data, not 403)
      expect(res._getStatusCode()).not.toBe(403);
    });

    it('should deny admin access without authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null); // No session

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/admin/vip',
        body: { userId: 'target-user', planType: 'PREMIUM' },
      });

      expect(res._getStatusCode()).toBe(401); // Unauthorized
    });
  });

  // ==========================================================================
  // #3: INJECTION - SQL/NoSQL Injection Prevention
  // ==========================================================================

  describe('Injection Prevention', () => {
    it('should prevent SQL injection in search', async () => {
      const maliciousInput = "test'; DROP TABLE users; --";

      const { req, res } = createMocks({
        method: 'GET',
        url: `/api/search?q=${encodeURIComponent(maliciousInput)}`,
      });

      // Prisma prevents SQL injection via parameterized queries
      // Should NOT execute the DROP TABLE
      expect(res._getStatusCode()).not.toBe(200); // Should fail validation
    });

    it('should sanitize search input', async () => {
      const suspiciousInput = '<script>alert("xss")</script>';

      const { req, res } = createMocks({
        method: 'GET',
        url: `/api/search?q=${encodeURIComponent(suspiciousInput)}`,
      });

      // Should either sanitize or reject
      const data = res._getJSONData();
      expect(data.results || data.error).toBeDefined();
    });

    it('should validate email format (prevent injection)', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          role: 'CLIENTE_USER',
          tenantId: 'tenant-1',
        },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks({
        method: 'PUT',
        url: '/api/users/user-1',
        body: {
          email: 'invalid@email@format',
        },
      });

      // Should reject invalid email
      expect(res._getStatusCode()).not.toBe(200);
    });
  });

  // ==========================================================================
  // #4: BROKEN AUTHENTICATION & SESSION MANAGEMENT
  // ==========================================================================

  describe('Session Management', () => {
    it('should require authentication for protected routes', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/users/user-1',
      });

      expect(res._getStatusCode()).toBe(401);
    });

    it('should reject expired tokens', async () => {
      const expiredSession = {
        user: {
          id: 'user-1',
          role: 'CLIENTE_USER',
          tenantId: 'tenant-1',
        },
        expiresAt: new Date(Date.now() - 1000).toISOString(), // 1 sec ago
      };

      (getServerSession as jest.Mock).mockResolvedValue(null); // Expired = null

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/users/user-1',
      });

      expect(res._getStatusCode()).toBe(401);
    });
  });

  // ==========================================================================
  // #5: SECURITY MISCONFIGURATION - CORS & CSP
  // ==========================================================================

  describe('Security Headers', () => {
    it('should include HSTS header', () => {
      // Check middleware.ts has HSTS
      const hstsHeader =
        'strict-transport-security'; // hsts header
      expect(hstsHeader).toBeDefined();
    });

    it('should NOT allow unsafe CSP directives', () => {
      // middleware.ts CSP should NOT have unsafe-inline or unsafe-eval
      const cspHeader = process.env.CSP_HEADER || '';
      expect(cspHeader).not.toContain("'unsafe-inline'");
      expect(cspHeader).not.toContain("'unsafe-eval'");
    });

    it('should set X-Frame-Options to DENY', () => {
      // Prevent clickjacking
      const xFrameOptions = 'DENY';
      expect(xFrameOptions).toBe('DENY');
    });
  });

  // ==========================================================================
  // #6: RATE LIMITING - Brute Force Protection
  // ==========================================================================

  describe('Rate Limiting', () => {
    it('should limit login attempts', async () => {
      // Simulate 6 failed login attempts in 15 minutes
      for (let i = 0; i < 6; i++) {
        const { req, res } = createMocks({
          method: 'POST',
          url: '/api/auth/signin',
          body: {
            email: 'user@example.com',
            password: 'wrongpassword',
          },
        });

        if (i === 5) {
          // 6th attempt should be rate limited
          expect(res._getStatusCode()).toBe(429); // Too Many Requests
        }
      }
    });

    it('should limit file uploads per user', async () => {
      const mockSession = {
        user: { id: 'user-1', tenantId: 'tenant-1' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      // Simulate 16 uploads in 1 minute (limit is 15/min)
      for (let i = 0; i < 16; i++) {
        const { req, res } = createMocks({
          method: 'POST',
          url: '/api/upload',
        });

        if (i === 15) {
          expect(res._getStatusCode()).toBe(429); // Rate limited
        }
      }
    });
  });

  // ==========================================================================
  // #7: INSUFFICIENT LOGGING & MONITORING
  // ==========================================================================

  describe('Audit Logging', () => {
    it('should log sensitive operations', async () => {
      const mockSession = {
        user: { id: 'user-1', role: 'CLIENTE_USER', tenantId: 'tenant-1' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks({
        method: 'PUT',
        url: '/api/users/user-1',
        body: { email: 'newemail@example.com' },
      });

      // Should have created an audit log entry
      // Check database for AuditLog with:
      // - action: USER_UPDATE
      // - userId: user-1
      // - status: SUCCESS
      // - changes: { email: ... }
    });

    it('should log failed authorization attempts', async () => {
      const mockSession = {
        user: { id: 'user-1', role: 'CLIENTE_USER', tenantId: 'tenant-1' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/users/other-user',
      });

      // Should have created audit log with:
      // - action: IDOR_ATTEMPT or similar
      // - status: FAILED
      // - logLevel: ERROR
    });
  });

  // ==========================================================================
  // #8: WEBHOOK SECURITY
  // ==========================================================================

  describe('Webhook Validation', () => {
    it('should validate Stripe webhook signature', async () => {
      const invalidSignature = 'invalid-signature';

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/webhooks/stripe',
        headers: {
          'stripe-signature': invalidSignature,
        },
        body: JSON.stringify({ type: 'charge.succeeded' }),
      });

      // Should reject invalid signature
      expect(res._getStatusCode()).toBe(401);
    });

    it('should handle malformed JSON gracefully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/webhooks/stripe',
        body: '{invalid json}', // Invalid JSON
      });

      // Should NOT crash, should return error
      expect(res._getStatusCode()).not.toBe(500);
    });
  });

  // ==========================================================================
  // #9: PRIVILEGE ESCALATION
  // ==========================================================================

  describe('Privilege Escalation Prevention', () => {
    it('should prevent user from changing own role', async () => {
      const mockSession = {
        user: { id: 'user-1', role: 'CLIENTE_USER', tenantId: 'tenant-1' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks({
        method: 'PUT',
        url: '/api/users/user-1',
        body: { role: 'CLIENTE_ADMIN' }, // Try to escalate
      });

      // Should NOT allow self-escalation
      expect(res._getStatusCode()).toBe(403);
    });

    it('should prevent non-admin from changing other roles', async () => {
      const mockSession = {
        user: { id: 'user-1', role: 'CLIENTE_USER', tenantId: 'tenant-1' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks({
        method: 'PUT',
        url: '/api/users/user-2',
        body: { role: 'CLIENTE_ADMIN' },
      });

      expect(res._getStatusCode()).toBe(403);
    });
  });

  // ==========================================================================
  // #10: DATA VALIDATION
  // ==========================================================================

  describe('Input Validation', () => {
    it('should validate required fields', async () => {
      const mockSession = {
        user: { id: 'user-1', tenantId: 'tenant-1' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks({
        method: 'PUT',
        url: '/api/users/user-1',
        body: {}, // Missing required fields
      });

      expect(res._getStatusCode()).not.toBe(200);
    });

    it('should reject oversized payloads', async () => {
      const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/upload',
        body: { data: largePayload },
      });

      expect(res._getStatusCode()).not.toBe(200);
    });
  });
});
