/**
 * POST /api/dev/reset-test-user
 * 
 * 🚨 DEV ONLY - Remove em produção!
 * Reseta senha do usuário de teste para debug
 */

import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  // 🔒 SECURITY: Apenas em development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await prisma.user.upsert({
      where: { email: 'admin@teste' },
      update: {
        password: hashedPassword,
        isActive: true,
      },
      create: {
        email: 'admin@teste',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Teste',
        role: 'SUPERADMIN',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log('[DEV] Test user reset:', user);

    return NextResponse.json({
      success: true,
      message: 'User admin@teste criado/resetado',
      user,
      credentials: {
        email: 'admin@teste',
        password: newPassword,
      },
    });
  } catch (error) {
    console.error('[DEV] Error resetting test user:', error);
    return NextResponse.json(
      { error: 'Failed to reset user' },
      { status: 500 }
    );
  }
}
