/**
 * Export Users Business Logic
 *
 * Helper functions for user export feature
 */

export type UserRoleType = 'SUPERADMIN' | 'OPERADOR' | 'CLIENTE_ADMIN' | 'CLIENTE_USER';

export interface ExportedUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRoleType;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ROLE HIERARCHY
// ============================================================================

export const ROLE_HIERARCHY: Record<UserRoleType, number> = {
  SUPERADMIN: 4,
  OPERADOR: 3,
  CLIENTE_ADMIN: 2,
  CLIENTE_USER: 1,
} as const;

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format user for export (mask sensitive data)
 */
export function formatUserForExport(user: any): ExportedUser {
  return {
    id: user.id,
    email: maskEmail(user.email),
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    createdAt: new Date(user.createdAt).toISOString(),
    updatedAt: new Date(user.updatedAt).toISOString(),
  };
}

/**
 * Mask email for privacy (first 2 chars + *** + @domain)
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `***@${domain}`;
  }
  return `${local.substring(0, 2)}***@${domain}`;
}

/**
 * Convert users array to CSV string
 */
export function convertToCSV(users: ExportedUser[]): string {
  if (users.length === 0) {
    return '';
  }

  // CSV headers
  const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'Active', 'Email Verified', 'Created At', 'Updated At'];

  // Escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build rows
  const rows = users.map((user) => [
    escapeCSV(user.id),
    escapeCSV(user.email),
    escapeCSV(user.firstName),
    escapeCSV(user.lastName),
    escapeCSV(user.role),
    escapeCSV(user.isActive),
    escapeCSV(user.emailVerified),
    escapeCSV(user.createdAt),
    escapeCSV(user.updatedAt),
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

/**
 * Build Prisma query for user export with filtering
 */
export function buildExportQuery(filterRole?: UserRoleType, status: 'active' | 'inactive' | 'deleted' = 'active') {
  const where: any = {};

  // Status filtering
  if (status === 'active') {
    where.deletedAt = null;
    where.isActive = true;
  } else if (status === 'inactive') {
    where.deletedAt = null;
    where.isActive = false;
  } else if (status === 'deleted') {
    where.deletedAt = { not: null };
  }

  // Role filtering
  if (filterRole) {
    where.role = filterRole;
  }

  return where;
}
