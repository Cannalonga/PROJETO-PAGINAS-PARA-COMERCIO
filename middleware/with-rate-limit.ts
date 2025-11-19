/**
 * MIDDLEWARE — WITH RATE LIMIT
 *
 * Aplica rate limiting (IP, Tenant, User)
 * Deve ser aplicado após withSentry (para que retorne erro estruturado)
 *
 * Features:
 * - IP-based rate limiting (global)
 * - Tenant-based rate limiting (per tenant)
 * - User-based rate limiting (per user)
 * - Customizable limits per endpoint
 * - 429 Too Many Requests com Retry-After header
 *
 * Padrão:
 * ```typescript
 * export const POST = withCorrelationId(
 *   withLogger(
 *     withSentry(
 *       withRateLimit(handler, { mode: 'ip' })
 *     )
 *   )
 * );
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RateLimitConfig, DEFAULT_LIMITS } from '@/lib/rate-limit';
import { getRequestContext } from '@/lib/request-context';
import { createContextLogger } from '@/lib/logger';

/**
 * Configuração para withRateLimit
 */
export interface RateLimitMiddlewareConfig {
  mode?: 'ip' | 'tenant' | 'user' | 'mixed'; // 'mixed' = IP + Tenant + User
  customLimits?: RateLimitConfig;
  skipPaths?: RegExp[]; // Paths para skip rate limiting
}

/**
 * High-order function que wraps handler com rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<Response>,
  config?: RateLimitMiddlewareConfig
) {
  const mode = config?.mode || 'ip';
  const skipPaths = config?.skipPaths || [];

  return async (req: NextRequest): Promise<Response> => {
    // Verificar se path deve ser skipped
    if (skipPaths.some((pattern) => pattern.test(req.nextUrl.pathname))) {
      return await handler(req);
    }

    const ctx = getRequestContext();
    const log = ctx ? createContextLogger(ctx) : undefined;

    try {
      // Determinar limiter names baseado no mode
      const limitersToCheck: Array<{
        name: string;
        key: string;
        config: RateLimitConfig;
      }> = [];

      if (mode === 'ip' || mode === 'mixed') {
        limitersToCheck.push({
          name: 'ip',
          key: ctx?.ip || 'unknown',
          config: config?.customLimits || DEFAULT_LIMITS.ip,
        });
      }

      if (mode === 'tenant' || mode === 'mixed') {
        if (ctx?.tenantId) {
          limitersToCheck.push({
            name: 'tenant',
            key: ctx.tenantId,
            config: config?.customLimits || DEFAULT_LIMITS.tenant,
          });
        }
      }

      if (mode === 'user' || mode === 'mixed') {
        if (ctx?.userId) {
          limitersToCheck.push({
            name: 'user',
            key: ctx.userId,
            config: config?.customLimits || DEFAULT_LIMITS.user,
          });
        }
      }

      // Verificar todos os limiters
      for (const limiter of limitersToCheck) {
        const result = await checkRateLimit(
          limiter.name,
          limiter.key,
          limiter.config,
          ctx?.correlationId
        );

        if (!result.isAllowed) {
          if (log) {
            log.warn(
              {
                limiter: limiter.name,
                key: limiter.key,
                remaining: result.remainingPoints,
                retryAfter: result.retryAfter,
              },
              'Rate limit exceeded'
            );
          }

          // Retornar 429 com headers apropriados
          return NextResponse.json(
            {
              error: 'Too Many Requests',
              message: `Rate limit exceeded for ${limiter.name}`,
              correlationId: result.correlationId,
              retryAfter: result.retryAfter,
            },
            {
              status: 429,
              headers: {
                'Retry-After': String(result.retryAfter || 60),
                'X-RateLimit-Limit': String(limiter.config.points),
                'X-RateLimit-Remaining': String(result.remainingPoints),
                'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
              },
            }
          );
        }

        if (log) {
          log.debug(
            {
              limiter: limiter.name,
              key: limiter.key,
              remaining: result.remainingPoints,
            },
            'Rate limit check passed'
          );
        }
      }

      // Todos os checks passaram
      return await handler(req);
    } catch (error) {
      if (log) {
        log.error(
          {
            error: error instanceof Error ? error.message : String(error),
          },
          'Rate limit check failed'
        );
      }

      // Graceful degradation: permitir se check falha (Redis down)
      return await handler(req);
    }
  };
}

/**
 * Versão específica para endpoints auth (limit bem mais restrito)
 */
export function withAuthRateLimit(
  handler: (req: NextRequest) => Promise<Response>
) {
  return withRateLimit(handler, {
    mode: 'ip',
    customLimits: DEFAULT_LIMITS.authIp, // 5 tentativas por minuto
  });
}

/**
 * Versão específica para endpoints de API key (limit bem mais generoso)
 */
export function withApiKeyRateLimit(
  handler: (req: NextRequest) => Promise<Response>,
  apiKeyHeader: string = 'x-api-key'
) {
  return async (req: NextRequest): Promise<Response> => {
    const ctx = getRequestContext();
    const apiKey = req.headers.get(apiKeyHeader);

    // Se tem API key, usar api-key rate limit em vez de IP
    if (apiKey) {
      return withRateLimit(handler, {
        mode: 'ip', // Custom mode: baseado em API key
        customLimits: DEFAULT_LIMITS.apiKey,
      })(req);
    }

    // Se não tem API key, usar IP rate limit normal
    return withRateLimit(handler, {
      mode: 'ip',
      customLimits: DEFAULT_LIMITS.ip,
    })(req);
  };
}
