import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Caminho do arquivo de dados
const DATA_FILE = join(process.cwd(), 'data', 'stores.json');

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

interface StoresData {
  stores: Store[];
  lastId: number;
}

// Inicializa o arquivo se não existir
function initDataFile(): void {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    const { mkdirSync } = require('fs');
    mkdirSync(dataDir, { recursive: true });
  }
  
  if (!existsSync(DATA_FILE)) {
    const initialData: StoresData = { stores: [], lastId: 0 };
    writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

// Lê todos os dados
function readData(): StoresData {
  initDataFile();
  try {
    const content = readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { stores: [], lastId: 0 };
  }
}

// Salva todos os dados
function writeData(data: StoresData): void {
  initDataFile();
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Gera um slug único
function generateSlug(name: string, existingSlugs: string[]): string {
  let baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// ============================================================================
// FUNÇÕES PÚBLICAS DA API
// ============================================================================

/**
 * Cria uma nova loja
 */
export function createStore(storeData: Omit<Store, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'status' | 'plan' | 'isVip'>): Store {
  const data = readData();
  
  const existingSlugs = data.stores.map(s => s.slug);
  const slug = generateSlug(storeData.name, existingSlugs);
  
  const newStore: Store = {
    ...storeData,
    id: `store_${Date.now()}_${++data.lastId}`,
    slug,
    status: 'ACTIVE', // Ativa direto para teste
    plan: 'FREE',
    isVip: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  data.stores.push(newStore);
  writeData(data);
  
  return newStore;
}

/**
 * Busca uma loja por ID
 */
export function getStoreById(id: string): Store | null {
  const data = readData();
  return data.stores.find(s => s.id === id) || null;
}

/**
 * Busca uma loja por slug
 */
export function getStoreBySlug(slug: string): Store | null {
  const data = readData();
  return data.stores.find(s => s.slug === slug) || null;
}

/**
 * Lista todas as lojas
 */
export function getAllStores(): Store[] {
  const data = readData();
  return data.stores;
}

/**
 * Lista lojas ativas (publicadas)
 */
export function getActiveStores(): Store[] {
  const data = readData();
  return data.stores.filter(s => s.status === 'ACTIVE');
}

/**
 * Atualiza uma loja
 */
export function updateStore(id: string, updates: Partial<Store>): Store | null {
  const data = readData();
  const index = data.stores.findIndex(s => s.id === id);
  
  if (index === -1) return null;
  
  data.stores[index] = {
    ...data.stores[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  writeData(data);
  return data.stores[index];
}

/**
 * Define uma loja como VIP (nunca expira)
 */
export function setStoreAsVip(id: string): Store | null {
  return updateStore(id, { isVip: true, plan: 'VIP', status: 'ACTIVE' });
}

/**
 * Deleta uma loja
 */
export function deleteStore(id: string): boolean {
  const data = readData();
  const index = data.stores.findIndex(s => s.id === id);
  
  if (index === -1) return false;
  
  data.stores.splice(index, 1);
  writeData(data);
  return true;
}

// Lista de slugs VIP (nunca expiram, sem pagamento)
export const VIP_SLUGS = ['rafael', 'admin', 'vitrinafast', 'demo', 'teste', 'cannaconverter'];

/**
 * Verifica se um slug é VIP
 */
export function isVipSlug(slug: string): boolean {
  return VIP_SLUGS.includes(slug.toLowerCase());
}
