/**
 * Prisma Middleware para enforçar isolamento multi-tenant
 * Automaticamente injeta tenantId em queries para Page, User, TenantData
 * Bloqueia acesso a dados de outros tenants
 */

type TenantAwareModel = 'Page' | 'User' | 'TenantData' | 'Store'

const TENANT_AWARE_MODELS: TenantAwareModel[] = [
  'Page',
  'User',
  'TenantData',
  'Store',
]

// Stack de tenantIds ativa (para contexto aninhado)
const tenantStack: string[] = []

export function pushTenantContext(tenantId: string) {
  if (!tenantId) throw new Error('tenantId cannot be empty')
  tenantStack.push(tenantId)
}

export function popTenantContext() {
  return tenantStack.pop()
}

export function getTenantContext(): string | null {
  return tenantStack[tenantStack.length - 1] || null
}

/**
 * Middleware que injeta tenantId automaticamente em operações Prisma
 * Deve ser registrado em prisma.ts:
 *
 * ```typescript
 * prisma.$use(tenantMiddleware)
 * ```
 */
export async function tenantMiddleware(
  params: any,
  next: (params: any) => Promise<any>
) {
  const { model, action, args } = params

  // ============================================================================
  // 1. MODELOS NÃO TENANT-AWARE (ex: Session, Account, etc)
  // Passar direto sem modificação
  // ============================================================================
  if (!TENANT_AWARE_MODELS.includes(model)) {
    return next(params)
  }

  // ============================================================================
  // 2. OBTER TENANT CONTEXT ATIVO
  // ============================================================================
  const activeTenant = getTenantContext()

  if (!activeTenant) {
    throw new Error(
      `[Prisma Tenant Middleware] No tenant context for model ${model}. ` +
      `Use pushTenantContext(tenantId) before queries.`
    )
  }

  // ============================================================================
  // 3. CRIAR/CREATE - injetar tenantId nos dados
  // ============================================================================
  if (action === 'create') {
    args.data ??= {}
    args.data.tenantId = activeTenant
  }

  // ============================================================================
  // 4. CREATEMANY - injetar tenantId em cada item
  // ============================================================================
  if (action === 'createMany') {
    args.data = args.data.map((item: any) => ({
      ...item,
      tenantId: activeTenant,
    }))
  }

  // ============================================================================
  // 5. READ (findUnique, findFirst, findMany) - adicionar filtro tenantId
  // ============================================================================
  if (['findUnique', 'findFirst', 'findMany'].includes(action)) {
    args.where ??= {}
    args.where.tenantId = activeTenant
  }

  // ============================================================================
  // 6. UPDATE - verificar que está atualizando do tenant certo
  // ============================================================================
  if (action === 'update') {
    args.where ??= {}
    args.where.tenantId = activeTenant
  }

  // ============================================================================
  // 7. UPDATEMANY - adicionar filtro tenantId na cláusula where
  // ============================================================================
  if (action === 'updateMany') {
    args.where ??= {}
    args.where.tenantId = activeTenant
  }

  // ============================================================================
  // 8. DELETE - verificar que está deletando do tenant certo
  // ============================================================================
  if (action === 'delete') {
    args.where ??= {}
    args.where.tenantId = activeTenant
  }

  // ============================================================================
  // 9. DELETEMANY - adicionar filtro tenantId
  // ============================================================================
  if (action === 'deleteMany') {
    args.where ??= {}
    args.where.tenantId = activeTenant
  }

  // ============================================================================
  // 10. COUNT - incluir tenantId no filtro
  // ============================================================================
  if (action === 'count') {
    args.where ??= {}
    args.where.tenantId = activeTenant
  }

  // ============================================================================
  // 11. AGGREGATE - incluir tenantId no filtro
  // ============================================================================
  if (action === 'aggregate') {
    args.where ??= {}
    args.where.tenantId = activeTenant
  }

  // ============================================================================
  // 12. EXECUTAR COM TENANT INJETADO
  // ============================================================================
  return next(params)
}

/**
 * Hook para usar em API routes/Server Actions
 * Automaticamente gerencia tenant context
 *
 * Uso:
 * ```typescript
 * export async function GET(req: NextRequest) {
 *   return withTenant('tenant-123', async () => {
 *     const pages = await prisma.page.findMany() // tenantId injetado automaticamente
 *     return NextResponse.json(pages)
 *   })
 * }
 * ```
 */
export async function withTenant<T>(
  tenantId: string,
  callback: () => Promise<T>
): Promise<T> {
  pushTenantContext(tenantId)
  try {
    return await callback()
  } finally {
    popTenantContext()
  }
}

/**
 * Wrapper para operações síncronas
 */
export function withTenantSync<T>(
  tenantId: string,
  callback: () => T
): T {
  pushTenantContext(tenantId)
  try {
    return callback()
  } finally {
    popTenantContext()
  }
}

/**
 * Debugging: ver stack de tenants ativos
 */
export function debugTenantStack() {
  console.log('[Prisma Tenant] Active stack:', tenantStack)
}
