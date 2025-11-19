/**
 * Robots.txt Generator
 * Gera robots.txt inteligente para controlar indexação
 * Bloqueia rotas privadas, libera páginas públicas
 */

/**
 * Opções para geração de robots.txt
 */
export interface RobotsOptions {
  /** Host principal do site (ex: example.com) */
  host: string;

  /** URL completa do sitemap.xml */
  sitemapUrl: string;

  /** Se está em produção (afeta Disallow rules) */
  isProduction: boolean;

  /** Disallow adicional por tenant ou aplicação customizada */
  additionalDisallows?: string[];
}

/**
 * Gera conteúdo de robots.txt
 *
 * Estratégia:
 * - Produção: libera conteúdo público, bloqueia admin/dashboard/api
 * - Desenvolvimento: bloqueia tudo (não indexar)
 * - Sempre referencia sitemap.xml
 *
 * @example
 * const robots = generateRobotsTxt({
 *   host: "example.com",
 *   sitemapUrl: "https://example.com/sitemap.xml",
 *   isProduction: true
 * });
 * // User-agent: *
 * // Disallow: /admin
 * // Disallow: /dashboard
 * // Disallow: /api
 * // Allow: /
 * // Host: example.com
 * // Sitemap: https://example.com/sitemap.xml
 */
export function generateRobotsTxt(options: RobotsOptions): string {
  const { host, sitemapUrl, isProduction, additionalDisallows = [] } = options;

  const lines: string[] = [];

  lines.push("User-agent: *");

  // Em desenvolvimento, bloqueia tudo
  if (!isProduction) {
    lines.push("Disallow: /");
    lines.push("");
    lines.push("# Development environment - all indexing disabled");
    lines.push(`Host: ${host}`);
    lines.push(`Sitemap: ${sitemapUrl}`);
    lines.push("");
    return lines.join("\n");
  }

  // Em produção: bloqueia rotas privadas
  lines.push("Disallow: /admin");
  lines.push("Disallow: /dashboard");
  lines.push("Disallow: /api");
  lines.push("Disallow: /api/");
  lines.push("Disallow: /_next");
  lines.push("Disallow: /.next");
  lines.push("Disallow: /private");

  // Disallow customizado (ex: draft pages, temp routes)
  for (const path of additionalDisallows) {
    lines.push(`Disallow: ${path}`);
  }

  // Libera raiz e conteúdo público
  lines.push("");
  lines.push("Allow: /");

  // Comentário
  lines.push("");
  lines.push("# Production environment");
  lines.push(`Host: ${host}`);
  lines.push(`Sitemap: ${sitemapUrl}`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Gera robots.txt para um tenant específico
 * Útil em arquitetura multi-tenant com domínios separados
 */
export function generateRobotsTxtForTenant(
  tenantSlug: string,
  baseUrl: string,
  isProduction: boolean
): string {
  const host = new URL(baseUrl).hostname;
  const sitemapUrl = `${baseUrl}/sitemap.xml`;

  return generateRobotsTxt({
    host,
    sitemapUrl,
    isProduction,
    additionalDisallows: [
      `/api/`,
      `/admin/`,
      `/${tenantSlug}/api/`,
      `/${tenantSlug}/admin/`,
    ],
  });
}

/**
 * Disallow patterns comuns para diferentes tipos de sites
 */
export const DISALLOW_PATTERNS = {
  /** Rotas de API (nunca indexar) */
  api: "/api/",

  /** Rotas de administração */
  admin: "/admin",
  dashboard: "/dashboard",

  /** Rotas Next.js internas */
  nextInternal: ["/api/", "/_next", "/.next"],

  /** Diretórios temporários */
  temp: ["/tmp", "/temp", "/cache"],

  /** Páginas draft/rascunho */
  draft: ["/draft", "/?draft=1", "/?preview=1"],

  /** Parâmetros de busca (evita duplicação) */
  search: ["?s=", "?q=", "?search="],
};
