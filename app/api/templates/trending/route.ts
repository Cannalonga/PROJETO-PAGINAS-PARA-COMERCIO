import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Fetch templates with trending criteria
    const templates = await prisma.template.findMany({
      where: {
        isPublic: true,
      },
      include: {
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: [
        { views: 'desc' }, // Higher views = more popular
        { clones: 'desc' }, // More clones = more useful
      ],
      take: limit,
    });

    // Fetch metrics for each
    const trending = await Promise.all(
      templates.map(async (template) => {
        const metrics = await prisma.templateMetrics?.findUnique({
          where: { templateId: template.id },
        });

        return {
          ...template,
          stats: {
            views: metrics?.views || 0,
            clones: metrics?.clones || 0,
            averageRating: metrics?.averageRating || 0,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: trending,
      count: trending.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching trending templates:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
