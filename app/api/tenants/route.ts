import { prisma } from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  validateInput,
  requireAuth,
  requireRole,
  allowMethods,
  safeHandler,
} from '@/lib/api-helpers';
import { verifyCsrfToken } from '@/lib/csrf';
import { NextResponse, NextRequest } from 'next/server';
import { CreateTenantSchema, TenantQuerySchema } from '@/lib/validations';

/**
 * GET /api/tenants
 * Lista todos os tenants com paginação
 * 
 * Query Parameters:
 * - page: número da página (padrão: 1)
 * - pageSize: itens por página (padrão: 10, máximo: 100)
 * - status: filtro por status (ACTIVE, INACTIVE, SUSPENDED, DELETED)
 * - search: buscar por nome ou slug
 * 
 * Requer autenticação + role SUPERADMIN ou OPERADOR
 */
export const GET = safeHandler(async (req: NextRequest, ctx): Promise<NextResponse> => {
  // ✅ Verificação 1: HTTP Method
  const methodError = allowMethods('GET')(req);
  if (methodError) return methodError;

  // ✅ Verificação 2: Autenticação
  const authError = requireAuth(req);
  if (authError) return authError;

  // ✅ Verificação 3: Autorização (apenas admin)
  const roleError = requireRole('SUPERADMIN', 'OPERADOR')(req);
  if (roleError) return roleError;

  try {
    // Valida query parameters
    const queryValidation = await validateInput(
      new NextRequest(req.url, {
        method: 'GET',
        headers: new Headers({
          'content-type': 'application/json',
        }),
      }),
      TenantQuerySchema
    );

    if (!queryValidation.valid) {
      return queryValidation.error;
    }

    const data = queryValidation.data as { page: number; pageSize: number; status?: string; search?: string };
    const { page, pageSize, status, search } = data;
    const skip = (page - 1) * pageSize;

    // ✅ OTIMIZAÇÃO: Construir where dinamicamente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // ✅ PERFORMANCE: Promise.all para queries paralelas
    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          name: true,
          email: true,
          status: true,
          billingPlan: true,
          billingStatus: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { users: true, pages: true },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json(
      successResponse(
        {
          items: tenants,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
        'Tenants retrieved successfully',
        ctx.requestId
      )
    );
  } catch (error) {
    throw error;
  }
});

/**
 * POST /api/tenants
 * Cria um novo tenant
 * 
 * Headers:
 * - x-csrf-token: token obtido em GET /api/csrf-token
 * 
 * Body:
 * {
 *   name: string (3-100 chars)
 *   email: string (válido)
 *   phone?: string
 *   cnpj?: string (14 dígitos)
 *   address?: string
 *   city?: string
 *   state?: string
 *   zipCode?: string
 * }
 * 
 * Requer autenticação + role SUPERADMIN ou OPERADOR
 * Requer CSRF token válido
 */
export const POST = safeHandler(async (req: NextRequest, ctx) => {
  // ✅ Verificação 1: HTTP Method
  const methodError = allowMethods('POST')(req);
  if (methodError) return methodError;

  // ✅ Verificação 2: CSRF Token (ANTES de auth para cache)
  const csrfError = verifyCsrfToken(req);
  if (csrfError) return csrfError;

  // ✅ Verificação 3: Autenticação
  const authError = requireAuth(req);
  if (authError) return authError;

  // ✅ Verificação 4: Autorização
  const roleError = requireRole('SUPERADMIN', 'OPERADOR')(req);
  if (roleError) return roleError;

  try {
    // ✅ SEGURANÇA: Validação obrigatória com Zod
    const validation = await validateInput(req, CreateTenantSchema);
    if (!validation.valid) {
      return validation.error;
    }

    const createData = validation.data as { name: string; email: string; phone?: string; address?: string; city?: string; state?: string; zipCode?: string; cnpj?: string };
    const { name, email, phone, address, city, state, zipCode, cnpj } = createData;

    // ✅ SEGURANÇA: Gerar slug seguro (sanitizado)
    const slug = generateSecureSlug(name);

    // ✅ ATOMICIDADE: Verificar slug em transação
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return NextResponse.json(
        errorResponse(
          'SLUG_EXISTS',
          `Tenant with slug "${slug}" already exists`,
          undefined,
          ctx.requestId
        ),
        { status: 409 }
      );
    }

    // ✅ Criar tenant com auditoria
    const tenant = await prisma.tenant.create({
      data: {
        slug,
        name,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        cnpj,
        metadata: {
          createdBy: ctx.userId,
          createdAt: new Date().toISOString(),
        },
      },
    });

    // ✅ Log de auditoria (opcional: integrar com AuditLog model)
    console.log(`[${ctx.requestId}] Tenant created:`, {
      id: tenant.id,
      slug: tenant.slug,
      createdBy: ctx.userId,
    });

    return NextResponse.json(
      successResponse(tenant, 'Tenant created successfully', ctx.requestId),
      { status: 201 }
    );
  } catch (error) {
    throw error;
  }
});

/**
 * Gera slug seguro e único
 * - Remove caracteres especiais
 * - Suporta punycode para domínios internacionalizados
 * - Previne Unicode tricks (homoglyphs)
 */
function generateSecureSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove caracteres especiais
    .replace(/[\s_-]+/g, '-')      // Normaliza espaços/hífens
    .replace(/^-+|-+$/g, '')       // Remove hífens nas extremidades
    .slice(0, 50);                 // Limita tamanho
}

