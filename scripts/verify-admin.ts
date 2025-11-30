import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function verifyAdmin() {
  try {
    console.log('🔍 Verificando usuário admin...');

    const email = 'rafaelcannalonga2@hotmail.com';
    
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (user) {
      console.log('✅ Usuário encontrado:', user.email);
      console.log('   ID:', user.id);
      console.log('   Ativo:', user.isActive);
      console.log('   Role:', user.role);
      console.log('\n✅ Login deve funcionar com:');
      console.log('   Email:', email);
      console.log('   Senha: 123456');
      return;
    }

    console.log('❌ Usuário NÃO encontrado. Criando agora...');

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
    console.log('\n✅ Agora você pode fazer login com:');
    console.log('   Email:', email);
    console.log('   Senha: 123456');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmin();
