import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, paginatedResponse } from '@/utils/helpers';

/**
 * GET /api/audit-logs
 * Retrieve audit logs for compliance and monitoring
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userTenantId = request.headers.get('x-tenant-id');

    if (!userId || userRole !== 'SUPERADMIN') {
      return NextResponse.json(
        errorResponse('Apenas SUPERADMIN pode acessar auditoria'),
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
    const tenantId = searchParams.get('tenantId') || userTenantId;
    const action = searchParams.get('action');
    const entity = searchParams.get('entity');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (tenantId) where.tenantId = tenantId;
    if (action) where.action = action;
    if (entity) where.entity = entity;

    const skip = (page - 1) * pageSize;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const formattedLogs = logs.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (log: any) => ({
        ...log,
        timestamp: log.timestamp.toISOString(),
      })
    );

    return NextResponse.json(
      paginatedResponse(formattedLogs, total, page, pageSize),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      errorResponse('Erro ao buscar auditoria'),
      { status: 500 }
    );
  }
}
