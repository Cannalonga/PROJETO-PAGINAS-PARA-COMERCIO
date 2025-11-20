/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 1 — SEO ENGINE CORE
 *
 * Motor principal que orquestra geração de SEO completa
 * Meta tags, OG, Twitter Card, JSON-LD, Score
 *
 * @file lib/seo/seo-engine.ts
 * @since 2025-11-19
 */

import type {
  SeoInput,
  SeoOutput,
  SeoConfig,
  SeoRecommendation,
} from "@/types/seo";

import {
  escapeSeoText,
  buildCanonicalUrl,
  truncate,
  formatKeywords,
  generateSlug,
} from "./seo-utils";

import {
  calculateSeoScoreBreakdown,
  scoreToGrade,
  isHealthyScore,
} from "./seo-score";

import {
  buildAdvancedMetaTags,
  integrateAdvancedTags,
  type AdvancedMetaResult,
} from "./seo-advanced-tags";

import {
  buildJsonLdFromSeo,
  type JsonLdResult,
} from "./seo-jsonld-orchestrator";

/**
 * Gera recomendações baseado na análise
 *
 * @param input - SEO Input
 * @param breakdown - Score breakdown
 * @returns Array de recomendações
 */
function generateRecommendations(
  input: Partial<SeoInput>,
  breakdown: any
): SeoRecommendation[] {
  const recommendations: SeoRecommendation[] = [];

  // Título
  if (!input.title) {
    recommendations.push({
      category: "TITLE",
      message: "Título está vazio",
      impact: "HIGH",
      potentialGain: 25,
      suggestion: "Crie um título com 50-60 caracteres",
      example: "Pizzaria do João - Melhor Pizza da Região",
    });
  } else if (input.title.length < 20) {
    recommendations.push({
      category: "TITLE",
      message: `Título muito curto (${input.title.length} chars)`,
      impact: "HIGH",
      potentialGain: 10,
      suggestion: "Expanda para 50-60 caracteres",
    });
  } else if (input.title.length > 70) {
    recommendations.push({
      category: "TITLE",
      message: `Título muito longo (${input.title.length} chars)`,
      impact: "MEDIUM",
      potentialGain: 5,
      suggestion: "Reduza para máximo 60 caracteres (Google corta)",
    });
  }

  // Descrição
  if (!input.description) {
    recommendations.push({
      category: "DESCRIPTION",
      message: "Descrição está vazia",
      impact: "HIGH",
      potentialGain: 25,
      suggestion: "Crie uma descrição com 120-155 caracteres",
      example: "Melhor pizza da região com entrega rápida. Aberto de seg-sex 18h-23h.",
    });
  } else if (input.description.length < 50) {
    recommendations.push({
      category: "DESCRIPTION",
      message: `Descrição muito curta (${input.description.length} chars)`,
      impact: "HIGH",
      potentialGain: 15,
      suggestion: "Expanda para 120-155 caracteres",
    });
  } else if (input.description.length > 160) {
    recommendations.push({
      category: "DESCRIPTION",
      message: `Descrição muito longa (${input.description.length} chars)`,
      impact: "MEDIUM",
      potentialGain: 5,
      suggestion: "Reduza para máximo 155 caracteres (Google corta)",
    });
  }

  // Keywords
  const keywordCount = input.keywords?.length ?? 0;
  if (keywordCount === 0) {
    recommendations.push({
      category: "KEYWORDS",
      message: "Sem keywords definidas",
      impact: "MEDIUM",
      potentialGain: 10,
      suggestion: "Adicione 3-5 keywords principais",
      example: "pizza, delivery, restaurante, São Paulo, comida rápida",
    });
  } else if (keywordCount < 3) {
    recommendations.push({
      category: "KEYWORDS",
      message: `Poucas keywords (${keywordCount})`,
      impact: "MEDIUM",
      potentialGain: 8,
      suggestion: "Adicione pelo menos 3 keywords",
    });
  }

  // Conteúdo
  if (!input.readingTimeMinutes) {
    recommendations.push({
      category: "CONTENT",
      message: "Sem informação de tempo de leitura",
      impact: "LOW",
      potentialGain: 5,
      suggestion: "Adicione readingTimeMinutes para contexto",
    });
  }

  if (!input.image) {
    recommendations.push({
      category: "TECHNICAL",
      message: "Sem imagem (OG Image)",
      impact: "HIGH",
      potentialGain: 10,
      suggestion: "Adicione uma imagem 1200x630px para compartilhamento",
    });
  }

  // Schema
  if (!input.businessName) {
    recommendations.push({
      category: "SCHEMA",
      message: "Sem nome do negócio",
      impact: "MEDIUM",
      potentialGain: 5,
      suggestion: "Adicione businessName para LocalBusiness schema",
    });
  }

  if (!input.address) {
    recommendations.push({
      category: "SCHEMA",
      message: "Sem endereço (LocalBusiness)",
      impact: "MEDIUM",
      potentialGain: 5,
      suggestion: "Adicione address para melhor ranking local",
    });
  }

  if (!input.telephone && !input.email) {
    recommendations.push({
      category: "TECHNICAL",
      message: "Sem contato (telefone ou email)",
      impact: "MEDIUM",
      potentialGain: 5,
      suggestion: "Adicione telephone ou email",
    });
  }

  return recommendations.slice(0, 5); // Max 5 recomendações
}

