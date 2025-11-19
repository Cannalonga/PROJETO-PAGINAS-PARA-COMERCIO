/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 2 — ADVANCED META TAGS ORCHESTRATOR
 *
 * Orquestra hreflang, robots e geotags em um resultado único
 * Integra todas as 3 gerações de meta tags avançadas
 *
 * @file lib/seo/seo-advanced-tags.ts
 * @since 2025-11-19
 */

import type { SeoInput, SeoOutput } from "@/types/seo";
import {
  buildHreflangTags,
  type HreflangOptions,
} from "./seo-hreflang";
import {
  buildRobotsMeta,
  type RobotsConfig,
} from "./seo-robots-meta";
import { buildGeoMetaTags } from "./seo-geotags";

/**
 * Resultado da construção de meta tags avançadas
 */
export interface AdvancedMetaResult {
  /** Tags hreflang para multi-idioma */
  hreflangTags?: string;

  /** Meta tag robots para crawling/indexing */
  robotsMeta?: string;

  /** Tags geo para geolocalização */
  geoTags?: string;

  /** URL canônica derivada */
  canonicalUrl?: string;

  /** Indicador de sucesso */
  success: boolean;

  /** Mensagens de aviso/erro */
  warnings: string[];
}

/**
 * Constrói todos os meta tags avançados baseado em SeoInput
 *
 * Processa:
 * 1. Hreflang para multi-idioma (se locales fornecidos)
 * 2. Robots meta para controle de crawling (baseado em status)
 * 3. Geo tags para localização (se location fornecido)
 *
 * @param input - Configuração SEO com dados de multi-idioma e geo
 * @returns AdvancedMetaResult com todos os tags
 *
 * @example
 * const result = buildAdvancedMetaTags({
 *   domain: "https://pizzarias.com.br",
 *   slug: "pizzaria-joao-centro",
 *   isDraft: false,
 *   isNoIndex: false,
 *   locales: [
 *     { locale: "pt-BR", slug: "pizzaria-joao-centro", isDefault: true },
 *     { locale: "en-US", slug: "joao-pizzeria-downtown" },
 *   ],
 *   location: {
 *     city: "São Paulo",
 *     region: "SP",
 *     countryCode: "BR",
 *     latitude: -23.5505,
 *     longitude: -46.6333,
 *   },
 * });
 * // Retorna:
 * // {
 * //   hreflangTags: "<link rel=\"alternate\" hreflang=\"pt-BR\" ... />...",
 * //   robotsMeta: "<meta name=\"robots\" content=\"index,follow\" />",
 * //   geoTags: "<meta name=\"geo.position\" content=\"-23.5505;-46.6333\" />...",
 * //   canonicalUrl: "https://pizzarias.com.br/pizzaria-joao-centro",
 * //   success: true,
 * //   warnings: [],
 * // }
 */
export function buildAdvancedMetaTags(
  input: SeoInput
): AdvancedMetaResult {
  const warnings: string[] = [];
  const result: AdvancedMetaResult = {
    success: true,
    warnings,
  };

  try {
    // 1. Construir canonical URL
    if (input.domain && input.slug) {
      result.canonicalUrl = `${input.domain.replace(/\/$/, "")}/${input.slug}`;
    } else if (input.domain) {
      result.canonicalUrl = input.domain.replace(/\/$/, "");
    }

    // 2. Construir hreflang tags (se locales fornecidos)
    if (input.locales && input.locales.length > 0) {
      if (!input.domain) {
        warnings.push("domain é requerido para gerar hreflang tags");
      } else {
        const hreflangOptions: HreflangOptions = {
          domain: input.domain,
          defaultSlug: input.slug || "",
          locales: input.locales,
        };

        try {
          result.hreflangTags = buildHreflangTags(hreflangOptions);
        } catch (err) {
          warnings.push(
            `Erro ao gerar hreflang tags: ${err instanceof Error ? err.message : "desconhecido"}`
          );
        }
      }
    }

    // 3. Construir robots meta (baseado em status)
    const robotsConfig: RobotsConfig = {
      isDraft: input.isDraft || false,
      isNoIndex: input.isNoIndex || false,
      allowIndex: !input.isDraft && !input.isNoIndex,
      allowFollow: true,
    };

    try {
      result.robotsMeta = buildRobotsMeta(robotsConfig);
    } catch (err) {
      warnings.push(
        `Erro ao gerar robots meta: ${err instanceof Error ? err.message : "desconhecido"}`
      );
    }

    // 4. Construir geo tags (se location fornecido)
    if (input.location) {
      try {
        result.geoTags = buildGeoMetaTags(input.location);
      } catch (err) {
        warnings.push(
          `Erro ao gerar geo tags: ${err instanceof Error ? err.message : "desconhecido"}`
        );
      }
    }

    // Marcar como falha se teve erros críticos
    if (warnings.length > 0 && !result.hreflangTags && !result.robotsMeta && !result.geoTags) {
      result.success = false;
    }
  } catch (err) {
    result.success = false;
    warnings.push(
      `Erro fatal ao processar advanced meta tags: ${err instanceof Error ? err.message : "desconhecido"}`
    );
  }

  return result;
}

