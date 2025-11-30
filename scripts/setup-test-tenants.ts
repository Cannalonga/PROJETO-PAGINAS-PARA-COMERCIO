import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const TENANT_A = '550e8400-e29b-41d4-a716-446655440001'
const TENANT_B = '550e8400-e29b-41d4-a716-446655440002'

async function setup() {
  try {
    console.log('📝 Creating test tenants...')
    
    // Criar tenants
    await prisma.tenant.upsert({
      where: { id: TENANT_A },
      update: {},
      create: {
        id: TENANT_A,
        name: 'Tenant A Test',
        slug: 'tenant-a-test',
        email: 'tenant-a@test.com',
      }
    })
    
    await prisma.tenant.upsert({
      where: { id: TENANT_B },
      update: {},
      create: {
        id: TENANT_B,
        name: 'Tenant B Test',
        slug: 'tenant-b-test',
        email: 'tenant-b@test.com',
      }
    })
    
    console.log('✅ Tenants created')
    console.log(`   - Tenant A: ${TENANT_A}`)
    console.log(`   - Tenant B: ${TENANT_B}`)
  } finally {
    await prisma.$disconnect()
  }
}

setup()
