import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      storeName, 
      email, 
      businessType, 
      pageTitle, 
      pageDescription, 
      photos = [],
      // Novos campos de contato
      phone,
      whatsapp,
      contactEmail,
      address,
      city,
      state,
      zipCode,
      instagram,
      facebook,
      businessHours,
    } = data;

    // Validar dados obrigatórios
    if (!storeName || !email || !businessType || !pageTitle || !pageDescription) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Validar campos de contato obrigatórios
    if (!whatsapp || !address || !city || !state) {
      return NextResponse.json(
        { error: 'Dados de contato obrigatórios faltando (WhatsApp, Endereço, Cidade, Estado)' },
        { status: 400 }
      );
    }

    // Criar slug a partir do nome da loja
    const slug = storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    // Criar tenant (loja) no banco
    const tenant = await prisma.tenant.create({
      data: {
        name: storeName,
        slug: slug,
        email: email,
        status: 'ACTIVE', // Status da loja
        plan: 'FREE', // Começa no plano gratuito
        billingStatus: 'INACTIVE', // Sem bilhetagem ainda
      },
    });

    // Criar página padrão com dados de contato
    const page = await prisma.page.create({
      data: {
        title: pageTitle,
        slug: 'home',
        description: pageDescription,
        content: {
          businessType,
          photos,
          // Dados de contato
          phone: phone || null,
          whatsapp,
          contactEmail: contactEmail || null,
          address,
          city,
          state,
          zipCode: zipCode || null,
          instagram: instagram || null,
          facebook: facebook || null,
          businessHours: businessHours || null,
        } as any,
        status: 'DRAFT', // Em rascunho, não publicada
        tenantId: tenant.id,
      },
    });

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      pageId: page.id,
      slug: tenant.slug,
      message: 'Página criada com sucesso! Agora visualize e personalize.',
    });
  } catch (error) {
    console.error('Erro ao criar página:', error);
    return NextResponse.json(
      { error: 'Erro ao criar página. Tente novamente.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