/**
 * Integra resultado de advanced meta tags em SeoOutput
 *
 * Copia campos do resultado para SeoOutput
 *
 * @param output - SeoOutput a atualizar
 * @param advanced - Resultado de buildAdvancedMetaTags
 * @returns SeoOutput atualizado
 *
 * @example
 * const output: SeoOutput = {
 *   metaTags: {...},
 *   openGraph: {...},
 * };
 *
 * const advanced = buildAdvancedMetaTags(input);
 * const updated = integrateAdvancedTags(output, advanced);
 * // Agora updated contém hreflangTags, robotsMeta, geoTags
 */
export function integrateAdvancedTags(
  output: SeoOutput,
  advanced: AdvancedMetaResult
): SeoOutput {
  return {
    ...output,
    hreflangTags: advanced.hreflangTags,
    robotsMeta: advanced.robotsMeta,
    geoTags: advanced.geoTags,
  };
}

/**
 * Renderiza todos os advanced tags para string HTML
 *
 * @param advanced - Resultado de buildAdvancedMetaTags
 * @returns String HTML completa com todos os tags
 *
 * @example
 * const html = renderAdvancedTags(advanced);
 * // Retorna string com todos os meta tags prontos para HTML
 */
export function renderAdvancedTags(advanced: AdvancedMetaResult): string {
  const parts: string[] = [];

  if (advanced.robotsMeta) {
    parts.push(advanced.robotsMeta);
  }

  if (advanced.hreflangTags) {
    parts.push(advanced.hreflangTags);
  }

  if (advanced.geoTags) {
    parts.push(advanced.geoTags);
  }

  return parts.join("\n");
}

/**
 * Valida completude de advanced tags
 *
 * @param advanced - Resultado a validar
 * @returns { isComplete: boolean, missing: string[] }
 *
 * @example
 * validateAdvancedTags(result)
 * // Returns: { isComplete: false, missing: ["hreflangTags", "geoTags"] }
 */
export function validateAdvancedTags(advanced: AdvancedMetaResult): {
  isComplete: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!advanced.hreflangTags) missing.push("hreflangTags");
  if (!advanced.robotsMeta) missing.push("robotsMeta");
  if (!advanced.geoTags) missing.push("geoTags");

  return {
    isComplete: missing.length === 0,
    missing,
  };
}

/**
 * Debug: Exibe estrutura de advanced tags formatada
 *
 * @param advanced - Resultado a exibir
 * @returns String formatada para debug
 *
 * @example
 * console.log(debugAdvancedTags(result));
 * // Output:
 * // Advanced Meta Tags (success: true)
 * // ├─ Robots: index,follow
 * // ├─ Hreflang: pt-BR, en-US (2 locales)
 * // └─ Geo: São Paulo, SP (-23.5505, -46.6333)
 */
export function debugAdvancedTags(advanced: AdvancedMetaResult): string {
  const lines: string[] = [
    `Advanced Meta Tags (success: ${advanced.success})`,
  ];

  if (advanced.robotsMeta) {
    const robotsMatch = advanced.robotsMeta.match(/content="([^"]+)"/);
    const robotsValue = robotsMatch ? robotsMatch[1] : "unknown";
    lines.push(`├─ Robots: ${robotsValue}`);
  }

  if (advanced.hreflangTags) {
    const hreflangCount = (advanced.hreflangTags.match(/hreflang/g) || [])
      .length;
    lines.push(`├─ Hreflang: ${hreflangCount} tags`);
  }

  if (advanced.geoTags) {
    const geoCount = (advanced.geoTags.match(/name="geo/g) || []).length;
    lines.push(`├─ Geo: ${geoCount} tags`);
  }

  if (advanced.warnings.length > 0) {
    lines.push(`└─ Warnings: ${advanced.warnings.join("; ")}`);
  }

  return lines.join("\n");
}
