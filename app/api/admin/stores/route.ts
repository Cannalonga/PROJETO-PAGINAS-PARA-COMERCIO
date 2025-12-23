import { NextRequest, NextResponse } from 'next/server';
import { getAllStores } from '@/lib/store-db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // ✅ SECURITY: Check admin authorization
    const auth = await requireAdmin(request);
    if (!auth.isAuthorized) {
      return auth.response!;
    }

    // Buscar todas as lojas
    const stores = await getAllStores();

    // Calcular estatísticas
    const stats = {
      total: stores.length,
      active: stores.filter(s => s.status === 'ACTIVE').length,
      draft: stores.filter(s => s.status === 'DRAFT' || s.status !== 'ACTIVE').length,
      vip: stores.filter(s => s.isVip || s.plan === 'VIP' || s.plan === 'PREMIUM').length,
    };

    return NextResponse.json({
      stores: stores.map(store => ({
        id: store.id,
        slug: store.slug,
        name: store.name,
        email: store.email,
        status: store.status,
        plan: store.plan,
        createdAt: store.createdAt,
        pageTitle: store.pageTitle,
      })),
      stats,
    });
  } catch (error) {
    console.error('Erro ao listar lojas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
