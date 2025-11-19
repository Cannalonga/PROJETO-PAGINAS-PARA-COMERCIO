/**
 * FASE 2 — P1 LOGGER
 *
 * Pino estruturado, JSON em produção, pretty em desenvolvimento
 * Multi-tenant aware com correlationId propagado
 *
 * Uso:
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * logger.info({ userId: '123', action: 'CREATE' }, 'User created successfully');
 * logger.error({ err }, 'Operation failed');
 * logger.warn({ tenantId }, 'Unusual activity detected');
 * ```
 */

import pino, { Logger } from 'pino';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Base logger instance
 * - Development: Pretty-printed com cores
 * - Production: JSON estruturado para log aggregators (ELK, Datadog, etc)
 */
export const logger: Logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  base: undefined, // Remove pid/hostname padrão
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
          messageFormat: '{levelLabel} - {msg}',
        },
      }
    : undefined, // Production: JSON puro para stdout
});

/**
 * Context logger — inclui correlationId, tenantId, userId
 * Cria um child logger com binding automático de contexto
 */
export interface LogContext {
  correlationId: string;
  tenantId?: string;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export function createContextLogger(ctx: LogContext): Logger {
  return logger.child({
    correlationId: ctx.correlationId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    requestId: ctx.requestId,
  });
}

/**
 * Helper para logs estruturados com padrão
 */
export const logLevels = {
  debug: (msg: string, data?: Record<string, any>) =>
    logger.debug(data || {}, msg),
  info: (msg: string, data?: Record<string, any>) =>
    logger.info(data || {}, msg),
  warn: (msg: string, data?: Record<string, any>) =>
    logger.warn(data || {}, msg),
  error: (msg: string, err?: Error | Record<string, any>) => {
    if (err instanceof Error) {
      logger.error({ err, stack: err.stack }, msg);
    } else {
      logger.error(err || {}, msg);
    }
  },
  fatal: (msg: string, err?: Error | Record<string, any>) => {
    if (err instanceof Error) {
      logger.fatal({ err, stack: err.stack }, msg);
    } else {
      logger.fatal(err || {}, msg);
    }
  },
};

/**
 * Request logger — loga início/fim de requisição
 * Usado em middleware
 */
export function logRequest(
  ctx: LogContext,
  method: string,
  path: string
): void {
  const log = createContextLogger(ctx);
  log.debug(
    {
      method,
      path,
      ip: ctx.ip,
      userAgent: ctx.userAgent?.substring(0, 100), // Limita tamanho
    },
    'Incoming request'
  );
}

export function logResponse(
  ctx: LogContext,
  method: string,
  path: string,
  status: number,
  duration: number
): void {
  const log = createContextLogger(ctx);

  if (status >= 500) {
    log.error({ method, path, status, duration }, 'Request failed');
  } else if (status >= 400) {
    log.warn({ method, path, status, duration }, 'Request warned');
  } else {
    log.info({ method, path, status, duration }, 'Request completed');
  }
}

/**
 * Error logger — padronizado para mensagens de erro
 */
export function logError(
  ctx: LogContext,
  error: unknown,
  operation: string
): void {
  const log = createContextLogger(ctx);

  const errorObj = error instanceof Error
    ? { err: error, stack: error.stack, message: error.message }
    : { error };

  log.error(errorObj, `Error during ${operation}`);
}

/**
 * Business event logger — eventos de negócio importantes
 */
export function logBusinessEvent(
  ctx: LogContext,
  event: string,
  data: Record<string, any>
): void {
  const log = createContextLogger(ctx);
  log.info(data, `Business event: ${event}`);
}
