import { prisma } from './prisma';

// ============================================================================
// INTERFACE
// ============================================================================

export interface StorePhoto {
  slot: string;
  url: string;
  publicId?: string;
  header?: string;
  description?: string;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  email: string;
  businessType: string;
  storeType: 'physical' | 'online';
  pageTitle: string;
  pageDescription: string;
  phone?: string;
  whatsapp: string;
  contactEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  instagram?: string;
  facebook?: string;
  businessHours?: string;
  photos: StorePhoto[];
  status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED';
  plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'VIP';
  isVip: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

// Gera um slug único
async function generateSlug(name: string): Promise<string> {
  let baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  // Verificar se slug já existe no banco
  while (true) {
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// Converte Tenant do Prisma para Store
function tenantToStore(tenant: any): Store {
  const page = tenant.pages?.[0];
  const content = page?.content as any || {};
  
  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    email: tenant.email,
    businessType: content.businessType || 'geral',
    storeType: content.storeType || 'physical',
    pageTitle: page?.title || tenant.name,
    pageDescription: page?.description || '',
    phone: tenant.phone || content.phone,
    whatsapp: content.whatsapp || '',
    contactEmail: content.contactEmail || tenant.email,
    address: tenant.address || content.address,
    city: tenant.city || content.city,
    state: tenant.state || content.state,
    zipCode: tenant.zipCode || content.zipCode,
    instagram: content.instagram,
    facebook: content.facebook,
    businessHours: content.businessHours,
    photos: content.photos || [],
    status: tenant.status === 'ACTIVE' ? 'ACTIVE' : tenant.status === 'SUSPENDED' ? 'SUSPENDED' : 'DRAFT',
    plan: tenant.plan as Store['plan'],
    isVip: tenant.plan === 'PREMIUM' || (content.isVip === true),
    createdAt: tenant.createdAt.toISOString(),
    updatedAt: tenant.updatedAt.toISOString(),
  };
}

// ============================================================================
// FUNÇÕES PÚBLICAS DA API
// ============================================================================

/**
 * Cria uma nova loja
 */
export async function createStore(storeData: Omit<Store, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'status' | 'plan' | 'isVip'>): Promise<Store> {
  const slug = await generateSlug(storeData.name);
  
  // Preparar content como objeto JSON válido para Prisma
  const pageContent = {
    businessType: storeData.businessType,
    storeType: storeData.storeType,
    phone: storeData.phone || null,
    whatsapp: storeData.whatsapp,
    contactEmail: storeData.contactEmail || null,
    address: storeData.address || null,
    city: storeData.city || null,
    state: storeData.state || null,
    zipCode: storeData.zipCode || null,
    instagram: storeData.instagram || null,
    facebook: storeData.facebook || null,
    businessHours: storeData.businessHours || null,
    photos: JSON.parse(JSON.stringify(storeData.photos || [])), // Garantir serialização correta
    isVip: false,
  };
  
  // Criar tenant com página associada
  const tenant = await prisma.tenant.create({
    data: {
      slug,
      name: storeData.name,
      email: storeData.email,
      phone: storeData.phone,
      address: storeData.address,
      city: storeData.city,
      state: storeData.state,
      zipCode: storeData.zipCode,
      status: 'ACTIVE', // Ativa direto para teste
      plan: 'FREE',
      pages: {
        create: {
          slug: 'principal',
          title: storeData.pageTitle,
          description: storeData.pageDescription,
          status: 'PUBLISHED',
          phone: storeData.phone,
          whatsapp: storeData.whatsapp,
          address: storeData.address,
          content: pageContent,
        },
      },
    },
    include: {
      pages: true,
    },
  });
  
  return tenantToStore(tenant);
}

/**
 * Busca uma loja por ID
 */
export async function getStoreById(id: string): Promise<Store | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: { pages: true },
  });
  
  if (!tenant) return null;
  return tenantToStore(tenant);
}

