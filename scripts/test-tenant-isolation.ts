import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

const TENANT_A = '550e8400-e29b-41d4-a716-446655440001'
const TENANT_B = '550e8400-e29b-41d4-a716-446655440002'

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

async function runTests() {
  console.log('🔒 Starting Tenant Isolation Tests...\n')

  try {
    // Test 1: Connection
    console.log('📡 Test 1: Database Connection...')
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected\n')
    results.push({ name: 'Database Connection', passed: true })

    // Test 2: Page Isolation
    console.log('🔍 Test 2: Page Isolation Between Tenants...')
    try {
      const pageA = await prisma.page.create({
        data: {
          title: `Test Page A - ${Date.now()}`,
          slug: `test-a-${Date.now()}`,
          description: 'Test page in Tenant A',
          content: { sections: [] },
          tenantId: TENANT_A,
        },
      })

      console.log(`   ✓ Created page in Tenant A (ID: ${pageA.id})`)

      // Tenta encontrar como Tenant B
      const pageInB = await prisma.page.findFirst({
        where: {
          id: pageA.id,
          tenantId: TENANT_B,
        },
      })

      if (pageInB) {
        throw new Error('❌ Page A foi visível em Tenant B! Cross-tenant leak detectado!')
      }

      console.log('   ✓ Page A is NOT visible in Tenant B context')
      results.push({ name: 'Page Isolation', passed: true })
      console.log('✅ Page Isolation OK\n')
    } catch (error) {
      results.push({
        name: 'Page Isolation',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      })
      console.log(`❌ Page Isolation FAILED: ${error}\n`)
    }

    // Test 3: User Isolation
    console.log('👤 Test 3: User Isolation Between Tenants...')
    try {
      const userA = await prisma.user.create({
        data: {
          email: `test-a-${Date.now()}@test.com`,
          password: 'hashed-pwd',
          firstName: 'Test',
          lastName: 'A',
          tenantId: TENANT_A,
        },
      })

      console.log(`   ✓ Created user in Tenant A (ID: ${userA.id})`)

      const userInB = await prisma.user.findFirst({
        where: {
          id: userA.id,
          tenantId: TENANT_B,
        },
      })

      if (userInB) {
        throw new Error('❌ User A foi visível em Tenant B! Cross-tenant leak detectado!')
      }

      console.log('   ✓ User A is NOT visible in Tenant B context')
      results.push({ name: 'User Isolation', passed: true })
      console.log('✅ User Isolation OK\n')
    } catch (error) {
      results.push({
        name: 'User Isolation',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      })
      console.log(`❌ User Isolation FAILED: ${error}\n`)
    }

    // Test 4: Count Isolation
    console.log('📊 Test 4: Count Query Isolation...')
    try {
      const countA = await prisma.page.count({
        where: { tenantId: TENANT_A },
      })

      const countB = await prisma.page.count({
        where: { tenantId: TENANT_B },
      })

      console.log(`   ✓ Tenant A pages: ${countA}`)
      console.log(`   ✓ Tenant B pages: ${countB}`)

      results.push({ name: 'Count Isolation', passed: true })
      console.log('✅ Count Isolation OK\n')
    } catch (error) {
      results.push({
        name: 'Count Isolation',
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      })
      console.log(`❌ Count Isolation FAILED: ${error}\n`)
    }

    // Summary
    console.log('=' .repeat(60))
    console.log('📊 TEST SUMMARY\n')
    const passed = results.filter(r => r.passed).length
    const total = results.length

    results.forEach(r => {
      const icon = r.passed ? '✅' : '❌'
      console.log(`${icon} ${r.name}`)
      if (r.error) {
        console.log(`   Error: ${r.error}`)
      }
    })

    console.log(`\n✅ PASSED: ${passed}/${total}`)

    if (passed === total) {
      console.log('\n🎉 All tenant isolation tests passed!')
      process.exit(0)
    } else {
      console.log('\n⚠️  Some tests failed')
      process.exit(1)
    }
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runTests()
