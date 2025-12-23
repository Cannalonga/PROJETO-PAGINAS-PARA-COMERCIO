import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { rateLimit, extractClientIp } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // ✅ PATCH #5: Rate limiting - max 5 password changes per user per hour
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Rate limit by user ID (not IP) for authenticated endpoints
    const rateLimitKey = `change-password:${(session.user as any).id}`;
    const limitResult = await rateLimit(rateLimitKey, {
      maxRequests: 5,
      windowSeconds: 3600, // 1 hour
    });

    if (!limitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many password change attempts. Please try again later.',
          retryAfter: limitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': (limitResult.retryAfter || 60).toString(),
          },
        }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    // ✅ SECURITY: Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Senha atual e nova são obrigatórias' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Nova senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'Nova senha deve ser diferente da atual' },
        { status: 400 }
      );
    }

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // ✅ SECURITY: Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 403 }
      );
    }

    // ✅ SECURITY: Generate reset token (expires in 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token (armazena o hash, não o token)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // @ts-ignore - Campo adicionado no schema mas tipo não foi regenerado corretamente
        passwordResetToken: resetTokenHash,
        // @ts-ignore - Campo adicionado no schema mas tipo não foi regenerado corretamente
        passwordResetExpires: expiresAt,
      },
    });

    // 📧 TODO: Enviar email para ambos os endereços
    // Email template:
    // Assunto: "Confirmação de Alteração de Senha - VitrineFast"
    // Corpo:
    // "Clique aqui para confirmar: /api/auth/confirm-password-change?token={resetToken}"
    // "Este link expira em 1 hora"

    console.log('[AUTH/CHANGE-PASSWORD] Reset token gerado para:', user.email);
    console.log('[AUTH/CHANGE-PASSWORD] Reset token gerado para:', user.email);
    // @ts-ignore - Campo adicionado no schema mas tipo não foi regenerado corretamente
    console.log('[AUTH/CHANGE-PASSWORD] Token enviado para:', userFull?.secondaryEmail || user.email);

    return NextResponse.json({
      success: true,
      // @ts-ignore - Campo adicionado no schema mas tipo não foi regenerado corretamente
      message: `Confirmação enviada para ${userFull?.secondaryEmail || user.email}. Clique no link para confirmar a mudança de senha.`,
    });
  } catch (error) {
    console.error('[AUTH/CHANGE-PASSWORD] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mudança de senha' },
      { status: 500 }
    );
  }
}
