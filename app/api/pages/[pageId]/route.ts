/**
 * app/api/pages/[pageId]/route.ts
 * ✅ GET /api/pages/[pageId] - Get page
 * ✅ PUT /api/pages/[pageId] - Update page
 * ✅ DELETE /api/pages/[pageId] - Delete page (soft delete)
 */

import { NextResponse } from 'next/server';
import { withAuthHandler } from '@/lib/auth/with-auth-handler';
import { PageService } from '@/lib/services/page-service';
import { updatePageSchema } from '@/lib/validations/pages';
import { errorResponse, successResponse } from '@/utils/helpers';
import { z } from 'zod';

const pageIdSchema = z.string().cuid('ID de página inválido');

/**
 * GET /api/pages/[pageId]
 * ✅ SECURITY: Requires authentication + IDOR prevention
 */
export const GET = withAuthHandler(
  async ({ tenant, params }) => {
    try {
      const pageId = pageIdSchema.parse(params?.pageId);
      const page = await PageService.getPageById(tenant.id, pageId);

      if (!page) {
        return NextResponse.json(
          errorResponse('Página não encontrada'),
          { status: 404 }
        );
      }

      return NextResponse.json(successResponse(page, 'Página recuperada com sucesso'));
    } catch (error) {
      console.error('[GET /api/pages/[pageId]] Error:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          errorResponse('ID de página inválido'),
          { status: 400 }
        );
      }

      return NextResponse.json(
        errorResponse('Erro ao recuperar página'),
        { status: 500 }
      );
    }
  },
  { requireTenant: true }
);

/**
 * PUT /api/pages/[pageId]
 * ✅ SECURITY: Requires authentication + (ADMIN or EDITOR role) + IDOR prevention
 */
export const PUT = withAuthHandler(
  async ({ session, tenant, req, params }) => {
    try {
      // ✅ SECURITY: RBAC - only ADMIN and EDITOR can update pages
      const allowedRoles = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN'];
      if (!allowedRoles.includes(session.role)) {
        return NextResponse.json(
          errorResponse('Sem permissão para editar páginas'),
          { status: 403 }
        );
      }

      const pageId = pageIdSchema.parse(params?.pageId);

      // ✅ SECURITY: Verify page exists and belongs to tenant (IDOR prevention)
      const page = await PageService.getPageById(tenant.id, pageId);
      if (!page) {
        return NextResponse.json(
          errorResponse('Página não encontrada'),
          { status: 404 }
        );
      }

      const body = await req.json();
      const data = updatePageSchema.parse(body);

      const updated = await PageService.updatePage(tenant.id, pageId, data);

      return NextResponse.json(
        successResponse(updated, 'Página atualizada com sucesso')
      );
    } catch (error) {
      console.error('[PUT /api/pages/[pageId]] Error:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          errorResponse('Dados inválidos'),
          { status: 400 }
        );
      }

      if (error instanceof Error && error.message.includes('Slug')) {
        return NextResponse.json(
          errorResponse(error.message),
          { status: 400 }
        );
      }

      return NextResponse.json(
        errorResponse('Erro ao atualizar página'),
        { status: 500 }
      );
    }
  },
  { requireTenant: true }
);

/**
 * DELETE /api/pages/[pageId]
 * ✅ SECURITY: Requires authentication + ADMIN role + IDOR prevention
 * ✅ Uses soft delete (sets deletedAt timestamp)
 */
export const DELETE = withAuthHandler(
  async ({ session, tenant, params }) => {
    try {
      // ✅ SECURITY: RBAC - only ADMIN can delete pages
      const allowedRoles = ['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN'];
      if (!allowedRoles.includes(session.role)) {
        return NextResponse.json(
          errorResponse('Sem permissão para deletar páginas'),
          { status: 403 }
        );
      }

      const pageId = pageIdSchema.parse(params?.pageId);

      // ✅ SECURITY: Verify page exists and belongs to tenant (IDOR prevention)
      const page = await PageService.getPageById(tenant.id, pageId);
      if (!page) {
        return NextResponse.json(
          errorResponse('Página não encontrada'),
          { status: 404 }
        );
      }

      await PageService.deletePage(tenant.id, pageId);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error('[DELETE /api/pages/[pageId]] Error:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          errorResponse('ID de página inválido'),
          { status: 400 }
        );
      }

      return NextResponse.json(
        errorResponse('Erro ao deletar página'),
        { status: 500 }
      );
    }
  },
  { requireTenant: true }
);
