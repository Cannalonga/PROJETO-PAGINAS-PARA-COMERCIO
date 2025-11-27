import { NextRequest, NextResponse } from 'next/server';
import { createStore } from '@/lib/store-db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      storeName, 
      email, 
      businessType,
      storeType = 'physical',
      pageTitle, 
      pageDescription, 
      photos = [],
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
    if (!storeName || !businessType || !pageTitle || !pageDescription) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando (nome, tipo, título, descrição)' },
        { status: 400 }
      );
    }

    // Validar WhatsApp (único campo obrigatório de contato)
    if (!whatsapp) {
      return NextResponse.json(
        { error: 'WhatsApp é obrigatório' },
        { status: 400 }
      );
    }

    // Criar loja usando o novo sistema JSON
    const store = createStore({
      name: storeName,
      email: email || 'contato@vitrinafast.com',
      businessType,
      storeType,
      pageTitle,
      pageDescription,
      phone: phone || undefined,
      whatsapp,
      contactEmail: contactEmail || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined,
      instagram: instagram || undefined,
      facebook: facebook || undefined,
      businessHours: businessHours || undefined,
      photos: photos || [],
    });

    return NextResponse.json({
      success: true,
      tenantId: store.id,
      storeId: store.id,
      slug: store.slug,
      message: 'Página criada com sucesso! 🎉',
    });
  } catch (error) {
    console.error('Erro ao criar página:', error);
    return NextResponse.json(
      { error: 'Erro ao criar página. Tente novamente.' },
      { status: 500 }
    );
  }
}
