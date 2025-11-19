/**
 * MIDDLEWARE — WITH SENTRY
 *
 * Captura erros automaticamente e envia para Sentry
 * Deve ser aplicado após withLogger
 *
 * Features:
 * - Catch all exceptions
 * - Automático tagging (correlationId, tenantId, userId)
 * - Breadcrumb logging
 * - Performance monitoring
 *
 * Padrão:
 * ```typescript
 * export const GET = withCorrelationId(
 *   withLogger(
 *     withSentry(handler)
 *   )
 * );
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { captureException, addBreadcrumb } from '@/lib/sentry';
import { getRequestContext } from '@/lib/request-context';
import { createContextLogger } from '@/lib/logger';

/**
 * High-order function que wraps handler com Sentry error capture
 */
export function withSentry(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const ctx = getRequestContext();
    const log = ctx ? createContextLogger(ctx) : undefined;

    try {
      // Breadcrumb: handler started
      addBreadcrumb(`Handling ${req.method} ${req.nextUrl.pathname}`, {
        method: req.method,
        path: req.nextUrl.pathname,
      });

      const response = await handler(req);

      // Log response status
      if (response.status >= 400) {
        addBreadcrumb(`Response ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
        }, 'warning');
      }

      return response;
    } catch (error) {
      // Capturar erro com contexto automático
      const correlationId = captureException(error);

      if (log) {
        log.error(
          {
            error: error instanceof Error ? error.message : String(error),
            correlationId,
          },
          'Error captured by Sentry'
        );
      }

      // Retornar erro estruturado
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          correlationId,
          message:
            process.env.NODE_ENV === 'development'
              ? error instanceof Error
                ? error.message
                : String(error)
              : 'An error occurred',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Versão com retry logic (para operações críticas)
 */
export function withSentryRetry(
  handler: (req: NextRequest) => Promise<Response>,
  maxRetries: number = 3,
  retryableStatusCodes: number[] = [408, 429, 500, 502, 503, 504]
) {
  return async (req: NextRequest): Promise<Response> => {
    const ctx = getRequestContext();
    const log = ctx ? createContextLogger(ctx) : undefined;

    let lastError: any;
    let lastResponse: Response | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        addBreadcrumb(`Attempt ${attempt}/${maxRetries}`, {
          path: req.nextUrl.pathname,
          method: req.method,
        });

        const response = await handler(req);

        // Se sucesso, retornar
        if (!retryableStatusCodes.includes(response.status)) {
          return response;
        }

        lastResponse = response;
        lastError = `Retryable status: ${response.status}`;

        // Aguardar antes de retry (exponential backoff)
        if (attempt < maxRetries) {
          const delayMs = Math.pow(2, attempt - 1) * 100; // 100ms, 200ms, 400ms
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          const delayMs = Math.pow(2, attempt - 1) * 100;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    // Todos os retries falharam
    if (lastResponse) {
      return lastResponse;
    }

    // Capturar erro final
    captureException(lastError);

    if (log) {
      log.error(
        {
          error:
            lastError instanceof Error
              ? lastError.message
              : String(lastError),
          attempts: maxRetries,
        },
        'All retries failed'
      );
    }

    return NextResponse.json(
      {
        error: 'Service Unavailable',
        message: 'Request failed after retries',
      },
      { status: 503 }
    );
  };
}
