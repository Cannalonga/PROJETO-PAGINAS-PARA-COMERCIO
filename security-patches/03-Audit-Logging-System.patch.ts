/**
 * PATCH #3: Audit Logging System
 * Vulnerability: CVSS 7.5 - Insufficient Logging & Monitoring
 * 
 * Impact: Can't detect attacks, forensics impossible, compliance violation (GDPR/SOC2)
 * 
 * HOW TO APPLY:
 * 1. Add schema to prisma/schema.prisma (see below)
 * 2. Create migration: npx prisma migrate dev --name "add_audit_logs"
 * 3. Add logAuditEvent() helper to lib/audit.ts (see below)
 * 4. Import in all critical routes: import { logAuditEvent } from '@/lib/audit'
 * 5. Call in routes: await logAuditEvent({...})
 * 6. Setup monitoring alerts on: logLevel=ERROR, action=*_DENIED, action=*_DELETE
 */

// ============================================================================
// STEP 1: Update prisma/schema.prisma
// ============================================================================

/*
Add this to your Prisma schema:

model AuditLog {
  id             String    @id @default(cuid())
  userId         String    // Who did it
  tenantId       String    // Which organization
  
  action         String    // USER_VIEW, ADMIN_VIP_UPGRADE, LOGIN_FAILED, etc
  resourceId     String?   // What (user ID, store ID, etc)
  resourceType   String?   // 'user', 'store', 'payment', etc
  
  status         String    // SUCCESS, FAILED
  logLevel       String    // INFO, WARNING, ERROR (for alerts)
  
  details        Json?     // Additional context
  changes        Json?     // Before/After for updates
  error          String?   // Error message if status=FAILED
  
  ipAddress      String?   // User IP (from headers)
  userAgent      String?   // Browser info
  
  timestamp      DateTime  @default(now()) @db.Timestamp(3)
  
  @@index([userId])
  @@index([tenantId])
  @@index([action])
  @@index([timestamp])
  @@index([status])
  @@fulltext([action]) // For search
}

// Add to User model:
model User {
  // ... existing fields
  auditLogs      AuditLog[] // Relationship
}

// Add to Store model:
model Store {
  // ... existing fields
  auditLogs      AuditLog[] // Relationship
}
*/

// ============================================================================
// STEP 2: Create lib/audit.ts - Audit Logging Helper
// ============================================================================

import { prisma } from '@/db/prisma';
import { headers } from 'next/headers';

export interface AuditEventPayload {
  userId: string;
  tenantId: string;
  action: string;
  resourceId?: string;
  resourceType?: string;
  status: 'SUCCESS' | 'FAILED';
  logLevel?: 'INFO' | 'WARNING' | 'ERROR';
  details?: Record<string, any>;
  changes?: Record<string, any>;
  error?: string;
}

/**
 * Log security-relevant events to audit trail
 * Called from every critical API route
 */
export async function logAuditEvent(payload: AuditEventPayload) {
  try {
    const headersList = headers();
    const ipAddress = 
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Determine log level
    let logLevel = payload.logLevel || 'INFO';
    if (payload.status === 'FAILED') {
      logLevel = 'ERROR';
    }
    if (payload.action.includes('DELETE') || payload.action.includes('DENIED')) {
      logLevel = 'WARNING';
    }

    // Create audit log
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: payload.userId,
        tenantId: payload.tenantId,
        action: payload.action,
        resourceId: payload.resourceId,
        resourceType: payload.resourceType,
        status: payload.status,
        logLevel,
        details: payload.details,
        changes: payload.changes,
        error: payload.error,
        ipAddress,
        userAgent,
      },
    });

    // ✅ CRITICAL: Alert on security events
    if (
      logLevel === 'ERROR' ||
      payload.action.includes('_DENIED') ||
      payload.action.includes('DELETE')
    ) {
      await sendSecurityAlert({
        action: payload.action,
        userId: payload.userId,
        tenantId: payload.tenantId,
        status: payload.status,
        logLevel,
        resourceId: payload.resourceId,
        ipAddress,
        timestamp: new Date(),
      });
    }

    return auditLog;
  } catch (error) {
    // Don't crash if audit logging fails, but log it
    console.error('[CRITICAL] Audit logging failed:', error);
  }
}

/**
 * Send alerts for security events (integration with Sentry, DataDog, etc)
 */
async function sendSecurityAlert(event: Record<string, any>) {
  try {
    // Sentry integration
    if (process.env.SENTRY_DSN) {
      Sentry.captureMessage(`Security Event: ${event.action}`, {
        level: event.logLevel === 'ERROR' ? 'error' : 'warning',
        tags: {
          action: event.action,
          status: event.status,
        },
        extra: event,
      });
    }

    // DataDog integration
    if (process.env.DATADOG_API_KEY) {
      // Send to DataDog API
      await fetch('https://http-intake.logs.datadoghq.com/v1/input', {
        method: 'POST',
        headers: {
          'DD-API-KEY': process.env.DATADOG_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ddsource: 'nodejs',
          ddtags: `action:${event.action},env:production`,
          message: `[${event.logLevel}] ${event.action}`,
          timestamp: Date.now(),
          ...event,
        }),
      });
    }

    // Slack webhook (optional)
    if (process.env.SLACK_SECURITY_WEBHOOK && event.logLevel === 'ERROR') {
      await fetch(process.env.SLACK_SECURITY_WEBHOOK, {
        method: 'POST',
        body: JSON.stringify({
          text: `🚨 Security Alert: ${event.action}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${event.action}*\nUser: ${event.userId}\nIP: ${event.ipAddress}\nStatus: ${event.status}`,
              },
            },
          ],
        }),
      });
    }
  } catch (error) {
    console.error('[ERROR] Failed to send security alert:', error);
  }
}

