/**
 * GET /[tenantSlug]/sitemap.xml
 * Retorna sitemap do tenant específico com suporte multi-idioma (PT, EN, ES)
 */

import { NextResponse, NextRequest } from "next/server";
import { buildSitemapXml } from "@/lib/seo/sitemap-generator";
import type { SitemapPage, SitemapContext } from "@/lib/seo/seo-sitemap-types";

interface RouteParams {
  params: {
    tenantSlug: string;
  };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { tenantSlug } = params;

    // Valida tenant slug
    if (!tenantSlug || typeof tenantSlug !== "string") {
      return new NextResponse("Invalid tenant", { status: 400 });
    }

    // Constrói base URL
    const baseUrl = process.env.APP_BASE_URL
      ? `${process.env.APP_BASE_URL}/${tenantSlug}`
      : `https://app.seudominio.com/${tenantSlug}`;

    const ctx: SitemapContext = {
      baseUrl,
      defaultLocale: "pt-BR",
      tenantId: tenantSlug,
    };

    // TODO: Substituir por query real do Prisma
    // Buscar todas as páginas publicadas do tenant com suas localizações
    // SELECT * FROM Page WHERE tenantId = ? AND isPublished = true
    // JOIN PageLocale para cada variação de idioma
    const pages: SitemapPage[] = [
      {
        pageId: "page-home-1",
        tenantId: tenantSlug,
        baseSlug: "home",
        isPublished: true,
        updatedAt: new Date(),
        priority: 1.0,
        changefreq: "daily",
        locales: [
          {
            locale: "pt-BR",
            slug: "pt",
            isDefault: true,
          },
          {
            locale: "en-US",
            slug: "en",
          },
          {
            locale: "es-ES",
            slug: "es",
          },
        ],
      },
      {
        pageId: "page-loja-1",
        tenantId: tenantSlug,
        baseSlug: "pizzaria-do-joao",
        isPublished: true,
        updatedAt: new Date(Date.now() - 3600000), // 1 hora atrás
        priority: 0.8,
        changefreq: "weekly",
        locales: [
          {
            locale: "pt-BR",
            slug: "pt/pizzaria-do-joao",
            isDefault: true,
          },
          {
            locale: "en-US",
            slug: "en/joes-pizza",
          },
          {
            locale: "es-ES",
            slug: "es/pizzeria-juan",
          },
        ],
      },
      {
        pageId: "page-about-1",
        tenantId: tenantSlug,
        baseSlug: "about",
        isPublished: true,
        updatedAt: new Date(Date.now() - 86400000), // 1 dia atrás
        priority: 0.7,
        changefreq: "monthly",
        locales: [
          {
            locale: "pt-BR",
            slug: "pt/sobre",
            isDefault: true,
          },
          {
            locale: "en-US",
            slug: "en/about",
          },
          {
            locale: "es-ES",
            slug: "es/acerca-de",
          },
        ],
      },
    ];

    // TODO: Opcional - integrar com Feature 6 (DeploymentRecord)
    // Buscar lastmod real de cada página baseado no deploy mais recente
    // const lastmodByPageId = await getLastmodFromDeployments(tenantId);
    const lastmodByPageId = undefined;

    // Gera XML com suporte a hreflang
    const xml = buildSitemapXml(pages, ctx, { lastmodByPageId });

    // Cache por 12 horas (sitemap por tenant varia pouco)
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=43200, s-maxage=43200",
      },
    });
  } catch (error) {
    console.error("[Sitemap Tenant] Error:", error);

    // Retorna sitemap vazio em caso de erro
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
</urlset>`,
      {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
}
