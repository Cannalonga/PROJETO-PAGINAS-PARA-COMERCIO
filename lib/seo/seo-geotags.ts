/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 2 — GEOLOCATION TAGS
 *
 * Gera meta tags de geolocalização para melhorar
 * compreensão do Google sobre localização física do negócio
 *
 * @file lib/seo/seo-geotags.ts
 * @since 2025-11-19
 */

import type { SeoGeoLocation } from "@/types/seo";

/**
 * Validação de coordenadas
 *
 * @param lat - Latitude (-90 a 90)
 * @param lng - Longitude (-180 a 180)
 * @returns true se válidas
 */
function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Formata coordenadas para string
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns String formatada "lat,lng"
 */
function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/**
 * Gera meta tags de geolocalização
 *
 * Meta tags geradas:
 * - geo.position (latitude;longitude)
 * - ICBM (latitude,longitude - formato legacy)
 * - geo.region (ex: SP)
 * - geo.placename (ex: São Paulo)
 *
 * @param geo - Dados de geolocalização
 * @returns String HTML com meta tags
 *
 * @example
 * const tags = buildGeoMetaTags({
 *   latitude: -23.5505,
 *   longitude: -46.6333,
 *   city: "São Paulo",
 *   region: "SP",
 *   countryCode: "BR"
 * });
 * // Retorna:
 * // <meta name="geo.position" content="-23.550500;-46.633300" />
 * // <meta name="ICBM" content="-23.550500, -46.633300" />
 * // <meta name="geo.placename" content="São Paulo" />
 * // <meta name="geo.region" content="SP" />
 */
export function buildGeoMetaTags(geo?: SeoGeoLocation): string {
  if (!geo) return "";

  const tags: string[] = [];

  // Coordenadas (geo.position e ICBM)
  if (
    typeof geo.latitude === "number" &&
    typeof geo.longitude === "number" &&
    isValidCoordinates(geo.latitude, geo.longitude)
  ) {
    const coords = formatCoordinates(geo.latitude, geo.longitude);

    // Formato recomendado (novo)
    tags.push(
      `<meta name="geo.position" content="${geo.latitude};${geo.longitude}" />`
    );

    // Formato legacy para compatibilidade
    tags.push(`<meta name="ICBM" content="${coords}" />`);
  }

  // Localidade (cidade)
  if (geo.city) {
    tags.push(
      `<meta name="geo.placename" content="${escapeMeta(geo.city)}" />`
    );
  }

  // Região/Estado
  if (geo.region) {
    tags.push(`<meta name="geo.region" content="${escapeMeta(geo.region)}" />`);
  }

  // País (código ISO)
  if (geo.countryCode) {
    tags.push(
      `<meta name="geo.countrycode" content="${geo.countryCode.toUpperCase()}" />`
    );
  }

  return tags.join("\n");
}

/**
 * Escapa valor de meta para HTML
 *
 * @param value - Valor a escapar
 * @returns Valor escapado
 */
function escapeMeta(value: string): string {
  return value
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Valida dados de geolocalização
 *
 * @param geo - Dados a validar
 * @returns { valid: boolean, errors: string[] }
 *
 * @example
 * validateGeoLocation({
 *   latitude: -23.5505,
 *   longitude: -46.6333
 * })
 * // Returns: { valid: true, errors: [] }
 *
 * validateGeoLocation({
 *   latitude: 200,
 *   longitude: 0
 * })
 * // Returns: { valid: false, errors: ["Latitude fora do intervalo -90 a 90"] }
 */
export function validateGeoLocation(
  geo: Partial<SeoGeoLocation>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof geo.latitude === "number") {
    if (geo.latitude < -90 || geo.latitude > 90) {
      errors.push("Latitude deve estar entre -90 e 90");
    }
  }

  if (typeof geo.longitude === "number") {
    if (geo.longitude < -180 || geo.longitude > 180) {
      errors.push("Longitude deve estar entre -180 e 180");
    }
  }

  // Se tem latitude, deve ter longitude
  if (
    typeof geo.latitude === "number" &&
    typeof geo.longitude !== "number"
  ) {
    errors.push("Latitude requer longitude");
  }

  // Se tem longitude, deve ter latitude
  if (
    typeof geo.longitude === "number" &&
    typeof geo.latitude !== "number"
  ) {
    errors.push("Longitude requer latitude");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extrai coordenadas de uma string
 *
 * @param coordString - String com coordenadas (ex: "-23.5505,-46.6333")
 * @returns { latitude, longitude } ou null se inválido
 *
 * @example
 * parseCoordinatesString("-23.5505,-46.6333")
 * // Returns: { latitude: -23.5505, longitude: -46.6333 }
 *
 * parseCoordinatesString("-23.5505;-46.6333")
 * // Returns: { latitude: -23.5505, longitude: -46.6333 }
 */
export function parseCoordinatesString(
  coordString: string
): { latitude: number; longitude: number } | null {
  if (!coordString) return null;

  // Tenta separar por , ou ;
  const parts = coordString.split(/[,;]/).map((p) => p.trim());

  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);

  if (isNaN(lat) || isNaN(lng)) return null;

  if (!isValidCoordinates(lat, lng)) return null;

  return { latitude: lat, longitude: lng };
}

/**
 * Calcula distância entre duas coordenadas (Haversine formula)
 *
 * @param lat1 - Latitude 1
 * @param lng1 - Longitude 1
 * @param lat2 - Latitude 2
 * @param lng2 - Longitude 2
 * @returns Distância em km
 *
 * @example
 * // São Paulo até Rio de Janeiro
 * distanceInKm(-23.5505, -46.6333, -22.9068, -43.1729)
 * // Returns: ~357.8 (aproximado)
 */
export function distanceInKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const earthRadiusKm = 6371;

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

/**
 * Constantes de códigos de país ISO 3166-1 alpha-2
 */
export const COUNTRY_CODES = {
  BR: "Brasil",
  US: "Estados Unidos",
  ES: "Espanha",
  FR: "França",
  DE: "Alemanha",
  IT: "Itália",
  UK: "Reino Unido",
  CA: "Canadá",
  AU: "Austrália",
  JP: "Japão",
  CN: "China",
  IN: "Índia",
  MX: "México",
  AR: "Argentina",
  CL: "Chile",
} as const;

/**
 * Valida código de país
 *
 * @param code - Código a validar (ex: "BR")
 * @returns true se válido
 */
export function isValidCountryCode(code: string): boolean {
  return Object.keys(COUNTRY_CODES).includes(code.toUpperCase());
}

/**
 * Retorna nome do país baseado em código
 *
 * @param code - Código ISO (ex: "BR")
 * @returns Nome do país ou null
 */
export function getCountryName(code: string): string | null {
  return COUNTRY_CODES[code.toUpperCase() as keyof typeof COUNTRY_CODES] ?? null;
}
