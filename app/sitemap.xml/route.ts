/**
 * GET /sitemap.xml
 * Retorna sitemap global (index multi-tenant)
 */

import { NextResponse } from "next/server";
import { buildSitemapIndexXml } from "@/lib/seo/sitemap-index";

export async function GET() {
  try {
    // TODO: Substituir por query real do Prisma
    // Buscar todos os tenants ativos com updatedAt
    const tenants = [
      { slug: "tenant-a", updatedAt: new Date() },
      { slug: "tenant-b", updatedAt: new Date() },
      { slug: "tenant-c", updatedAt: new Date(Date.now() - 86400000) }, // 1 dia atrás
    ];

    const baseUrl = process.env.APP_BASE_URL ?? "https://app.seudominio.com";

    // Constrói entries de sitemap index
    const entries = tenants.map((t) => ({
      loc: `${baseUrl}/${t.slug}/sitemap.xml`,
      lastmod: t.updatedAt.toISOString(),
    }));

    // Gera XML
    const xml = buildSitemapIndexXml(entries);

    // Cache por 24 horas (sitemap varia pouco)
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[Sitemap Global] Error:", error);

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</sitemapindex>`,
      {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
}
