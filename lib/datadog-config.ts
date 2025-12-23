/**
 * DATADOG CONFIGURATION - Application Performance Monitoring (APM) & Logs
 * File: lib/datadog-config.ts
 * 
 * Tracks:
 * - API response times
 * - Database query performance
 * - Error rates and types
 * - User journeys and funnels
 * - Security events
 * - Infrastructure metrics
 * 
 * Setup:
 * 1. npm install @datadog/browser-rum @datadog/browser-logs dd-trace
 * 2. Get API Key from https://app.datadoghq.com
 * 3. Add to .env.local:
 *    DATADOG_APPLICATION_ID=xxx
 *    DATADOG_CLIENT_TOKEN=xxx  
 *    DATADOG_API_KEY=xxx (server-side)
 *    DATADOG_SITE=datadoghq.com (or datadoghq.eu)
 */

import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

/**
 * Initialize Datadog RUM (Real User Monitoring) - Client-side
 * Call this in _app.tsx or root layout
 */
export function initDatadogRUM() {
  if (
    typeof window === 'undefined' ||
    !process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  ) {
    return;
  }

  datadogRum.init({
    applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    site: process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com',
    service: 'paginas-comercio-app',
    env: process.env.NODE_ENV || 'production',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

    // Session sampling
    sessionSampleRate: 100, // Track 100% of sessions
    sessionReplaySampleRate: 10, // Record 10% for replay

    // Enable features
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    enableExperimentalFeatures: ['feature_flags'],

    // Performance settings
    defaultPrivacyLevel: 'mask-user-input', // Mask form inputs
    trackViewsManually: false, // Auto-track page views

    // Error tracking
    beforeSend: (event) => {
      // Filter sensitive data
      if (event.type === 'error') {
        // Don't send certain errors
        if (event.error?.message?.includes('404')) {
          return false; // Don't send 404s
        }
      }
      return true;
    },

    // Allowed URLs for CORS
    allowedTracingUrls: [
      /https:\/\/.*\.paginas-comercio\.com.*/,
      /https:\/\/api\.example\.com.*/,
    ],
  });

  datadogRum.startSessionReplayRecording();
}

/**
 * Initialize Datadog Logs - Client-side
 */
export function initDatadogLogs() {
  if (typeof window === 'undefined') return;

  datadogLogs.init({
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    site: process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com',
    service: 'paginas-comercio-app',
    env: process.env.NODE_ENV || 'production',
    version: process.env.NEXT_PUBLIC_APP_VERSION,
    forwardConsoleLogs: ['log', 'info', 'warn', 'error'],
    forwardErrorsToLogs: true,
    sessionSampleRate: 100,
  });

  datadogLogs.logger.info('Datadog Logs initialized');
}

/**
 * Set user context for tracking
 */
export function setDatadogUser(userId: string, email?: string) {
  datadogRum.setUser({
    id: userId,
    email: email,
    name: email?.split('@')[0],
  });

  datadogLogs.setUser({
    id: userId,
    email: email,
  });
}

/**
 * Add custom event for security alerts
 */
