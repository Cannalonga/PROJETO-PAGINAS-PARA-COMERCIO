/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 3 — JSON-LD CORE TYPES & HELPERS
 *
 * Tipos e funções base para construir JSON-LD estruturado
 * Segue schema.org padrão para máxima compatibilidade
 *
 * @file lib/seo/seo-jsonld-core.ts
 * @since 2025-11-19
 */

/**
 * Base para todos os JSON-LD structures
 */
export interface JsonLdBase {
  "@context": "https://schema.org";
  "@type": string | string[];
}

/**
 * Endereço estruturado (PostalAddress)
 */
export interface JsonLdAddress {
  "@type": "PostalAddress";
  streetAddress?: string;
  addressLocality?: string;    // Cidade
  addressRegion?: string;      // Estado/Região
  postalCode?: string;         // CEP
  addressCountry?: string;     // Código país (BR, US, etc)
}

/**
 * Coordenadas geográficas
 */
export interface JsonLdGeo {
  "@type": "GeoCoordinates";
  latitude: number;
  longitude: number;
}

/**
 * Horário de funcionamento (um dia da semana)
 */
export interface JsonLdOpeningHoursSpecification {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string | string[];  // "Monday", ["Monday", "Tuesday"]
  opens: string;                  // "09:00"
  closes: string;                 // "18:00"
  validFrom?: string;             // "2025-01-01"
  validThrough?: string;          // "2025-12-31"
}

/**
 * Avaliação agregada (nota média + count)
 */
export interface JsonLdAggregateRating {
  "@type": "AggregateRating";
  ratingValue: number;            // 0-5
  reviewCount: number;            // total
  bestRating?: number;            // 5
  worstRating?: number;           // 1
}

/**
 * LocalBusiness JSON-LD completo
 */
export interface LocalBusinessJsonLd extends JsonLdBase {
  "@type": string;
  name: string;
  description?: string;
  url?: string;
  image?: string;
  telephone?: string;
  email?: string;
  priceRange?: string;            // "$", "$$", "$$$"
  address?: JsonLdAddress;
  geo?: JsonLdGeo;
  openingHoursSpecification?: JsonLdOpeningHoursSpecification[];
  sameAs?: string[];              // social profiles
  aggregateRating?: JsonLdAggregateRating;
}

/**
 * Remove valores vazios/null/undefined recursivamente
 * Mantém arrays vazios (alguns schemas exigem)
 *
 * @param obj - Objeto a limpar
 * @returns Objeto com valores vazios removidos
 *
 * @example
 * pruneEmpty({ name: "João", phone: undefined, address: null })
 * // → { name: "João" }
 */
export function pruneEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
  if (obj === null || obj === undefined) return {};

  if (Array.isArray(obj)) {
    const filtered = obj
      .map((item) => pruneEmpty(item))
      .filter(
        (item) =>
          item !== null && item !== undefined && (typeof item !== "string" || item !== "")
      );
    return filtered as unknown as Partial<T>;
  }

  if (typeof obj === "object") {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined || value === "") {
        continue;
      }

      if (typeof value === "object") {
        const cleaned = pruneEmpty(value);
        if (Object.keys(cleaned).length > 0 || Array.isArray(value)) {
          result[key] = cleaned;
        }
      } else {
        result[key] = value;
      }
    }

    return result as Partial<T>;
  }

  return obj;
}

/**
 * Valida e formata string de hora (HH:MM)
 *
 * @param time - String de hora
 * @returns Hora formatada ou undefined se inválida
 *
 * @example
 * normalizeTime("9:00")       // → "09:00"
 * normalizeTime("09:00")      // → "09:00"
 * normalizeTime("25:00")      // → undefined
 * normalizeTime("abc")        // → undefined
 */
