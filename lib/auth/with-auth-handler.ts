/**
 * lib/auth/with-auth-handler.ts
 * 
 * ✅ SECURITY: Enhanced authentication wrapper for API routes
 * Provides tenant context, session validation, and RBAC enforcement
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/utils/helpers';

export type AuthContext = {
  session: {
    id: string;
    email: string;
    role: string;
    tenantId: string | null;
  };
  tenant: {
    id: string;
    slug: string;
    name: string;
  };
  req: NextRequest;
  params?: Record<string, any>;
};

/**
 * withAuthHandler: Higher-order function for authenticated route handlers
 * 
 * Usage:
 * export const GET = withAuthHandler(async ({ session, tenant, req }) => {
 *   // Your handler logic
 * });
 */
export function withAuthHandler(
  handler: (context: AuthContext) => Promise<NextResponse>,
  options?: {
    requireTenant?: boolean;
    allowedRoles?: string[];
  }
) {
  return async (req: NextRequest, context?: { params?: Record<string, any> }) => {
    try {
      // ✅ SECURITY: Validate authentication
      const session = await getServerSession(authOptions);

      if (!session?.user) {
        return NextResponse.json(
          errorResponse('Não autenticado'),
          { status: 401 }
        );
      }

      const user = session.user as any;

      // ✅ SECURITY: Check RBAC if specified
      if (options?.allowedRoles && !options.allowedRoles.includes(user.role)) {
        return NextResponse.json(
          errorResponse('Sem permissão para acessar este recurso'),
          { status: 403 }
        );
      }

      // ✅ SECURITY: Get tenant context
      let tenant: { id: string; slug: string; name: string } | null = null;

      // Só buscar tenant se requireTenant=true OU se tenantId existe
      if (user.tenantId) {
        tenant = await prisma.tenant.findUnique({
          where: { id: user.tenantId },
          select: { id: true, slug: true, name: true },
        });

        // Se tenant não existe mas era obrigatório, retorna erro
        if (!tenant && options?.requireTenant) {
          return NextResponse.json(
            errorResponse('Tenant não encontrado'),
            { status: 404 }
          );
        }
        
        // Se tenant não existe e não era obrigatório, limpa o tenantId
        if (!tenant) {
          user.tenantId = null;
        }
      } else if (options?.requireTenant) {
        return NextResponse.json(
          errorResponse('Contexto de tenant ausente'),
          { status: 403 }
        );
      }

      return handler({
        session: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
        tenant: tenant as any,
        req,
        params: context?.params,
      });
    } catch (error) {
      console.error('[AUTH_HANDLER] Error:', error);
      return NextResponse.json(
        errorResponse('Erro ao processar requisição'),
        { status: 500 }
      );
    }
  };
}

/**
 * Helper: Check if user has required role
 */
export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Helper: Verify tenant match (IDOR prevention)
 */
export function verifyTenantMatch(userTenantId: string | null, resourceTenantId: string): boolean {
  return userTenantId === resourceTenantId;
}
