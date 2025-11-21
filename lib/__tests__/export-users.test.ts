/**
 * Tests for Export Users Library
 *
 * Coverage:
 * - Query building with filters
 * - User data formatting
 * - Email masking
 * - CSV generation and escaping
 */

import {
  buildExportQuery,
  formatUserForExport,
  convertToCSV,
  maskEmail,
  ExportedUser,
} from '@/lib/export-users';

describe('Export Users Library', () => {
  // ========================================================================
  // QUERY BUILDING TESTS
  // ========================================================================

  describe('Query Building', () => {
    it('should build query for active users (default)', () => {
      const query = buildExportQuery(undefined, 'active');
      expect(query.deletedAt).toBeNull();
      expect(query.isActive).toBe(true);
    });

    it('should build query for inactive users', () => {
      const query = buildExportQuery(undefined, 'inactive');
      expect(query.deletedAt).toBeNull();
      expect(query.isActive).toBe(false);
    });

    it('should build query for deleted users', () => {
      const query = buildExportQuery(undefined, 'deleted');
      expect(query.deletedAt).toEqual({ not: null });
    });

    it('should include role filter when specified', () => {
      const query = buildExportQuery('OPERADOR', 'active');
      expect(query.role).toBe('OPERADOR');
      expect(query.isActive).toBe(true);
    });

    it('should handle combined filters', () => {
      const query = buildExportQuery('CLIENTE_ADMIN', 'inactive');
      expect(query.role).toBe('CLIENTE_ADMIN');
      expect(query.isActive).toBe(false);
      expect(query.deletedAt).toBeNull();
    });
  });

  // ========================================================================
  // USER FORMATTING TESTS
  // ========================================================================

  describe('User Formatting', () => {
    it('should format user with all fields', () => {
      const user = {
        id: 'user-1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENTE_ADMIN',
        isActive: true,
        emailVerified: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const formatted = formatUserForExport(user);
      expect(formatted.id).toBe('user-1');
      expect(formatted.firstName).toBe('John');
      expect(formatted.lastName).toBe('Doe');
      expect(formatted.isActive).toBe(true);
      expect(formatted.createdAt).toMatch(/2024-01-01/);
    });

    it('should mask email in exported data', () => {
      const user = {
        id: 'user-1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENTE_USER',
        isActive: true,
        emailVerified: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const formatted = formatUserForExport(user);
      expect(formatted.email).toBe('jo***@example.com');
    });

    it('should handle null firstName and lastName', () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: null,
        lastName: null,
        role: 'CLIENTE_USER',
        isActive: true,
        emailVerified: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const formatted = formatUserForExport(user);
      expect(formatted.firstName).toBeNull();
      expect(formatted.lastName).toBeNull();
    });

    it('should convert timestamps to ISO string', () => {
      const now = new Date();
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CLIENTE_USER',
        isActive: true,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      };

      const formatted = formatUserForExport(user);
      expect(formatted.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(formatted.updatedAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  // ========================================================================
  // EMAIL MASKING TESTS
  // ========================================================================

  describe('Email Masking', () => {
    it('should mask email with 2+ character local part', () => {
      expect(maskEmail('john@example.com')).toBe('jo***@example.com');
    });

    it('should mask single character email', () => {
      expect(maskEmail('a@example.com')).toBe('***@example.com');
    });

    it('should mask two character email', () => {
      expect(maskEmail('ab@example.com')).toBe('***@example.com');
    });

    it('should handle long local part', () => {
      expect(maskEmail('verylongemail@example.com')).toBe('ve***@example.com');
    });

    it('should preserve domain correctly', () => {
      const masked = maskEmail('test@subdomain.example.co.uk');
      expect(masked).toContain('***@');
      expect(masked).toContain('subdomain.example.co.uk');
    });

    it('should handle subdomains', () => {
      expect(maskEmail('user@mail.company.com')).toBe('us***@mail.company.com');
    });
  });

  // ========================================================================
  // CSV GENERATION TESTS
  // ========================================================================

  describe('CSV Generation', () => {
    const mockUser: ExportedUser = {
      id: 'user-1',
      email: 'jo***@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'OPERADOR',
      isActive: true,
      emailVerified: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    };

    it('should generate empty CSV for empty user list', () => {
      const csv = convertToCSV([]);
      expect(csv).toBe('');
    });

    it('should include CSV headers', () => {
      const csv = convertToCSV([mockUser]);
      expect(csv).toContain('ID,Email,First Name,Last Name,Role,Active,Email Verified,Created At,Updated At');
    });

    it('should escape CSV values with commas', () => {
      const user: ExportedUser = {
        ...mockUser,
        firstName: 'John, Jr',
      };

      const csv = convertToCSV([user]);
      expect(csv).toContain('"John, Jr"');
    });

    it('should escape CSV values with quotes', () => {
      const user: ExportedUser = {
        ...mockUser,
        firstName: 'John "Johnny"',
      };

      const csv = convertToCSV([user]);
      expect(csv).toContain('"John ""Johnny"""');
    });

    it('should escape CSV values with newlines', () => {
      const user: ExportedUser = {
        ...mockUser,
        firstName: 'John\nLine2',
      };

      const csv = convertToCSV([user]);
      expect(csv).toContain('"John\nLine2"');
    });

    it('should handle multiple rows', () => {
      const users: ExportedUser[] = [
        mockUser,
        {
          ...mockUser,
          id: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      ];

      const csv = convertToCSV(users);
      const lines = csv.split('\n');
      expect(lines.length).toBe(3); // Header + 2 rows
    });

    it('should handle null values in CSV', () => {
      const user: ExportedUser = {
        ...mockUser,
        firstName: null,
        lastName: null,
      };

      const csv = convertToCSV([user]);
      expect(csv).toContain('user-1,jo***@example.com,,,OPERADOR');
    });

    it('should format headers correctly', () => {
      const csv = convertToCSV([mockUser]);
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      expect(headers).toEqual([
        'ID',
        'Email',
        'First Name',
        'Last Name',
        'Role',
        'Active',
        'Email Verified',
        'Created At',
        'Updated At',
      ]);
    });

    it('should format data row correctly', () => {
      const csv = convertToCSV([mockUser]);
      const lines = csv.split('\n');
      const dataLine = lines[1];
      expect(dataLine).toContain('user-1');
      expect(dataLine).toContain('jo***@example.com');
      expect(dataLine).toContain('John');
      expect(dataLine).toContain('Doe');
      expect(dataLine).toContain('OPERADOR');
    });

    it('should handle special characters in CSV', () => {
      const user: ExportedUser = {
        ...mockUser,
        firstName: "O'Brien",
        lastName: 'Müller',
      };

      const csv = convertToCSV([user]);
      expect(csv).toContain("O'Brien");
      expect(csv).toContain('Müller');
    });

    it('should handle very long fields', () => {
      const longString = 'a'.repeat(1000);
      const user: ExportedUser = {
        ...mockUser,
        firstName: longString,
      };

      const csv = convertToCSV([user]);
      expect(csv).toContain(longString);
    });

    it('should handle all roles', () => {
      const roles: Array<ExportedUser['role']> = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER'];
      
      roles.forEach((role) => {
        const user: ExportedUser = {
          ...mockUser,
          role,
        };
        const csv = convertToCSV([user]);
        expect(csv).toContain(role);
      });
    });

    it('should handle combined special characters', () => {
      const user: ExportedUser = {
        ...mockUser,
        firstName: 'John, "Special" User\nLine2',
      };

      const csv = convertToCSV([user]);
      expect(csv).toContain('"John, ""Special"" User\nLine2"');
    });
  });

  // ========================================================================
  // INTEGRATION TESTS
  // ========================================================================

  describe('Export Flow', () => {
    it('should format and export active users', () => {
      const users = [
        {
          id: 'user-1',
          email: 'active@example.com',
          firstName: 'Active',
          lastName: 'User',
          role: 'CLIENTE_USER',
          isActive: true,
          emailVerified: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      const formatted = users.map(formatUserForExport);
      expect(formatted).toHaveLength(1);
      expect(formatted[0].email).toBe('ac***@example.com');
    });

    it('should convert formatted users to CSV', () => {
      const users: ExportedUser[] = [
        {
          id: 'user-1',
          email: 'jo***@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'OPERADOR',
          isActive: true,
          emailVerified: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ];

      const csv = convertToCSV(users);
      expect(csv).toContain('ID,Email');
      expect(csv).toContain('John');
      expect(csv).toContain('Doe');
    });

    it('should handle export with multiple users', () => {
      const rawUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          role: 'CLIENTE_ADMIN' as const,
          isActive: true,
          emailVerified: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
          role: 'CLIENTE_USER' as const,
          isActive: false,
          emailVerified: false,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-04'),
        },
      ];

      const formatted = rawUsers.map(formatUserForExport);
      const csv = convertToCSV(formatted);

      expect(formatted).toHaveLength(2);
      expect(csv.split('\n').length).toBe(3); // Header + 2 rows
    });
  });
});
