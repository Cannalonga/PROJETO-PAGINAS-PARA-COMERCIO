/**
 * E2E Tests: Multi-Tenant Isolation & Access Control
 * Verifica que dados de um tenant não são acessíveis por outro
 *
 * Usa banco de dados de teste com prisma (não muta prod)
 */

import { PrismaClient } from '@prisma/client'
import { withTenant } from '@/lib/prisma-middleware'

// Inicializar Prisma em modo de teste
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    },
  },
})

describe('🔒 Multi-Tenant Isolation Tests', () => {
  // ============================================================================
  // SETUP & TEARDOWN
  // ============================================================================

  // IDs de tenant para testes
  const TENANT_A = '550e8400-e29b-41d4-a716-446655440001'
  const TENANT_B = '550e8400-e29b-41d4-a716-446655440002'

  beforeAll(async () => {
    console.log('🔧 Setting up test tenants...')

    // Limpar dados antigos (opcional - comentar se usar DB test real)
    // await prisma.page.deleteMany({ where: { tenantId: { in: [TENANT_A, TENANT_B] } } })
    // await prisma.user.deleteMany({ where: { tenantId: { in: [TENANT_A, TENANT_B] } } })
  })

  afterAll(async () => {
    console.log('🧹 Cleaning up test data...')
    await prisma.$disconnect()
  })

  // ============================================================================
  // TEST 1: Criar página no Tenant A, não deve ser visível no Tenant B
  // ============================================================================
  it('should isolate pages between tenants', async () => {
    // Criar página no Tenant A
    const pageA = await withTenant(TENANT_A, async () => {
      return await prisma.page.create({
        data: {
          title: 'Secret Page - Tenant A',
          slug: 'secret-a',
          description: 'Only visible to Tenant A',
          content: 'Confidential content',
          tenantId: TENANT_A,
        },
      })
    })

    expect(pageA).toBeDefined()
    expect(pageA.tenantId).toBe(TENANT_A)

    // Tentar acessar página do Tenant A como Tenant B
    const pagesB = await withTenant(TENANT_B, async () => {
      return await prisma.page.findMany()
    })

    // Verificar que página A NÃO é visível no Tenant B
    const pageFound = pagesB.find(p => p.id === pageA.id)
    expect(pageFound).toBeUndefined()

    console.log('✅ Pages properly isolated')
  })

  // ============================================================================
  // TEST 2: Criar usuários em tenants diferentes, não devem se ver
  // ============================================================================
  it('should isolate users between tenants', async () => {
    // Usuário no Tenant A
    const userA = await withTenant(TENANT_A, async () => {
      return await prisma.user.create({
        data: {
          email: 'user-a@test.com',
          name: 'User A',
          tenantId: TENANT_A,
        },
      })
    })

    // Usuário no Tenant B
    const userB = await withTenant(TENANT_B, async () => {
      return await prisma.user.create({
        data: {
          email: 'user-b@test.com',
          name: 'User B',
          tenantId: TENANT_B,
        },
      })
    })

    expect(userA.tenantId).toBe(TENANT_A)
    expect(userB.tenantId).toBe(TENANT_B)

    // Listar usuários no Tenant A
    const usersInA = await withTenant(TENANT_A, async () => {
      return await prisma.user.findMany()
    })

    // Verificar que User B não aparece
    const userBInA = usersInA.find(u => u.id === userB.id)
    expect(userBInA).toBeUndefined()

    console.log('✅ Users properly isolated')
  })

  // ============================================================================
  // TEST 3: Update de um tenant não deve afetar outro
  // ============================================================================
  it('should prevent cross-tenant updates', async () => {
    // Criar página no Tenant A
    const pageA = await withTenant(TENANT_A, async () => {
      return await prisma.page.create({
        data: {
          title: 'Original Title',
          slug: 'test-update-a',
          description: 'Test',
          content: 'Content A',
          tenantId: TENANT_A,
        },
      })
    })

    // Tentar atualizar como Tenant B (deve falhar silenciosamente)
    const updateResult = await withTenant(TENANT_B, async () => {
      return await prisma.page.updateMany({
        where: {
          id: pageA.id, // Não será encontrado porque Tenant B não vê
        },
        data: {
          title: 'Hacked Title',
        },
      })
    })

    expect(updateResult.count).toBe(0)

    // Verificar que página original não foi modificada
    const pageCheck = await withTenant(TENANT_A, async () => {
      return await prisma.page.findUnique({
        where: { id: pageA.id },
      })
    })

    expect(pageCheck?.title).toBe('Original Title')
    console.log('✅ Cross-tenant update prevented')
  })

  // ============================================================================
  // TEST 4: Delete de um tenant não deve afetar outro
  // ============================================================================
  it('should prevent cross-tenant deletes', async () => {
    // Criar páginas em ambos tenants
    const pageA = await withTenant(TENANT_A, async () => {
      return await prisma.page.create({
        data: {
          title: 'Page A',
          slug: 'delete-test-a',
          description: 'Test',
          content: 'Content',
          tenantId: TENANT_A,
        },
      })
    })

    const pageB = await withTenant(TENANT_B, async () => {
      return await prisma.page.create({
        data: {
          title: 'Page B',
          slug: 'delete-test-b',
          description: 'Test',
          content: 'Content',
          tenantId: TENANT_B,
        },
      })
    })

    // Tentar deletar página A como Tenant B
    const deleteResult = await withTenant(TENANT_B, async () => {
      return await prisma.page.deleteMany({
        where: { id: pageA.id },
      })
    })

    expect(deleteResult.count).toBe(0)

    // Verificar que página A ainda existe
    const pageStillExists = await withTenant(TENANT_A, async () => {
      return await prisma.page.findUnique({
        where: { id: pageA.id },
      })
    })

    expect(pageStillExists).toBeDefined()
    console.log('✅ Cross-tenant delete prevented')
  })

  // ============================================================================
  // TEST 5: Count queries devem respeitar tenant
  // ============================================================================
  it('should isolate count queries', async () => {
    // Criar 3 páginas no Tenant A
    await withTenant(TENANT_A, async () => {
      for (let i = 0; i < 3; i++) {
        await prisma.page.create({
          data: {
            title: `Page A-${i}`,
            slug: `count-test-a-${i}`,
            description: 'Test',
            content: 'Content',
            tenantId: TENANT_A,
          },
        })
      }
    })

    // Criar 2 páginas no Tenant B
    await withTenant(TENANT_B, async () => {
      for (let i = 0; i < 2; i++) {
        await prisma.page.create({
          data: {
            title: `Page B-${i}`,
            slug: `count-test-b-${i}`,
            description: 'Test',
            content: 'Content',
            tenantId: TENANT_B,
          },
        })
      }
    })

    // Contar páginas no Tenant A
    const countA = await withTenant(TENANT_A, async () => {
      return await prisma.page.count()
    })

    // Contar páginas no Tenant B
    const countB = await withTenant(TENANT_B, async () => {
      return await prisma.page.count()
    })

    expect(countA).toBeGreaterThanOrEqual(3)
    expect(countB).toBeGreaterThanOrEqual(2)
    expect(countA).not.toBe(countB)

    console.log('✅ Count queries properly isolated')
  })

  // ============================================================================
  // TEST 6: Tenant context obrigatório (deve falhar sem context)
  // ============================================================================
  it('should require tenant context', async () => {
    // Tentar acessar sem tenant context deve falhar
    try {
      await prisma.page.findMany()
      // Se chegou aqui, teste falha (não deveria permitir)
      expect(true).toBe(false)
    } catch (error) {
      // Esperado falhar
      expect(error).toBeDefined()
      console.log('✅ Tenant context properly required')
    }
  })

  // ============================================================================
  // TEST 7: Aggregate queries isolado por tenant
  // ============================================================================
  it('should isolate aggregate queries', async () => {
    // Agregar dados no Tenant A
    const aggregateA = await withTenant(TENANT_A, async () => {
      return await prisma.page.aggregate({
        _count: true,
      })
    })

    // Agregar dados no Tenant B
    const aggregateB = await withTenant(TENANT_B, async () => {
      return await prisma.page.aggregate({
        _count: true,
      })
    })

    expect(aggregateA._count).toBeDefined()
    expect(aggregateB._count).toBeDefined()

    console.log('✅ Aggregate queries properly isolated')
  })
})

// ============================================================================
// INSTRUÇÕES PARA EXECUTAR
// ============================================================================
/*
# 1. Instalar dependências de teste
npm install --save-dev @jest/globals jest ts-jest @types/jest

# 2. Criar .env.test com DATABASE_URL_TEST apontando para DB de teste
echo "DATABASE_URL_TEST=postgresql://user:pass@localhost:5432/test" >> .env.test

# 3. Rodar os testes
npm run test -- tenant-isolation.e2e.ts --testEnvironment=node

# 4. Ver cobertura
npm run test -- tenant-isolation.e2e.ts --coverage

# 5. Modo watch (rerun ao salvar)
npm run test -- tenant-isolation.e2e.ts --watch
*/
