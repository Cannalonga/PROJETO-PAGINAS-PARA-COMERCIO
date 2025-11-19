// app/api/deploy/rollback/route.ts
/**
 * POST /api/deploy/rollback
 * Initiates rollback to a previous stable deployment
 * Finds the last successful deployment for a page
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma.js";
import { rollbackDeployment } from "@/lib/deploy/deploy-manager-real.js";

/**
 * Get tenant ID from session
 */
async function getTenantFromSession(session: any): Promise<string> {
  if (!session?.user?.tenantId) {
    throw new Error("No tenant found in session");
  }
  return session.user.tenantId;
}

export async function POST(req: NextRequest) {
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

    // Parse request body
    let body: { pageId?: string } | null = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body?.pageId) {
      return NextResponse.json(
        {
          error: "Missing required field",
          required: ["pageId"],
        },
        { status: 400 }
      );
    }

    console.log(
      `[Rollback] Initiating rollback for page ${body.pageId} (tenant: ${tenantId})`
    );

    // Find last successful deployment
    const lastSuccess = await prisma.deploymentRecord.findFirst({
      where: {
        tenantId,
        pageId: body.pageId,
        status: 'COMPLETED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: 1, // Skip the current latest
    });

    if (!lastSuccess) {
      return NextResponse.json(
        { error: "No successful deployments to rollback to" },
        { status: 404 }
      );
    }

    console.log(
      `[Rollback] Found candidate: ${lastSuccess.version} (${lastSuccess.id})`
    );

    // Execute rollback using deploy-manager
    try {
      const rollbackResult = await rollbackDeployment(
        tenantId,
        body.pageId,
        body.slug || lastSuccess.slug,
        body.targetVersion
      );

      return NextResponse.json(
        {
          success: true,
          message: 'Rollback initiated successfully',
          targetDeployment: {
            id: rollbackResult.id,
            version: rollbackResult.version,
            status: rollbackResult.status,
            deployedUrl: rollbackResult.deployedUrl,
          },
          nextSteps: [
            'Rollback is being processed',
            'CDN will be updated shortly',
            'Check status with GET /api/deploy/status',
          ],
        },
        { status: 200 }
      );
    } catch (rollbackErr) {
      const msg = rollbackErr instanceof Error ? rollbackErr.message : 'Unknown error';
      return NextResponse.json(
        {
          success: false,
          error: 'Rollback execution failed',
          details: msg,
        },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("[Rollback] Error:", message);

    return NextResponse.json(
      {
        error: "Rollback initiation failed",
        details: message,
      },
      { status: 500 }
    );
  }
}
