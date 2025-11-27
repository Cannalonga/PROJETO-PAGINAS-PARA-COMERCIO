import { getStoreById, updateStore, deleteStore } from '@/lib/store-db';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const store = await getStoreById(id);

    if (!store) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    // Formatar resposta compatível com o frontend
    return NextResponse.json({
      id: store.id,
      name: store.name,
      email: store.email,
      slug: store.slug,
      status: store.status,
      plan: store.plan,
      pages: [{
        id: store.id,
        title: store.pageTitle,
        description: store.pageDescription,
        content: {
          businessType: store.businessType,
          photos: store.photos,
          phone: store.phone,
          whatsapp: store.whatsapp,
          contactEmail: store.contactEmail,
          address: store.address,
          city: store.city,
          state: store.state,
          zipCode: store.zipCode,
          instagram: store.instagram,
          facebook: store.facebook,
          businessHours: store.businessHours,
        },
      }],
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Erro ao buscar loja' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const store = await updateStore(id, body);

    if (!store) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: store,
      message: 'Loja atualizada com sucesso',
    });
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Erro ao atualizar loja' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const deleted = await deleteStore(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Loja deletada com sucesso',
    });
  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Erro ao deletar loja' },
      { status: 500 }
    );
  }
}
