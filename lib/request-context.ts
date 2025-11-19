/**
 * FASE 2 — P1 REQUEST CONTEXT
 *
 * Armazena contexto de requisição (correlationId, tenantId, userId)
 * Usa AsyncLocalStorage para manter contexto sem passar parâmetros
 *
 * Padrão: Context é inicializado no middleware, acessível em qualquer
 * função chamada durante a requisição
 *
 * Uso:
 * ```typescript
 * // Em middleware:
 * runWithRequestContext(
 *   { correlationId, tenantId, userId, ip },
 *   () => handler(req, res)
 * );
 *
 * // Em qualquer função chamada durante requisição:
 * const ctx = getRequestContext();
 * logger.info({ correlationId: ctx?.correlationId }, 'msg');
 * ```
 */

import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Dados do contexto da requisição
 * Disponível durante toda a lifecycle da requisição
 */
export interface RequestContextData {
  correlationId: string;
  tenantId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string; // Alias para correlationId (compatibilidade com P0)
}

/**
 * Storage AsyncLocal para manter contexto
 * Isolado por requisição (seguro em multi-concorrência)
 */
const storage = new AsyncLocalStorage<RequestContextData>();

/**
 * Executa função dentro de contexto de requisição
 *
 * @param ctx Contexto da requisição
 * @param cb Função a executar
 * @returns Resultado da função
 *
 * Exemplo:
 * ```typescript
 * return runWithRequestContext(
 *   { correlationId: 'uuid', tenantId: 'tenant-1', userId: 'user-1' },
 *   () => handler(req, res)
 * );
 * ```
 */
export function runWithRequestContext<T>(
  ctx: RequestContextData,
  cb: () => T | Promise<T>
): T | Promise<T> {
  return storage.run(ctx, cb);
}

/**
 * Obtém contexto da requisição atual
 * Retorna undefined se fora de contexto
 *
 * Exemplo:
 * ```typescript
 * const ctx = getRequestContext();
 * if (ctx) {
 *   logger.info({ correlationId: ctx.correlationId }, 'msg');
 * }
 * ```
 */
export function getRequestContext(): RequestContextData | undefined {
  return storage.getStore();
}

/**
 * Helper para garantir contexto existe
 * Útil em operações críticas que precisam de correlationId
 */
export function requireRequestContext(): RequestContextData {
  const ctx = getRequestContext();
  if (!ctx) {
    throw new Error('Request context not initialized. Check middleware.');
  }
  return ctx;
}

/**
 * Helper para adicionar dados ao contexto existente
 * Cria novo contexto com merge de dados
 */
export function extendRequestContext(
  data: Partial<RequestContextData>
): RequestContextData {
  const current = getRequestContext();
  if (!current) {
    throw new Error('No request context to extend');
  }
  return { ...current, ...data };
}