// ============================================================================
// STEP 3: Usage Examples - Add to ALL critical routes
// ============================================================================

/*
LOGIN SUCCESS:
await logAuditEvent({
  userId: user.id,
  tenantId: user.tenantId,
  action: 'LOGIN_SUCCESS',
  status: 'SUCCESS',
  logLevel: 'INFO',
  details: { method: 'credentials', ip: '192.168.1.1' }
});

LOGIN FAILURE (Brute Force Attempt):
await logAuditEvent({
  userId: email,
  tenantId: 'unknown',
  action: 'LOGIN_FAILED',
  status: 'FAILED',
  logLevel: 'ERROR',
  error: 'Invalid password',
  details: { attempt: 3, ipAddress: '192.168.1.100' }
});

USER DELETION (Sensitive):
await logAuditEvent({
  userId: adminId,
  tenantId: adminTenantId,
  action: 'USER_DELETE',
  resourceId: targetUserId,
  resourceType: 'user',
  status: 'SUCCESS',
  logLevel: 'WARNING',
  changes: { deleted: true, email: targetEmail }
});

UNAUTHORIZED ACCESS ATTEMPT:
await logAuditEvent({
  userId: sessionUserId,
  tenantId: sessionTenantId,
  action: 'IDOR_ATTEMPT',
  resourceId: targetResourceId,
  status: 'FAILED',
  logLevel: 'ERROR',
  error: 'User tried to access resource outside own tenant'
});

STRIPE WEBHOOK FAILURE:
await logAuditEvent({
  userId: 'system',
  tenantId: 'system',
  action: 'WEBHOOK_STRIPE_FAILED',
  resourceType: 'payment',
  status: 'FAILED',
  logLevel: 'ERROR',
  error: 'Failed to process payment event',
  details: { eventType: 'charge.succeeded', error: 'DB error' }
});
*/

// ============================================================================
// STEP 4: Query Audit Logs (Admin Dashboard)
// ============================================================================

export async function getAuditLogs(
  tenantId: string,
  filters?: {
    userId?: string;
    action?: string;
    status?: 'SUCCESS' | 'FAILED';
    logLevel?: 'INFO' | 'WARNING' | 'ERROR';
    startDate?: Date;
    endDate?: Date;
  }
) {
  const logs = await prisma.auditLog.findMany({
    where: {
      tenantId,
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.action && { action: { contains: filters.action } }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.logLevel && { logLevel: filters.logLevel }),
      ...(filters?.startDate && { timestamp: { gte: filters.startDate } }),
      ...(filters?.endDate && { timestamp: { lte: filters.endDate } }),
    },
    orderBy: { timestamp: 'desc' },
    take: 1000,
  });

  return logs;
}

// ============================================================================
// STEP 5: Setup Retention & Cleanup
// ============================================================================

/*
// Create scheduled task (cron job) to clean old logs
// Run daily at 2 AM: 0 2 * * *

export async function cleanupOldAuditLogs() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const deleted = await prisma.auditLog.deleteMany({
    where: {
      timestamp: { lt: thirtyDaysAgo },
      logLevel: 'INFO', // Keep ERROR/WARNING longer
    },
  });
  
  console.log(`[AUDIT] Deleted ${deleted.count} old audit logs`);
}

// Or use Prisma's built-in cleanup:
model AuditLog {
  // ... fields ...
  timestamp DateTime @default(now()) @db.Timestamp(3) @map("created_at")
  
  // Auto-delete after 90 days
  @@map("audit_logs")
}
*/

// ============================================================================
// STEP 6: API Endpoint for Admin to View Audit Logs
// ============================================================================

/*
// File: app/api/admin/audit-logs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getAuditLogs } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.isAuthorized) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const status = searchParams.get('status') as 'SUCCESS' | 'FAILED' | undefined;
    const logLevel = searchParams.get('logLevel') as 'INFO' | 'WARNING' | 'ERROR' | undefined;

    const logs = await getAuditLogs(auth.session.user.tenantId, {
      userId: userId || undefined,
      action: action || undefined,
      status: status,
      logLevel: logLevel,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    });

    return NextResponse.json({
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error('[ERROR] GET /api/admin/audit-logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// MONITORING ALERTS TO SETUP
// ============================================================================

/*
CRITICAL ALERTS (Immediate):
  - logLevel = 'ERROR' → Slack + Email + PagerDuty
  - action contains 'DELETE' → Log + Review
  - action contains 'DENIED' → Count and alert if >10/hour
  - action = 'LOGIN_FAILED' → Alert if >5 from same IP/hour

HIGH PRIORITY:
  - ADMIN actions (VIP_UPGRADE, TRIAL_EXTEND, SETTINGS_CHANGE)
  - Payment webhook failures
  - Authentication issues

DASHBOARD METRICS:
  - Failed login attempts (24h)
  - IDOR/BFLA attempts blocked
  - Admin actions count
  - System errors count
  - Webhook success rate
*/
