import { NextRequest, NextResponse } from 'next/server';
import { createPaymentPreference, PLAN_PRICES } from '@/lib/mercadopago';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, planType = 'monthly' } = body;

    // Validar tenant ID
    if (!tenantId) {
      return NextResponse.json(
        { error: 'ID da loja é obrigatório' },
        { status: 400 }
      );
    }

    // Validar tipo de plano
    if (!['monthly', 'yearly'].includes(planType)) {
      return NextResponse.json(
        { error: 'Tipo de plano inválido' },
        { status: 400 }
      );
    }

    // Buscar dados do tenant no banco
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    // Criar preferência de pagamento no Mercado Pago
    const preference = await createPaymentPreference({
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
      planType: planType as 'monthly' | 'yearly',
    });

    // Retornar URL do checkout
    return NextResponse.json({
      success: true,
      checkoutUrl: preference.init_point, // URL para redirecionar o usuário
      sandboxUrl: preference.sandbox_init_point, // URL para testes
      preferenceId: preference.id,
      plan: PLAN_PRICES[planType as keyof typeof PLAN_PRICES],
    });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao criar checkout. Tente novamente.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
