const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Iniciando limpeza do banco de dados...');
    console.log('⚠️  ATENÇÃO: Isso apagará TODOS os dados!');

    try {
        // Apagar na ordem correta para respeitar Foreign Keys

        console.log('1. Apagando Analytics...');
        await prisma.analyticsEvent.deleteMany({});

        console.log('2. Apagando Pagamentos...');
        await prisma.payment.deleteMany({});

        console.log('3. Apagando Imagens...');
        await prisma.pageImage.deleteMany({});

        console.log('4. Apagando Páginas...');
        await prisma.page.deleteMany({});

        console.log('5. Apagando Logs de Auditoria...');
        await prisma.auditLog.deleteMany({});

        console.log('6. Apagando Usuários...');
        await prisma.user.deleteMany({});

        console.log('7. Apagando Tenants (Lojas)...');
        await prisma.tenant.deleteMany({});

        console.log('✅ Banco de dados limpo com sucesso!');
    } catch (e) {
        console.error('❌ Erro ao limpar banco:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
