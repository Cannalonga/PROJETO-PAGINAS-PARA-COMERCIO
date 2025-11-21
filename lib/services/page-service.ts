/**
 * lib/services/page-service.ts
 * Business logic layer for multi-tenant page operations
 */

import { prisma } from '@/lib/prisma';

export interface CreatePageInput {
  slug: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  content: string;
  description?: string | null;
  templateId?: string | null;
}

export interface UpdatePageInput {
  slug?: string;
  title?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  content?: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  seoImage?: string | null;
  seoNoIndex?: boolean;
}

export class PageService {
  /**
   * List all pages for a tenant
   */
  static async listPagesByTenant(
    tenantId: string,
    filters?: {
      status?: string;
      search?: string;
      page?: number;
      pageSize?: number;
    }
  ) {
    const pageSize = filters?.pageSize || 10;
    const page = filters?.page || 1;
    const skip = (page - 1) * pageSize;

    const where: any = {
      tenantId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.page.count({ where }),
    ]);

    return {
      pages,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get a single page by ID (with tenant validation)
   */
  static async getPageById(tenantId: string, pageId: string) {
    return prisma.page.findFirst({
      where: {
        id: pageId,
        tenantId,
      },
    });
  }

  /**
   * Get a page by slug for public viewing
   */
  static async getPageBySlug(tenantSlug: string, pageSlug: string) {
    return prisma.page.findFirst({
      where: {
        tenant: {
          slug: tenantSlug,
        },
        slug: pageSlug,
      },
    });
  }

  /**
   * Create a new page
   */
  static async createPage(tenantId: string, data: CreatePageInput) {
    // Check if slug is unique within tenant
    const existing = await prisma.page.findFirst({
      where: {
        tenantId,
        slug: data.slug,
      },
    });

    if (existing) {
      throw new Error('Slug já existe neste tenant');
    }

    return prisma.page.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  /**
   * Update a page
   */
  static async updatePage(tenantId: string, pageId: string, data: UpdatePageInput) {
    // Check if slug is unique (if changing slug)
    if (data.slug) {
      const existing = await prisma.page.findFirst({
        where: {
          tenantId,
          slug: data.slug,
          id: { not: pageId },
        },
      });

      if (existing) {
        throw new Error('Slug já existe neste tenant');
      }
    }

    const result = await prisma.page.updateMany({
      where: {
        id: pageId,
        tenantId,
      },
      data,
    });

    if (result.count === 0) {
      throw new Error('Página não encontrada');
    }

    return this.getPageById(tenantId, pageId);
  }

  /**
   * Soft delete a page (marca como rascunho deletado)
   */
  static async deletePage(tenantId: string, pageId: string) {
    const result = await prisma.page.updateMany({
      where: {
        id: pageId,
        tenantId,
      },
      data: {
        status: 'ARCHIVED',
      },
    });

    if (result.count === 0) {
      throw new Error('Página não encontrada');
    }

    return result;
  }

  /**
   * Hard delete a page (admin only)
   */
  static async hardDeletePage(tenantId: string, pageId: string) {
    return prisma.page.deleteMany({
      where: {
        id: pageId,
        tenantId,
      },
    });
  }
}
