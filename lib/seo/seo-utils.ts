/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 1 — SEO UTILITIES
 *
 * Funções utilitárias para sanitização, truncagem, URL building
 * Segue os mesmos padrões do Static Export (security-first)
 *
 * @file lib/seo/seo-utils.ts
 * @since 2025-11-19
 */

/**
 * Escapa HTML para evitar XSS em SEO tags
 * Mesma abordagem do security.ts do Static Export
 *
 * @param value - Texto a ser escapado
 * @returns Texto seguro para HTML
 *
 * @example
 * escapeSeoText('<script>alert("xss")</script>')
 * // Returns: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
 */
export function escapeSeoText(value: string): string {
  if (!value || typeof value !== "string") return "";

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Trunca texto mantendo integridade semântica
 * Ideal para títulos e descrições
 *
 * @param text - Texto a truncar
 * @param maxLength - Comprimento máximo
 * @param suffix - Sufixo quando trunca (padrão: "...")
 * @returns Texto truncado
 *
 * @example
 * truncate("Pizzaria do João - Melhor pizza da região", 30)
 * // Returns: "Pizzaria do João - Melhor p..."
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix: string = "..."
): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  // Se possível, trunca na última palavra antes do limite
  const truncated = text.slice(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.7) {
    // Se última palavra começou depois de 70% do limite, trunca lá
    return truncated.slice(0, lastSpace) + suffix;
  }

  return truncated + suffix;
}

/**
 * Remove caracteres especiais mantendo o significado
 * Ideal para slugs e keywords
 *
 * @param text - Texto a limpar
 * @returns Texto limpo
 *
 * @example
 * sanitizeForKeyword("São Paulo - SP")
 * // Returns: "sao paulo sp"
 */
export function sanitizeForKeyword(text: string): string {
  if (!text) return "";

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, " ") // Normaliza espaços
    .trim();
}

/**
 * Valida e normaliza uma URL
 *
 * @param url - URL a validar
 * @returns URL normalizada ou null se inválida
 *
 * @example
 * normalizeUrl("https://exemplo.com/")
 * // Returns: "https://exemplo.com"
 */
export function normalizeUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  try {
    const parsed = new URL(url);
    return parsed.href.replace(/\/$/, ""); // Remove trailing slash
  } catch {
    return null;
  }
}

/**
 * Constrói URL canônica a partir de domain e slug
 * Garante formato consistente
 *
 * @param domain - Domain principal (com protocolo)
 * @param slug - Slug da página
 * @param locale - Locale opcional (pt-BR, etc)
 * @returns URL canônica completa
 *
 * @example
 * buildCanonicalUrl("https://exemplo.com", "pizzaria-do-joao")
 * // Returns: "https://exemplo.com/pizzaria-do-joao"
 *
 * buildCanonicalUrl("https://exemplo.com", "pizzaria-do-joao", "pt-BR")
 * // Returns: "https://exemplo.com/pt-BR/pizzaria-do-joao"
 */
export function buildCanonicalUrl(
  domain: string,
  slug: string,
  locale?: string
): string {
  if (!domain || !slug) throw new Error("domain e slug são obrigatórios");

  const normalized = normalizeUrl(domain);
  if (!normalized) throw new Error(`domain inválida: ${domain}`);

  const cleanSlug = slug.startsWith("/") ? slug : `/${slug}`;

  if (locale) {
    return `${normalized}/${locale}${cleanSlug}`;
  }

  return `${normalized}${cleanSlug}`;
}

/**
 * Valida se uma URL é canônica (não duplicada)
 *
 * @param url - URL a validar
 * @returns true se é canônica
 *
 * @example
 * isCanonicalUrl("https://exemplo.com/pagina")
 * // Returns: true
 *
 * isCanonicalUrl("https://exemplo.com/pagina?utm_source=google")
 * // Returns: false (tem query params)
 */
export function isCanonicalUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    // URL canônica não deve ter query params ou fragments
    return !parsed.search && !parsed.hash;
  } catch {
    return false;
  }
}

