// app/api/deploy/preview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateStaticPageArtifacts } from "@/lib/static-export/generate-static-html";
import { getTenantFromSession } from "@/lib/tenant-session";

/**
 * POST /api/deploy/preview
 * Gera HTML de preview para uma página (sem publicar)
 * 
 * @body { pageId: string, slug: string }
 * @returns { success: boolean, previewUrl?: string, previewHtml?: string, error?: string }
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

    // Em produção, você salvaria em um storage temporário (ex: S3 com TTL)
    // Por agora, retornamos o HTML para preview local
    const previewUrl = `/preview/${tenantId}/${pageId}?token=${Date.now()}`;

    return NextResponse.json(
      {
        success: true,
        previewUrl,
        previewHtml: artifacts.previewHtml,
        version: artifacts.version,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/deploy/preview]", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to generate preview" },
      { status: 500 }
    );
  }
}
