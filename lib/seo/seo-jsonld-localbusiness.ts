/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 3 — LOCALBUSINESS JSON-LD GENERATOR
 *
 * Constrói JSON-LD LocalBusiness completo para negócios locais
 * Integra categoria, endereço, horário, contato, avaliações
 *
 * @file lib/seo/seo-jsonld-localbusiness.ts
 * @since 2025-11-19
 */

import { resolveSchemaBusinessType } from "./seo-jsonld-categories";
import {
  buildJsonLdAddress,
  buildJsonLdGeo,
  buildJsonLdOpeningHours,
  buildJsonLdRating,
  pruneEmpty,
  validateSocialProfiles,
  isValidPriceRange,
  type LocalBusinessJsonLd,
  type JsonLdOpeningHoursSpecification,
} from "./seo-jsonld-core";

// Re-export for convenience
export type { LocalBusinessJsonLd };

/**
 * Entrada para construir LocalBusiness JSON-LD
 */
export interface LocalBusinessInput {
  name?: string;
  title?: string;
  description?: string;
  canonicalUrl: string;
  image?: string;

  businessCategory?: string;

  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    countryCode?: string;
  };

  contact?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };

  location?: {
    latitude?: number;
    longitude?: number;
  };

  openingHours?: Array<{
    dayOfWeek?: string;
    opens?: string;
    closes?: string;
  }>;

  priceRange?: string;

  socialProfiles?: string[];

  rating?: {
    ratingValue?: number;
    reviewCount?: number;
  };
}

/**
 * Constrói JSON-LD LocalBusiness completo
 *
 * Segue schema.org padrão:
 * https://schema.org/LocalBusiness
 * https://schema.org/Restaurant
 * https://schema.org/Store
 * etc
 *
 * @param input - Dados estruturados
 * @returns JSON-LD completo (com tipos corretos)
 *
 * @example
 * const jsonLd = buildLocalBusinessJsonLd({
 *   name: "Pizzaria do João",
 *   description: "Melhor pizza de São Paulo",
 *   canonicalUrl: "https://site.com/pizzaria",
 *   businessCategory: "PIZZARIA",
 *   address: {
 *     street: "Rua A",
 *     number: "123",
 *     city: "São Paulo",
 *     region: "SP",
 *     countryCode: "BR"
 *   },
 *   contact: { phone: "11 3000-0000" },
 *   location: { latitude: -23.5505, longitude: -46.6333 },
 *   openingHours: [
 *     { dayOfWeek: "Mo", opens: "11:00", closes: "23:00" }
 *   ],
 *   rating: { ratingValue: 4.5, reviewCount: 150 },
 *   socialProfiles: ["https://instagram.com/pizzariajao"]
 * })
 */
export function buildLocalBusinessJsonLd(
  input: LocalBusinessInput
): LocalBusinessJsonLd {
  const businessType = resolveSchemaBusinessType(input.businessCategory);
  const businessName = input.name ?? input.title ?? "Negócio Local";

  // Endereço
  const address = buildJsonLdAddress(input.address);

  // Geolocalização
  const geo = buildJsonLdGeo(
    input.location?.latitude,
    input.location?.longitude
  );

  // Horário de funcionamento
  const openingHoursSpec: JsonLdOpeningHoursSpecification[] = [];
  if (input.openingHours && Array.isArray(input.openingHours)) {
    for (const oh of input.openingHours) {
      const spec = buildJsonLdOpeningHours(oh.dayOfWeek, oh.opens, oh.closes);
      if (spec) {
        openingHoursSpec.push(spec);
      }
    }
  }

  // Avaliação
  const aggregateRating = buildJsonLdRating(
    input.rating?.ratingValue,
    input.rating?.reviewCount
  );

  // Telefone (prioridade: telefone → whatsapp)
  const telephone = input.contact?.phone ?? input.contact?.whatsapp;

  // Redes sociais (validadas)
  const sameAs = validateSocialProfiles(input.socialProfiles);

  // Faixa de preço (validada)
  const priceRange =
    input.priceRange && isValidPriceRange(input.priceRange)
      ? input.priceRange
      : undefined;

  // Monta estrutura LocalBusiness
  const data = pruneEmpty<LocalBusinessJsonLd>({
    "@context": "https://schema.org",
    "@type": businessType,
    name: businessName,
    description: input.description,
    url: input.canonicalUrl,
    image: input.image,
    telephone,
    email: input.contact?.email,
    priceRange,
    address,
    geo,
    openingHoursSpecification:
      openingHoursSpec.length > 0 ? openingHoursSpec : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    aggregateRating,
  }) as LocalBusinessJsonLd;

  return data;
}

