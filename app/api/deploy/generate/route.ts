// app/api/deploy/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateStaticPageArtifacts } from "@/lib/static-export/generate-static-html";
import { getTenantFromSession } from "@/lib/tenant-session";

/**
 * POST /api/deploy/generate
 * Gera artefatos estáticos para uma página (sem publicar em CDN)
 * Útil para dry-run ou verificações locais
 * 
 * @body { pageId: string, slug: string }
 * @returns { success: boolean, artifacts?: StaticPageArtifacts, error?: string }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId, slug } = await req.json();
  if (!pageId || !slug) {
    return NextResponse.json({ error: "Missing pageId or slug" }, { status: 400 });
  }

  const tenantId = await getTenantFromSession(session);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 403 });
  }

  try {
    const artifacts = await generateStaticPageArtifacts({
      tenantId,
      pageId,
      slug,
    });

    return NextResponse.json(
      {
        success: true,
        version: artifacts.version,
        htmlSize: artifacts.html.length,
        previewSize: artifacts.previewHtml.length,
        assetsCount: artifacts.assets.length,
        assetsTotalSize: artifacts.assets.reduce((sum, a) => sum + a.size, 0),
        metadata: {
          generatedAt: new Date(),
          previewUrl: artifacts.previewUrl,
          deployedUrl: artifacts.deployedUrl,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/deploy/generate]", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to generate artifacts" },
      { status: 500 }
    );
  }
}
