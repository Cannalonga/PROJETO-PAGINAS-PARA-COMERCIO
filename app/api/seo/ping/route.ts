/**
 * POST /api/seo/ping
 * Notifica mecanismos de busca sobre sitemap atualizado
 * Suporta: Google, Bing, Yandex
 */

import { NextResponse, NextRequest } from "next/server";
import { pingSearchEngines } from "@/lib/seo/search-engine-ping";
import { rateLimit } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: apenas 10 pings por hora (é operação cara)
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const isAllowed = await rateLimit(`seo-ping-${ip}`, 10, 3600);

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 10 pings per hour." },
        { status: 429 }
      );
    }

    const baseUrl =
      process.env.APP_BASE_URL ?? "https://app.seudominio.com";
    const sitemapUrl = `${baseUrl}/sitemap.xml`;

    // Realiza ping (executa em paralelo, fault-tolerant)
    const results = await pingSearchEngines({
      sitemapUrl,
      debug: process.env.DEBUG === "true",
    });

    // Log da operação
    console.log("[Search Engine Ping] Results:", {
      timestamp: new Date().toISOString(),
      sitemapUrl,
      summary: results.summary,
    });

    return NextResponse.json(results, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[Search Engine Ping] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to ping search engines",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/seo/ping
 * Para suporte a CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
