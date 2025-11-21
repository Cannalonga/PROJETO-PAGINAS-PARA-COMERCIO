/**
 * app/api/templates/route.ts
 * ✅ GET /api/templates - List templates (public/approved only)
 * ✅ POST /api/templates - Create template (SUPERADMIN only)
 */

import { NextResponse } from 'next/server';
import { withAuthHandler } from '@/lib/auth/with-auth-handler';
import { errorResponse, successResponse } from '@/utils/helpers';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500).optional(),
  content: z.record(z.any()),
  preview: z.string().url().optional(),
  category: z.enum(['LOJA', 'RESTAURANTE', 'SERVICOS', 'CONSULTORIO', 'SALON']).optional(),
});

/**
 * GET /api/templates
 * ✅ SECURITY: All authenticated users can view published templates
 * ✅ Templates are global (not tenant-specific)
 */
export const GET = withAuthHandler(
  async () => {
    try {
      // Predefined templates (can be extended to use a database model)
      const templates = [
        {
          id: 'tpl-001',
          name: 'Loja Básica',
          description: 'Template padrão para lojas de comércio eletrônico',
          category: 'LOJA',
          preview: '/templates/loja-basica.jpg',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'tpl-002',
          name: 'Restaurante Premium',
          description: 'Template premium para restaurantes com menu interativo',
          category: 'RESTAURANTE',
          preview: '/templates/restaurante-premium.jpg',
          createdAt: new Date('2024-01-02'),
        },
      ];

      return NextResponse.json(
        successResponse(templates, 'Templates recuperados com sucesso')
      );
    } catch (error) {
      console.error('[GET /api/templates] Error:', error);
      return NextResponse.json(
        errorResponse('Erro ao recuperar templates'),
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/templates
 * ✅ SECURITY: Only SUPERADMIN can create templates
 */
export const POST = withAuthHandler(
  async ({ session, req }) => {
    try {
      // ✅ SECURITY: RBAC - only SUPERADMIN can create templates
      if (session.role !== 'SUPERADMIN') {
        return NextResponse.json(
          errorResponse('Apenas administradores podem criar templates'),
          { status: 403 }
        );
      }

      const body = await req.json();
      const data = createTemplateSchema.parse(body);

      // For now, return the template data (can be extended to save to database)
      const template = {
        id: `tpl-${Date.now()}`,
        ...data,
        published: false,
        createdAt: new Date(),
      };

      return NextResponse.json(
        successResponse(template, 'Template criado com sucesso'),
        { status: 201 }
      );
    } catch (error) {
      console.error('[POST /api/templates] Error:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          errorResponse('Dados de template inválidos'),
          { status: 400 }
        );
      }

      return NextResponse.json(
        errorResponse('Erro ao criar template'),
        { status: 500 }
      );
    }
  }
);
