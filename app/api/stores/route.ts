import { NextResponse } from 'next/server';
import { createStore } from '@/lib/store-db';
import { withAuthHandler } from '@/lib/auth/with-auth-handler';
import { prisma } from '@/lib/prisma';

export const POST = withAuthHandler(async ({ req, session }) => {
  try {
    const data = await req.json();
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

    // Verificar se usuário já tem um tenant
    if (session.tenantId) {
      return NextResponse.json(
        { error: 'Usuário já possui uma loja. Use a edição para alterar dados.' },
        { status: 400 }
      );
    }

    console.log('[API/STORES] Creating store for user:', session.email);

    // Criar loja no banco de dados
    const store = await createStore({
      name: storeName,
      email: email || session.email || 'contato@vitrinafast.com',
      businessType,
      storeType,
      pageTitle,
      pageDescription,
      phone: phone || undefined,
      whatsapp,
      contactEmail: contactEmail || session.email || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined,
      instagram: instagram || undefined,
      facebook: facebook || undefined,
      businessHours: businessHours || undefined,
      photos: photos || [],
    });

    console.log('[API/STORES] Store created:', store.id);

    // ✅ VINCULAR USUÁRIO À LOJA COM VALIDAÇÃO ATÔMICA
    // Verificar se usuário existe antes de atualizar
    const userExists = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true },
    });

    if (!userExists) {
      console.error(`[API/STORES] User ID ${session.id} not found in database`);
      // Remover tenant criado se usuário não existir (rollback)
      await prisma.tenant.delete({
        where: { id: store.id },
      }).catch(e => console.error('Failed to rollback tenant:', e));
      
      return NextResponse.json(
        { error: 'Sessão inválida. Faça login novamente.' },
        { status: 401 }
      );
    }

    // Atualizar usuário com tenant e role
    await prisma.user.update({
      where: { id: session.id },
      data: {
        tenantId: store.id,
        role: 'SUPERADMIN',
      },
    });

    console.log('[API/STORES] User linked to store');

    return NextResponse.json({
      success: true,
      tenantId: store.id,
      storeId: store.id,
      slug: store.slug,
      message: 'Página criada com sucesso! 🎉',
    });
  } catch (error) {
    console.error('[API/STORES] Erro ao criar página:', error);
    
    // Log detalhado de erro (sem expor em produção)
    if (error instanceof Error) {
      console.error('[API/STORES] Stack:', error.stack);
    }
    
    const errorMessage = 
      error instanceof Error && error.message.includes('P2025')
        ? 'Erro ao vincular usuário à loja. Sessão pode estar expirada.'
        : 'Erro ao criar página. Tente novamente.'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
});