/**
 * Gera tags meta HTML
 *
 * @param input - SEO Input
 * @param config - Configuração
 * @returns String HTML com meta tags
 */
function generateMetaTags(
  input: SeoInput,
  config: SeoConfig
): string {
  const title = truncate(escapeSeoText(input.title), 60);
  const description = truncate(escapeSeoText(input.description), 155);
  const keywords = formatKeywords(input.keywords, 10);
  const canonical = buildCanonicalUrl(config.domain, input.slug, input.language);

  const tags: (string | false)[] = [
    `<meta charset="utf-8" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
    `<title>${title}</title>`,
    `<meta name="title" content="${title}" />`,
    `<meta name="description" content="${description}" />`,
    keywords && `<meta name="keywords" content="${keywords}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta name="language" content="${input.language ?? config.defaultLocale ?? "pt-BR"}" />`,
    input.author && `<meta name="author" content="${escapeSeoText(input.author)}" />`,
    !input.isIndexable && input.isDraft && `<meta name="robots" content="noindex, nofollow" />`,
    input.isIndexable === true && `<meta name="robots" content="index, follow" />`,
  ];

  return tags.filter(Boolean).join("\n  ");
}

/**
 * Gera tags Open Graph
 *
 * @param input - SEO Input
 * @param config - Configuração
 * @returns String HTML com OG tags
 */
function generateOpenGraphTags(
  input: SeoInput,
  config: SeoConfig
): string {
  const title = truncate(escapeSeoText(input.title), 60);
  const description = truncate(escapeSeoText(input.description), 155);
  const url = buildCanonicalUrl(config.domain, input.slug, input.language);
  const type = input.contentType ?? "website";
  const image = input.image || undefined;

  const tags: string[] = [
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    image && `<meta property="og:image" content="${image}" />`,
    image && `<meta property="og:image:width" content="1200" />`,
    image && `<meta property="og:image:height" content="630" />`,
    `<meta property="og:site_name" content="${escapeSeoText(input.businessName ?? config.defaultBusinessName ?? "Site")}" />`,
    input.language && `<meta property="og:locale" content="${input.language}" />`,
  ];

  return tags.filter(Boolean).join("\n  ");
}

/**
 * Gera tags Twitter Card
 *
 * @param input - SEO Input
 * @param config - Configuração
 * @returns String HTML com Twitter tags
 */
