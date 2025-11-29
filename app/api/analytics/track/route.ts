import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const trackSchema = z.object({
    tenantId: z.string(),
    eventType: z.enum(['PAGE_VIEW', 'BUTTON_CLICK', 'WHATSAPP_CLICK']),
    metadata: z.record(z.any()).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tenantId, eventType, metadata } = trackSchema.parse(body);

        // Salvar evento de forma assíncrona (fire and forget para não travar o cliente)
        // Mas em serverless precisamos esperar, então vamos fazer rápido
        await prisma.analyticsEvent.create({
            data: {
                tenantId,
                eventType,
                metadata: metadata || {},
                // userAgent e ipAddress poderiam ser extraídos dos headers se necessário
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics error:', error);
        // Não retornar erro 500 para não quebrar a experiência do usuário
        return NextResponse.json({ success: false }, { status: 200 });
    }
}
