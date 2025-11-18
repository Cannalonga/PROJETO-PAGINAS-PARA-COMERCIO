import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpar dados existentes (cuidado em produção!)
  await prisma.analyticsEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.pageImage.deleteMany();
  await prisma.page.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Criar Super Admin
  const superAdminPassword = await bcrypt.hash('admin123456', 12);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@paginas-comercio.com',
      password: superAdminPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'SUPERADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Super Admin criado:', superAdmin.email);

  // Criar Tenants de Demo
  const tenant1 = await prisma.tenant.create({
    data: {
      slug: 'pizza-bella',
      name: 'Pizza Bella',
      cnpj: '12.345.678/0001-99',
      email: 'contato@pizzabella.com',
      phone: '(11) 98765-4321',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      status: 'ACTIVE',
      billingPlan: 'PROFESSIONAL',
      billingStatus: 'ACTIVE',
      logoUrl: 'https://via.placeholder.com/200x100?text=Pizza+Bella',
      metadata: {
        industry: 'Restaurante',
        employees: 5,
      },
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      slug: 'eletro-santos',
      name: 'Eletrônicos Santos',
      cnpj: '98.765.432/0001-11',
      email: 'vendas@eletrosantos.com',
      phone: '(11) 3456-7890',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01311-100',
      status: 'ACTIVE',
      billingPlan: 'STARTER',
      billingStatus: 'ACTIVE',
      logoUrl: 'https://via.placeholder.com/200x100?text=Eletro+Santos',
      metadata: {
        industry: 'Varejo',
        employees: 3,
      },
    },
  });

  console.log('✅ Tenants criados:', [tenant1.slug, tenant2.slug]);

  // Criar usuários para os tenants
  const operatorPassword = await bcrypt.hash('operador123456', 12);
  
  await prisma.user.create({
    data: {
      email: 'operador@pizzabella.com',
      password: operatorPassword,
      firstName: 'João',
      lastName: 'Gerente',
      role: 'CLIENTE_ADMIN',
      tenantId: tenant1.id,
      emailVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@eletrosantos.com',
      password: operatorPassword,
      firstName: 'Maria',
      lastName: 'Administradora',
      role: 'CLIENTE_ADMIN',
      tenantId: tenant2.id,
      emailVerified: true,
    },
  });

  console.log('✅ Usuários operadores criados');

  // Criar páginas
  await prisma.page.create({
    data: {
      slug: 'home',
      title: 'Pizza Bella - Melhor Pizzaria da Região',
      description: 'Pizzaria com os melhores sabores da Itália',
      template: 'RESTAURANTE',
      status: 'PUBLISHED',
      tenantId: tenant1.id,
      phone: '(11) 98765-4321',
      whatsapp: '5511987654321',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      seoTitle: 'Pizza Bella | Pizzaria em São Paulo',
      seoDescription: 'Visite a Pizza Bella e prove as melhores pizzas artesanais de São Paulo.',
      seoKeywords: 'pizzaria, pizza, São Paulo',
      heroImage: 'https://via.placeholder.com/1200x600?text=Pizza+Bella',
      hours: {
        monday: { open: '11:00', close: '23:00' },
        tuesday: { open: '11:00', close: '23:00' },
        wednesday: { open: '11:00', close: '23:00' },
        thursday: { open: '11:00', close: '23:00' },
        friday: { open: '11:00', close: '00:00' },
        saturday: { open: '12:00', close: '00:00' },
        sunday: { open: '12:00', close: '23:00' },
      },
      ctaText: 'Peça pelo WhatsApp',
      ctaUrl: 'https://wa.me/5511987654321',
      content: {
        hero: {
          title: 'Pizza Bella',
          subtitle: 'Melhor pizzaria da região',
        },
        about: {
          title: 'Sobre nós',
          description: 'Desde 2010, servindo as melhores pizzas artesanais.',
        },
        services: [
          {
            title: 'Delivery',
            description: 'Entrega rápida em toda a região',
          },
          {
            title: 'Balcão',
            description: 'Vendemos por fatia',
          },
        ],
      },
      publishedAt: new Date(),
    },
  });

  await prisma.page.create({
    data: {
      slug: 'home',
      title: 'Eletrônicos Santos - Sua Loja de Confiança',
      description: 'Tudo em eletrônicos com os melhores preços',
      template: 'LOJA',
      status: 'PUBLISHED',
      tenantId: tenant2.id,
      phone: '(11) 3456-7890',
      whatsapp: '5511987654322',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      seoTitle: 'Eletrônicos Santos | Loja Online',
      seoDescription: 'Compre eletrônicos com garantia e os melhores preços em São Paulo.',
      seoKeywords: 'eletrônicos, loja online, São Paulo',
      heroImage: 'https://via.placeholder.com/1200x600?text=Eletro+Santos',
      hours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: { closed: true },
      },
      ctaText: 'Abrir Catálogo',
      ctaUrl: '#catalogo',
      content: {
        hero: {
          title: 'Eletrônicos Santos',
          subtitle: 'Os melhores preços em eletrônicos',
        },
        about: {
          title: 'Qualidade Garantida',
          description: '15 anos servindo com excelência',
        },
      },
      publishedAt: new Date(),
    },
  });

  console.log('✅ Páginas criadas');

  // Criar eventos de analytics
  await prisma.analyticsEvent.create({
    data: {
      tenantId: tenant1.id,
      eventType: 'PAGE_VIEW',
      metadata: { path: '/home' },
      ipAddress: '192.168.1.1',
    },
  });

  console.log('✅ Eventos de analytics criados');

  console.log('🎉 Seed completo!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
