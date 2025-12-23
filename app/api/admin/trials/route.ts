/**
 * ADMIN TRIALS API
 * 
 * POST   /api/admin/trials/grant    → Dar trial a um email
 * GET    /api/admin/trials/list     → Listar trials ativos
 * DELETE /api/admin/trials/revoke   → Revogar trial
 * PUT    /api/admin/trials/config   → Ativar/desativar free trial padrão
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  grantTrial,
  listActiveTrials,
  revokeTrial,
  updateDefaultTrialConfig,
  getTrialConfig,
} from '@/lib/trial-system';
import { requireAdmin } from '@/lib/admin-auth';

const errorResponse = (message: string) => ({ error: message });

// ============================================================================
// POST /api/admin/trials/grant
// 
// Body: { email: "user@example.com", days: 7 }
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // ✅ SECURITY: Check admin authorization
    const auth = await requireAdmin(request, ['SUPERADMIN', 'OPERADOR']);
    if (!auth.isAuthorized) {
      return auth.response!;
    }

    const { email, days } = await request.json();

    if (!email || ![7, 15, 30].includes(days)) {
      return NextResponse.json(
        errorResponse('Email e dias (7, 15, 30) obrigatórios'),
        { status: 400 }
      );
    }

    const result = await grantTrial(email, days, auth.session!.userId);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      trial: result.trial,
    });
  } catch (error) {
    console.error('[TRIAL API] Error granting trial', error);
    return NextResponse.json(
      errorResponse('Erro ao conceder trial'),
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/admin/trials/list
// 
// Lista todos os trials ativos
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // ✅ SECURITY: Check admin authorization
    const auth = await requireAdmin(request, ['SUPERADMIN', 'OPERADOR']);
    if (!auth.isAuthorized) {
      return auth.response!;
    }

    const pathname = request.nextUrl.pathname;

    // Check if this is a config request
    if (pathname.includes('/config')) {
      const config = await getTrialConfig();
      return NextResponse.json({
        success: true,
        config,
      });
    }

    const trials = await listActiveTrials();

    return NextResponse.json({
      success: true,
      count: trials.length,
      trials,
    });
  } catch (error) {
    console.error('[TRIAL API] Error listing trials', error);
    return NextResponse.json(
      errorResponse('Erro ao listar trials'),
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/admin/trials/revoke
// 
// Body: { email: "user@example.com" }
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    if (userRole !== 'SUPERADMIN' && userRole !== 'DELEGATED_ADMIN') {
      return NextResponse.json(
        errorResponse('Apenas admin pode revogar trials'),
        { status: 403 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        errorResponse('Email obrigatório'),
        { status: 400 }
      );
    }

    const result = await revokeTrial(email, userId!);

    return NextResponse.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error('[TRIAL API] Error revoking trial', error);
    return NextResponse.json(
      errorResponse('Erro ao revogar trial'),
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/admin/trials/config
// 
// Body: { isEnabled: true }
// Ativa/desativa free trial padrão de 7 dias
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    if (userRole !== 'SUPERADMIN') {
      return NextResponse.json(
        errorResponse('Apenas SUPERADMIN pode mudar configuração de trials'),
        { status: 403 }
      );
    }

    const { isEnabled } = await request.json();

    if (typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        errorResponse('isEnabled deve ser true ou false'),
        { status: 400 }
      );
    }

    const result = await updateDefaultTrialConfig(
      isEnabled,
      userId!
    );

    return NextResponse.json({
      success: result.success,
      message: result.message,
      config: result.config,
    });
  } catch (error) {
    console.error('[TRIAL API] Error updating config', error);
    return NextResponse.json(
      errorResponse('Erro ao atualizar configuração'),
      { status: 500 }
    );
  }
}
