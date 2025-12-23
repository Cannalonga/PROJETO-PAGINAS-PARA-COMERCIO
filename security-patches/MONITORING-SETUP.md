# 📊 MONITORING & ALERTING SETUP GUIDE

**Status:** Actions 3 & 4 - Security Monitoring Implementation  
**Components:** Sentry (errors) + DataDog (performance/logs) + Alerts  
**Timeline:** 4-6 hours to fully setup

---

## 🚨 QUICK START

### 1. Install Dependencies
```bash
npm install @sentry/nextjs @sentry/tracing
npm install --save-dev @types/node

# Optional: DataDog APM (advanced metrics)
npm install @datadog/browser-rum @datadog/browser-logs
npm install dd-trace  # Server-side APM
```

### 2. Get API Credentials

#### Sentry Setup (5 min)
1. Go to https://sentry.io/signup/
2. Create account, create project → "Next.js"
3. Copy **SENTRY_DSN** from project settings
4. Go to Account Settings → Auth Tokens
5. Create token with `project:write` scope
6. Copy **SENTRY_AUTH_TOKEN**

#### DataDog Setup (10 min) - OPTIONAL
1. Go to https://app.datadoghq.com/signup
2. Create organization
3. Go to Organization Settings → API Keys
4. Generate **DATADOG_API_KEY**
5. Go to Integrations → RUM → Create new application
6. Copy **DATADOG_APPLICATION_ID** and **DATADOG_CLIENT_TOKEN**

### 3. Add Environment Variables

**File:** `.env.local` (DO NOT commit)

```bash
# Sentry
SENTRY_DSN=https://abc123@def456.ingest.sentry.io/789012
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# DataDog (Optional)
NEXT_PUBLIC_DATADOG_APPLICATION_ID=xxxxx
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=xxxxx
NEXT_PUBLIC_DATADOG_SITE=datadoghq.com
DATADOG_API_KEY=xxxxx

# Slack webhook for critical alerts
SLACK_SECURITY_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

### 4. Update next.config.js

```javascript
// next.config.js

const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // ... existing config
  
  // Add Sentry environment variables
  env: {
    SENTRY_DSN: process.env.SENTRY_DSN,
  },
};

module.exports = withSentryConfig(
  nextConfig,
  {
    // Sentry build-time config
    org: process.env.SENTRY_ORG || 'your-org',
    project: process.env.SENTRY_PROJECT || 'paginas-comercio',
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // Silently catch warnings during build
    silent: true,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  }
);
```

### 5. Initialize in App (Client-side)

**File:** `app/layout.tsx` (or `_app.tsx`)

```typescript
import { initDatadogRUM, initDatadogLogs } from '@/lib/datadog-config';

