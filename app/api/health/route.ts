import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health Check Endpoint
 * Verifica saúde geral da aplicação incluindo:
 * - Database connectivity
 * - API responsiveness
 * - Build version
 * 
 * Resposta rápida (< 1s) indica sistema operacional
 * Timeout ou erro indica problema crítico
 */
export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now();

    // ✅ VERIFICAÇÃO 1: Conectividade com Database
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      return NextResponse.json(
        {
          status: 'degraded',
          message: 'Database connection failed',
          timestamp: new Date().toISOString(),
          components: {
            api: 'healthy',
            database: 'unhealthy',
          },
          error: (dbError as any)?.message || 'Unknown database error',
        },
        { status: 503 }
      );
    }

    // ✅ VERIFICAÇÃO 2: Tempo de resposta
    const responseTime = Date.now() - startTime;

    // ✅ RESPOSTA COMPLETA
    return NextResponse.json(
      {
        status: 'healthy',
        message: 'API is operational',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        components: {
          api: 'healthy',
          database: 'healthy',
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-cache' } }
    );
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        error: (error as any)?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// OPTIONS para CORS preflight
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
