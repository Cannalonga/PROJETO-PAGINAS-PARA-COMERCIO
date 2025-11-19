/**
 * FASE 2 — P1 SENTRY INTEGRATION
 *
 * Error tracking + Performance monitoring + Source maps
 * Captura erros automaticamente e envia para dashboard Sentry
 *
 * Setup:
 * 1. npm install @sentry/nextjs @sentry/profiling-node
 * 2. Criar account em https://sentry.io
 * 3. Add SENTRY_DSN a .env.local
 * 4. Call initSentry() em app initialization
 *
 * Uso:
 * ```typescript
 * import { sentry, captureException, captureMessage } from '@/lib/sentry';
 *
 * try {
 *   // operação
 * } catch (err) {
 *   captureException(err, { tags: { tenantId } });
 * }
 * ```
 */

import * as Sentry from '@sentry/nextjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { getRequestContext } from './request-context';

/**
 * Inicializa Sentry com configuração production-ready
 */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  if (!dsn) {
    console.warn('[SENTRY] DSN not configured, Sentry disabled');
    return null;
  }

  try {
    Sentry.init({
      dsn,
      environment,
      integrations: [nodeProfilingIntegration()],

      // Sampling rates
      tracesSampleRate:
        environment === 'production'
          ? 0.1 // 10% em produção
          : 1.0, // 100% em dev
      profilesSampleRate:
        environment === 'production'
          ? 0.1 // 10% em produção
          : 1.0, // 100% em dev

      // Release version (from package.json)
      release: process.env.npm_package_version,

      // Capture breadcrumbs
      attachStacktrace: true,
      maxBreadcrumbs: 50,

      // Ignore certain errors (noise reduction)
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection',
        'NetworkError',
        'timeout of',
        'cancelled',
      ],

      // Before send — adicionar contexto antes de enviar
      beforeSend(event, hint) {
        const ctx = getRequestContext();

        if (ctx) {
          event.tags = {
            ...event.tags,
            correlationId: ctx.correlationId,
            tenantId: ctx.tenantId,
            userId: ctx.userId,
          };

          event.contexts = {
            ...event.contexts,
            request: {
              ...event.contexts?.request,
              correlationId: ctx.correlationId,
              ip: ctx.ip,
            },
          };
        }

        return event;
      },
    });

    console.log('[SENTRY] Initialized successfully');
    return Sentry;
  } catch (err) {
    console.error('[SENTRY] Initialization failed:', err);
    return null;
  }
}

/**
 * Captura exception com contexto automático
 */
export function captureException(
  error: unknown,
  tags?: Record<string, string>
): string | null {
  if (!Sentry) return null;

  const ctx = getRequestContext();

  Sentry.captureException(error, {
    tags: {
      ...tags,
      correlationId: ctx?.correlationId,
      tenantId: ctx?.tenantId,
      userId: ctx?.userId,
    },
  });

  return ctx?.correlationId || null;
}

/**
 * Captura mensagem (para events que não são erros)
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  tags?: Record<string, string>
): string | null {
  if (!Sentry) return null;

  const ctx = getRequestContext();

  Sentry.captureMessage(message, {
    level,
    tags: {
      ...tags,
      correlationId: ctx?.correlationId,
      tenantId: ctx?.tenantId,
      userId: ctx?.userId,
    },
  });

  return ctx?.correlationId || null;
}

/**
 * Set user context (para tracking de usuários específicos)
 */
export function setSentryUser(userId?: string, email?: string) {
  if (!Sentry) return;

  if (userId) {
    Sentry.setUser({ id: userId, email });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb (para debug trail)
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
) {
  if (!Sentry) return;

  Sentry.addBreadcrumb({
    message,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Exporta instância Sentry para acesso direto
 */
export { Sentry };
