import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

let redisClient: RedisClientType | null = null;
let isConnected = false;

/**
 * Get or create Redis connection
 * Connects lazily on first use
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  // Skip if Redis is disabled
  if (process.env.REDIS_DISABLED === 'true') {
    return null;
  }

  // Return existing connection
  if (redisClient && isConnected) {
    return redisClient;
  }

  try {
    if (!redisClient) {
      const url = process.env.REDIS_URL || 'redis://localhost:6379';

      redisClient = createClient({
        url,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error(
                'Redis connection failed after 10 retries',
                { retries }
              );
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 50, 500);
          },
          connectTimeout: 10000,
        },
      });

      redisClient.on('error', (err) => {
        logger.error('Redis client error', { error: err.message });
        isConnected = false;
      });

      redisClient.on('connect', () => {
        isConnected = true;
        logger.info('Redis connected', {});
      });

      redisClient.on('disconnect', () => {
        isConnected = false;
        logger.info('Redis disconnected', {});
      });

      await redisClient.connect();
      isConnected = true;

      logger.info('Redis initialized', { url });
    }

    return redisClient;
  } catch (error) {
    logger.error(
      'Failed to initialize Redis',
      {
        error: error instanceof Error ? error.message : String(error),
      }
    );

    // Fail gracefully - return null to fall back to in-memory
    redisClient = null;
    isConnected = false;
    return null;
  }
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedis(): Promise<void> {
  if (redisClient && isConnected) {
    try {
      await redisClient.disconnect();
      isConnected = false;
      logger.info('Redis disconnected', {});
    } catch (error) {
      logger.error(
        'Error closing Redis',
        {
          error: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }
}

/**
 * Health check for Redis
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return false;
    }

    const pong = await client.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}
