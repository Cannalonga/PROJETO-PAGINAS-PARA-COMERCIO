/**
 * PATCH #2: BFLA Prevention - Admin Endpoint Authorization
 * File: app/api/admin/*/route.ts (ALL ADMIN ROUTES)
 * 
 * Vulnerability: CVSS 8.1 - Broken Function Level Authorization
 * Fix: Add role-based authorization middleware
 * 
 * HOW TO APPLY:
 * 1. Create: lib/admin-auth.ts (helper below)
 * 2. Add requireAdmin() to ALL admin routes at start
 * 3. Run tests: npm test -- __tests__/integration/bfla-admin.test.ts
 * 4. Test non-admin access is blocked with 403
 */

// ============================================================================
// NEW FILE: lib/admin-auth.ts - Admin Authorization Helper
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';

const ADMIN_ROLES = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN'];

/**
 * Middleware to require admin role
 * Usage: const auth = await requireAdmin(request);
 *        if (!auth.isAuthorized) return auth.response;
 */
export async function requireAdmin(
  request: NextRequest,
  requiredRoles: string[] = ADMIN_ROLES
) {
  try {
    // 1. Get session
    const session = await getSession({ req: request });

    // 2. Check authentication
    if (!session?.user?.id) {
      return {
        isAuthorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized: Must be logged in' },
          { status: 401 }
        ),
        session: null,
      };
    }

    // 3. Check authorization
    if (!requiredRoles.includes(session.user.role)) {
      // Audit log for failed authorization
      await logAuditEvent({
        userId: session.user.id,
        tenantId: session.user.tenantId,
        action: 'ADMIN_ACCESS_DENIED',
        resourceId: new URL(request.url).pathname,
        status: 'FAILED',
        details: {
          userRole: session.user.role,
          requiredRoles,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return {
        isAuthorized: false,
        response: NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        ),
        session: null,
      };
    }

    // ✅ Authorized
    return {
      isAuthorized: true,
      response: null,
      session,
    };
  } catch (error) {
    console.error('[ERROR] requireAdmin middleware:', error);
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
      session: null,
    };
  }
}

/**
 * Get tenant ID from request (for multi-tenant validation)
 */
export async function getTenantIdFromRequest(request: NextRequest): Promise<string> {
  const session = await getSession({ req: request });
  return session?.user?.tenantId || '';
}

// ============================================================================
// EXAMPLE: Updated Admin Route - VIP Management
// File: app/api/admin/vip/route.ts
// ============================================================================

export async function POST(request: NextRequest) {
  // ✅ FIRST THING: Check admin authorization
  const auth = await requireAdmin(request);
  if (!auth.isAuthorized) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const { userId, planType, extensionMonths } = body;

    // Validate input
    if (!userId || !planType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, planType' },
        { status: 400 }
      );
    }

    // ✅ NEW: Verify user belongs to same tenant
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: auth.session.user.tenantId, // ← Prevent cross-tenant
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in your organization' },
        { status: 404 }
      );
    }

    // ✅ NEW: Check user's store
    const userStore = await prisma.store.findFirst({
      where: {
        ownerId: userId,
        tenantId: auth.session.user.tenantId, // ← Prevent cross-tenant
      },
    });

    if (!userStore) {
      return NextResponse.json(
        { error: 'User has no store' },
        { status: 400 }
      );
    }

    // Update plan
    const updated = await prisma.store.update({
      where: { id: userStore.id },
      data: {
        plan: planType,
        ...(extensionMonths && {
          planExpires: new Date(Date.now() + extensionMonths * 30 * 24 * 60 * 60 * 1000),
        }),
      },
    });

    // Audit log
    await logAuditEvent({
      userId: auth.session.user.id,
      tenantId: auth.session.user.tenantId,
      action: 'ADMIN_VIP_UPGRADE',
      resourceId: userId,
      status: 'SUCCESS',
      changes: { plan: planType, extensionMonths },
    });

    return NextResponse.json({
      message: 'User upgraded to VIP',
      store: updated,
    });
  } catch (error) {
    console.error('[ERROR] POST /api/admin/vip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXAMPLE: Updated Admin Route - Trial Extension
// File: app/api/admin/trials/extend/route.ts
// ============================================================================

export async function POST(request: NextRequest) {
  // ✅ FIRST THING: Check admin authorization
  const auth = await requireAdmin(request, ['SUPERADMIN', 'OPERADOR']); // ← Stricter roles
  if (!auth.isAuthorized) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const { storeId, extensionDays } = body;

    // Validate
    if (!storeId || !extensionDays) {
      return NextResponse.json(
        { error: 'Missing storeId or extensionDays' },
        { status: 400 }
      );
    }

    // ✅ NEW: Verify store belongs to admin's tenant
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        tenantId: auth.session.user.tenantId, // ← Cross-tenant prevention
      },
      include: { owner: true },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Check current trial status
    if (!store.trialEndsAt || new Date(store.trialEndsAt) < new Date()) {
      return NextResponse.json(
        { error: 'Store is not in trial period' },
        { status: 400 }
      );
    }

    // Extend trial
    const newTrialEnd = new Date(store.trialEndsAt);
    newTrialEnd.setDate(newTrialEnd.getDate() + extensionDays);

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: { trialEndsAt: newTrialEnd },
    });

    // Audit log
    await logAuditEvent({
      userId: auth.session.user.id,
      tenantId: auth.session.user.tenantId,
      action: 'ADMIN_TRIAL_EXTEND',
      resourceId: storeId,
      status: 'SUCCESS',
      changes: { extensionDays, newTrialEnd },
    });

    return NextResponse.json({
      message: 'Trial extended',
      store: updated,
    });
  } catch (error) {
    console.error('[ERROR] POST /api/admin/trials/extend:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXAMPLE: Updated Admin Route - User Management
// File: app/api/admin/users/route.ts
// ============================================================================

export async function GET(request: NextRequest) {
  // ✅ FIRST THING: Check admin authorization
  const auth = await requireAdmin(request);
  if (!auth.isAuthorized) {
    return auth.response;
  }

  try {
    // ✅ Filter users by tenant only
    const users = await prisma.user.findMany({
      where: {
        tenantId: auth.session.user.tenantId, // ← Critical: Only show tenant users
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Audit log
    await logAuditEvent({
      userId: auth.session.user.id,
      tenantId: auth.session.user.tenantId,
      action: 'ADMIN_LIST_USERS',
      resourceId: 'all',
      status: 'SUCCESS',
      details: { count: users.length },
    });

    return NextResponse.json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('[ERROR] GET /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// CHECKLIST: Apply to ALL /api/admin/* routes:
// ============================================================================

/*
Routes that need requireAdmin():
  ✅ POST /api/admin/vip
  ✅ POST /api/admin/trials/extend
  ✅ GET /api/admin/users
  ⚠️  DELETE /api/admin/users/[id]
  ⚠️  PUT /api/admin/settings
  ⚠️  GET /api/admin/analytics
  ⚠️  POST /api/admin/stores/create
  ⚠️  DELETE /api/admin/stores/[id]
  ⚠️  GET /api/admin/audit-logs
  ⚠️  POST /api/admin/features/toggle
  ⚠️  GET /api/admin/reports
  ⚠️  POST /api/admin/billing/refund
  ⚠️  GET /api/admin/security/logs

Testing Pattern:
  1. Logged in as USER_ROLE = 403 Forbidden
  2. Logged in as CLIENTE_ADMIN = 200 OK
  3. Not logged in = 401 Unauthorized
  4. Cross-tenant access = 404 Not Found
*/
