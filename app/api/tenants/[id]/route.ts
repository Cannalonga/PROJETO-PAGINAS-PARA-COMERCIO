import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/utils/helpers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        pages: true,
        users: true,
      },
    });

    if (!tenant) {
      return NextResponse.json(errorResponse('NOT_FOUND', 'Tenant not found'), {
        status: 404,
      });
    }

    return NextResponse.json(successResponse(tenant, 'Tenant retrieved successfully'));
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch tenant'),
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const tenant = await prisma.tenant.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(successResponse(tenant, 'Tenant updated successfully'));
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(errorResponse('NOT_FOUND', 'Tenant not found'), {
        status: 404,
      });
    }
    console.error('Error updating tenant:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_SERVER_ERROR', 'Failed to update tenant'),
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.tenant.delete({
      where: { id },
    });

    return NextResponse.json(successResponse(null, 'Tenant deleted successfully'));
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(errorResponse('NOT_FOUND', 'Tenant not found'), {
        status: 404,
      });
    }
    console.error('Error deleting tenant:', error);
    return NextResponse.json(
      errorResponse('INTERNAL_SERVER_ERROR', 'Failed to delete tenant'),
      { status: 500 }
    );
  }
}
