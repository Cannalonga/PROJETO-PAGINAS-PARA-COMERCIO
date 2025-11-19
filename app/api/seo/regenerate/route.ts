/**
 * POST /api/seo/regenerate
 * Força regeneração de sitemap
 * Útil após deploy ou atualização em massa de páginas
 */

import { NextResponse, NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limiter";

interface RegenerateRequest {
  tenantId?: string;
  tenantSlug?: string;
  pingAfter?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // Validação: apenas POST com auth (TODO: adicionar auth real)
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limiting: máximo 5 regenerações por hora
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const isAllowed = await rateLimit(`seo-regenerate-${ip}`, 5, 3600);

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 5 regenerations per hour." },
        { status: 429 }
      );
    }

    const body: RegenerateRequest = await req.json().catch(() => ({}));
    const { tenantId, tenantSlug, pingAfter = false } = body;

    if (!tenantId && !tenantSlug) {
      return NextResponse.json(
        { error: "tenantId or tenantSlug required" },
        { status: 400 }
      );
    }

    // TODO: Implementar lógica de regeneração
    // 1. Invalidar cache do sitemap
    // 2. Recompuor lista de páginas
    // 3. Gerar novo sitemap.xml
    // 4. Se pingAfter=true, notificar mecanismos de busca

    const regenerationId = `regen-${Date.now()}`;

    console.log("[Sitemap Regeneration] Started", {
      regenerationId,
      tenantId,
      tenantSlug,
      pingAfter,
      timestamp: new Date().toISOString(),
    });

    // Simula regeneração assíncrona
    // Em produção, isso seria background job (queue)
    setTimeout(async () => {
      console.log("[Sitemap Regeneration] Completed", {
        regenerationId,
        timestamp: new Date().toISOString(),
      });

      // Se pingAfter, notificar search engines
      if (pingAfter) {
        const baseUrl =
          process.env.APP_BASE_URL ?? "https://app.seudominio.com";
        const sitemapUrl = tenantSlug
          ? `${baseUrl}/${tenantSlug}/sitemap.xml`
          : `${baseUrl}/sitemap.xml`;

        try {
          const { pingSearchEngines } = await import(
            "@/lib/seo/search-engine-ping"
          );
          await pingSearchEngines({ sitemapUrl });
        } catch (err) {
          console.error("[Sitemap Ping] Failed after regeneration:", err);
        }
      }
    }, 1000);

    return NextResponse.json(
      {
        success: true,
        regenerationId,
        message: "Sitemap regeneration started",
        status: "processing",
        tenantId,
        tenantSlug,
        pingAfter,
      },
      {
        status: 202, // Accepted
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Sitemap Regeneration] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to regenerate sitemap",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/seo/regenerate
 * Para suporte a CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
