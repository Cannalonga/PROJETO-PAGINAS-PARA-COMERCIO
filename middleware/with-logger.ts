/**
 * MIDDLEWARE — WITH LOGGER
 *
 * Loga todos requests/responses com contexto automático
 * Deve ser aplicado após withCorrelationId
 *
 * Logs:
 * - Request: método, path, query, body size, tenant, user
 * - Response: status, duration, bytes sent
 * - Errors: exception + stack trace
 *
 * Padrão:
 * ```typescript
 * export const GET = withCorrelationId(
 *   withLogger(handler)
 * );
 * ```
 */

import { NextRequest } from 'next/server';
import { createContextLogger } from '@/lib/logger';
import { requireRequestContext } from '@/lib/request-context';

/**
 * High-order function que wraps handler com logging
 */
export function withLogger(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const startTime = Date.now();
    const ctx = requireRequestContext();
    const log = createContextLogger(ctx);

    try {
      // Log incoming request
      log.info(
        {
          method: req.method,
          path: req.nextUrl.pathname,
          query: Object.fromEntries(req.nextUrl.searchParams),
          contentLength: req.headers.get('content-length'),
          userAgent: req.headers.get('user-agent'),
        },
        'Incoming request'
      );

      // Execute handler
      const response = await handler(req);

      // Log outgoing response
      const duration = Date.now() - startTime;
      log.info(
        {
          status: response.status,
          statusText: response.statusText,
          duration,
          durationMs: `${duration}ms`,
          contentLength: response.headers.get('content-length'),
        },
        'Request completed'
      );

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      log.error(
        {
          error: error instanceof Error ? error.message : String(error),
          stack:
            error instanceof Error
              ? error.stack
              : undefined,
          duration,
          durationMs: `${duration}ms`,
        },
        'Request failed'
      );

      // Re-throw error para próximo middleware capturar (sentry, etc)
      throw error;
    }
  };
}

/**
 * Versão simples: loga apenas eventos importantes (skip request details)
 */
export function withLoggerSimple(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const startTime = Date.now();
    const ctx = requireRequestContext();
    const log = createContextLogger(ctx);

    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;

      // Log only se status >= 400 ou duration > 1s
      if (response.status >= 400 || duration > 1000) {
        log.info(
          {
            method: req.method,
            path: req.nextUrl.pathname,
            status: response.status,
            durationMs: duration,
          },
          'Request completed'
        );
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      log.error(
        {
          method: req.method,
          path: req.nextUrl.pathname,
          error: error instanceof Error ? error.message : String(error),
          durationMs: duration,
        },
        'Request failed'
      );
      throw error;
    }
  };
}
