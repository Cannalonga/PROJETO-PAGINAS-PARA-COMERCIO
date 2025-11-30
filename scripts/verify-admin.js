#!/usr/bin/env node

/**
 * Script para verificar/criar usuário admin
 */

import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    console.log('🔍 Verificando usuário admin...');

    const email = 'rafaelcannalonga2@hotmail.com';
    
    // Procurar usuário
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      console.log('✅ Usuário encontrado:', existingUser.email);
      console.log('   ID:', existingUser.id);
      console.log('   Ativo:', existingUser.isActive);
      console.log('   Role:', existingUser.role);
      return;
    }

    console.log('❌ Usuário NÃO encontrado. Criando...');

    // Criar usuário
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Rafael',
        lastName: 'Cannalonga',
        role: 'SUPERADMIN',
        isActive: true,
        emailVerified: true,
      },
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log('   Email:', newUser.email);
    console.log('   ID:', newUser.id);
    console.log('   Role:', newUser.role);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
