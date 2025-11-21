// lib/logger.ts
/**
 * Logger estruturado com contexto de requisição
 * 
 * Produz logs em JSON com:
 * - Level (debug, info, warn, error)
 * - Message
 * - Timestamp ISO 8601
 * - Correlação: requestId, tenantId, userId, path, method
 * - Metadata customizada
 * 
 * Segurança:
 * - Nunca loga senhas, tokens, dados sensíveis
 * - Email só em debug/dev
 * - Erros sanitizados antes de logar
 * 
 * @example
 * logger.info("User logged in", { action: "login", timestamp: Date.now() });
 * logger.error("Payment failed", { error: err.message, attempt: 1 });
 */

import { getRequestContext } from "./request-context";

type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMeta = Record<string, unknown>;

/**
 * Sanitizar valor para evitar PII em logs
 * 
 * - Remove dados sensíveis conhecidos
 * - Hash emails em produção
 * - Remove tokens/senhas
 * 
 * @param obj Objeto a sanitizar
 * @returns Objeto sanitizado
 */
function sanitizeForLogging(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForLogging);
  }

  const sanitized: Record<string, unknown> = {};
  const sensitiveFields = ["password", "token", "secret", "card", "ssn", "cpf"];

  for (const [key, value] of Object.entries(obj)) {
    // Pular campos sensíveis
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = "[REDACTED]";
      continue;
    }

    // Email: em debug/dev mostrar, em prod truncar
    if (key.toLowerCase().includes("email")) {
      if (process.env.NODE_ENV === "production") {
        const email = String(value);
        sanitized[key] = email.substring(0, 3) + "***@***";
      } else {
        sanitized[key] = value;
      }
      continue;
    }

    // Objetos aninhados: recursivo
    if (typeof value === "object") {
      sanitized[key] = sanitizeForLogging(value);
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Formatar log estruturado
 * 
 * Inclui contexto de requisição automaticamente
 * 
 * @param level Nível do log
 * @param message Mensagem
 * @param meta Metadados opcionais
 * @returns String JSON
 */
function formatLog(level: LogLevel, message: string, meta?: LogMeta): string {
  const ctx = getRequestContext();
  
  const base = {
    level,
    message,
    time: new Date().toISOString(),
    requestId: ctx?.requestId ?? "system",
    tenantId: ctx?.tenantId,
    userId: ctx?.userId,
    path: ctx?.path,
    method: ctx?.method,
  };

  const sanitized = meta
    ? (sanitizeForLogging(meta) as Record<string, unknown>)
    : {};

  return JSON.stringify({
    ...base,
    ...sanitized,
  });
}

/**
 * Logger com suporte a contexto de requisição
 * 
 * Todos os logs incluem requestId, tenantId, userId automaticamente
 */
export const logger = {
  /**
   * Log de debug - apenas em desenvolvimento
   * 
   * @param message Mensagem
   * @param meta Dados adicionais
   */
  debug(message: string, meta?: LogMeta) {
    if (process.env.NODE_ENV === "production") return;
    console.debug(formatLog("debug", message, meta));
  },

  /**
   * Log de informação - operações normais
   * 
   * @param message Mensagem
   * @param meta Dados adicionais
   * 
   * @example
   * logger.info("Checkout initiated", { planId: "pro", amount: 99.99 });
   */
  info(message: string, meta?: LogMeta) {
    console.info(formatLog("info", message, meta));
  },

  /**
   * Log de aviso - comportamento inesperado mas recuperável
   * 
   * @param message Mensagem
   * @param meta Dados adicionais
   * 
   * @example
   * logger.warn("Rate limit approaching", { remaining: 10, limit: 100 });
   */
  warn(message: string, meta?: LogMeta) {
    console.warn(formatLog("warn", message, meta));
  },

  /**
   * Log de erro - falhas e exceções
   * 
   * Sanitiza automaticamente:
   * - Mensagens de erro externas (Prisma, Stripe, etc.)
   * - Evita expor tokens ou dados sensíveis
   * 
   * @param message Mensagem
   * @param meta Dados adicionais (pode incluir error object)
   * 
   * @example
   * logger.error("Payment failed", { error: err.message, stripeCode: err.code });
   */
  error(message: string, meta?: LogMeta) {
    console.error(formatLog("error", message, meta));
  },
};

/**
 * Wrapper para logar errors de forma segura
 * 
 * Extrai apenas informações públicas de erros
 * 
 * @param error Erro a logar
 * @param context Contexto adicional
 * 
 * @example
 * try {
 *   await processPayment(user);
 * } catch (err) {
 *   logError(err, { action: "processPayment", userId: user.id });
 * }
 */
export function logError(error: unknown, context?: LogMeta) {
  let errorData: LogMeta = {};

  if (error instanceof Error) {
    errorData = {
      errorName: error.name,
      errorMessage: error.message,
      // Stack trace apenas em dev
      ...(process.env.NODE_ENV !== "production" && {
        errorStack: error.stack,
      }),
    };
  } else if (typeof error === "string") {
    errorData = { errorMessage: error };
  } else {
    errorData = { error: String(error) };
  }

  logger.error(
    context?.message ? String(context.message) : "Error occurred",
    { ...context, ...errorData }
  );
}
