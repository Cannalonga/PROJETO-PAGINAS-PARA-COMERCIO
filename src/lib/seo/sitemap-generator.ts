/**
 * Sitemap Generator — Multi-language + Multi-tenant
 * Gera sitemap.xml com suporte a múltiplos idiomas e hreflang
 */

import type {
  SitemapPage,
  SitemapContext,
  SitemapUrlEntry,
  PageLocaleInfo,
} from "./seo-sitemap-types";

/**
 * Escapa caracteres especiais para XML seguro
 * Necessário para evitar quebra de parsing XML
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Constrói URL absoluta a partir de base URL e slug
 * Sanitiza slashes para evitar duplicações
 *
 * @example
 * buildAbsoluteUrl("https://example.com", "pt/pizzaria") → "https://example.com/pt/pizzaria"
 */
export function buildAbsoluteUrl(baseUrl: string, slug: string): string {
  const sanitizedBase = baseUrl.replace(/\/+$/, "");
  const sanitizedSlug = slug.replace(/^\/+/, "");
  return `${sanitizedBase}/${sanitizedSlug}`;
}

/**
 * Constrói tags hreflang para uma página com múltiplos idiomas
 * Inclui x-default apontando para locale default
 *
 * @returns Array de links hreflang com locale e href
 */
export function buildHreflangForPageLocales(
  baseUrl: string,
  locales: PageLocaleInfo[]
): SitemapUrlEntry["hreflang"] {
  if (!locales || locales.length === 0) return undefined;

  const links: SitemapUrlEntry["hreflang"] = [];

  // Adiciona cada locale encontrado
  for (const locale of locales) {
    const href = buildAbsoluteUrl(baseUrl, locale.slug);
    links.push({
      locale: locale.locale,
      href,
    });
  }

  // x-default = primeiro com isDefault, fallback pt-BR, ou primeiro disponível
  const defaultLocale =
    locales.find((l) => l.isDefault) ||
    locales.find((l) => l.locale === "pt-BR") ||
    locales[0];

  if (defaultLocale) {
    links.push({
      locale: "x-default",
      href: buildAbsoluteUrl(baseUrl, defaultLocale.slug),
    });
  }

  return links;
}

/**
 * Constrói entrada de sitemap para uma página com múltiplos idiomas
 * Retorna array pois uma página pode gerar múltiplas URLs
 *
 * Estratégia: Usa URL do locale default como <loc>,
 * inclui todas as variações com <xhtml:link rel="alternate" hreflang="...">
 */
export function buildSitemapEntryForPage(
  page: SitemapPage,
  ctx: SitemapContext,
  lastmodOverride?: Date
): SitemapUrlEntry[] {
  // Páginas não-publicadas não aparecem no sitemap
  if (!page.isPublished) return [];

  const entries: SitemapUrlEntry[] = [];

  // Valida que há locales
  if (!page.locales || page.locales.length === 0) {
    console.warn(`Page ${page.pageId} has no locales, skipping sitemap entry`);
    return [];
  }

  // Constrói hreflang com todas as variações
  const hreflang = buildHreflangForPageLocales(ctx.baseUrl, page.locales);

  // Usa locale default ou primeiro disponível
  const defaultLocale =
    page.locales.find((l) => l.isDefault) || page.locales[0];

  const loc = buildAbsoluteUrl(ctx.baseUrl, defaultLocale.slug);
  const lastmodDate = lastmodOverride ?? page.updatedAt;

  entries.push({
    loc,
    lastmod: lastmodDate.toISOString(),
    changefreq: page.changefreq ?? "weekly",
    priority: page.priority ?? 0.5,
    hreflang,
  });

  return entries;
}

/**
 * Constrói XML de sitemap completo (urlset)
 * Inclui namespace para suporte a hreflang
 *
 * Exemplo de output:
 * <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
 *         xmlns:xhtml="http://www.w3.org/1999/xhtml">
 *   <url>
 *     <loc>https://example.com/pt/pizzaria</loc>
 *     <xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/en/pizza-shop" />
 *     <xhtml:link rel="alternate" hreflang="es-ES" href="https://example.com/es/pizzeria" />
 *     ...
 *   </url>
 * </urlset>
 */
export function buildSitemapXml(
  pages: SitemapPage[],
  ctx: SitemapContext,
  options?: {
    /** Map de pageId → lastmod override (ex: do deploy system) */
    lastmodByPageId?: Record<string, Date>;
  }
): string {
  const urls: SitemapUrlEntry[] = [];

  // Processa cada página
  for (const page of pages) {
    const lastmod =
      options?.lastmodByPageId?.[page.pageId] ?? page.updatedAt;

    const entries = buildSitemapEntryForPage(page, ctx, lastmod);
    urls.push(...entries);
  }

  // Serializa URLs para XML
  const xmlUrls = urls
    .map((u) => {
      const parts: string[] = [];

      parts.push(`<loc>${escapeXml(u.loc)}</loc>`);

      if (u.lastmod) {
        parts.push(`<lastmod>${escapeXml(u.lastmod)}</lastmod>`);
      }

      if (u.changefreq) {
        parts.push(`<changefreq>${u.changefreq}</changefreq>`);
      }

      if (typeof u.priority === "number") {
        parts.push(`<priority>${u.priority.toFixed(1)}</priority>`);
      }

      // Hreflang com namespace xhtml
      if (u.hreflang && u.hreflang.length > 0) {
        for (const link of u.hreflang) {
          parts.push(
            `<xhtml:link rel="alternate" hreflang="${escapeXml(
              link.locale
            )}" href="${escapeXml(link.href)}" />`
          );
        }
      }

      return `<url>${parts.join("")}</url>`;
    })
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    xmlUrls,
    `</urlset>`,
  ].join("\n");
}

/**
 * Calcula prioridade automática baseada no tipo de página
 * Útil para quando não há prioridade explícita definida
 */
export function calculateAutoPriority(
  baseSlug: string,
  isHome?: boolean
): number {
  if (isHome) return 1.0; // Home = máxima prioridade
  if (baseSlug === "about" || baseSlug === "contato") return 0.7;
  if (baseSlug.startsWith("blog")) return 0.6;
  return 0.5; // Padrão para páginas regulares
}
