/**
 * SEO Sitemap Types — Multi-language + Multi-tenant
 */

/**
 * Locales suportados no sistema
 * Adicione mais conforme necessário: fr-FR, de-DE, it-IT, ja-JP, etc.
 */
export type SupportedLocale = "pt-BR" | "en-US" | "es-ES";

/**
 * Informações de locale para uma página
 * Cada página pode ter múltiplas variações de idioma
 */
export interface PageLocaleInfo {
  /** Locale (pt-BR, en-US, es-ES, etc.) */
  locale: SupportedLocale;

  /** Slug relativo com locale embutido, ex: "pt/pizzaria-do-joao" ou "en/joes-pizza" */
  slug: string;

  /** Se é a variação default para hreflang x-default */
  isDefault?: boolean;
}

/**
 * Representação de uma página para geração de sitemap
 * Contém todas as informações necessárias para URLs multi-idioma
 */
export interface SitemapPage {
  /** ID único da página no banco */
  pageId: string;

  /** ID do tenant proprietário */
  tenantId: string;

  /** Slug base sem locale, ex: "loja-do-ze" (sem /) */
  baseSlug: string;

  /** Se está publicada (draft = não aparece no sitemap) */
  isPublished: boolean;

  /** Última modificação lógica da página */
  updatedAt: Date;

  /** Locales disponíveis (pt-BR / en-US / es-ES / etc.) */
  locales: PageLocaleInfo[];

  /** Prioridade sugerida para SEO (0.0–1.0), default 0.5 */
  priority?: number;

  /** Frequência de atualização sugerida */
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
}

/**
 * Contexto para geração de sitemap
 * Contém informações do tenant e configurações
 */
export interface SitemapContext {
  /** URL base do tenant, ex: "https://app.seudominio.com" ou "https://app.seudominio.com/tenant-a" */
  baseUrl: string;

  /** Locale padrão do tenant */
  defaultLocale: SupportedLocale;

  /** ID do tenant (para multi-tenant) */
  tenantId?: string;
}

/**
 * Entrada individual de URL no sitemap
 * Representação estruturada antes de serializar para XML
 */
export interface SitemapUrlEntry {
  /** URL absoluta da página */
  loc: string;

  /** Data de última modificação (ISO 8601) */
  lastmod?: string;

  /** Frequência de atualização sugerida */
  changefreq?: SitemapPage["changefreq"];

  /** Prioridade (0.0–1.0) */
  priority?: number;

  /** Links hreflang para variações em outros idiomas */
  hreflang?: Array<{
    locale: string;
    href: string;
  }>;
}

/**
 * Entrada de sitemap index
 * Usado para agrupar múltiplos sitemaps (multi-tenant)
 */
export interface SitemapIndexEntry {
  /** URL do sitemap */
  loc: string;

  /** Data de última modificação */
  lastmod?: string;
}
