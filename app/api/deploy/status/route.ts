// app/api/deploy/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTenantFromSession } from "@/lib/tenant-session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/deploy/status
 * Consulta status de deployments de uma página
 * 
 * @query { pageId: string, limit?: number }
 * @returns { success: boolean, deployments?: DeploymentRecord[], error?: string }
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("pageId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  if (!pageId) {
    return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
  }

  const tenantId = await getTenantFromSession(session);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 403 });
  }

  try {
    const deployments = await prisma.deployment.findMany({
      where: {
        tenantId,
        pageId,
      },
      orderBy: { startedAt: "desc" },
      take: limit,
    });

    return NextResponse.json(
      {
        success: true,
        deployments,
        total: deployments.length,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/deploy/status]", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch deployment status" },
      { status: 500 }
    );
  }
}
