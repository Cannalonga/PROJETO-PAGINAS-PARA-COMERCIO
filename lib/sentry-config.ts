/**
 * SENTRY CONFIGURATION - Error Tracking & Security Monitoring
 * File: lib/sentry-config.ts
 * 
 * Tracks:
 * - Application errors
 * - Security vulnerabilities  
 * - Failed authentication attempts
 * - Rate limiting triggers
 * - Webhook failures
 * 
 * Setup:
 * 1. npm install @sentry/nextjs @sentry/tracing
 * 2. Get SENTRY_AUTH_TOKEN from https://sentry.io
 * 3. Add to .env.local:
 *    SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
 *    SENTRY_AUTH_TOKEN=sntrys_xxx
 *    SENTRY_PROJECT=paginas-comercio
 *    SENTRY_ORG=your-org
 * 4. Run: npm run build (will initialize Sentry)
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry
 * Call this in next.config.js withSentryConfig()
 */
export function initSentry() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      // Sentry DSN (Data Source Name)
      dsn: process.env.SENTRY_DSN,

      // Environment
      environment: process.env.NODE_ENV || 'production',

      // Release version for tracking
      release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

      // Sample error reporting (100% in production)
      sampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.1,

      // Performance monitoring
      tracesSampleRate: 0.1, // 10% of transactions

      // Enable debug in development
      debug: process.env.NODE_ENV === 'development',

      // Filter sensitive data
      beforeSend(event, hint) {
        // Don't send events with certain conditions
        if (event.exception) {
          const error = hint.originalException;
          
          // Filter out 404s
          if (error instanceof Error && error.message.includes('404')) {
            return null;
          }

          // Filter out expected errors
          if (error instanceof Error && error.message.includes('IGNORED')) {
            return null;
          }
        }

        // Remove sensitive data from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
            // Don't log sensitive data
            if (breadcrumb.data) {
              breadcrumb.data = {
                ...breadcrumb.data,
                password: '[REDACTED]',
                token: '[REDACTED]',
                apiKey: '[REDACTED]',
              };
            }
            return breadcrumb;
          });
        }

        // Remove PII from request data
        if (event.request) {
          event.request.cookies = '[REDACTED]';
          event.request.headers = {
            ...event.request.headers,
            'authorization': '[REDACTED]',
          };
        }

        return event;
      },

      // Integrations
      integrations: [
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Session replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with error

      // Capture unhandled promise rejections
      attachStacktrace: true,
      captureUnhandledRejections: true,

      // Max breadcrumbs to keep
      maxBreadcrumbs: 50,

      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome://',
        // Expected network errors
        'NetworkError',
        'timeout',
        // Random plugins/extensions
        'Can\'t find variable: ZiteReader',
        'jigsaw is not defined',
      ],
    });
  }
}

/**
 * Capture security events
 * Usage: captureSecurityEvent('IDOR_ATTEMPT', { userId, targetId, ip })
 */
export function captureSecurityEvent(
  eventType: string,
  data: Record<string, any>
) {
  Sentry.captureMessage(
    `[SECURITY] ${eventType}`,
    {
      level: 'error', // Always log security events as errors
      tags: {
        event_type: eventType,
        severity: data.severity || 'high',
      },
      extra: {
        timestamp: new Date().toISOString(),
        ...data,
      },
    }
  );

  // Also send to monitoring system if critical
  if (data.severity === 'critical') {
    alertSecurityTeam(eventType, data);
  }
}

/**
 * Alert security team on critical events
 */
async function alertSecurityTeam(eventType: string, data: Record<string, any>) {
  // Send to Slack
  if (process.env.SLACK_SECURITY_WEBHOOK) {
    await fetch(process.env.SLACK_SECURITY_WEBHOOK, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 SECURITY ALERT: ${eventType}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `🚨 ${eventType}`,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*User:*\\n${data.userId}`,
              },
              {
                type: 'mrkdwn',
                text: `*IP:*\\n${data.ip || 'unknown'}`,
              },
              {
                type: 'mrkdwn',
                text: `*Time:*\\n${new Date().toISOString()}`,
              },
              {
                type: 'mrkdwn',
                text: `*Severity:*\\n${data.severity || 'high'}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '```' + JSON.stringify(data, null, 2) + '```',
            },
          },
        ],
      }),
    });
  }

  // Send to PagerDuty for critical alerts
  if (process.env.PAGERDUTY_INTEGRATION_URL && data.severity === 'critical') {
    await fetch(process.env.PAGERDUTY_INTEGRATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        routing_key: process.env.PAGERDUTY_ROUTING_KEY,
        event_action: 'trigger',
        payload: {
          summary: `Security Alert: ${eventType}`,
          severity: 'critical',
          source: 'Sentry',
          custom_details: data,
        },
      }),
    });
  }
}

/**
 * Capture performance metrics
 */
export function capturePerformanceMetric(
  name: string,
  duration: number,
  tags?: Record<string, string>
) {
  Sentry.captureMessage(
    `Performance: ${name}`,
    {
      level: 'info',
      tags: {
        metric_name: name,
        duration_ms: `${duration}`,
        ...tags,
      },
    }
  );
}

/**
 * Set user context for tracking
 */
export function setSentryUser(userId: string, email?: string, roles?: string[]) {
  Sentry.setUser({
    id: userId,
    email: email,
    custom: {
      roles: roles?.join(','),
    },
  });
}

/**
 * Clear user context on logout
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

// ============================================================================
// MONITORED EVENTS TO SEND TO SENTRY
// ============================================================================

/*
CRITICAL SECURITY EVENTS (Send immediately):
  1. IDOR_ATTEMPT - User tried to access other user's data
  2. BFLA_ATTEMPT - Non-admin tried to access admin endpoint
  3. BRUTE_FORCE - >5 failed logins from same IP/15min
  4. PRIVILEGE_ESCALATION - User tried to change own role
  5. WEBHOOK_SIGNATURE_INVALID - Stripe/MercadoPago signature failed
  6. MALFORMED_WEBHOOK - JSON parse error on webhook
  7. CROSS_TENANT_ACCESS - User tried to access other tenant
  8. PAYMENT_FAILED - Stripe/MercadoPago payment failure
  9. DATABASE_ERROR - SQL/ORM errors
  10. UNHANDLED_EXCEPTION - Any unhandled error

Usage Examples:
  captureSecurityEvent('IDOR_ATTEMPT', {
    severity: 'high',
    userId: session.user.id,
    targetId: attemptedId,
    ip: request.headers.get('x-forwarded-for'),
    timestamp: new Date()
  });

  captureSecurityEvent('BRUTE_FORCE', {
    severity: 'critical',
    ip: clientIp,
    attempts: 6,
    timeWindow: '15min',
  });
*/
