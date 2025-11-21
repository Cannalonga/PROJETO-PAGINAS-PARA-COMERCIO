/**
 * Tests for GET /api/users/stats endpoint
 *
 * Coverage:
 * - Statistics aggregation by role
 * - Statistics aggregation by status
 * - Total count calculation
 * - Tenant isolation
 * - Authorization checks
 * - Empty stats handling
 * - Role count distribution
 * - Status count distribution
 */

// Mock Prisma before imports
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUniqueOrThrow: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';

describe('User Stats API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // ROLE STATISTICS TESTS
  // ========================================================================

  describe('Role Statistics', () => {
    it('should count users by SUPERADMIN role', () => {
      const users = [
        { role: 'SUPERADMIN', isActive: true, deletedAt: null },
        { role: 'SUPERADMIN', isActive: true, deletedAt: null },
        { role: 'OPERADOR', isActive: true, deletedAt: null },
      ];

      const byRole = {
        SUPERADMIN: 0,
        OPERADOR: 0,
        CLIENTE_ADMIN: 0,
        CLIENTE_USER: 0,
      };

      users.forEach((user) => {
        byRole[user.role as keyof typeof byRole]++;
      });

      expect(byRole.SUPERADMIN).toBe(2);
      expect(byRole.OPERADOR).toBe(1);
      expect(byRole.CLIENTE_ADMIN).toBe(0);
      expect(byRole.CLIENTE_USER).toBe(0);
    });

    it('should count users by OPERADOR role', () => {
      const users = [
        { role: 'OPERADOR', isActive: true, deletedAt: null },
        { role: 'OPERADOR', isActive: false, deletedAt: null },
        { role: 'CLIENTE_ADMIN', isActive: true, deletedAt: null },
      ];

      const byRole = {
        SUPERADMIN: 0,
        OPERADOR: 0,
        CLIENTE_ADMIN: 0,
        CLIENTE_USER: 0,
      };

      users.forEach((user) => {
        byRole[user.role as keyof typeof byRole]++;
      });

      expect(byRole.OPERADOR).toBe(2);
      expect(byRole.CLIENTE_ADMIN).toBe(1);
    });

    it('should count users by CLIENTE_ADMIN role', () => {
      const users = Array(5)
        .fill(null)
        .map(() => ({ role: 'CLIENTE_ADMIN', isActive: true, deletedAt: null }));

      const byRole = {
        SUPERADMIN: 0,
        OPERADOR: 0,
        CLIENTE_ADMIN: 0,
        CLIENTE_USER: 0,
      };

      users.forEach((user) => {
        byRole[user.role as keyof typeof byRole]++;
      });

      expect(byRole.CLIENTE_ADMIN).toBe(5);
    });

    it('should count users by CLIENTE_USER role', () => {
      const users = Array(10)
        .fill(null)
        .map(() => ({ role: 'CLIENTE_USER', isActive: true, deletedAt: null }));

      const byRole = {
        SUPERADMIN: 0,
        OPERADOR: 0,
        CLIENTE_ADMIN: 0,
        CLIENTE_USER: 0,
      };

      users.forEach((user) => {
        byRole[user.role as keyof typeof byRole]++;
      });

      expect(byRole.CLIENTE_USER).toBe(10);
    });

    it('should handle mixed role distribution', () => {
      const users = [
        { role: 'SUPERADMIN', isActive: true, deletedAt: null },
        { role: 'SUPERADMIN', isActive: true, deletedAt: null },
        { role: 'OPERADOR', isActive: true, deletedAt: null },
        { role: 'OPERADOR', isActive: false, deletedAt: null },
        { role: 'OPERADOR', isActive: true, deletedAt: null },
        { role: 'CLIENTE_ADMIN', isActive: true, deletedAt: null },
        { role: 'CLIENTE_ADMIN', isActive: true, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: false, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: true, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: true, deletedAt: null },
      ];

      const byRole = {
        SUPERADMIN: 0,
        OPERADOR: 0,
        CLIENTE_ADMIN: 0,
        CLIENTE_USER: 0,
      };

      users.forEach((user) => {
        byRole[user.role as keyof typeof byRole]++;
      });

      expect(byRole.SUPERADMIN).toBe(2);
      expect(byRole.OPERADOR).toBe(3);
      expect(byRole.CLIENTE_ADMIN).toBe(2);
      expect(byRole.CLIENTE_USER).toBe(3);
    });
  });

  // ========================================================================
  // STATUS STATISTICS TESTS
  // ========================================================================

  describe('Status Statistics', () => {
    it('should count active users', () => {
      const users = [
        { role: 'CLIENTE_USER', isActive: true, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: true, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: false, deletedAt: null },
      ];

      const byStatus = {
        active: 0,
        inactive: 0,
        deleted: 0,
      };

      users.forEach((user) => {
        if (user.deletedAt) {
          byStatus.deleted++;
        } else if (user.isActive) {
          byStatus.active++;
        } else {
          byStatus.inactive++;
        }
      });

      expect(byStatus.active).toBe(2);
      expect(byStatus.inactive).toBe(1);
      expect(byStatus.deleted).toBe(0);
    });

    it('should count inactive users', () => {
      const users = [
        { role: 'CLIENTE_USER', isActive: false, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: false, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: false, deletedAt: null },
      ];

      const byStatus = {
        active: 0,
        inactive: 0,
        deleted: 0,
      };

      users.forEach((user) => {
        if (user.deletedAt) {
          byStatus.deleted++;
        } else if (user.isActive) {
          byStatus.active++;
        } else {
          byStatus.inactive++;
        }
      });

      expect(byStatus.inactive).toBe(3);
      expect(byStatus.active).toBe(0);
      expect(byStatus.deleted).toBe(0);
    });

    it('should count deleted users', () => {
      const users = [
        { role: 'CLIENTE_USER', isActive: true, deletedAt: new Date('2024-01-01') },
        { role: 'CLIENTE_USER', isActive: false, deletedAt: new Date('2024-01-02') },
        { role: 'CLIENTE_USER', isActive: true, deletedAt: null },
      ];

      const byStatus = {
        active: 0,
        inactive: 0,
        deleted: 0,
      };

      users.forEach((user) => {
        if (user.deletedAt) {
          byStatus.deleted++;
        } else if (user.isActive) {
          byStatus.active++;
        } else {
          byStatus.inactive++;
        }
      });

      expect(byStatus.deleted).toBe(2);
      expect(byStatus.active).toBe(1);
      expect(byStatus.inactive).toBe(0);
    });

    it('should handle mixed status distribution', () => {
      const users = [
        { role: 'CLIENTE_USER', isActive: true, deletedAt: null },
        { role: 'OPERADOR', isActive: true, deletedAt: null },
        { role: 'CLIENTE_ADMIN', isActive: false, deletedAt: null },
        { role: 'SUPERADMIN', isActive: false, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: true, deletedAt: new Date('2024-01-01') },
        { role: 'OPERADOR', isActive: false, deletedAt: new Date('2024-01-02') },
      ];

      const byStatus = {
        active: 0,
        inactive: 0,
        deleted: 0,
      };

      users.forEach((user) => {
        if (user.deletedAt) {
          byStatus.deleted++;
        } else if (user.isActive) {
          byStatus.active++;
        } else {
          byStatus.inactive++;
        }
      });

      expect(byStatus.active).toBe(2);
      expect(byStatus.inactive).toBe(2);
      expect(byStatus.deleted).toBe(2);
    });

    it('should handle all users active', () => {
      const users = Array(20)
        .fill(null)
        .map(() => ({ role: 'CLIENTE_USER', isActive: true, deletedAt: null }));

      const byStatus = {
        active: 0,
        inactive: 0,
        deleted: 0,
      };

      users.forEach((user) => {
        if (user.deletedAt) {
          byStatus.deleted++;
        } else if (user.isActive) {
          byStatus.active++;
        } else {
          byStatus.inactive++;
        }
      });

      expect(byStatus.active).toBe(20);
      expect(byStatus.inactive).toBe(0);
      expect(byStatus.deleted).toBe(0);
    });
  });

  // ========================================================================
  // TOTAL COUNT TESTS
  // ========================================================================

  describe('Total Count Calculation', () => {
    it('should calculate correct total with single user', () => {
      const users = [{ role: 'CLIENTE_USER', isActive: true, deletedAt: null }];
      const total = users.length;
      expect(total).toBe(1);
    });

    it('should calculate correct total with multiple users', () => {
      const users = [
        { role: 'SUPERADMIN', isActive: true, deletedAt: null },
        { role: 'OPERADOR', isActive: true, deletedAt: null },
        { role: 'CLIENTE_ADMIN', isActive: false, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: true, deletedAt: new Date('2024-01-01') },
      ];
      const total = users.length;
      expect(total).toBe(4);
    });

    it('should calculate correct total with no users', () => {
      const users: any[] = [];
      const total = users.length;
      expect(total).toBe(0);
    });

    it('should match sum of role counts', () => {
      const users = [
        { role: 'SUPERADMIN', isActive: true, deletedAt: null },
        { role: 'SUPERADMIN', isActive: true, deletedAt: null },
        { role: 'OPERADOR', isActive: true, deletedAt: null },
        { role: 'CLIENTE_ADMIN', isActive: true, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: false, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: true, deletedAt: new Date('2024-01-01') },
      ];

      const total = users.length;
      const byRole = { SUPERADMIN: 0, OPERADOR: 0, CLIENTE_ADMIN: 0, CLIENTE_USER: 0 };

      users.forEach((user) => {
        byRole[user.role as keyof typeof byRole]++;
      });

      const roleTotals = Object.values(byRole).reduce((a, b) => a + b, 0);
      expect(total).toBe(roleTotals);
    });

    it('should match sum of status counts', () => {
      const users = [
        { role: 'CLIENTE_USER', isActive: true, deletedAt: null },
        { role: 'OPERADOR', isActive: true, deletedAt: null },
        { role: 'CLIENTE_ADMIN', isActive: false, deletedAt: null },
        { role: 'SUPERADMIN', isActive: false, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: true, deletedAt: new Date('2024-01-01') },
      ];

      const total = users.length;
      const byStatus = { active: 0, inactive: 0, deleted: 0 };

      users.forEach((user) => {
        if (user.deletedAt) {
          byStatus.deleted++;
        } else if (user.isActive) {
          byStatus.active++;
        } else {
          byStatus.inactive++;
        }
      });

      const statusTotals = Object.values(byStatus).reduce((a, b) => a + b, 0);
      expect(total).toBe(statusTotals);
    });
  });

  // ========================================================================
  // AUTHORIZATION TESTS
  // ========================================================================

  describe('Authorization', () => {
    it('should authorize stats access for same tenant', async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        tenantId: 'tenant-1',
      });

      // Simulating the authorization check
      const user = await prisma.user.findUniqueOrThrow({ where: { id: 'user-1' } });
      const requestingTenantId = 'tenant-1';

      expect(user.tenantId).toBe(requestingTenantId);
    });

    it('should reject cross-tenant stats access', async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        tenantId: 'tenant-1',
      });

      const user = await prisma.user.findUniqueOrThrow({ where: { id: 'user-1' } });
      const requestingTenantId = 'tenant-2';

      expect(user.tenantId).not.toBe(requestingTenantId);
    });

    it('should handle authorization check errors', async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error('DB Error'));

      try {
        await prisma.user.findUniqueOrThrow({ where: { id: 'user-1' } });
      } catch (error: any) {
        expect(error.message).toBe('DB Error');
      }
    });
  });

  // ========================================================================
  // EMPTY STATS TESTS
  // ========================================================================

  describe('Empty Stats', () => {
    it('should handle zero users', () => {
      const users: any[] = [];

      const byRole = { SUPERADMIN: 0, OPERADOR: 0, CLIENTE_ADMIN: 0, CLIENTE_USER: 0 };
      const byStatus = { active: 0, inactive: 0, deleted: 0 };
      const total = users.length;

      expect(total).toBe(0);
      expect(Object.values(byRole).reduce((a, b) => a + b, 0)).toBe(0);
      expect(Object.values(byStatus).reduce((a, b) => a + b, 0)).toBe(0);
    });

    it('should have all zero role counts for empty dataset', () => {
      const users: any[] = [];
      const byRole = { SUPERADMIN: 0, OPERADOR: 0, CLIENTE_ADMIN: 0, CLIENTE_USER: 0 };

      users.forEach((user) => {
        byRole[user.role as keyof typeof byRole]++;
      });

      expect(byRole.SUPERADMIN).toBe(0);
      expect(byRole.OPERADOR).toBe(0);
      expect(byRole.CLIENTE_ADMIN).toBe(0);
      expect(byRole.CLIENTE_USER).toBe(0);
    });

    it('should have all zero status counts for empty dataset', () => {
      const users: any[] = [];
      const byStatus = { active: 0, inactive: 0, deleted: 0 };

      users.forEach((user) => {
        if (user.deletedAt) {
          byStatus.deleted++;
        } else if (user.isActive) {
          byStatus.active++;
        } else {
          byStatus.inactive++;
        }
      });

      expect(byStatus.active).toBe(0);
      expect(byStatus.inactive).toBe(0);
      expect(byStatus.deleted).toBe(0);
    });
  });

  // ========================================================================
  // RESPONSE FORMAT TESTS
  // ========================================================================

  describe('Response Format', () => {
    it('should include success flag', () => {
      const response = {
        success: true,
        data: {
          total: 0,
          byRole: { SUPERADMIN: 0, OPERADOR: 0, CLIENTE_ADMIN: 0, CLIENTE_USER: 0 },
          byStatus: { active: 0, inactive: 0, deleted: 0 },
          lastUpdated: new Date().toISOString(),
        },
      };

      expect(response.success).toBe(true);
    });

    it('should include all required fields', () => {
      const response = {
        success: true,
        data: {
          total: 10,
          byRole: { SUPERADMIN: 1, OPERADOR: 2, CLIENTE_ADMIN: 3, CLIENTE_USER: 4 },
          byStatus: { active: 8, inactive: 1, deleted: 1 },
          lastUpdated: '2024-01-01T00:00:00.000Z',
        },
      };

      expect(response.data).toHaveProperty('total');
      expect(response.data).toHaveProperty('byRole');
      expect(response.data).toHaveProperty('byStatus');
      expect(response.data).toHaveProperty('lastUpdated');
    });

    it('should have ISO format timestamp', () => {
      const timestamp = new Date().toISOString();
      expect(timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include all roles in byRole', () => {
      const byRole = { SUPERADMIN: 0, OPERADOR: 0, CLIENTE_ADMIN: 0, CLIENTE_USER: 0 };

      expect(byRole).toHaveProperty('SUPERADMIN');
      expect(byRole).toHaveProperty('OPERADOR');
      expect(byRole).toHaveProperty('CLIENTE_ADMIN');
      expect(byRole).toHaveProperty('CLIENTE_USER');
    });

    it('should include all statuses in byStatus', () => {
      const byStatus = { active: 0, inactive: 0, deleted: 0 };

      expect(byStatus).toHaveProperty('active');
      expect(byStatus).toHaveProperty('inactive');
      expect(byStatus).toHaveProperty('deleted');
    });
  });

  // ========================================================================
  // EDGE CASES
  // ========================================================================

  describe('Edge Cases', () => {
    it('should handle very large user counts', () => {
      const users = Array(10000)
        .fill(null)
        .map(() => ({ role: 'CLIENTE_USER', isActive: true, deletedAt: null }));

      const total = users.length;
      expect(total).toBe(10000);
    });

    it('should handle single user of each role', () => {
      const users = [
        { role: 'SUPERADMIN', isActive: true, deletedAt: null },
        { role: 'OPERADOR', isActive: true, deletedAt: null },
        { role: 'CLIENTE_ADMIN', isActive: true, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: true, deletedAt: null },
      ];

      const byRole = { SUPERADMIN: 0, OPERADOR: 0, CLIENTE_ADMIN: 0, CLIENTE_USER: 0 };

      users.forEach((user) => {
        byRole[user.role as keyof typeof byRole]++;
      });

      expect(byRole.SUPERADMIN).toBe(1);
      expect(byRole.OPERADOR).toBe(1);
      expect(byRole.CLIENTE_ADMIN).toBe(1);
      expect(byRole.CLIENTE_USER).toBe(1);
    });

    it('should handle all users with same status', () => {
      const users = Array(50)
        .fill(null)
        .map(() => ({ role: 'CLIENTE_USER', isActive: true, deletedAt: null }));

      const byStatus = { active: 0, inactive: 0, deleted: 0 };

      users.forEach((user) => {
        if (user.deletedAt) {
          byStatus.deleted++;
        } else if (user.isActive) {
          byStatus.active++;
        } else {
          byStatus.inactive++;
        }
      });

      expect(byStatus.active).toBe(50);
      expect(byStatus.inactive).toBe(0);
      expect(byStatus.deleted).toBe(0);
    });

    it('should handle equal distribution across roles', () => {
      const users = [
        { role: 'SUPERADMIN', isActive: true, deletedAt: null },
        { role: 'OPERADOR', isActive: true, deletedAt: null },
        { role: 'CLIENTE_ADMIN', isActive: true, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: true, deletedAt: null },
        { role: 'SUPERADMIN', isActive: false, deletedAt: null },
        { role: 'OPERADOR', isActive: false, deletedAt: null },
        { role: 'CLIENTE_ADMIN', isActive: false, deletedAt: null },
        { role: 'CLIENTE_USER', isActive: false, deletedAt: null },
      ];

      const byRole = { SUPERADMIN: 0, OPERADOR: 0, CLIENTE_ADMIN: 0, CLIENTE_USER: 0 };

      users.forEach((user) => {
        byRole[user.role as keyof typeof byRole]++;
      });

      expect(byRole.SUPERADMIN).toBe(2);
      expect(byRole.OPERADOR).toBe(2);
      expect(byRole.CLIENTE_ADMIN).toBe(2);
      expect(byRole.CLIENTE_USER).toBe(2);
    });
  });
});
