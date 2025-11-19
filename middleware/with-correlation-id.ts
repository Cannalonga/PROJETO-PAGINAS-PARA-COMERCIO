/**
 * MIDDLEWARE — WITH CORRELATION ID
 *
 * Inicializa contexto de request com correlation ID e metadados
 * DEVE SER O PRIMEIRO MIDDLEWARE (innermost wrapper)
 *
 * Padrão:
 * ```typescript
 * export const GET = withCorrelationId(
 *   withLogger(handler)
 * );
 * ```
 *
 * Fluxo:
 * 1. Extrai correlation ID do header ou gera novo
 * 2. Extrai tenant ID do header (validar depois)
 * 3. Extrai user ID do JWT (validar depois)
 * 4. Extrai IP client + user-agent
 * 5. Inicializa AsyncLocalStorage com contexto
 * 6. Executa handler dentro do contexto
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCorrelationId } from '@/lib/correlation-id';
import {
  runWithRequestContext,
  RequestContextData,
} from '@/lib/request-context';

/**
 * Extrai client IP de headers ou socket
 */
function getClientIp(request: NextRequest): string {
  // Prioridade: X-Forwarded-For (proxy) > X-Real-IP > socket
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  );
}

/**
 * Higher-order function que wraps handler com contexto
 */
export function withCorrelationId(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    // 1. Extrair ou gerar correlation ID
    const correlationIdHeader = req.headers.get('x-correlation-id');
    const correlationId = correlationIdHeader || generateCorrelationId();

    // 2. Extrair tenant ID (do header, do JWT, ou padrão)
    const tenantId = req.headers.get('x-tenant-id') || 'default';

    // 3. Extrair user ID (será validado em middleware de auth)
    const userId = req.headers.get('x-user-id') || undefined;

    // 4. Extrair IP + user-agent
    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // 5. Criar contexto data
    const contextData: RequestContextData = {
      correlationId,
      tenantId,
      userId,
      ip,
      userAgent,
    };

    // 6. Executar handler dentro do contexto
    return await runWithRequestContext(contextData, async () => {
      const response = await handler(req);

      // 7. Adicionar correlation ID no response header
      const headers = new Headers(response.headers);
      headers.set('x-correlation-id', correlationId);

      // Clonar response com headers atualizados
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    });
  };
}

/**
 * Wrapper para aplicar multiple middlewares (composição)
 *
 * Uso:
 * ```typescript
 * export const POST = composeMiddleware(
 *   handler,
 *   withCorrelationId,
 *   withLogger,
 *   withSentry,
 *   withRateLimit
 * );
 * ```
 */
export function composeMiddleware(
  handler: (req: NextRequest) => Promise<Response>,
  ...middlewares: Array<(h: (req: NextRequest) => Promise<Response>) => (req: NextRequest) => Promise<Response>>
): (req: NextRequest) => Promise<Response> {
  return middlewares.reduce((h, middleware) => middleware(h), handler);
}
