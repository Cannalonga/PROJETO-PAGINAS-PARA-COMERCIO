/**
 * Admin Authorization Helper
 * Implements BFLA Prevention (CVSS 8.1)
 * 
 * Use at the start of ANY admin endpoint:
 * const auth = await requireAdmin(request);
 * if (!auth.isAuthorized) return auth.response;
 */

import { NextRequest, NextResponse } from 'next/server';
// Admin authentication helper - Note: @/auth module must be configured in next-auth setup

const ADMIN_ROLES = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN'];

interface AdminAuthResult {
  isAuthorized: boolean;
  response?: NextResponse;
  session?: {
    userId: string;
    email: string;
    role: string;
    tenantId: string;
  } | null;
}

/**
 * Middleware to require admin role
 * Returns early with 401/403 if not authorized
 * 
 * @param request NextRequest from route handler
 * @param requiredRoles Admin roles allowed (default: all admin roles)
 * @returns { isAuthorized, response, session }
 */
export async function requireAdmin(
  _request: NextRequest,
  requiredRoles: string[] = ADMIN_ROLES
): Promise<AdminAuthResult> {
  try {
    // Get session from NextAuth.js using getServerSession
    // Note: auth() function requires @/auth module configuration
    const session = await Promise.resolve(null as any); // Placeholder until @/auth is available

    // 1. Check if user is authenticated
    if (!session?.user?.id) {
      return {
        isAuthorized: false,
        response: NextResponse.json(
          {
            error: 'Unauthorized: Must be logged in',
            timestamp: new Date().toISOString(),
          },
          { status: 401 }
        ),
        session: null,
      };
    }

    // 2. Check if user has required admin role
    const userRole = session.user?.role as string | undefined;
    if (!userRole || !requiredRoles.includes(userRole)) {
      return {
        isAuthorized: false,
        response: NextResponse.json(
          {
            error: `Forbidden: This action requires one of roles: ${requiredRoles.join(', ')}`,
            userRole: userRole || 'unknown',
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        ),
        session: null,
      };
    }

    // 3. Authorization successful
    return {
      isAuthorized: true,
      session: {
        userId: session.user.id,
        email: session.user.email || '',
        role: userRole,
        tenantId: (session.user as any).tenantId || '',
      },
    };
  } catch (error) {
    console.error('Admin auth error:', error);
    return {
      isAuthorized: false,
      response: NextResponse.json(
        {
          error: 'Internal server error during authorization',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      ),
      session: null,
    };
  }
}

/**
 * Require specific superadmin role (most restrictive)
 */
export async function requireSuperAdmin(
  request: NextRequest
): Promise<AdminAuthResult> {
  return requireAdmin(request, ['SUPERADMIN']);
}

/**
 * Require operator or above (OPERADOR, SUPERADMIN)
 */
export async function requireOperator(
  request: NextRequest
): Promise<AdminAuthResult> {
  return requireAdmin(request, ['OPERADOR', 'SUPERADMIN']);
}

/**
 * Require any admin role
 */
export async function requireAnyAdmin(
  request: NextRequest
): Promise<AdminAuthResult> {
  return requireAdmin(request, ADMIN_ROLES);
}
