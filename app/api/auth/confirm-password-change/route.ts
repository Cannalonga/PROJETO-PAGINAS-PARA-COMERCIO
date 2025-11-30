/**
 * GET /api/auth/confirm-password-change?token=xxx&newPassword=xxx
 * 
 * ✅ SECURITY: Confirm password change via email token
 * 
 * Este endpoint é chamado quando o usuário clica no link do email
 * ou quando confirma manualmente com o token recebido
 * 
 * Query params:
 * - token: Reset token (plain text, será hashed para validar)
 * - newPassword: Nova senha (pode vir do body também para POST)
 */

import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    // ✅ SECURITY: Validate input
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Hash token para comparar com o armazenado
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: {
          gt: new Date(), // Token não expirou
        },
      },
      select: {
        id: true,
        email: true,
        secondaryEmail: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 403 }
      );
    }

    // ✅ SECURITY: Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password e limpar token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        lastPasswordChangeAt: new Date(),
      },
    });

    console.log('[AUTH/CONFIRM-PASSWORD] Senha alterada para:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso! Faça login novamente.',
    });
  } catch (error) {
    console.error('[AUTH/CONFIRM-PASSWORD] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao confirmar mudança de senha' },
      { status: 500 }
    );
  }
}
