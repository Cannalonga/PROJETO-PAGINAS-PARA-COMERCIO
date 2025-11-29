const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'teste@vitrinefast.com';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('🔌 Conectando ao banco de dados...');

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                isActive: true,
                role: 'CLIENTE_USER',
            },
            create: {
                email,
                password: hashedPassword,
                firstName: 'Usuário',
                lastName: 'Teste',
                role: 'CLIENTE_USER',
                isActive: true,
                emailVerified: true,
            },
        });

        console.log('✅ Usuário de teste criado com sucesso!');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Senha: ${password}`);
        console.log(`🆔 ID: ${user.id}`);
    } catch (e) {
        console.error('❌ Erro ao criar usuário:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