// Initialize monitoring
if (typeof window !== 'undefined') {
  // Initialize DataDog (if enabled)
  if (process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID) {
    initDatadogRUM();
    initDatadogLogs();
  }
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### 6. Setup Server-side Tracking

**File:** `middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Add monitoring to middleware
export function middleware(request: NextRequest) {
  const start = Date.now();
  
  const response = NextResponse.next();
  
  const duration = Date.now() - start;
  console.log(`[PERF] ${request.method} ${request.nextUrl.pathname}: ${duration}ms`);
  
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/admin/:path*'],
};
```

---

## 🎯 CONFIGURE MONITORING FOR EACH VULNERABILITY

### #1: IDOR Prevention Alerts

**What to Monitor:**
- IDOR_ATTEMPT events
- User accessing other user's resources
- Cross-tenant access attempts

**Sentry Tag:** `event_type:idor_attempt`

**DataDog Query:**
```
service:paginas-comercio-api @event_type:idor_attempt
```

**Alert Condition:**
```
If IDOR_ATTEMPT > 5 in 1 hour → PagerDuty + Slack
```

**Implementation:**
```typescript
// In app/api/users/[id]/route.ts
if (!hasAccess) {
  // Log to Sentry
  Sentry.captureMessage('IDOR Attempt Detected', {
    level: 'error',
    tags: { event_type: 'idor_attempt' },
    extra: { userId, targetId, ip },
  });

  // Log to DataDog
  logSecurityEvent('IDOR_ATTEMPT', { userId, targetId, ip });
}
```

### #2: BFLA Prevention Alerts

**What to Monitor:**
- BFLA_ATTEMPT events
- Non-admin accessing admin endpoints
- Permission escalation attempts

**Sentry Tag:** `event_type:bfla_attempt`

**Alert Condition:**
```
If BFLA_ATTEMPT > 10 in 1 hour → Alert
If same user > 3 times → Block user
```

**Implementation:**
```typescript
// In lib/admin-auth.ts
if (!auth.isAuthorized) {
  captureSecurityEvent('BFLA_ATTEMPT', {
    userId: session.user.id,
    role: session.user.role,
    endpoint: request.nextUrl.pathname,
    ip: request.headers.get('x-forwarded-for'),
  });
}
```

### #3: Audit Logging Alerts

**What to Monitor:**
- All USER_DELETE operations
- All ADMIN actions
- Failed authorization attempts
- Webhook failures

**Create Dashboard:**
```
- Real-time DELETE count
- Authorization failures by type
- Admin actions timeline
- Webhook success rate
```

**Alert Rules:**
```
1. USER_DELETE event → Log to analytics
2. ADMIN_action AND status=FAILED → Alert
3. WEBHOOK failures > 3 in a row → Critical alert
4. SQL_ERROR → Error tracking
```

### #4: Authentication Alerts

**What to Monitor:**
- LOGIN_FAILED events
- Brute force attempts (>5/15min from same IP)
- Session timeout events

**Alert Condition:**
```
If LOGIN_FAILED from same IP > 5 times in 15 min:
  → Rate limit that IP to 1 request/minute
  → Send to Slack #security
  → Create PagerDuty incident if > 100 from same /24 CIDR
```

**Implementation:**
```typescript
// Track failed logins per IP
const failedAttempts = await redis.incr(`failed-login:${ip}`);
if (failedAttempts === 1) {
  await redis.expire(`failed-login:${ip}`, 900); // 15 min
}

if (failedAttempts > 5) {
  // Send alert
  Sentry.captureMessage('Brute Force Attempt', {
    level: 'error',
    tags: { event_type: 'brute_force' },
    extra: { ip, attempts: failedAttempts },
  });
  
  // Rate limit
  const remaining = Math.max(0, 900 - (Date.now() - startTime));
  throw new Error(`Rate limited. Retry in ${remaining}s`);
}
```

### #5: Webhook Monitoring

**What to Monitor:**
- WEBHOOK_RECEIVED count
- WEBHOOK_FAILED errors
- JSON parsing errors
- Signature validation failures
- Payment state transitions

**Alert Condition:**
```
If webhook failures > 3 in a row:
  → Critical alert (may miss payments)
  → Disable auto-processing
  → Manual review required
```

**Implementation:**
```typescript
// app/api/webhooks/stripe/route.ts
try {
  const event = stripe.webhooks.constructEvent(...);
  
  // Log success
  datadogRum.addUserAction('WEBHOOK_STRIPE_SUCCESS', {
    eventType: event.type,
    eventId: event.id,
  });
} catch (error) {
  // Log failure
  Sentry.captureException(error, {
    tags: { webhook_type: 'stripe' },
  });
  
  // Send alert if critical
  if (failureCount > 3) {
    await sendCriticalAlert('Stripe webhooks failing');
  }
}
```

---

## 📊 DASHBOARDS TO CREATE

### Sentry Dashboard
1. Go to https://sentry.io → Your Project
2. Create new Dashboard
3. Add widgets:
   - Error rate (last 24h)
   - Top errors
   - Errors by release
   - Errors by environment
   - User feedback

### DataDog Dashboard
1. Go to https://app.datadoghq.com → Dashboards
2. Create new dashboard → "Security Monitoring"
3. Add panels:
   - Real-time API latency (p50, p95, p99)
   - Error rate by endpoint
   - Security events timeline
   - Failed auth attempts
   - IDOR/BFLA attempts
   - Webhook success rate

---

## 🔔 SLACK INTEGRATION SETUP

### 1. Create Slack App
```
1. Go to https://api.slack.com/apps
2. Create New App
3. Name: "Security Alerts"
4. Choose your workspace
```

### 2. Add Incoming Webhooks
```
1. Left sidebar: Incoming Webhooks
2. Activate Incoming Webhooks: ON
3. Add New Webhook to Workspace
4. Select #security or create new channel
5. Copy webhook URL to .env.local
```

### 3. Add Sentry Integration
```
1. In Sentry: Organization → Integrations
2. Search "Slack"
3. Install → Select channel #security
4. Configure notifications:
   - Alert on errors: ON
   - Alert threshold: 10+ errors/min
```

### 4. Add DataDog Integration
```
1. In DataDog: Integrations → Slack
2. Click Install
3. Set default channel: #security
4. Setup alert notifications:
   - High priority: #security
   - Medium priority: #alerts
```

---

## 📈 METRICS & KPIs

Track these metrics on your monitoring dashboards:

### Availability
- **API Uptime:** Target 99.9% (allow 45 min/month downtime)
- **Webhook Success Rate:** Target 99.99% (1 failure/10k)
- **Database Connection Pool:** Monitor free connections

### Performance
- **API Response Time (p95):** Target <500ms
- **API Response Time (p99):** Target <2s
- **Database Query Time (p95):** Target <100ms
- **File Upload Time:** Target <30s for 10MB

### Security
- **Failed Auth Attempts/hour:** Alert if > 50
- **IDOR Attempts Blocked:** Goal = 0 (logged)
- **BFLA Attempts Blocked:** Goal = 0 (logged)
- **Webhook Failures/hour:** Alert if > 5

### Business
- **Successful Payments:** Track count & value
- **Trial Signups/day:** Monitor growth
- **Plan Upgrades/day:** Track conversions
- **User Churn Rate:** Goal < 5%/month

---

## 🧪 TESTING MONITORING

### Test Sentry Error Capture
```bash
# Navigate to test route in browser
curl https://your-app.com/api/test-error

# Check Sentry dashboard - should see error
```

### Test Slack Alerts
```typescript
// app/api/test-alert/route.ts
export async function GET(request) {
  try {
    throw new Error('Test error from monitoring setup');
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ ok: true });
  }
}

// Should receive in Slack #security within 30s
```

### Test DataDog Events
```bash
# Send test event via DataDog API
curl -X POST https://api.datadoghq.com/api/v1/events \
  -H "DD-API-KEY: $DATADOG_API_KEY" \
  -d '{
    "title": "Test Alert",
    "text": "This is a test event",
    "priority": "high",
    "tags": ["test", "monitoring"]
  }'
```

---

## ✅ VALIDATION CHECKLIST

After setup, verify:

- [ ] Sentry dashboard shows recent errors
- [ ] DataDog RUM tracking user sessions
- [ ] Slack #security receiving test alerts
- [ ] Performance metrics visible in DataDog
- [ ] Security events being logged and tagged
- [ ] Alerts triggering on test failures
- [ ] Email notifications working
- [ ] PagerDuty escalation working
- [ ] Session replay working in DataDog
- [ ] Custom events being tracked

---

## 📚 DOCUMENTATION LINKS

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [DataDog RUM Docs](https://docs.datadoghq.com/real_user_monitoring/)
- [DataDog Alerts](https://docs.datadoghq.com/monitors/)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)

---

**Next Steps:**
1. ✅ Install packages
2. ✅ Setup credentials
3. ✅ Configure next.config.js
4. ✅ Initialize in app
5. ✅ Create dashboards
6. ✅ Setup alerts
7. ✅ Test everything
8. ➡️ **Go to Action 2: Generate PDF Report**

