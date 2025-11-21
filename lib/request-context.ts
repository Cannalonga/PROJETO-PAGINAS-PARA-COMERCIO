// lib/request-context.ts
/**
 * Request Context usando AsyncLocalStorage
 * 
 * Correlaciona requisições com:
 * - requestId (único por requisição)
 * - tenantId (tenant da requisição)
 * - userId (user autenticado)
 * 
 * Usável em qualquer contexto async da requisição:
 * middleware, services, routes, database queries, etc.
 */

import { AsyncLocalStorage } from "async_hooks";

export type RequestContextValue = {
  requestId: string;
  tenantId?: string;
  userId?: string;
  path: string;
  method: string;
};

const storage = new AsyncLocalStorage<RequestContextValue>();

/**
 * Execute uma função dentro de um contexto de requisição
 * 
 * @param ctx Contexto da requisição
 * @param fn Função a executar
 * @returns Resultado da função
 * 
 * @example
 * const result = await runWithRequestContext(ctx, async () => {
 *   logger.info("Processing request");
 *   return await processData();
 * });
 */
export function runWithRequestContext<T>(
  ctx: RequestContextValue,
  fn: () => Promise<T> | T
): Promise<T> | T {
  return storage.run(ctx, fn);
}

/**
 * Obter contexto da requisição atual
 * 
 * Retorna undefined se chamado fora de um contexto ativo
 * 
 * @returns Contexto da requisição ou undefined
 * 
 * @example
 * const ctx = getRequestContext();
 * if (ctx?.requestId) {
 *   console.log(`Request ID: ${ctx.requestId}`);
 * }
 */
export function getRequestContext(): RequestContextValue | undefined {
  return storage.getStore();
}

/**
 * Definir tenantId no contexto atual
 * 
 * Útil após resolver tenant em middleware ou route
 * 
 * @param tenantId ID do tenant
 * 
 * @example
 * const tenant = await resolveTenant(req);
 * setTenantInContext(tenant.id);
 */
export function setTenantInContext(tenantId: string) {
  const ctx = storage.getStore();
  if (!ctx) return;
  Object.assign(ctx, { tenantId });
}

/**
 * Definir userId no contexto atual
 * 
 * Útil após autenticar usuário
 * 
 * @param userId ID do usuário
 * 
 * @example
 * const session = await getSession();
 * setUserInContext(session.user.id);
 */
export function setUserInContext(userId: string) {
  const ctx = storage.getStore();
  if (!ctx) return;
  Object.assign(ctx, { userId });
}

/**
 * Obter correlação completa (para logs)
 * 
 * @returns Objeto com requestId, tenantId, userId (útil para logging)
 */
export function getCorrelation() {
  const ctx = getRequestContext();
  return {
    requestId: ctx?.requestId,
    tenantId: ctx?.tenantId,
    userId: ctx?.userId,
  };
}
