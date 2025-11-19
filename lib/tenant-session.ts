// lib/tenant-session.ts
import { Session } from 'next-auth';
import { prisma } from './prisma';

/**
 * Extract tenant ID from NextAuth session
 * Fetches the user from the database to get their associated tenantId
 * 
 * @param session - NextAuth session object
 * @returns tenantId string or null if not found
 */
export async function getTenantFromSession(session: Session | null): Promise<string | null> {
  if (!session?.user?.email) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { tenantId: true },
    });

    return user?.tenantId ?? null;
  } catch (error) {
    console.error('[getTenantFromSession] Error fetching user:', error);
    return null;
  }
}
