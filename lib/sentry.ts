/**
 * Sentry Integration for Next.js
 *
 * Centralizes error tracking and monitoring
 * - Automatic error capture with request context
 * - Performance monitoring
 * - Release tracking
 * - Environment-based configuration
 *
 * @example
 * import { initSentry } from '@/lib/sentry';
 * // Called in app/layout.tsx
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';
import { NextRequest } from 'next/server';

/**
 * Initialize Sentry for Next.js
 * Call this in the root layout
 */
export function initSentry() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured, error tracking disabled');
    return;
  }

  // Only initialize once
  if (Sentry.isInitialized()) {
    return;
  }

  Sentry.init({
    // DSN from environment (get from Sentry dashboard)
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Release for tracking (auto-filled by build process)
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',

    // Environment
    environment: process.env.NODE_ENV || 'production',

    // Performance monitoring (0 = disabled, 1 = 100% sampling)
    tracesSampleRate:
      process.env.NODE_ENV === 'production'
        ? 0.1 // 10% in production (reduce cost)
        : 1.0, // 100% in development

    // Enable performance monitoring for Next.js routes
    integrations: [],

    // Capture replays for 10% of all sessions plus for 100% of error sessions
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Configure which errors to track
    beforeSend(event) {
      // Filter out non-500 errors in production (optional)
      if (process.env.NODE_ENV === 'production') {
        // Only track server errors by default
        if (event.exception) {
          const statusCode = (event as any).statusCode;
          if (statusCode && statusCode < 500) {
            return null; // Don't send
          }
        }
      }

      return event;
    },
  });

  console.info('[Sentry] Initialized', {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION,
  });
}

/**
 * Capture exception with request context
 */
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>
) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

/**
 * Capture message with level
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: Record<string, unknown>
) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  Sentry.captureMessage(message, level);

  if (context) {
    Sentry.setContext('custom', context);
  }
}

/**
 * Set user context for tracking
 */
export function setSentryUser(
  userId: string | null,
  properties?: Record<string, unknown>
) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  if (userId) {
    Sentry.setUser({
      id: userId,
      ...properties,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Set request context for better error tracking
 */
export function setSentryContext(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  const userIdHeader = request.headers.get('x-user-id');
  const tenantIdHeader = request.headers.get('x-tenant-id');
  const requestId = request.headers.get('x-request-id');

  Sentry.setContext('http', {
    method: request.method,
    url: request.nextUrl.href,
    headers: {
      'user-agent': request.headers.get('user-agent'),
    },
  });

  if (userIdHeader) {
    setSentryUser(userIdHeader);
  }

  if (tenantIdHeader) {
    Sentry.setContext('tenant', {
      id: tenantIdHeader,
    });
  }

  if (requestId) {
    Sentry.setTag('requestId', requestId);
  }
}

/**
 * Wrapper for route handlers to catch and report errors
 */
export function withSentryCapture<T extends (...args: any[]) => any>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      captureException(error);
      throw error;
    }
  }) as T;
}

/**
 * Flush pending events before shutdown
 */
export async function flushSentry(timeout = 2000) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  await Sentry.flush(timeout);
}
