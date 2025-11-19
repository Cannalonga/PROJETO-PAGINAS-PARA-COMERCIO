/**
 * GET /robots.txt
 * Retorna robots.txt global para o sistema
 */

import { NextResponse } from "next/server";
import { generateRobotsTxt } from "@/lib/seo/robots-generator";

export async function GET() {
  try {
    const baseUrl = process.env.APP_BASE_URL ?? "https://app.seudominio.com";
    const isProduction = process.env.NODE_ENV === "production";

    // Parse hostname a partir da URL
    const hostname = new URL(baseUrl).hostname;

    // Gera robots.txt
    const robots = generateRobotsTxt({
      host: hostname,
      sitemapUrl: `${baseUrl}/sitemap.xml`,
      isProduction,
      additionalDisallows: [
        "/tenant/*/admin",
        "/tenant/*/api",
        "/?draft=1",
        "/?preview=1",
      ],
    });

    // Cache por 7 dias (robots.txt varia raramente)
    return new NextResponse(robots, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=604800, s-maxage=604800",
      },
    });
  } catch (error) {
    console.error("[Robots.txt] Error:", error);

    // Fallback seguro
    return new NextResponse("User-agent: *\nDisallow: /", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}
