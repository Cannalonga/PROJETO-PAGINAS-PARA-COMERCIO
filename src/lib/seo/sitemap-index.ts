/**
 * Sitemap Index — Multi-tenant
 * Gera sitemap-index.xml para agrupar múltiplos sitemaps
 * Usado em ambiente multi-tenant ou quando há muitos URLs
 */

import { escapeXml } from "./sitemap-generator";

/**
 * Entrada individual de sitemap no index
 */
export interface SitemapIndexEntry {
  /** URL absoluta do sitemap.xml referenciado */
  loc: string;

  /** Data de última modificação do sitemap */
  lastmod?: string;
}

/**
 * Constrói XML de sitemap-index
 * Usado para:
 * - Multi-tenant: cada tenant tem seu sitemap
 * - Grandes volumes: múltiplos sitemaps paginados
 *
 * Exemplo de output:
 * <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 *   <sitemap>
 *     <loc>https://app.example.com/tenant-a/sitemap.xml</loc>
 *     <lastmod>2024-01-15T10:30:00Z</lastmod>
 *   </sitemap>
 *   <sitemap>
 *     <loc>https://app.example.com/tenant-b/sitemap.xml</loc>
 *   </sitemap>
 * </sitemapindex>
 */
export function buildSitemapIndexXml(entries: SitemapIndexEntry[]): string {
  const items = entries
    .map((e) => {
      const parts: string[] = [];

      parts.push(`<loc>${escapeXml(e.loc)}</loc>`);

      if (e.lastmod) {
        parts.push(`<lastmod>${escapeXml(e.lastmod)}</lastmod>`);
      }

      return `<sitemap>${parts.join("")}</sitemap>`;
    })
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    items,
    `</sitemapindex>`,
  ].join("\n");
}

/**
 * Constrói lista de sitemaps para um ambiente multi-tenant
 * Retorna estrutura pronta para buildSitemapIndexXml
 *
 * @param baseUrl URL base do sistema (ex: https://app.example.com)
 * @param tenants Array de tenants com slug e updatedAt
 * @returns Array de SitemapIndexEntry pronto para buildSitemapIndexXml
 */
export function buildMultiTenantSitemapIndex(
  baseUrl: string,
  tenants: Array<{ slug: string; updatedAt: Date }>
): SitemapIndexEntry[] {
  return tenants.map((t) => ({
    loc: `${baseUrl}/${t.slug}/sitemap.xml`,
    lastmod: t.updatedAt.toISOString(),
  }));
}
