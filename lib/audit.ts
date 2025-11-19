import { prisma } from '@/lib/prisma';
import { getTenantScopedDb } from '@/lib/tenant-isolation';

export interface AuditLogInput {
  userId: string;
  tenantId: string;
  action: string; // 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
  entity: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  maskPii?: boolean; // Default: true
  requestId?: string; // Para correlacionar requisições
}

/**
 * Lista de campos SENSÍVEIS que NUNCA devem ser loggados
 */
const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'passwordSalt',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'apiSecret',
  'secret',
  'ssn',
  'creditCard',
  'cardNumber',
  'cvv',
  'pin',
  'otp',
  'totpSecret',
]);

/**
 * Mask Personally Identifiable Information (PII) in audit logs
 * Required for LGPD/GDPR compliance
 */
export function maskPii(data: Record<string, unknown>): Record<string, unknown> {
  if (!data) return data;

  const masked = { ...data };
  const piiFields = ['email', 'phone', 'cpf', 'cnpj', 'password', 'ssn', 'creditCard'];

  for (const field of piiFields) {
    if (field in masked) {
      const value = masked[field];
      
      if (typeof value === 'string') {
        if (field === 'email') {
          // email@example.com → e**@example.com
          const [localPart, domain] = value.split('@');
          masked[field] = `${localPart.charAt(0)}***@${domain}`;
        } else if (field === 'phone') {
          // +55 11 98765-4321 → +55 11 9876****
          masked[field] = value.replace(/(\d{2,4})(\d{2,4})(\d+)/g, '$1 $2 ****');
        } else if (field === 'cpf' || field === 'cnpj') {
          // 123.456.789-00 → 123.***.***-**
          masked[field] = value.replace(/\d(?=\d{2,})/g, '*');
        } else if (field === 'password' || field === 'creditCard') {
          masked[field] = '***REDACTED***';
        } else {
          masked[field] = `***${value.slice(-3)}`;
        }
      }
    }
  }

  return masked;
}

/**
 * Remove campos sensíveis de um objeto (não inclui no log)
 */
function sanitizeForAudit(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Pula campos sensíveis completamente
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      sanitized[key] = '***REDACTED***';
      continue;
    }

    // Recursivamente sanitiza objetos aninhados
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeForAudit(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (typeof item === 'object') {
          return sanitizeForAudit(item as Record<string, unknown>);
        }
        return item;
      });
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}  return masked;
}

/**
 * Create audit log entry
 */
export async function logAuditEvent(input: AuditLogInput): Promise<void> {
  try {
    // Apply PII masking by default
    const shouldMask = input.maskPii !== false;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonData: any = {
      userId: input.userId,
      tenantId: input.tenantId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      oldValues: shouldMask && input.oldValues ? maskPii(input.oldValues) : input.oldValues || {},
      newValues: shouldMask && input.newValues ? maskPii(input.newValues) : input.newValues || {},
      metadata: shouldMask && input.metadata ? maskPii(input.metadata) : input.metadata || {},
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      timestamp: new Date(),
    };

    await prisma.auditLog.create({
      data: jsonData,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - logging failures shouldn't break the main operation
  }
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(
  tenantId: string,
  filters?: {
    userId?: string;
    entity?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { tenantId };
    
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.entity) where.entity = filters.entity;
    if (filters?.action) where.action = filters.action;
    
    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters?.startDate) where.timestamp.gte = filters.startDate;
      if (filters?.endDate) where.timestamp.lte = filters.endDate;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    const total = await prisma.auditLog.count({ where });

    return { logs, total };
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    throw error;
  }
}

/**
 * Compare old and new values to detect changes
 */
export function detectChanges(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  allKeys.forEach((key) => {
    const oldValue = oldValues[key];
    const newValue = newValues[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = { old: oldValue, new: newValue };
    }
  });

  return changes;
}

/**
 * Format audit log for human reading
 */
export function formatAuditLog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: any
): string {
  const action = log.action.toLowerCase();
  const entity = log.entity.toLowerCase();
  
  let message = `${log.user?.name || 'Unknown'} ${action} ${entity} (ID: ${log.entityId})`;
  
  if (log.oldValues && log.newValues) {
    const changes = detectChanges(log.oldValues, log.newValues);
    const changesList = Object.entries(changes)
      .map(([key, { old, new: newVal }]) => `${key}: ${old} → ${newVal}`)
      .join(', ');
    message += ` [${changesList}]`;
  }
  
  return message;
}

/**
 * Export Audit Logs como CSV para compliance/auditoria externa
 * Útil para: LGPD, GDPR, conformidade regulatória
 */
export async function exportAuditLogsAsCSV(
  tenantId: string,
  filters?: {
    fromDate?: Date;
    toDate?: Date;
    action?: string;
    entity?: string;
  }
): Promise<string> {
  try {
    const auditLogs = await getAuditLogs(tenantId, {
      startDate: filters?.fromDate,
      endDate: filters?.toDate,
      limit: 10000, // Max export
    });

    // Cabeçalhos CSV
    const headers = [
      'Timestamp',
      'User ID',
      'Action',
      'Entity',
      'Entity ID',
      'Old Values',
      'New Values',
      'IP Address',
      'User Agent',
      'Request ID',
    ];

    const rows = auditLogs.logs.map((log) => [
      log.timestamp.toISOString(),
      log.userId,
      log.action,
      log.entity,
      log.entityId,
      log.oldValues ? JSON.stringify(log.oldValues) : '',
      log.newValues ? JSON.stringify(log.newValues) : '',
      log.ipAddress || '-',
      log.userAgent || '-',
      log.requestId || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  } catch (error) {
    console.error('[AUDIT-EXPORT-ERROR]', error);
    throw error;
  }
}
