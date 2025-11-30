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

    // Find user with valid reset token - verificar token hash manualmente
    // @ts-ignore - Campos adicionados no schema mas tipo não foi regenerado corretamente
    const userList = await prisma.user.findMany({
      where: {
        // @ts-ignore - Campos adicionados no schema mas tipo não foi regenerado corretamente
        passwordResetExpires: {
          gt: new Date(), // Token não expirou
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    // Procurar o usuário correto comparando hash do token
    let user = null;
    for (const u of userList) {
      const userFull = await prisma.user.findUnique({
        where: { id: u.id },
      });
      // @ts-ignore
      if (userFull?.passwordResetToken === tokenHash) {
        user = u;
        break;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 403 }
      );
    }

    // ✅ SECURITY: Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password e limpar token
    if (user?.id) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          // @ts-ignore - Campos adicionados no schema mas tipo não foi regenerado corretamente
          passwordResetToken: null,
          // @ts-ignore - Campos adicionados no schema mas tipo não foi regenerado corretamente
          passwordResetExpires: null,
          // @ts-ignore - Campos adicionados no schema mas tipo não foi regenerado corretamente
          lastPasswordChangeAt: new Date(),
        },
      });
    }

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
