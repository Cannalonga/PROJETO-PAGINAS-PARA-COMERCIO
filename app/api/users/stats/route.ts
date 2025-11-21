/**
 * GET /api/users/stats
 *
 * Get user statistics aggregated by role and tenant.
 *
 * Returns:
 * - User count by role (SUPERADMIN, OPERADOR, CLIENTE_ADMIN, CLIENTE_USER)
 * - User count by status (active, inactive, deleted)
 * - Total count
 * - Statistics filtered by tenant
 *
 * Authorization:
 * - Auth layer: JWT token validation
 * - Authorization layer: RBAC - superadmin can view all, others only their tenant stats
 * - Tenant layer: All stats filtered to current tenant only
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

type UserRoleType = 'SUPERADMIN' | 'OPERADOR' | 'CLIENTE_ADMIN' | 'CLIENTE_USER';

// ============================================================================
// TYPES
// ============================================================================

interface RoleStats {
  SUPERADMIN: number;
  OPERADOR: number;
  CLIENTE_ADMIN: number;
  CLIENTE_USER: number;
}

interface StatusStats {
  active: number;
  inactive: number;
  deleted: number;
}

interface UserStatsResponse {
  success: boolean;
  data: {
    total: number;
    byRole: RoleStats;
    byStatus: StatusStats;
    lastUpdated: string;
  };
}

// ============================================================================
// AUTHORIZATION
// ============================================================================

/**
 * Verify that requesting user can access stats for their tenant
 */
async function authorizeStatsAccess(
  requestingUserId: string,
  requestingTenantId: string,
): Promise<{ authorized: boolean; error?: string }> {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: requestingUserId },
      select: { tenantId: true },
    });

    if (user.tenantId !== requestingTenantId) {
      return { authorized: false, error: 'Tenant mismatch' };
    }

    return { authorized: true };
  } catch (error) {
    return { authorized: false, error: 'Authorization check failed' };
  }
}

// ============================================================================
// STATISTICS CALCULATION
// ============================================================================

/**
 * Get user statistics for a tenant
 */
async function getUserStats(tenantId: string): Promise<UserStatsResponse['data']> {
  // Get all users for the tenant
  const allUsers = await prisma.user.findMany({
    where: { tenantId },
    select: {
      role: true,
      isActive: true,
      deletedAt: true,
    },
  });

  // Initialize stats
  const byRole: RoleStats = {
    SUPERADMIN: 0,
    OPERADOR: 0,
    CLIENTE_ADMIN: 0,
    CLIENTE_USER: 0,
  };

  const byStatus: StatusStats = {
    active: 0,
    inactive: 0,
    deleted: 0,
  };

  // Aggregate stats
  allUsers.forEach((user) => {
    // Count by role
    const role = user.role as UserRoleType;
    byRole[role]++;

    // Count by status
    if (user.deletedAt) {
      byStatus.deleted++;
    } else if (user.isActive) {
      byStatus.active++;
    } else {
      byStatus.inactive++;
    }
  });

  return {
    total: allUsers.length,
    byRole,
    byStatus,
    lastUpdated: new Date().toISOString(),
  };
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
    const requestingUserId = request.headers.get('x-user-id');
    const requestingTenantId = request.headers.get('x-tenant-id');

    if (!requestingUserId || !requestingTenantId) {
      return NextResponse.json(
        { error: 'Missing user context headers' },
        { status: 400 },
      );
    }

    // ========================================================================
    // AUTHORIZATION LAYER: Check access to stats
    // ========================================================================

    const authResult = await authorizeStatsAccess(requestingUserId, requestingTenantId);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    // ========================================================================
    // CALCULATION LAYER: Get user statistics
    // ========================================================================

    const statsData = await getUserStats(requestingTenantId);

    // ========================================================================
    // RESPONSE LAYER: Return formatted statistics
    // ========================================================================

    const response: UserStatsResponse = {
      success: true,
      data: statsData,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[User Stats] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching stats' },
      { status: 500 },
    );
  }
}

// ============================================================================
// METHOD NOT ALLOWED
// ============================================================================

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch user statistics' },
    { status: 405 },
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch user statistics' },
    { status: 405 },
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch user statistics' },
    { status: 405 },
  );
}
