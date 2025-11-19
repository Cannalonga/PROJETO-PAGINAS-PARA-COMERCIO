// app/api/deploy/publish/route.ts
/**
 * POST /api/deploy/publish
 * Publishes a page to Cloudflare R2 CDN
 * Requires authentication and valid tenant
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeDeployment } from "@/lib/deploy/deploy-manager-real.js";
import { prisma } from "@/lib/prisma.js";

/**
 * Get tenant ID from session
 * Validates that user belongs to the tenant
 */
async function getTenantFromSession(session: any): Promise<string> {
  if (!session?.user?.tenantId) {
    throw new Error("No tenant found in session");
  }

  // Optional: Verify tenant still exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
  });

  if (!tenant) {
    throw new Error("Tenant not found or inactive");
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
    let body: { pageId?: string; slug?: string } | null = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body?.pageId || !body?.slug) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["pageId", "slug"],
        },
        { status: 400 }
      );
    }

    console.log(
      `[Deploy] Publishing page ${body.pageId} for tenant ${tenantId}`
    );

    // Execute deployment
    const result = await executeDeployment({
      tenantId,
      pageId: body.pageId,
      slug: body.slug,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        deploymentId: result.id,
        status: result.status,
        version: result.version,
        deployedUrl: result.deployedUrl,
        previewUrl: result.previewUrl,
        provider: result.provider,
        startedAt: result.startedAt,
        finishedAt: result.finishedAt,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("[Deploy] Publish error:", message);

    return NextResponse.json(
      {
        error: "Deployment failed",
        details: message,
      },
      { status: 500 }
    );
  }
}
