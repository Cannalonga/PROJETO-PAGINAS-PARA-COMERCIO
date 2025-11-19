/**
 * FASE 2 — P1 RATE LIMITING
 *
 * Redis-based distributed rate limiting usando rate-limiter-flexible
 * Suporta: IP-based, Tenant-based, User-based limits
 *
 * Setup:
 * 1. npm install redis rate-limiter-flexible
 * 2. Adicionar REDIS_URL a .env.local
 * 3. Call initRateLimiters() em app initialization
 *
 * Uso:
 * ```typescript
 * import { checkRateLimit, rateLimiters } from '@/lib/rate-limit';
 *
 * // IP-based (global)
 * await checkRateLimit('ip', clientIp, { points: 100, duration: 60 });
 *
 * // Tenant-based
 * await checkRateLimit('tenant', tenantId, { points: 1000, duration: 3600 });
 *
 * // User-based
 * await checkRateLimit('user', userId, { points: 50, duration: 60 });
 * ```
 */

import Redis from 'ioredis';
import {
  RateLimiterRedis,
  RateLimiterRes,
  RateLimiterAbstract,
} from 'rate-limiter-flexible';

/**
 * Interface para configuração de rate limit
 */
export interface RateLimitConfig {
  points: number; // Número de "pontos" permitidos
  duration: number; // Duração da janela em segundos
  blockDuration?: number; // Duração do bloqueio após exceder (0 = banimento permanente na janela)
}

/**
 * Interface para resultado de rate limit check
 */
export interface RateLimitCheckResult {
  isAllowed: boolean;
  remainingPoints: number;
  resetTime: number; // Timestamp em ms quando resets
  retryAfter?: number; // Segundos para esperar se bloqueado
  correlationId?: string;
}

/**
 * Limites padrão por tipo
 */
const DEFAULT_LIMITS = {
  // Endpoint geral: 100 requests por minuto por IP
  ip: { points: 100, duration: 60 },

  // Endpoints de auth: 5 tentativas por minuto por IP
  authIp: { points: 5, duration: 60 },

  // Tenant: 10k requests por hora
  tenant: { points: 10000, duration: 3600 },

  // User: 1k requests por hora
  user: { points: 1000, duration: 3600 },

  // API key: 5k requests por hora
  apiKey: { points: 5000, duration: 3600 },
};

let redisClient: Redis | null = null;
let rateLimiters: Map<string, RateLimiterRedis> = new Map();

/**
 * Inicializa conexão Redis e rate limiters
 */
export async function initRateLimiters() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn('[RATE-LIMIT] Redis URL not configured, rate limiting disabled');
    return false;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: false,
    });

    redisClient.on('error', (err) => {
      console.error('[RATE-LIMIT] Redis error:', err);
    });

    redisClient.on('connect', () => {
      console.log('[RATE-LIMIT] Redis connected');
    });

    // Pré-configurar limiters comuns
    createLimiter('ip', DEFAULT_LIMITS.ip);
    createLimiter('authIp', DEFAULT_LIMITS.authIp);
    createLimiter('tenant', DEFAULT_LIMITS.tenant);
    createLimiter('user', DEFAULT_LIMITS.user);
    createLimiter('apiKey', DEFAULT_LIMITS.apiKey);

    console.log('[RATE-LIMIT] Initialized with Redis');
    return true;
  } catch (err) {
    console.error('[RATE-LIMIT] Initialization failed:', err);
    return false;
  }
}

/**
 * Cria um novo rate limiter com configuração customizada
 */
function createLimiter(name: string, config: RateLimitConfig): RateLimiterRedis {
  if (!redisClient) {
    throw new Error('[RATE-LIMIT] Redis not initialized');
  }

  const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: `rate-limit:${name}:`,
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration || 0,
  });

  rateLimiters.set(name, limiter);
  return limiter;
}

/**
 * Verifica rate limit para uma chave
 * Throwna error se excedido
 */
export async function checkRateLimit(
  limiterName: string,
  key: string,
  config?: RateLimitConfig,
  correlationId?: string
): Promise<RateLimitCheckResult> {
  if (!redisClient) {
    // Se Redis não está disponível, permite (graceful degradation)
    return {
      isAllowed: true,
      remainingPoints: -1,
      resetTime: 0,
      correlationId,
    };
  }

  try {
    let limiter = rateLimiters.get(limiterName);

    // Se configuração customizada, criar limiter específico
    if (config && !limiter) {
      limiter = createLimiter(`${limiterName}:${key}`, config);
    }

    if (!limiter) {
      throw new Error(`Rate limiter '${limiterName}' not found`);
    }

    // Consumir 1 ponto
    const res: RateLimiterRes = await limiter.consume(key, 1);

    return {
      isAllowed: true,
      remainingPoints: res.remainingPoints,
      resetTime: Date.now() + res.msBeforeNext,
      correlationId,
    };
  } catch (err: any) {
    // Se é RateLimiterRes (erro de limite excedido)
    if (err.remainingPoints !== undefined) {
      const msBeforeNext = err.msBeforeNext || 0;
      return {
        isAllowed: false,
        remainingPoints: err.remainingPoints,
        resetTime: Date.now() + msBeforeNext,
        retryAfter: Math.ceil(msBeforeNext / 1000),
        correlationId,
      };
    }

    // Erro real (Redis down, etc)
    console.error('[RATE-LIMIT] Check failed:', err);
    // Graceful degradation: permite se Redis falha
    return {
      isAllowed: true,
      remainingPoints: -1,
      resetTime: 0,
      correlationId,
    };
  }
}

/**
 * Verifica rate limit sem consumir pontos (apenas read)
 */
export async function peekRateLimit(
  limiterName: string,
  key: string
): Promise<number> {
  if (!redisClient) return -1;

  try {
    const limiter = rateLimiters.get(limiterName);
    if (!limiter) return -1;

    const res = await limiter.get(key);
    return res ? res.remainingPoints : -1;
  } catch (err) {
    console.error('[RATE-LIMIT] Peek failed:', err);
    return -1;
  }
}

/**
 * Reset rate limit para uma chave (útil para testes)
 */
export async function resetRateLimit(
  limiterName: string,
  key: string
): Promise<boolean> {
  if (!redisClient) return false;

  try {
    const limiter = rateLimiters.get(limiterName);
    if (!limiter) return false;

    await limiter.delete(key);
    return true;
  } catch (err) {
    console.error('[RATE-LIMIT] Reset failed:', err);
    return false;
  }
}

/**
 * Fecha conexão Redis gracefully
 */
export async function closeRateLimiters(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    rateLimiters.clear();
    console.log('[RATE-LIMIT] Closed');
  }
}

/**
 * Retorna status do Redis
 */
export function getRateLimitStatus(): {
  connected: boolean;
  limitersCount: number;
  redisStatus?: string;
} {
  return {
    connected: redisClient?.status === 'ready',
    limitersCount: rateLimiters.size,
    redisStatus: redisClient?.status,
  };
}

/**
 * Exporta DEFAULT_LIMITS para customização
 */
export { DEFAULT_LIMITS };
