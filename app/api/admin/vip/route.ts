import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Senha secreta para criar páginas VIP (mude isso!)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'vitrinafast-admin-2024';

// POST - Criar página VIP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      secret,
      slug,
      storeName,
      email,
      pageTitle,
      pageDescription,
      phone,
      whatsapp,
      address,
      city,
      state,
      zipCode,
      instagram,
      facebook,
      businessHours,
      photos = [],
    } = body;

    // Validar senha admin
    if (secret !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    // Validar campos obrigatórios
    if (!slug || !storeName || !email || !pageTitle) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: slug, storeName, email, pageTitle' },
        { status: 400 }
      );
    }

    // Verificar se slug já existe
    const existing = await prisma.tenant.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Este slug já está em uso' },
        { status: 409 }
      );
    }

    // Criar tenant VIP (já ativo, sem precisar pagar)
    const tenant = await prisma.tenant.create({
      data: {
        name: storeName,
        slug: slug.toLowerCase(),
        email: email,
        phone: phone || whatsapp,
        address: address,
        city: city,
        state: state,
        zipCode: zipCode,
        status: 'ACTIVE',           // Já ativo!
        plan: 'PREMIUM',            // Plano premium VIP
        billingStatus: 'ACTIVE',    // Billing ativo (sem precisar pagar)
        metadata: {
          isVip: true,
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
        },
      },
    });

    // Criar página home
    const page = await prisma.page.create({
      data: {
        title: pageTitle,
        slug: 'home',
        description: pageDescription || '',
        content: {
          businessType: 'custom',
          photos: photos,
          phone,
          whatsapp,
          contactEmail: email,
          address,
          city,
          state,
          zipCode,
          instagram,
          facebook,
          businessHours,
        } as any,
        status: 'PUBLISHED',  // Já publicada!
        tenantId: tenant.id,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return NextResponse.json({
      success: true,
      message: '🎉 Página VIP criada com sucesso!',
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      },
      page: {
        id: page.id,
        title: page.title,
      },
      urls: {
        public: `${baseUrl}/loja/${tenant.slug}`,
        preview: `${baseUrl}/preview/${tenant.id}`,
      },
    });
  } catch (error) {
    console.error('Erro ao criar página VIP:', error);
    return NextResponse.json(
      { error: 'Erro ao criar página VIP' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Listar páginas VIP
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Validar senha admin
    if (secret !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    const vipTenants = await prisma.tenant.findMany({
      where: {
        OR: [
          { plan: 'PREMIUM' },
          { metadata: { path: ['isVip'], equals: true } },
        ],
      },
      include: {
        pages: {
          where: { slug: 'home' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return NextResponse.json({
      total: vipTenants.length,
      tenants: vipTenants.map(t => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        email: t.email,
        status: t.status,
        plan: t.plan,
        createdAt: t.createdAt,
        publicUrl: `${baseUrl}/loja/${t.slug}`,
      })),
    });
  } catch (error) {
    console.error('Erro ao listar VIPs:', error);
    return NextResponse.json(
      { error: 'Erro ao listar páginas VIP' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