/**
 * Gera slug a partir de texto
 * Útil para auto-geração
 *
 * @param text - Texto para gerar slug
 * @param separator - Separador (padrão: "-")
 * @returns Slug gerado
 *
 * @example
 * generateSlug("Pizzaria do João")
 * // Returns: "pizzaria-do-joao"
 */
export function generateSlug(text: string, separator: string = "-"): string {
  if (!text) return "";

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos
    .replace(/[^a-z0-9\s-]/g, "") // Remove especiais
    .replace(/\s+/g, separator) // Espaços para separador
    .replace(new RegExp(`${separator}+`, "g"), separator) // Múltiplos separadores
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), ""); // Remove start/end
}

/**
 * Valida campo requerido para SEO
 *
 * @param value - Valor a validar
 * @param fieldName - Nome do campo
 * @param minLength - Comprimento mínimo
 * @param maxLength - Comprimento máximo
 * @throws Error se inválido
 *
 * @example
 * validateSeoField("Título", "title", 5, 60)
 * // Throws if invalid
 */
export function validateSeoField(
  value: string | undefined,
  fieldName: string,
  minLength: number,
  maxLength: number
): void {
  if (!value) {
    throw new Error(`${fieldName} é obrigatório`);
  }

  if (value.length < minLength) {
    throw new Error(
      `${fieldName} deve ter no mínimo ${minLength} caracteres (tem ${value.length})`
    );
  }

  if (value.length > maxLength) {
    throw new Error(
      `${fieldName} deve ter no máximo ${maxLength} caracteres (tem ${value.length})`
    );
  }
}

/**
 * Extrai domínio de uma URL
 *
 * @param url - URL completa
 * @returns Apenas o domínio
 *
 * @example
 * extractDomain("https://www.exemplo.com/pagina")
 * // Returns: "exemplo.com"
 */
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname?.replace(/^www\./, "") ?? null;
  } catch {
    return null;
  }
}

/**
 * Converte array de keywords para string SEO-friendly
 *
 * @param keywords - Array de keywords
 * @param maxKeywords - Máximo a incluir
 * @returns String formatada
 *
 * @example
 * formatKeywords(["pizza", "delivery", "restaurante"], 5)
 * // Returns: "pizza, delivery, restaurante"
 */
export function formatKeywords(
  keywords: string[] | undefined,
  maxKeywords: number = 10
): string {
  if (!keywords || !Array.isArray(keywords)) return "";

  return keywords
    .slice(0, maxKeywords)
    .map((k) => sanitizeForKeyword(k))
    .filter(Boolean)
    .join(", ");
}

/**
 * Valida um email
 *
 * @param email - Email a validar
 * @returns true se válido
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida um telefone (formato básico)
 *
 * @param phone - Telefone a validar
 * @returns true se parece válido
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Calcula hash simples de string para cache invalidation
 *
 * @param text - Texto a hashear
 * @returns Hash simples
 */
export async function hashString(text: string): Promise<string> {
  if (!text) return "";

  // Usar Web Crypto API se disponível (Node.js 15+)
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Fallback: simple hash (não use em produção para segurança)
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Detecta idioma básico de texto
 *
 * @param text - Texto a analisar
 * @returns Código de idioma (pt, es, en, etc)
 */
export function detectLanguage(text: string): string {
  if (!text) return "pt"; // Default português

  // Palavras-chave em português
  const ptWords = ["o", "a", "de", "para", "que", "em", "do", "da", "é", "e"];
  const enWords = ["the", "is", "at", "to", "for", "of", "and", "a"];
  const esWords = ["el", "la", "de", "para", "que", "es", "y", "a"];

  const lower = text.toLowerCase();
  let ptCount = 0,
    enCount = 0,
    esCount = 0;

  ptWords.forEach((w) => {
    ptCount += (lower.match(new RegExp(`\\b${w}\\b`, "g")) || []).length;
  });
  enWords.forEach((w) => {
    enCount += (lower.match(new RegExp(`\\b${w}\\b`, "g")) || []).length;
  });
  esWords.forEach((w) => {
    esCount += (lower.match(new RegExp(`\\b${w}\\b`, "g")) || []).length;
  });

  if (ptCount >= enCount && ptCount >= esCount) return "pt";
  if (enCount > esCount) return "en";
  return "es";
}
