import { PrismaClient } from "@prisma/client";

/**
 * TENANT ISOLATION HELPER
 * 
 * Fornece acesso ao banco de dados com filtro automático de tenantId.
 * Garante que queries sempre incluem tenantId, evitando data leaks.
 * 
 * Uso:
 *   const db = getTenantScopedDb(auth.tenantId);
 *   const pages = await db.page.findMany({ where: { status: "PUBLISHED" } });
 *   // Resultado: só páginas do tenant específico
 */

const prisma = new PrismaClient();

interface TenantScopedArgs {
  where?: Record<string, any>;
  [key: string]: any;
}

/**
 * IMPORTANTE: Sempre passe o tenantId do contexto autenticado,
 * NUNCA do body/query da requisição!
 */
export function getTenantScopedDb(tenantId: string) {
  if (!tenantId) {
    throw new Error("getTenantScopedDb requires valid tenantId");
  }

  return {
    /**
     * Pages
     */
    page: {
      findMany: async (args?: TenantScopedArgs) => {
        return prisma.page.findMany({
          ...args,
          where: {
            ...(args?.where || {}),
            tenantId, // ← FORCED: sempre filtra por tenantId
          },
        });
      },

      findUnique: async (args: any) => {
        // Nota: findUnique não pode ter múltiplos campos únicos
        // Use findFirst em vez disso para multi-field unique
        return prisma.page.findFirst({
          where: {
            ...args.where,
            tenantId, // ← FORCED
          },
        });
      },

      findFirst: async (args?: TenantScopedArgs) => {
        return prisma.page.findFirst({
          ...args,
          where: {
            ...(args?.where || {}),
            tenantId, // ← FORCED
          },
        });
      },

      create: async (args: any) => {
        return prisma.page.create({
          ...args,
          data: {
            ...args.data,
            tenantId, // ← FORCED: sempre adiciona tenantId
          },
        });
      },

      update: async (args: any) => {
        // Valida que o página pertence ao tenant
        const existing = await prisma.page.findFirst({
          where: {
            id: args.where.id,
            tenantId,
          },
        });

        if (!existing) {
          throw new Error(`Page not found or not owned by tenant ${tenantId}`);
        }

        return prisma.page.update({
          ...args,
          where: { id: args.where.id }, // Use apenas id para update
        });
      },

      delete: async (args: any) => {
        const existing = await prisma.page.findFirst({
          where: {
            id: args.where.id,
            tenantId,
          },
        });

        if (!existing) {
          throw new Error(`Page not found or not owned by tenant ${tenantId}`);
        }

        return prisma.page.delete({
          where: { id: args.where.id },
        });
      },

      count: async (args?: TenantScopedArgs) => {
        return prisma.page.count({
          ...args,
          where: {
            ...(args?.where || {}),
            tenantId,
          },
        });
      },
    },

    /**
     * Users
     */
    user: {
      findMany: async (args?: TenantScopedArgs) => {
        return prisma.user.findMany({
          ...args,
          where: {
            ...(args?.where || {}),
            tenantId,
          },
        });
      },

      findFirst: async (args?: TenantScopedArgs) => {
        return prisma.user.findFirst({
          ...args,
          where: {
            ...(args?.where || {}),
            tenantId,
          },
        });
      },

      create: async (args: any) => {
        return prisma.user.create({
          ...args,
          data: {
            ...args.data,
            tenantId,
          },
        });
      },

      update: async (args: any) => {
        const existing = await prisma.user.findFirst({
          where: {
            id: args.where.id,
            tenantId,
          },
        });

        if (!existing) {
          throw new Error(`User not found or not owned by tenant ${tenantId}`);
        }

        return prisma.user.update(args);
      },

      delete: async (args: any) => {
        const existing = await prisma.user.findFirst({
          where: {
            id: args.where.id,
            tenantId,
          },
        });

        if (!existing) {
          throw new Error(`User not found or not owned by tenant ${tenantId}`);
        }

        return prisma.user.delete(args);
      },

      count: async (args?: TenantScopedArgs) => {
        return prisma.user.count({
          ...args,
          where: {
            ...(args?.where || {}),
            tenantId,
          },
        });
      },
    },

    /**
     * PageImages
     */
    pageImage: {
      findMany: async (args?: TenantScopedArgs) => {
        // PageImage não tem tenantId direto, mas related via Page
        // Pattern: buscar pageIds do tenant, depois imagens
        const pages = await prisma.page.findMany({
          where: { tenantId },
          select: { id: true },
        });

        const pageIds = pages.map((p) => p.id);

        return prisma.pageImage.findMany({
          ...args,
          where: {
            ...(args?.where || {}),
            pageId: { in: pageIds },
          },
        });
      },

      delete: async (args: any) => {
        // Valida ownership via page relationship
        const image = await prisma.pageImage.findUnique({
          where: { id: args.where.id },
          include: { page: true },
        });

        if (!image || image.page.tenantId !== tenantId) {
          throw new Error(`Image not found or not owned by tenant ${tenantId}`);
        }

        return prisma.pageImage.delete(args);
      },
    },

    /**
     * Payments
     */
    payment: {
      findMany: async (args?: TenantScopedArgs) => {
        return prisma.payment.findMany({
          ...args,
          where: {
            ...(args?.where || {}),
            tenantId,
          },
        });
      },

      findFirst: async (args?: TenantScopedArgs) => {
        return prisma.payment.findFirst({
          ...args,
          where: {
            ...(args?.where || {}),
            tenantId,
          },
        });
      },

      create: async (args: any) => {
        return prisma.payment.create({
          ...args,
          data: {
            ...args.data,
            tenantId,
          },
        });
      },

      count: async (args?: TenantScopedArgs) => {
        return prisma.payment.count({
          ...args,
          where: {
            ...(args?.where || {}),
            tenantId,
          },
        });
      },
    },

    /**
     * AuditLogs (para o tenant)
     */
    auditLog: {
      findMany: async (args?: TenantScopedArgs) => {
        return prisma.auditLog.findMany({
          ...args,
          where: {
            ...(args?.where || {}),
            tenantId,
          },
        });
      },

      create: async (args: any) => {
        return prisma.auditLog.create({
          ...args,
          data: {
            ...args.data,
            tenantId,
          },
        });
      },

      count: async (args?: TenantScopedArgs) => {
        return prisma.auditLog.count({
          ...args,
          where: {
            ...(args?.where || {}),
            tenantId,
          },
        });
      },
    },
  };
}

/**
 * ALTERNATIVE: Prisma Middleware Approach (mais avançado)
 * 
 * Para usar isso, você precisa de AsyncLocalStorage para armazenar
 * contexto por request. Implementaremos depois se necessário.
 * 
 * Por enquanto, o padrão getTenantScopedDb() é mais explícito e seguro.
 */

export function setupTenantMiddleware() {
  prisma.$use(async (params, next) => {
    // Exemplo de middleware que injeta tenantId automaticamente
    // NOTA: Isso requer que você tenha contexto asynclocalstorage
    // por enquanto, deixamos comentado para referência futura

    return next(params);
  });
}

/**
 * Export singleton prisma para casos que precisam bypass
 * (apenas admin actions ou background jobs)
 * 
 * ⚠️ CUIDADO: USE COM MODERAÇÃO!
 * Sempre prefira getTenantScopedDb().
 */
export { prisma };
