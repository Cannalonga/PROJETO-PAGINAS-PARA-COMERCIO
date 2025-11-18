import { prisma } from '@/lib/prisma';

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
}

/**
 * Create audit log entry
 */
export async function logAuditEvent(input: AuditLogInput): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonData: any = {
      userId: input.userId,
      tenantId: input.tenantId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      oldValues: input.oldValues || {},
      newValues: input.newValues || {},
      metadata: input.metadata || {},
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