export function logSecurityEvent(
  eventName: string,
  data: Record<string, any>
) {
  // Log via RUM
  datadogRum.addUserAction(eventName, {
    ...data,
    event_type: 'security',
  });

  // Log via Logs
  datadogLogs.logger.error(`[SECURITY] ${eventName}`, {
    ...data,
    severity: 'error',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track API call performance
 */
export function trackAPICall(
  method: string,
  endpoint: string,
  statusCode: number,
  duration: number
) {
  datadogRum.addUserAction(`API_${method}`, {
    endpoint,
    statusCode,
    duration,
    method,
  });
}

/**
 * Track authentication events
 */
export function trackAuthEvent(
  eventType: 'login_success' | 'login_failed' | 'logout' | 'session_expired',
  details?: Record<string, any>
) {
  datadogRum.addUserAction(`AUTH_${eventType.toUpperCase()}`, {
    ...details,
  });

  datadogLogs.logger.info(`Authentication: ${eventType}`, { ...details });
}

/**
 * Track business metrics
 */
export function trackBusinessMetric(
  metric: string,
  value: number,
  tags?: Record<string, string>
) {
  datadogRum.addUserAction(`BUSINESS_${metric}`, {
    value,
    ...tags,
  });
}

// ============================================================================
// SERVER-SIDE DATADOG SETUP (Node.js)
// ============================================================================

/**
 * Initialize Datadog APM for Node.js
 * Call at the very top of your server entry point (before any other requires)
 * 
 * Usage in server.js:
 * ```
 * require('dd-trace').init({
 *   env: process.env.NODE_ENV,
 *   service: 'paginas-comercio-api',
 *   version: process.env.APP_VERSION,
 * });
 * ```
 */

export const SERVER_CONFIG = {
  // Add to next.config.js or package.json scripts
  initCommand: `DD_TRACE_ENABLED=true DD_SERVICE=paginas-comercio-api node_modules/.bin/next start`,

  // Environment variables needed:
  envVars: [
    'DD_TRACE_ENABLED=true',
    'DD_SERVICE=paginas-comercio-api',
    'DD_ENV=production',
    'DD_VERSION=1.0.0',
    'DD_TRACE_AGENT_HOSTNAME=localhost',
    'DD_TRACE_AGENT_PORT=8126',
  ],

  // Metrics to instrument:
  metricsToTrack: [
    'api_request_duration',
    'database_query_duration',
    'cache_hit_rate',
    'error_rate',
    'auth_failure_rate',
    'webhook_success_rate',
    'payment_processing_time',
    'file_upload_duration',
  ],
};

// ============================================================================
// SECURITY EVENT TRACKING
// ============================================================================

/*
EVENTS TO LOG TO DATADOG:

1. Authentication Events:
   - login_success
   - login_failed (track per IP for brute force)
   - logout
   - session_expired
   - session_timeout

2. Authorization Events:
   - idor_attempt (blocked)
   - bfla_attempt (blocked)
   - privilege_escalation_attempt (blocked)
   - cross_tenant_access_attempt (blocked)
   - admin_action (track all admin activities)

3. Data Events:
   - user_created
   - user_deleted (soft delete tracked)
   - user_role_changed
   - data_export_requested
   - data_deletion_requested

4. Payment Events:
   - payment_initiated
   - payment_succeeded
   - payment_failed
   - refund_processed
   - invoice_generated

5. File Events:
   - file_uploaded
   - file_deleted
   - file_scanned (for malware)
   - export_generated

6. System Events:
   - webhook_received
   - webhook_failed
   - database_error
   - rate_limit_exceeded
   - api_error (5xx)

DASHBOARD SETUP:
Create a Datadog dashboard with:
  - Real-time authentication failure rate
  - API response time by endpoint
  - Error rate and trend
  - Security event timeline
  - User activity heatmap
  - Webhook success rate
  - Payment success rate
  - Database query duration p95/p99
  - Cache hit rate
  - File upload volume and sizes

ALERTS TO SET:
  1. Error rate > 1% (paging)
  2. Auth failures > 10/min from same IP
  3. IDOR/BFLA attempts detected
  4. Webhook failures > 3 in a row
  5. Payment processing > 30s
  6. Database queries > 5s
  7. Rate limit exceeded > 5 times/hour
  8. Critical errors (exceptions)

TRACE LINKS:
Set up trace-to-logs linking in Datadog to:
  - Link errors to user sessions
  - Link payments to user activity
  - Link webhooks to database changes
  - Link API calls to business events
*/

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// In API route (app/api/auth/signin/route.ts):
import { trackAuthEvent, logSecurityEvent } from '@/lib/datadog-config';

if (isPasswordValid) {
  trackAuthEvent('login_success', {
    email: normalizedEmail,
    method: 'credentials',
  });
} else {
  trackAuthEvent('login_failed', {
    email: normalizedEmail,
    ip: request.headers.get('x-forwarded-for'),
  });
  
  logSecurityEvent('BRUTE_FORCE_ALERT', {
    attemptCount: 6,
    ip: clientIp,
    timeWindow: '15min',
  });
}

// In IDOR detection (app/api/users/[id]/route.ts):
if (!hasAccess) {
  logSecurityEvent('IDOR_ATTEMPT_BLOCKED', {
    userId: session.user.id,
    targetId: params.id,
    tenantId: session.user.tenantId,
    ip: request.headers.get('x-forwarded-for'),
  });
}

// In payment processing:
trackBusinessMetric('PAYMENT_PROCESSED', 1, {
  plan: planType,
  userId: user.id,
  amount: price.toString(),
});
*/