/**
 * Busca uma loja por slug
 */
export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { pages: true },
  });
  
  if (!tenant) return null;
  return tenantToStore(tenant);
}

/**
 * Lista todas as lojas
 */
export async function getAllStores(): Promise<Store[]> {
  const tenants = await prisma.tenant.findMany({
    include: { pages: true },
    orderBy: { createdAt: 'desc' },
  });
  
  return tenants.map(tenantToStore);
}

/**
 * Lista lojas ativas (publicadas)
 */
export async function getActiveStores(): Promise<Store[]> {
  const tenants = await prisma.tenant.findMany({
    where: { status: 'ACTIVE' },
    include: { pages: true },
    orderBy: { createdAt: 'desc' },
  });
  
  return tenants.map(tenantToStore);
}

/**
 * Atualiza uma loja
 */
export async function updateStore(id: string, updates: Partial<Store>): Promise<Store | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: { pages: true },
  });
  
  if (!tenant) return null;
  
  // Preparar dados para atualizar no tenant
  const tenantUpdates: any = {};
  if (updates.name) tenantUpdates.name = updates.name;
  if (updates.email) tenantUpdates.email = updates.email;
  if (updates.phone) tenantUpdates.phone = updates.phone;
  if (updates.address) tenantUpdates.address = updates.address;
  if (updates.city) tenantUpdates.city = updates.city;
  if (updates.state) tenantUpdates.state = updates.state;
  if (updates.zipCode) tenantUpdates.zipCode = updates.zipCode;
  if (updates.status) {
    tenantUpdates.status = updates.status === 'ACTIVE' ? 'ACTIVE' : 
                          updates.status === 'SUSPENDED' ? 'SUSPENDED' : 'INACTIVE';
  }
  if (updates.plan) tenantUpdates.plan = updates.plan;
  
  // Atualizar tenant
  await prisma.tenant.update({
    where: { id },
    data: tenantUpdates,
    include: { pages: true },
  });
  
  // Atualizar página se houver atualizações de conteúdo
  if (tenant.pages[0] && (updates.pageTitle || updates.pageDescription || updates.photos || updates.whatsapp)) {
    const page = tenant.pages[0];
    const existingContent = page.content as any || {};
    
    await prisma.page.update({
      where: { id: page.id },
      data: {
        title: updates.pageTitle || page.title,
        description: updates.pageDescription || page.description,
        content: {
          ...existingContent,
          ...(updates.businessType && { businessType: updates.businessType }),
          ...(updates.storeType && { storeType: updates.storeType }),
          ...(updates.whatsapp && { whatsapp: updates.whatsapp }),
          ...(updates.instagram && { instagram: updates.instagram }),
          ...(updates.facebook && { facebook: updates.facebook }),
          ...(updates.businessHours && { businessHours: updates.businessHours }),
          ...(updates.photos && { photos: updates.photos }),
          ...(updates.isVip !== undefined && { isVip: updates.isVip }),
        },
      },
    });
  }
  
  // Buscar novamente para retornar dados atualizados
  const result = await prisma.tenant.findUnique({
    where: { id },
    include: { pages: true },
  });
  
  return result ? tenantToStore(result) : null;
}

/**
 * Define uma loja como VIP (nunca expira)
 */
export async function setStoreAsVip(id: string): Promise<Store | null> {
  return updateStore(id, { isVip: true, plan: 'VIP', status: 'ACTIVE' });
}

/**
 * Deleta uma loja
 */
export async function deleteStore(id: string): Promise<boolean> {
  try {
    await prisma.tenant.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// Lista de slugs VIP (nunca expiram, sem pagamento)
export const VIP_SLUGS = ['rafael', 'admin', 'vitrinafast', 'demo', 'teste', 'cannaconverter'];

/**
 * Verifica se um slug é VIP
 */
export function isVipSlug(slug: string): boolean {
  return VIP_SLUGS.includes(slug.toLowerCase());
}
