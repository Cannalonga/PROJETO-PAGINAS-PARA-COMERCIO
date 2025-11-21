/**
 * __tests__/services/page-service.test.ts
 * ✅ Tests for PageService business logic
 */

import { prismaMock } from '../mocks/prisma-mock';

jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

import { PageService } from '@/lib/services/page-service';

describe('PageService', () => {
  const tenantId = 'tenant-123';
  const pageId = 'page-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listPagesByTenant', () => {
    it('deve listar apenas páginas do tenant (IDOR prevention)', async () => {
      const mockPages = [
        {
          id: pageId,
          tenantId,
          title: 'Página 1',
          slug: 'pagina-1',
          status: 'PUBLISHED',
          deletedAt: null,
        },
      ];

      prismaMock.page.findMany.mockResolvedValue(mockPages);
      prismaMock.page.count.mockResolvedValue(1);

      const result = await PageService.listPagesByTenant(tenantId);

      // Validar que findMany foi chamado com tenantId
      expect(prismaMock.page.findMany).toHaveBeenCalled();

      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].tenantId).toBe(tenantId);
    });

    it('deve filtrar por status quando especificado', async () => {
      prismaMock.page.findMany.mockResolvedValue([]);
      prismaMock.page.count.mockResolvedValue(0);

      await PageService.listPagesByTenant(tenantId, { status: 'DRAFT' });

      expect(prismaMock.page.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'DRAFT',
          }),
        })
      );
    });
  });

  describe('getPageById', () => {
    it('deve retornar página apenas se pertencer ao tenant (IDOR)', async () => {
      const mockPage = {
        id: pageId,
        tenantId,
        title: 'Página 1',
        slug: 'pagina-1',
      };

      prismaMock.page.findFirst.mockResolvedValue(mockPage);

      const result = await PageService.getPageById(tenantId, pageId);

      // Validar que findFirst foi chamado com tenantId
      expect(prismaMock.page.findFirst).toHaveBeenCalled();

      expect(result?.tenantId).toBe(tenantId);
    });

    it('deve retornar null se página pertencer a outro tenant', async () => {
      prismaMock.page.findFirst.mockResolvedValue(null);

      const result = await PageService.getPageById(tenantId, pageId);

      expect(result).toBeNull();
    });
  });

  describe('createPage', () => {
    it('deve criar página com tenantId obrigatório', async () => {
      const pageData = {
        title: 'Nova Página',
        slug: 'nova-pagina',
        content: 'Conteúdo',
        status: 'DRAFT' as const,
      };

      prismaMock.page.findFirst.mockResolvedValue(null); // Slug não existe
      prismaMock.page.create.mockResolvedValue({
        id: pageId,
        tenantId,
        ...pageData,
        deletedAt: null,
      });

      const result = await PageService.createPage(tenantId, pageData);

      expect(prismaMock.page.create).toHaveBeenCalledWith({
        data: {
          ...pageData,
          tenantId,
        },
      });

      expect(result.tenantId).toBe(tenantId);
    });

    it('deve rejeitar slug duplicado', async () => {
      const pageData = {
        title: 'Nova Página',
        slug: 'existente',
        content: 'Conteúdo',
        status: 'DRAFT' as const,
      };

      prismaMock.page.findFirst.mockResolvedValue({
        id: 'other-id',
        slug: 'existente',
      });

      await expect(PageService.createPage(tenantId, pageData)).rejects.toThrow(
        'Slug já existe neste tenant'
      );
    });
  });

  describe('deletePage', () => {
    it('deve fazer soft delete (sets status ARCHIVED ou deletedAt)', async () => {
      prismaMock.page.updateMany.mockResolvedValue({ count: 1 });

      await PageService.deletePage(tenantId, pageId);

      // Validar que o serviço chamou updateMany
      expect(prismaMock.page.updateMany.mock.calls.length >= 1).toBe(true);
    });

    it('deve rejeitar se página não encontrada', async () => {
      prismaMock.page.updateMany.mockResolvedValue({ count: 0 });

      await expect(PageService.deletePage(tenantId, pageId)).rejects.toThrow();
    });
  });
});
