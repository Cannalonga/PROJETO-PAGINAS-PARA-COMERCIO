// app/api/deploy/preview/route.ts
/**
 * POST /api/deploy/preview
 * Generates static page preview without publishing to CDN
 * Useful for internal testing and review before deployment
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Get tenant ID from session
 * TODO: Configure with your actual tenant resolution logic
 */
async function getTenantFromSession(session: any): Promise<string | null> {
  // Placeholder implementation
  return session?.user?.tenantId || null;
}

/**
 * Placeholder for generateStaticPageArtifacts
 * TODO: Import from @/lib/static-export/generate-static-page when available
 */
async function generateStaticPageArtifacts(ctx: {
  tenantId: string;
  pageId: string;
  slug: string;
}) {
  return {
    version: `v-${Date.now()}`,
    html: "<html><body>Preview HTML</body></html>",
    previewHtml: "<html><body>Preview</body></html>",
    sitemapEntry: `<url><loc>/${ctx.slug}</loc></url>`,
    assets: [],
    deployedUrl: undefined,
    previewUrl: undefined,
  };
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
      `[Preview] Generating preview for page ${body.pageId} (tenant: ${tenantId})`
    );

    // Generate artifacts
    const artifacts = await generateStaticPageArtifacts({
      tenantId,
      pageId: body.pageId,
      slug: body.slug,
    });

    // Return preview response
    return NextResponse.json(
      {
        success: true,
        version: artifacts.version,
        previewHtml: artifacts.previewHtml,
        sitemapEntry: artifacts.sitemapEntry,
        assetCount: artifacts.assets.length,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("[Preview] Generation error:", message);

    return NextResponse.json(
      {
        error: "Preview generation failed",
        details: message,
      },
      { status: 500 }
    );
  }
}
