/**
 * PATCH #1: IDOR Prevention - User Endpoint Authorization
 * File: app/api/users/[id]/route.ts (REPLACE GET, PUT, DELETE)
 * 
 * Vulnerability: CVSS 8.2 - Broken Access Control
 * Fix: Add ownership and role-based authorization checks
 * 
 * HOW TO APPLY:
 * 1. Replace GET/PUT/DELETE functions in app/api/users/[id]/route.ts
 * 2. Keep existing schema validation at top
 * 3. Run tests: npm test -- __tests__/integration/idor-users.test.ts
 */

// ============================================================================
// HELPER: Check User Access Control
// ============================================================================

async function checkUserAccess(
  sessionUserId: string,
  sessionTenantId: string,
  sessionRole: string,
  targetUserId: string
): Promise<{ hasAccess: boolean; error?: string }> {
  // ✅ Own profile access
  if (sessionUserId === targetUserId) {
    return { hasAccess: true };
  }

  // ✅ Admin access check
  const isAdmin = ['CLIENTE_ADMIN', 'SUPERADMIN', 'OPERADOR'].includes(
    sessionRole
  );

  if (!isAdmin) {
    return { hasAccess: false, error: 'Unauthorized' };
  }

  // ✅ Verify tenant isolation
  const targetUser = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      tenantId: sessionTenantId, // ← Critical: Prevent cross-tenant access
    },
  });

  if (!targetUser) {
    return { hasAccess: false, error: 'User not found' };
  }

  return { hasAccess: true };
}

// ============================================================================
// UPDATED GET: /api/users/[id]
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // 1. Extract user ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const targetUserId = pathSegments[pathSegments.length - 1];

    // 2. Validate input
    const params = GetUserParamsSchema.parse({ id: targetUserId });

    // 3. Get session
    const session = await getSession({ req: request });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ NEW: Check access control
    const { hasAccess, error } = await checkUserAccess(
      session.user.id,
      session.user.tenantId,
      session.user.role,
      params.id
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: error || 'Forbidden' },
        { status: 403 }
      );
    }

    // 4. Fetch user (safe fields only)
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        tenantId: true,
        // ❌ Never return: password, tokens, secrets
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 5. Audit log
    await logAuditEvent({
      userId: session.user.id,
      tenantId: session.user.tenantId,
      action: 'USER_VIEW',
      resourceId: params.id,
      status: 'SUCCESS',
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[ERROR] GET /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// UPDATED PUT: /api/users/[id]
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    // 1. Extract user ID
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const targetUserId = pathSegments[pathSegments.length - 1];

    // 2. Validate input
    const params = GetUserParamsSchema.parse({ id: targetUserId });
    const body = UpdateUserBodySchema.parse(await request.json());

    // 3. Get session
    const session = await getSession({ req: request });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ NEW: Check access control
    const { hasAccess, error } = await checkUserAccess(
      session.user.id,
      session.user.tenantId,
      session.user.role,
      params.id
    );

    if (!hasAccess) {
      await logAuditEvent({
        userId: session.user.id,
        tenantId: session.user.tenantId,
        action: 'USER_UPDATE',
        resourceId: params.id,
        status: 'FAILED',
        details: { reason: 'Unauthorized' },
      });

      return NextResponse.json(
        { error: error || 'Forbidden' },
        { status: 403 }
      );
    }

    // ✅ NEW: Prevent privilege escalation
    // Non-admins modifying someone else's role = BLOCKED
    if (body.role && session.user.id !== params.id) {
      const isAdmin = ['CLIENTE_ADMIN', 'SUPERADMIN', 'OPERADOR'].includes(
        session.user.role
      );
      
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot modify user roles' },
          { status: 403 }
        );
      }
    }

    // 4. Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.email && { email: body.email.toLowerCase() }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.role &&
          session.user.id !== params.id && { role: body.role }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // 5. Audit log
    await logAuditEvent({
      userId: session.user.id,
      tenantId: session.user.tenantId,
      action: 'USER_UPDATE',
      resourceId: params.id,
      status: 'SUCCESS',
      changes: body,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[ERROR] PUT /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// UPDATED DELETE: /api/users/[id]
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    // 1. Extract user ID
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const targetUserId = pathSegments[pathSegments.length - 1];

    // 2. Validate input
    const params = GetUserParamsSchema.parse({ id: targetUserId });

    // 3. Get session
    const session = await getSession({ req: request });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ NEW: Admin-only deletion
    const isAdmin = ['CLIENTE_ADMIN', 'SUPERADMIN', 'OPERADOR'].includes(
      session.user.role
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can delete users' },
        { status: 403 }
      );
    }

    // ✅ NEW: Verify tenant isolation
    const targetUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId, // ← Prevent cross-tenant deletion
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 4. Soft delete
    const deletedUser = await prisma.user.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
      select: {
        id: true,
        email: true,
        deletedAt: true,
      },
    });

    // 5. Audit log
    await logAuditEvent({
      userId: session.user.id,
      tenantId: session.user.tenantId,
      action: 'USER_DELETE',
      resourceId: params.id,
      status: 'SUCCESS',
    });

    return NextResponse.json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    console.error('[ERROR] DELETE /api/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
