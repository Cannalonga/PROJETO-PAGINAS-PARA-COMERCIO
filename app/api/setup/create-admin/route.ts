/**
 * POST /api/setup/create-admin
 * 
 * 🚨 DEV ONLY - Cria usuário admin real no banco
 * Remove em produção!
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Only in development' },
      { status: 403 }
    );
  }

  try {
    // Deletar se existir
    await prisma.user.deleteMany({
      where: { email: 'admin@teste' },
    });

    // Criar novo com senha criptografada
    const password = await bcrypt.hash('123456', 12);
    
    const user = await prisma.user.create({
      data: {
        id: `admin-${Date.now()}`,
        email: 'admin@teste',
        password,
        firstName: 'Admin',
        lastName: 'Teste',
        role: 'SUPERADMIN',
        isActive: true,
        emailVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      message: 'Admin criado! Use admin@teste / 123456',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
