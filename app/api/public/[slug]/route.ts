import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lista de slugs VIP que nunca expiram (sua página e outras especiais)
const VIP_SLUGS = [
  'rafael',
  'admin',
  'vitrinafast',
  'demo',
  'teste',
];

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        pages: {
          where: { 
            OR: [
              { slug: 'home' },
              { slug: 'principal' },
            ]
          },
          take: 1,
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Página não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se é VIP ou se está ativo/publicado
    const isVip = VIP_SLUGS.includes(tenant.slug.toLowerCase());
    const isActive = tenant.status === 'ACTIVE' && tenant.billingStatus === 'ACTIVE';
    const page = tenant.pages[0];
    const isPublished = page?.status === 'PUBLISHED';

    // Permitir acesso se: é VIP OU (está ativo E publicado)
    if (!isVip && !isActive && !isPublished) {
      return NextResponse.json(
        { error: 'Esta página ainda não foi publicada' },
        { status: 403 }
      );
    }

    // Extrair dados do content da página
    const content = (page?.content as any) || {};

    // Registrar visualização (analytics)
    try {
      await prisma.analyticsEvent.create({
        data: {
          tenantId: tenant.id,
          eventType: 'PAGE_VIEW',
          metadata: {
            slug: tenant.slug,
            userAgent: request.headers.get('user-agent') || 'unknown',
            referer: request.headers.get('referer') || 'direct',
          },
        },
      });
    } catch (analyticsError) {
      // Não falhar se analytics der erro
      console.error('Erro ao registrar analytics:', analyticsError);
    }

    // Retornar dados da página
    return NextResponse.json({
      title: page?.title || tenant.name,
      pageDescription: page?.description || '',
      storeName: tenant.name,
      slug: tenant.slug,
      // Dados de contato (do tenant ou do content)
      phone: content.phone || tenant.phone,
      whatsapp: content.whatsapp || tenant.phone,
      email: content.contactEmail || tenant.email,
      address: content.address || tenant.address,
      city: content.city || tenant.city,
      state: content.state || tenant.state,
      zipCode: content.zipCode || tenant.zipCode,
      // Redes sociais
      instagram: content.instagram,
      facebook: content.facebook,
      businessHours: content.businessHours,
      // Fotos
      photos: content.photos || [],
      // Meta para SEO
      meta: {
        isVip,
        plan: tenant.plan,
        logoUrl: tenant.logoUrl,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar página pública:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