/**
 * Versão simplificada para minimal LocalBusiness
 * (útil pra testes ou quando dados são limitados)
 *
 * @param name - Nome do negócio
 * @param url - URL canônica
 * @returns JSON-LD minimal mas válido
 */
export function buildMinimalLocalBusinessJsonLd(
  name: string,
  url: string
): LocalBusinessJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    url,
  };
}

/**
 * Valida completude do LocalBusiness JSON-LD
 *
 * Retorna warnings para campos recomendados ausentes
 *
 * @param jsonLd - JSON-LD a validar
 * @returns { isComplete: boolean, warnings: string[] }
 *
 * @example
 * const result = validateLocalBusinessJsonLd(jsonLd);
 * if (!result.isComplete) {
 *   console.log("Campos faltando:", result.warnings);
 * }
 */
export function validateLocalBusinessJsonLd(
  jsonLd?: LocalBusinessJsonLd
): {
  isComplete: boolean;
  warnings: string[];
} {
  if (!jsonLd) {
    return {
      isComplete: false,
      warnings: ["JSON-LD não foi criado"],
    };
  }

  const warnings: string[] = [];

  if (!jsonLd.name) warnings.push("Nome do negócio ausente");
  if (!jsonLd.description) warnings.push("Descrição ausente");
  if (!jsonLd.telephone && !jsonLd.email)
    warnings.push("Telefone ou email ausente");
  if (!jsonLd.address) warnings.push("Endereço ausente");
  if (!jsonLd.geo) warnings.push("Coordenadas de localização ausentes");
  if (!jsonLd.openingHoursSpecification)
    warnings.push("Horário de funcionamento ausente");
  if (!jsonLd.aggregateRating) warnings.push("Avaliações ausentes");
  if (!jsonLd.sameAs || jsonLd.sameAs.length === 0)
    warnings.push("Perfis sociais ausentes");

  return {
    isComplete: warnings.length === 0,
    warnings,
  };
}

/**
 * Calcula score de completude (0-100)
 *
 * Baseado em quantos campos estão preenchidos
 *
 * @param jsonLd - JSON-LD a avaliar
 * @returns Score 0-100
 */
export function calculateLocalBusinessCompleteness(
  jsonLd?: LocalBusinessJsonLd
): number {
  if (!jsonLd) return 0;

  let score = 0;
  const maxFields = 11;

  if (jsonLd.name) score++;
  if (jsonLd.description) score++;
  if (jsonLd.telephone || jsonLd.email) score++;
  if (jsonLd.address) score++;
  if (jsonLd.geo) score++;
  if (jsonLd.openingHoursSpecification) score++;
  if (jsonLd.aggregateRating) score++;
  if (jsonLd.sameAs && jsonLd.sameAs.length > 0) score++;
  if (jsonLd.url) score++;
  if (jsonLd.image) score++;
  if (jsonLd.priceRange) score++;

  return Math.round((score / maxFields) * 100);
}

/**
 * Converte JSON-LD para string JSON formatada (pretty print)
 *
 * Útil para debugging e preview
 *
 * @param jsonLd - JSON-LD a converter
 * @param indent - Número de espaços (default: 2)
 * @returns String JSON formatada
 */
export function formatLocalBusinessJsonLd(
  jsonLd: LocalBusinessJsonLd,
  indent: number = 2
): string {
  return JSON.stringify(jsonLd, null, indent);
}
