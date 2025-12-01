/**
 * FREE TRIAL DONATION SYSTEM
 * 
 * Permite você:
 * ✅ Dar 7, 15, ou 30 dias grátis para qualquer email
 * ✅ Configurar 7 dias free trial padrão para todos
 * ✅ Ativar/desativar o free trial padrão quando quiser
 * ✅ Ver lista de quem está com trial ativo
 * ✅ Revogar um trial a qualquer momento
 * 
 * Tudo gerenciável do seu painel de admin
 */

import { prisma } from '@/lib/prisma';

/**
 * Calculate trial expiry date based on duration in days
 * Returns the end of the last day (23:59:59)
 */
export function calculateTrialExpiry(days: number): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  expiry.setHours(23, 59, 59, 999);
  return expiry;
}

/**
 * Check if an email has an active trial
 */
export async function hasActiveTrial(email: string): Promise<boolean> {
  const trial = await prisma.trialDonation.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!trial || !trial.isActive) return false;

  // Check if trial has expired
  return trial.expiresAt > new Date();
}

/**
 * Get remaining trial days for an email
 */
export async function getRemainingTrialDays(email: string): Promise<number> {
  const trial = await prisma.trialDonation.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!trial || !trial.isActive) return 0;

  // Check if trial has expired
  if (trial.expiresAt <= new Date()) return 0;

  // Calculate days remaining
  const now = new Date();
  const timeDiff = trial.expiresAt.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return Math.max(0, daysDiff);
}

/**
 * Grant a free trial to an email
 * Supports 7, 15, or 30 days
 */
export async function grantTrial(
  email: string,
  days: 7 | 15 | 30,
  grantedByUserId: string
): Promise<{ success: boolean; message: string; trial?: any }> {
  try {
    const normalizedEmail = email.toLowerCase();
    const expiresAt = calculateTrialExpiry(days);

    // Check if trial already exists
    const existing = await prisma.trialDonation.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      // Update existing trial
      const updated = await prisma.trialDonation.update({
        where: { email: normalizedEmail },
        data: {
          duration: days,
          expiresAt,
          isActive: true,
          revokedAt: null,
          revokedBy: null,
          grantedBy: grantedByUserId,
          grantedAt: new Date(),
        },
      });

      return {
        success: true,
        message: `Trial de ${days} dias atualizado para ${email}`,
        trial: updated,
      };
    }

    // Create new trial
    const trial = await prisma.trialDonation.create({
      data: {
        email: normalizedEmail,
        duration: days,
        expiresAt,
        isActive: true,
        grantedBy: grantedByUserId,
      },
    });

    return {
      success: true,
      message: `Trial de ${days} dias concedido a ${email}`,
      trial,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao conceder trial: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * List all active trials with remaining days
 */
export async function listActiveTrials(): Promise<any[]> {
  const trials = await prisma.trialDonation.findMany({
    where: { isActive: true },
    orderBy: { expiresAt: 'asc' },
  });

  // Add remaining days to each trial
  const enriched = trials.map((trial) => {
    const now = new Date();
    const timeDiff = trial.expiresAt.getTime() - now.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return {
      ...trial,
      remainingDays: Math.max(0, remainingDays),
      isExpired: trial.expiresAt <= now,
    };
  });

  // Filter out expired trials
  return enriched.filter((t) => !t.isExpired);
}

/**
 * Revoke a trial immediately
 */
export async function revokeTrial(
  email: string,
  revokedByUserId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const normalizedEmail = email.toLowerCase();

    await prisma.trialDonation.update({
      where: { email: normalizedEmail },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedBy: revokedByUserId,
      },
    });

    return {
      success: true,
      message: `Trial revogado para ${email}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao revogar trial: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Update default trial configuration
 * Controls whether new users get a 7-day trial by default
 */
export async function updateDefaultTrialConfig(
  isEnabled: boolean,
  updatedByUserId: string
): Promise<{ success: boolean; message: string; config?: any }> {
  try {
    // Get or create the config
    let config = await prisma.trialConfig.findFirst();

    if (!config) {
      config = await prisma.trialConfig.create({
        data: {
          isEnabled,
          defaultDays: 7,
          updatedBy: updatedByUserId,
        },
      });
    } else {
      config = await prisma.trialConfig.update({
        where: { id: config.id },
        data: {
          isEnabled,
          updatedBy: updatedByUserId,
        },
      });
    }

    const status = isEnabled ? 'ativado' : 'desativado';
    return {
      success: true,
      message: `Free trial de ${config.defaultDays} dias ${status} para novos usuários`,
      config,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao atualizar configuração: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get current trial configuration
 */
export async function getTrialConfig(): Promise<any> {
  let config = await prisma.trialConfig.findFirst();

  if (!config) {
    config = await prisma.trialConfig.create({
      data: {
        isEnabled: true,
        defaultDays: 7,
        updatedBy: 'system',
      },
    });
  }

  return config;
}