function generateTwitterCardTags(
  input: SeoInput,
  config: SeoConfig
): string {
  const title = truncate(escapeSeoText(input.title), 60);
  const description = truncate(escapeSeoText(input.description), 155);
  const image = input.image || undefined;

  const tags: string[] = [
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    config.twitterHandle && `<meta name="twitter:creator" content="${config.twitterHandle}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    image && `<meta name="twitter:image" content="${image}" />`,
  ];

  return tags.filter(Boolean).join("\n  ");
}

/**
 * Gera JSON-LD Schema
 *
 * @param input - SEO Input
 * @param config - Configuração
 * @returns Objeto JSON-LD
 */
function generateJsonLd(
  input: SeoInput,
  config: SeoConfig
): Record<string, any> {
  const url = buildCanonicalUrl(config.domain, input.slug, input.language);

  // Base LocalBusiness
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": input.contentType === "article" ? "NewsArticle" : "LocalBusiness",
    name: input.businessName || input.title,
    description: input.description,
    url: url,
    datePublished: input.publishedAt?.toISOString(),
    dateModified: input.updatedAt?.toISOString(),
  };

  // Image
  if (input.image) {
    schema.image = input.image;
  }

  // Contact
  if (input.telephone || input.email) {
    schema.contact = {
      "@type": "ContactPoint",
      ...(input.telephone && { telephone: input.telephone }),
      ...(input.email && { email: input.email }),
    };
  }

  // Address (LocalBusiness)
  if (input.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: input.address.street,
      addressLocality: input.address.city,
      addressRegion: input.address.state,
      postalCode: input.address.postalCode,
      addressCountry: input.address.country ?? "BR",
    };
  }

  // Coordinates (Geo)
  if (input.coordinates) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: input.coordinates.latitude,
      longitude: input.coordinates.longitude,
    };
  }

  // Opening Hours
  if (input.openingHours && input.openingHours.length > 0) {
    schema.openingHoursSpecification = input.openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.dayOfWeek,
      opens: hours.opens,
      closes: hours.closes,
    }));
  }

  // Price Range
  if (input.priceRange) {
    schema.priceRange = input.priceRange;
  }

  // Keywords
  if (input.keywords && input.keywords.length > 0) {
    schema.keywords = input.keywords.join(", ");
  }

  // Author
  if (input.author) {
    schema.author = {
      "@type": "Person",
      name: input.author,
    };
  }

  // Reading time
  if (input.readingTimeMinutes) {
    schema.timeRequired = `PT${input.readingTimeMinutes}M`;
  }

  return schema;
}

/**
 * Motor SEO principal
 *
 * @param input - SEO Input
 * @param config - Configuração
 * @returns Output com todas as tags e score
 *
 * @example
 * const output = await generateSeo({
 *   title: "Pizzaria do João - Delivery",
 *   description: "A melhor pizza da região com entrega rápida.",
 *   slug: "pizzaria-do-joao",
 *   keywords: ["pizza", "delivery", "restaurante"],
 *   image: "https://exemplo.com/thumb.png",
 *   businessName: "Pizzaria do João",
 *   businessCategory: "Restaurant",
 *   publishedAt: new Date(),
 * }, {
 *   domain: "https://meusite.com"
 * });
 *
 * // output.score = 90 (exemplo)
 * // output.metaTags = "<meta ..."
 * // output.jsonLd = { "@context": "https://schema.org", ... }
 */
export async function generateSeo(
  input: SeoInput,
  config: SeoConfig
): Promise<SeoOutput> {
  // Validações
  if (!input.title || !input.description) {
    throw new Error("title e description são obrigatórios");
  }

  if (!config.domain) {
    throw new Error("config.domain é obrigatório");
  }

  // Se slug vazio, gera a partir do título
  const slug = input.slug || generateSlug(input.title);

  // Score breakdown
  const breakdown = calculateSeoScoreBreakdown(input);

  // Recomendações
  const recommendations = !config.skipRecommendations
    ? generateRecommendations(input, breakdown)
    : [];

  // Gera tags
  const metaTags = generateMetaTags({ ...input, slug }, config);
  const openGraph = generateOpenGraphTags({ ...input, slug }, config);
  const twitterCard = generateTwitterCardTags({ ...input, slug }, config);
  const jsonLd = !config.skipJsonLd
    ? generateJsonLd({ ...input, slug }, config)
    : {};

  const canonicalUrl = buildCanonicalUrl(config.domain, slug, input.language);

  // BLOCO 2: Advanced meta tags (hreflang, robots, geo)
  const advanced = buildAdvancedMetaTags({
    ...input,
    slug,
    domain: config.domain,
  });

  // BLOCO 3: Advanced JSON-LD (LocalBusiness, OpeningHours, etc)
  const jsonLdResult = buildJsonLdFromSeo(input, canonicalUrl);

  const output = integrateAdvancedTags(
    {
      metaTags,
      openGraph,
      twitterCard,
      jsonLd,
      score: breakdown.total,
      canonicalUrl,
      recommendations,
    },
    advanced
  );

  // Integrar BLOCO 3 JSON-LD
  return {
    ...output,
    jsonLd: jsonLdResult.jsonLd,
    schemaScore: jsonLdResult.schemaScore,
    schemaWarnings: jsonLdResult.schemaWarnings,
    schemaRecommendations: jsonLdResult.recommendations,
    schemaJsonLd: jsonLdResult.jsonLd,
  };
}

/**
 * Versão rápida apenas com score
 *
 * @param input - SEO Input
 * @returns Score 0-100
 */
export function quickSeoScore(input: Partial<SeoInput>): number {
  return calculateSeoScoreBreakdown(input).total;
}
