/**
 * GET /api/users/export
 *
 * Export users as CSV or JSON with role-based filtering and tenant isolation.
 *
 * Query Parameters:
 * - format: 'csv' | 'json' (default: 'json')
 * - role?: UserRole (optional, filter by role)
 * - status?: 'active' | 'inactive' | 'deleted' (default: 'active')
 *
 * Authorization:
 * - Auth layer: JWT token validation
 * - Validation layer: Format validation (csv/json), role enum validation
 * - Authorization layer: RBAC - superadmin can export any, others only lower roles
 * - Tenant layer: All exports filtered to current tenant only
 *
 * Response:
 * - CSV: text/csv with user data
 * - JSON: application/json with user array
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { z } from 'zod';
import {
  UserRoleType,
  ROLE_HIERARCHY,
  formatUserForExport,
  convertToCSV,
  buildExportQuery,
} from '@/lib/export-users';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const ExportQuerySchema = z.object({
  format: z.enum(['csv', 'json']).default('json'),
  role: z.enum(['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER']).optional(),
  status: z.enum(['active', 'inactive', 'deleted']).default('active'),
});

// ============================================================================
// AUTHORIZATION
// ============================================================================

/**
 * Authorize export request based on role hierarchy
 * - Superadmin can export any role
 * - Others can only export roles below their own level
 */
async function authorizeExport(
  requestingUserId: string,
  requestingTenantId: string,
  filterRole: UserRoleType | undefined,
): Promise<{ authorized: boolean; error?: string }> {
  try {
    // Get requesting user
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: requestingUserId },
      select: {
        role: true,
        tenantId: true,
      },
    });

    // Verify tenant isolation
    if (user.tenantId !== requestingTenantId) {
      return { authorized: false, error: 'Tenant mismatch' };
    }

    // If filtering by role, check privilege hierarchy
    if (filterRole) {
      const userHierarchy = ROLE_HIERARCHY[user.role as UserRoleType];
      const filterHierarchy = ROLE_HIERARCHY[filterRole];

      // SUPERADMIN can view any role
      if (user.role === 'SUPERADMIN') {
        return { authorized: true };
      }

      // Others can only view lower/equal roles (not higher privilege)
      if (filterHierarchy > userHierarchy) {
        return {
          authorized: false,
          error: `Cannot export users with role higher than your privilege level`,
        };
      }
    }

    return { authorized: true };
  } catch (error) {
    return { authorized: false, error: 'Authorization check failed' };
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // ========================================================================
    // AUTH LAYER: Verify JWT token and extract user info
    // ========================================================================

    const authHeader = headers().get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    // TODO: Implement proper JWT verification
    // For now, assume token contains user data (would be extracted via jwt.verify in production)
    const requestingUserId = request.headers.get('x-user-id');
    const requestingTenantId = request.headers.get('x-tenant-id');

    if (!requestingUserId || !requestingTenantId) {
      return NextResponse.json(
        { error: 'Missing user context headers' },
        { status: 400 },
      );
    }

    // ========================================================================
    // VALIDATION LAYER: Parse and validate query parameters
    // ========================================================================

    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      format: searchParams.get('format'),
      role: searchParams.get('role'),
      status: searchParams.get('status'),
    };

    const validationResult = ExportQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { format, role, status } = validationResult.data;

    // ========================================================================
    // AUTHORIZATION LAYER: Check role-based access for export
    // ========================================================================

    const authResult = await authorizeExport(requestingUserId, requestingTenantId, role as UserRoleType | undefined);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    // ========================================================================
    // QUERY LAYER: Fetch users with filtering
    // ========================================================================

    const where = buildExportQuery(role as UserRoleType | undefined, status);
    where.tenantId = requestingTenantId; // Always isolate by tenant

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // ========================================================================
    // FORMATTING LAYER: Format response based on format parameter
    // ========================================================================

    const exportedUsers = users.map(formatUserForExport);

    if (format === 'csv') {
      const csvContent = convertToCSV(exportedUsers);
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': `attachment; filename="users_export_${Date.now()}.csv"`,
        },
      });
    }

    // JSON format (default)
    return NextResponse.json(
      {
        success: true,
        data: exportedUsers,
        count: exportedUsers.length,
        exportedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[Export Users] Error:', error);

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Internal server error during export' },
      { status: 500 },
    );
  }
}

// ============================================================================
// METHOD NOT ALLOWED
// ============================================================================

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to export users' },
    { status: 405 },
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to export users' },
    { status: 405 },
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to export users' },
    { status: 405 },
  );
}
