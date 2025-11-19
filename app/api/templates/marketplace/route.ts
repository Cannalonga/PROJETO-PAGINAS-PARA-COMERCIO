import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minRating = parseInt(searchParams.get('minRating') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    const whereClause: any = {
      isPublic: true,
    };

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch templates
    const templates = await prisma.template.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    // Fetch metrics for each template
    const templatesWithStats = await Promise.all(
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

    // Filter by minRating if needed
    const filtered =
      minRating > 0
        ? templatesWithStats.filter((t) => (t.stats?.averageRating || 0) >= minRating)
        : templatesWithStats;

    // Get total count
    const total = await prisma.template.count({ where: whereClause });

    return NextResponse.json({
      success: true,
      data: filtered,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching marketplace templates:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
