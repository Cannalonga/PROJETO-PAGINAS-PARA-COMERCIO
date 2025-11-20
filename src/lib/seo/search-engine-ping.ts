/**
 * Search Engine Ping — Notifica mecanismos de busca sobre sitemap
 * Suporta: Google, Bing, Yandex
 */

/**
 * Opções para ping de mecanismos de busca
 */
export interface PingOptions {
  /** URL absoluta do sitemap.xml */
  sitemapUrl: string;

  /** Se registrar em log (para debugging) */
  debug?: boolean;
}

/**
 * Resultado de um ping individual
 */
export interface PingResult {
  ok: boolean;
  status: number;
  statusText?: string;
  error?: string;
}

/**
 * Resultado agregado de ping para múltiplos mecanismos
 */
export interface PingResults {
  success: boolean;
  sitemapUrl: string;
  timestamp: string;
  results: {
    google?: PingResult;
    bing?: PingResult;
    yandex?: PingResult;
  };
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * Realiza fetch seguro com timeout e tratamento de erros
 * Não lança exceções, retorna resultado estruturado
 */
async function safeFetch(
  url: string,
  timeout = 5000
): Promise<PingResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return {
      ok: false,
      status: 0,
      error: errorMsg,
    };
  }
}

/**
 * Envia notificação para Google Search Console
 * Endpoint: https://www.google.com/ping?sitemap=...
 */
async function pingGoogle(sitemapUrl: string): Promise<PingResult> {
  const encoded = encodeURIComponent(sitemapUrl);
  const url = `https://www.google.com/ping?sitemap=${encoded}`;
  return safeFetch(url);
}

/**
 * Envia notificação para Bing Webmaster Tools
 * Endpoint: https://www.bing.com/ping?sitemap=...
 */
async function pingBing(sitemapUrl: string): Promise<PingResult> {
  const encoded = encodeURIComponent(sitemapUrl);
  const url = `https://www.bing.com/ping?sitemap=${encoded}`;
  return safeFetch(url);
}

/**
 * Envia notificação para Yandex (opcional, legacy)
 * Endpoint: https://webmaster.yandex.com/site/map.xml?host=...
 * Nota: Yandex exige formato de URL do host, não full URL do sitemap
 */
async function pingYandex(sitemapUrl: string): Promise<PingResult> {
  try {
    const urlObj = new URL(sitemapUrl);
    const host = urlObj.hostname;
    const url = `https://webmaster.yandex.com/site/map.xml?host=${encodeURIComponent(host)}&sitemap_url=${encodeURIComponent(sitemapUrl)}`;
    return safeFetch(url);
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: "Invalid URL format for Yandex",
    };
  }
}

/**
 * Realiza ping para todos os mecanismos de busca suportados
 * Executa em paralelo com Promise.all para performance
 * Não falha se um ping falhar (fault-tolerant)
 *
 * @param options Configuração (sitemapUrl obrigatório)
 * @returns Resultado agregado com status de cada mecanismo
 *
 * @example
 * const results = await pingSearchEngines({
 *   sitemapUrl: "https://example.com/sitemap.xml"
 * });
 * // {
 * //   success: true,
 * //   sitemapUrl: "https://example.com/sitemap.xml",
 * //   results: { google: {...}, bing: {...}, yandex: {...} },
 * //   summary: { total: 3, successful: 2, failed: 1 }
 * // }
 */
export async function pingSearchEngines(
  options: PingOptions
): Promise<PingResults> {
  const { sitemapUrl, debug = false } = options;

  if (debug) {
    console.log("[Search Engine Ping] Starting for:", sitemapUrl);
  }

  // Executa pings em paralelo
  const [google, bing, yandex] = await Promise.all([
    pingGoogle(sitemapUrl),
    pingBing(sitemapUrl),
    pingYandex(sitemapUrl),
  ]);

  // Calcula resumo
  const results = { google, bing, yandex };
  const successful = Object.values(results).filter((r) => r.ok).length;
  const failed = Object.values(results).filter((r) => !r.ok).length;

  if (debug) {
    console.log("[Search Engine Ping] Results:", {
      google: google.ok ? "✓" : `✗ (${google.status})`,
      bing: bing.ok ? "✓" : `✗ (${bing.status})`,
      yandex: yandex.ok ? "✓" : `✗ (${yandex.status})`,
    });
  }

  return {
    success: successful > 0, // Sucesso se pelo menos um respondeu OK
    sitemapUrl,
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: 3,
      successful,
      failed,
    },
  };
}

/**
 * Testa conectividade com um mecanismo de busca específico
 * Útil para debugging e validação
 */
export async function testPingEngine(
  engine: "google" | "bing" | "yandex",
  _sitemapUrl: string
): Promise<PingResult> {
  const testUrl = "https://example.com/sitemap.xml";

  if (engine === "google") return pingGoogle(testUrl);
  if (engine === "bing") return pingBing(testUrl);
  if (engine === "yandex") return pingYandex(testUrl);

  return {
    ok: false,
    status: 0,
    error: `Unknown engine: ${engine}`,
  };
}
