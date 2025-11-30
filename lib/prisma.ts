import { PrismaClient } from '@prisma/client';
import { tenantMiddleware } from './prisma-middleware';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Apply tenant isolation middleware
  client.$use(tenantMiddleware);

  return client;
};

export const prisma =
  globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * withTenant wrapper for enforcing tenant context in queries
 * Usage: await withTenant(tenantId, async () => prisma.pages.findMany())
 */
export async function withTenant<T>(
  tenantId: string,
  callback: () => Promise<T>
): Promise<T> {
  if (!tenantId) {
    throw new Error('withTenant: tenantId is required');
  }
  
  // Store tenantId in context for middleware to use
  const originalContext = (globalThis as any).__tenantContext;
  (globalThis as any).__tenantContext = { tenantId };
  
  try {
    return await callback();
  } finally {
    (globalThis as any).__tenantContext = originalContext;
  }
}
