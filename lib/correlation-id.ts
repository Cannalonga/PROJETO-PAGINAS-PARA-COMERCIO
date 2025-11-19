/**
 * FASE 2 — P1 CORRELATION ID
 *
 * Gera UUID único para cada requisição
 * Permite rastrear uma requisição através de múltiplos serviços/logs
 *
 * Uso:
 * ```typescript
 * import { generateCorrelationId } from '@/lib/correlation-id';
 *
 * const correlationId = generateCorrelationId();
 * // Output: "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */

import { randomUUID } from 'crypto';

/**
 * Gera um UUID v4 para correlação de requisições
 * Usado em todos os logs e eventos de uma mesma requisição
 */
export function generateCorrelationId(): string {
  return randomUUID();
}

/**
 * Formata correlationId para header (opcional, para propagação)
 */
export function formatCorrelationIdHeader(correlationId: string): string {
  return `correlationId=${correlationId}`;
}
