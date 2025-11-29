import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
        // Buscar eventos de PAGE_VIEW dos últimos X dias
        const events = await prisma.analyticsEvent.findMany({
            where: {
                tenantId,
                eventType: 'PAGE_VIEW',
                createdAt: {
                    gte: startDate,
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Agrupar por dia
        const dailyStats = new Map<string, number>();

        // Inicializar dias com 0
        for (let i = 0; i < days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            dailyStats.set(dateStr, 0);
        }

        // Contar eventos
        events.forEach(event => {
            const dateStr = new Date(event.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (dailyStats.has(dateStr)) {
                dailyStats.set(dateStr, (dailyStats.get(dateStr) || 0) + 1);
            }
        });

        // Converter para array reverso (cronológico)
        const chartData = Array.from(dailyStats.entries())
            .map(([date, count]) => ({ date, count }))
            .reverse();

        const totalViews = events.length;

        return NextResponse.json({
            totalViews,
            chartData,
        });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
