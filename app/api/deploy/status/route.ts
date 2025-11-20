// app/api/deploy/status/route.ts
/**
 * GET /api/deploy/status?pageId=...
 * Retrieves the latest deployment status for a specific page
 * Requires query parameter: pageId
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

    // Validate required query params
    if (!pageId) {
      return NextResponse.json(
        {
          error: "Missing required query parameter",
          required: ["pageId"],
        },
        { status: 400 }
      );
    }

    console.log(
      `[DeployStatus] Fetching status for page ${pageId} (tenant: ${tenantId})`
    );

    // Fetch latest deployment record from Prisma
    const record = await prisma.deploymentRecord.findFirst({
      where: {
        tenantId,
        pageId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "No deployments found for this page" },
        { status: 404 }
      );
    }

    // Return deployment status
    return NextResponse.json(
      {
        success: true,
        deployment: {
          id: record.id,
          status: record.status,
          version: record.version,
          provider: record.provider,
          urls: {
            deployed: record.deployedUrl,
            preview: record.previewUrl,
          },
          timestamps: {
            createdAt: record.createdAt,
            startedAt: record.startedAt,
            finishedAt: record.finishedAt,
            duration: record.finishedAt && record.startedAt
              ? `${Math.round((record.finishedAt.getTime() - record.startedAt.getTime()) / 1000)}s`
              : null,
          },
          error: record.error,
          metadata: record.metadata,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("[DeployStatus] Query error:", message);

    return NextResponse.json(
      {
        error: "Failed to fetch deployment status",
        details: message,
      },
      { status: 500 }
    );
  }
}
