/**
 * app/api/pages/route.ts
 * ✅ GET /api/pages - List pages
 * ✅ POST /api/pages - Create page
 */

import { NextResponse } from 'next/server';
import { withAuthHandler } from '@/lib/auth/with-auth-handler';
import { PageService } from '@/lib/services/page-service';
import { createPageSchema, listPagesSchema } from '@/lib/validations/pages';
import { errorResponse, successResponse } from '@/utils/helpers';

/**
 * GET /api/pages
 * ✅ SECURITY: Requires authentication
 * ✅ Returns only pages for the current tenant
 */
export const GET = withAuthHandler(
  async ({ tenant, req }) => {
    try {
      const searchParams = new URL(req.url).searchParams;
      const filters = listPagesSchema.parse({
        page: searchParams.get('page'),
        pageSize: searchParams.get('pageSize'),
        status: searchParams.get('status'),
        search: searchParams.get('search'),
      });

      const result = await PageService.listPagesByTenant(tenant.id, filters);

      return NextResponse.json(
        successResponse(result, 'Páginas recuperadas com sucesso')
      );
    } catch (error) {
      console.error('[GET /api/pages] Error:', error);

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          errorResponse('Parâmetros inválidos'),
          { status: 400 }
        );
      }

      return NextResponse.json(
        errorResponse('Erro ao recuperar páginas'),
        { status: 500 }
      );
    }
  },
  { requireTenant: true }
);

/**
 * POST /api/pages
 * ✅ SECURITY: Requires authentication + (ADMIN or EDITOR role)
 * ✅ Creates page for current tenant only
 */
export const POST = withAuthHandler(
  async ({ session, tenant, req }) => {
    try {
      // ✅ SECURITY: RBAC - only ADMIN and EDITOR can create pages
      const allowedRoles = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN'];
      if (!allowedRoles.includes(session.role)) {
        return NextResponse.json(
          errorResponse('Sem permissão para criar páginas'),
          { status: 403 }
        );
      }

      const body = await req.json();
      const data = createPageSchema.parse(body);

      const page = await PageService.createPage(tenant.id, data);

      return NextResponse.json(
        successResponse(page, 'Página criada com sucesso'),
        { status: 201 }
      );
    } catch (error) {
      console.error('[POST /api/pages] Error:', error);

      if (error instanceof SyntaxError || error instanceof Error && error.message.includes('Slug')) {
        return NextResponse.json(
          errorResponse(error.message || 'Dados inválidos'),
          { status: 400 }
        );
      }

      return NextResponse.json(
        errorResponse('Erro ao criar página'),
        { status: 500 }
      );
    }
  },
  { requireTenant: true }
);
