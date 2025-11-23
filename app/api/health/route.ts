// app/api/health/route.ts
/**
 * Health Check Endpoint
 *
 * Verifica status de componentes críticos:
 * - App: sempre ok (se conseguir responder)
 * - Database: testa conexão Prisma
 *
 * Retorna:
 * - 200: Todos os componentes ok
 * - 500: Algum componente falhou
 *
 * Não requer autenticação
 * Não está sujeito a rate limiting
 *
 * @route GET /api/health
 *
 * @example
 * // Resposta 200
 * {
 *   "status": "ok",
 *   "checks": {
 *     "app": "ok",
 *     "db": "ok"
 *   },
 *   "timestamp": "2025-11-21T10:30:00.000Z"
 * }
 *
 * @example
 * // Resposta 500
 * {
 *   "status": "degraded",
 *   "checks": {
 *     "app": "ok",
 *     "db": "fail"
 *   },
 *   "timestamp": "2025-11-21T10:30:00.000Z"
 * }
 */

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type CheckStatus = 'ok' | 'fail';

interface HealthResponse {
  status: 'ok' | 'degraded';
  checks: Record<string, CheckStatus>;
  timestamp: string;
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const checks: Record<string, CheckStatus> = {
    app: 'ok',
    db: 'fail',
  };

  try {
    // Teste simples de conexão com DB
    await prisma.$queryRaw`SELECT 1`;
    checks.db = 'ok';
  } catch (err) {
    checks.db = 'fail';
    console.warn('Health check: DB failed', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Determinar status geral
  const allOk = Object.values(checks).every((v) => v === 'ok');
  const status = allOk ? ('ok' as const) : ('degraded' as const);

  const response: HealthResponse = {
    status,
    checks,
    timestamp: new Date().toISOString(),
  };

  // Retornar 200 se ok, 500 se degraded
  const statusCode = allOk ? 200 : 500;

  return NextResponse.json(response, { status: statusCode });
}