export function normalizeTime(time?: string): string | undefined {
  if (!time) return undefined;

  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return undefined;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return undefined;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Converte dia da semana para formato Schema.org
 *
 * Aceita: "Mo", "Mon", "SEGUNDA", "Monday", etc
 * Retorna: "Monday", "Tuesday", etc
 *
 * @param day - Dia em qualquer formato
 * @returns Dia formatado para Schema.org
 *
 * @example
 * dayOfWeekToSchema("Mo")      // → "Monday"
 * dayOfWeekToSchema("segunda") // → "Monday"
 * dayOfWeekToSchema("Monday")  // → "Monday"
 */
export function dayOfWeekToSchema(day?: string): string | undefined {
  if (!day) return undefined;

  const normalized = day.trim().toLowerCase();

  const mapping: Record<string, string> = {
    mo: "Monday",
    mon: "Monday",
    segunda: "Monday",
    "segunda-feira": "Monday",

    tu: "Tuesday",
    tue: "Tuesday",
    terça: "Tuesday",
    "terça-feira": "Tuesday",

    we: "Wednesday",
    wed: "Wednesday",
    quarta: "Wednesday",
    "quarta-feira": "Wednesday",

    th: "Thursday",
    thu: "Thursday",
    quinta: "Thursday",
    "quinta-feira": "Thursday",

    fr: "Friday",
    fri: "Friday",
    sexta: "Friday",
    "sexta-feira": "Friday",

    sa: "Saturday",
    sat: "Saturday",
    sábado: "Saturday",
    sabado: "Saturday",

    su: "Sunday",
    sun: "Sunday",
    domingo: "Sunday",
  };

  return mapping[normalized] || undefined;
}

/**
 * Valida URL absoluta
 *
 * @param url - URL a validar
 * @returns true se válida
 */
export function isValidAbsoluteUrl(url?: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Monta PostalAddress a partir de dados estruturados
 *
 * @param params - Dados de endereço
 * @returns JsonLdAddress ou undefined
 *
 * @example
 * buildJsonLdAddress({
 *   street: "Rua A",
 *   number: "123",
 *   city: "São Paulo",
 *   region: "SP",
 *   countryCode: "BR"
 * })
 * // → { "@type": "PostalAddress", streetAddress: "Rua A, 123", ... }
 */
export function buildJsonLdAddress(params?: {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  countryCode?: string;
}): JsonLdAddress | undefined {
  if (!params) return undefined;

  const streetParts = [
    params.street,
    params.number,
    params.complement,
    params.neighborhood,
  ].filter(Boolean);

  // Requer pelo menos algo significativo
  if (
    streetParts.length === 0 &&
    !params.city &&
    !params.region &&
    !params.postalCode &&
    !params.countryCode
  ) {
    return undefined;
  }

  return pruneEmpty<JsonLdAddress>({
    "@type": "PostalAddress",
    streetAddress: streetParts.length > 0 ? streetParts.join(", ") : undefined,
    addressLocality: params.city,
    addressRegion: params.region,
    postalCode: params.postalCode,
    addressCountry: params.countryCode,
  }) as JsonLdAddress;
}

/**
 * Monta GeoCoordinates
 *
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @returns JsonLdGeo ou undefined se coordenadas inválidas
 */
export function buildJsonLdGeo(
  latitude?: number,
  longitude?: number
): JsonLdGeo | undefined {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return undefined;
  }

  // Validação básica
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return undefined;
  }

  return {
    "@type": "GeoCoordinates",
    latitude,
    longitude,
  };
}

/**
 * Monta OpeningHoursSpecification para um dia
 *
 * @param dayOfWeek - Dia (qualquer formato)
 * @param opens - Hora de abertura (09:00)
 * @param closes - Hora de fechamento (18:00)
 * @returns JsonLdOpeningHoursSpecification ou undefined se inválido
 */
export function buildJsonLdOpeningHours(
  dayOfWeek?: string,
  opens?: string,
  closes?: string
): JsonLdOpeningHoursSpecification | undefined {
  if (!dayOfWeek || !opens || !closes) return undefined;

  const schemaDay = dayOfWeekToSchema(dayOfWeek);
  const schemaOpens = normalizeTime(opens);
  const schemaCloses = normalizeTime(closes);

  if (!schemaDay || !schemaOpens || !schemaCloses) {
    return undefined;
  }

  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: schemaDay,
    opens: schemaOpens,
    closes: schemaCloses,
  };
}

/**
 * Monta AggregateRating
 *
 * @param ratingValue - Nota média (0-5)
 * @param reviewCount - Número de avaliações
 * @returns JsonLdAggregateRating ou undefined se inválido
 */
export function buildJsonLdRating(
  ratingValue?: number,
  reviewCount?: number
): JsonLdAggregateRating | undefined {
  if (
    typeof ratingValue !== "number" ||
    typeof reviewCount !== "number"
  ) {
    return undefined;
  }

  if (ratingValue < 0 || ratingValue > 5 || reviewCount < 1) {
    return undefined;
  }

  return {
    "@type": "AggregateRating",
    ratingValue,
    reviewCount,
    bestRating: 5,
    worstRating: 1,
  };
}

/**
 * Valida faixa de preço
 *
 * @param priceRange - Faixa ("$", "$$", "$$$")
 * @returns true se válida
 */
export function isValidPriceRange(priceRange?: string): boolean {
  if (!priceRange) return true;
  return ["$", "$$", "$$$", "$$$$"].includes(priceRange);
}

/**
 * Limpa e valida array de URLs (perfis sociais)
 *
 * @param urls - Array de URLs
 * @returns URLs válidas
 */
export function validateSocialProfiles(urls?: string[]): string[] {
  if (!urls || !Array.isArray(urls)) return [];

  return urls.filter((url) => isValidAbsoluteUrl(url));
}
