/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 2 — HREFLANG MULTI-IDIOMA
 *
 * Gera tags <link rel="alternate" hreflang="..."> para
 * indicar ao Google versões em outros idiomas/regiões
 *
 * @file lib/seo/seo-hreflang.ts
 * @since 2025-11-19
 */

import type { SeoLocaleVariant } from "@/types/seo";
import { buildCanonicalUrl } from "./seo-utils";

/**
 * Configuração para geração de hreflang
 */
export interface HreflangOptions {
  /** Domínio base: ex: https://meusite.com */
  domain: string;

  /** Slug default da página (sem / inicial) */
  defaultSlug: string;

  /** Lista de variantes de idioma */
  locales?: SeoLocaleVariant[];
}

/**
 * Gera tags <link rel="alternate" hreflang="...">
 * Inclui x-default como fallback
 *
 * Exemplo de uso:
 * ```
 * const hreflang = buildHreflangTags({
 *   domain: "https://meusite.com",
 *   defaultSlug: "pizzaria-do-joao",
 *   locales: [
 *     { locale: "pt-BR", slug: "pizzaria-do-joao", isDefault: true },
 *     { locale: "en-US", slug: "joao-pizzeria" },
 *     { locale: "es-ES", slug: "pizzeria-de-joao" }
 *   ]
 * });
 * // Retorna:
 * // <link rel="alternate" href="https://meusite.com/pizzaria-do-joao" hreflang="pt-BR" />
 * // <link rel="alternate" href="https://meusite.com/joao-pizzeria" hreflang="en-US" />
 * // <link rel="alternate" href="https://meusite.com/pizzeria-de-joao" hreflang="es-ES" />
 * // <link rel="alternate" href="https://meusite.com/pizzaria-do-joao" hreflang="x-default" />
 * ```
 *
 * @param options - Configuração com domain, slug e locales
 * @returns String HTML com tags hreflang
 */
export function buildHreflangTags(options: HreflangOptions): string {
  const { domain, defaultSlug, locales } = options;

  // Se não tem locales, retorna vazio
  if (!locales || locales.length === 0) {
    return "";
  }

  const tags: string[] = [];

  // Monta cada tag de alternate language
  for (const locale of locales) {
    // Usa absoluteUrl se fornecida, senão constrói
    const href =
      locale.absoluteUrl ??
      buildCanonicalUrl(domain, locale.slug ?? defaultSlug);

    // Valida e escapa o locale (ex: "pt-BR")
    if (locale.locale && /^[a-z]{2}(-[A-Z]{2})?$/.test(locale.locale)) {
      tags.push(
        `<link rel="alternate" href="${href}" hreflang="${locale.locale}" />`
      );
    }
  }

  // Adiciona x-default (versão padrão/fallback)
  const xDefault = locales.find((l) => l.isDefault) ?? locales[0];
  if (xDefault) {
    const href =
      xDefault.absoluteUrl ??
      buildCanonicalUrl(domain, xDefault.slug ?? defaultSlug);

    tags.push(`<link rel="alternate" href="${href}" hreflang="x-default" />`);
  }

  return tags.join("\n");
}

/**
 * Valida se um locale está no formato correto (BCP 47)
 *
 * @param locale - Locale a validar (ex: "pt-BR", "en-US")
 * @returns true se válido
 *
 * @example
 * isValidLocale("pt-BR") // true
 * isValidLocale("en") // true
 * isValidLocale("x-default") // true
 * isValidLocale("pt_BR") // false
 * isValidLocale("PT-br") // false
 */
export function isValidLocale(locale: string): boolean {
  if (!locale) return false;

  // x-default é especial
  if (locale === "x-default") return true;

  // Formatos válidos: "pt", "pt-BR", "en-US", etc
  const regex = /^[a-z]{2}(-[A-Z]{2})?$/;
  return regex.test(locale);
}

/**
 * Normaliza um locale para formato correto
 *
 * @param locale - Locale em qualquer formato
 * @returns Locale normalizado ou null se inválido
 *
 * @example
 * normalizeLocale("PT_BR") // "pt-BR"
 * normalizeLocale("en_us") // "en-US"
 * normalizeLocale("pt") // "pt"
 */
export function normalizeLocale(locale: string): string | null {
  if (!locale) return null;

  // Se é x-default, retorna como está
  if (locale === "x-default") return "x-default";

  // Replace _ com -
  let normalized = locale.replace(/_/g, "-");

  // Split em partes
  const parts = normalized.split("-");

  if (parts.length === 1) {
    // Apenas language code (ex: "pt")
    return parts[0].toLowerCase();
  }

  if (parts.length === 2) {
    // Language + region (ex: "pt-BR")
    return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
  }

  // Mais de 2 partes é inválido
  return null;
}

/**
 * Retorna o locale mais geral (language code)
 *
 * @param locale - Locale específico (ex: "pt-BR")
 * @returns Locale geral (ex: "pt")
 *
 * @example
 * getLanguageCode("pt-BR") // "pt"
 * getLanguageCode("en-US") // "en"
 * getLanguageCode("fr") // "fr"
 */
export function getLanguageCode(locale: string): string {
  if (!locale) return "";
  return locale.split("-")[0].toLowerCase();
}

/**
 * Agrupa locales por language code
 *
 * @param locales - Array de SeoLocaleVariant
 * @returns Mapa agrupado por language code
 *
 * @example
 * groupLocalesByLanguage([
 *   { locale: "pt-BR" },
 *   { locale: "pt-PT" },
 *   { locale: "en-US" }
 * ])
 * // Returns:
 * // {
 * //   pt: [{ locale: "pt-BR" }, { locale: "pt-PT" }],
 * //   en: [{ locale: "en-US" }]
 * // }
 */
export function groupLocalesByLanguage(
  locales: SeoLocaleVariant[]
): Record<string, SeoLocaleVariant[]> {
  const grouped: Record<string, SeoLocaleVariant[]> = {};

  for (const locale of locales) {
    const langCode = getLanguageCode(locale.locale);
    if (!grouped[langCode]) {
      grouped[langCode] = [];
    }
    grouped[langCode].push(locale);
  }

  return grouped;
}
