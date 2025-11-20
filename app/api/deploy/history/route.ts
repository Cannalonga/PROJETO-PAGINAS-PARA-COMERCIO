// app/api/deploy/history/route.ts
/**
 * GET /api/deploy/history?pageId=...&limit=...
 * Retrieves deployment history for a page or all pages in tenant
 * Optional query params: pageId, limit (default 20, max 100)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get tenant ID from session
 */
async function getTenantFromSession(session: any): Promise<string> {
  if (!session?.user?.tenantId) {
    throw new Error("No tenant found in session");
  }
  return session.user.tenantId;
}

export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized: No active session" },
        { status: 401 }
      );
    }

    // Tenant resolution
    const tenantId = await getTenantFromSession(session);
    if (!tenantId) {
      return NextResponse.json(
        { error: "Forbidden: Tenant not found for user" },
        { status: 403 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("pageId");
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);
    const limit = Math.min(limitParam, 100); // Max 100 records
    const offset = (pageParam - 1) * limit;

    console.log(
      `[DeployHistory] Fetching history for tenant ${tenantId}${
        pageId ? ` page ${pageId}` : ""
      } (limit: ${limit}, offset: ${offset})`
    );

    // Fetch deployment history from Prisma
    const [records, total] = await Promise.all([
      prisma.deploymentRecord.findMany({
        where: {
          tenantId,
          ...(pageId ? { pageId } : {}),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.deploymentRecord.count({
        where: {
          tenantId,
          ...(pageId ? { pageId } : {}),
        },
      }),
    ]);

    // Return deployment history
    return NextResponse.json(
      {
        success: true,
        deployments: records.map((r) => ({
          id: r.id,
          version: r.version,
          status: r.status,
          provider: r.provider,
          urls: {
            deployed: r.deployedUrl,
            preview: r.previewUrl,
          },
          timestamps: {
            createdAt: r.createdAt,
            startedAt: r.startedAt,
            finishedAt: r.finishedAt,
          },
          error: r.error,
        })),
        pagination: {
          count: records.length,
          limit,
          offset,
          total,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("[DeployHistory] Query error:", message);

    return NextResponse.json(
      {
        error: "Failed to fetch deployment history",
        details: message,
      },
      { status: 500 }
    );
  }
}
