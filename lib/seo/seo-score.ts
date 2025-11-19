/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 1 — SEO SCORE CALCULATOR
 *
 * Sistema de pontuação SEO (0-100)
 * Objetivo, transparente e configurável
 *
 * @file lib/seo/seo-score.ts
 * @since 2025-11-19
 */

import type { SeoInput, SeoScoreBreakdown } from "@/types/seo";

/**
 * Pontuação máxima por componente
 */
const SCORE_CONFIG = {
  title: {
    max: 25,
    minLength: 20,
    maxLength: 60,
    idealLength: 50,
  },
  description: {
    max: 25,
    minLength: 50,
    maxLength: 155,
    idealLength: 120,
  },
  content: {
    max: 20,
    minKeywords: 3,
    maxKeywords: 10,
    minReadingTime: 2,
  },
  technical: {
    max: 15,
    // canonical, robots, lang, etc
  },
  performance: {
    max: 10,
    // image size, compression, etc
  },
  schema: {
    max: 5,
    // JSON-LD válido
  },
};

/**
 * Calcula score do título
 *
 * @param title - Título
 * @returns Score 0-25
 */
function scoreTitleQuality(title: string | undefined): number {
  if (!title) return 0;

  let score = 0;
  const len = title.length;

  // Comprimento ideal (50 chars)
  if (len >= SCORE_CONFIG.title.minLength && len <= SCORE_CONFIG.title.maxLength) {
    score += 10;

    // Bônus se próximo ideal
    const distanceFromIdeal = Math.abs(
      len - SCORE_CONFIG.title.idealLength
    );
    if (distanceFromIdeal < 10) {
      score += 5;
    }
  } else if (len >= 10 && len <= 70) {
    score += 5;
  }

  // Tem separator (- ou |)?
  if (title.includes(" - ") || title.includes(" | ")) {
    score += 5;
  }

  // Começa com keyword?
  const firstWord = title.split(" ")[0];
  if (firstWord.length > 3) {
    score += 5;
  }

  return Math.min(score, SCORE_CONFIG.title.max);
}

/**
 * Calcula score da descrição
 *
 * @param description - Descrição meta
 * @returns Score 0-25
 */
function scoreDescriptionQuality(description: string | undefined): number {
  if (!description) return 0;

  let score = 0;
  const len = description.length;

  // Comprimento ideal
  if (len >= SCORE_CONFIG.description.minLength && len <= SCORE_CONFIG.description.maxLength) {
    score += 12;

    // Bônus se próximo ideal
    const distanceFromIdeal = Math.abs(
      len - SCORE_CONFIG.description.idealLength
    );
    if (distanceFromIdeal < 20) {
      score += 5;
    }
  } else if (len >= 40 && len <= 160) {
    score += 8;
  }

  // Tem call-to-action?
  const ctaWords = ["clique", "confira", "saiba", "descubra", "aproveite", "conheça", "visite"];
  if (ctaWords.some((word) => description.toLowerCase().includes(word))) {
    score += 5;
  }

  // Tem número?
  if (/\d/.test(description)) {
    score += 3;
  }

  return Math.min(score, SCORE_CONFIG.description.max);
}

/**
 * Calcula score de conteúdo
 *
 * @param input - SEO Input
 * @returns Score 0-20
 */
function scoreContentQuality(input: Partial<SeoInput>): number {
  let score = 0;

  // Keywords
  const keywordCount = input.keywords?.length ?? 0;
  if (keywordCount >= SCORE_CONFIG.content.minKeywords) {
    score += 5;

    // Bônus por keywords bem distribuídas
    if (keywordCount <= SCORE_CONFIG.content.maxKeywords) {
      score += 5;
    } else {
      score += 3; // Muitas keywords é spam
    }
  }

  // Reading time (proxy de conteúdo)
  if (input.readingTimeMinutes) {
    if (input.readingTimeMinutes >= SCORE_CONFIG.content.minReadingTime) {
      score += 5;
    }

    // Bônus se artigo longo (10+ min)
    if (input.readingTimeMinutes >= 10) {
      score += 2;
    }
  }

  // Tags/categorias
  if (input.tags && input.tags.length > 0) {
    score += 3;
  }

  return Math.min(score, SCORE_CONFIG.content.max);
}

/**
 * Calcula score técnico
 *
 * @param input - SEO Input
 * @returns Score 0-15
 */
function scoreTechnicalQuality(input: Partial<SeoInput>): number {
  let score = 0;

  // Image (OG)
  if (input.image) {
    score += 5;
  }

  // Endereço (LocalBusiness)
  if (input.address) {
    score += 3;
  }

  // Coordenadas (Geo)
  if (input.coordinates) {
    score += 2;
  }

  // Telefone
  if (input.telephone) {
    score += 2;
  }

  // Horários
  if (input.openingHours && input.openingHours.length > 0) {
    score += 2;
  }

  // Locale
  if (input.language) {
    score += 1;
  }

  return Math.min(score, SCORE_CONFIG.technical.max);
}

/**
 * Calcula score de performance
 *
 * @param input - SEO Input
 * @returns Score 0-10
 */
function scorePerformanceQuality(input: Partial<SeoInput>): number {
  let score = 0;

  // Tem image (performance: lazy loading, webp, etc)
  if (input.image) {
    score += 5;
  }

  // Tem URL do business
  if (input.businessUrl) {
    score += 3;
  }

  // Mobile friendly (assumed if schema completo)
  if (input.address && input.coordinates) {
    score += 2;
  }

  return Math.min(score, SCORE_CONFIG.performance.max);
}

/**
 * Calcula score do schema JSON-LD
 *
 * @param input - SEO Input
 * @returns Score 0-5
 */
function scoreSchemaQuality(input: Partial<SeoInput>): number {
  let score = 0;

  // Business name
  if (input.businessName) {
    score += 1;
  }

  // Category
  if (input.businessCategory) {
    score += 1;
  }

  // Dates
  if (input.publishedAt || input.updatedAt) {
    score += 1;
  }

  // Contact info
  if (input.email || input.telephone) {
    score += 1;
  }

  // Completo
  if (
    input.businessName &&
    input.businessCategory &&
    input.publishedAt &&
    input.email
  ) {
    score += 1;
  }

  return Math.min(score, SCORE_CONFIG.schema.max);
}

/**
 * Calcula score SEO total com breakdown
 *
 * @param input - SEO Input
 * @returns Breakdown completo 0-100
 *
 * @example
 * calculateSeoScoreBreakdown({
 *   title: "Pizzaria do João - Delivery",
 *   description: "A melhor pizza da região com entrega rápida.",
 *   keywords: ["pizza", "delivery", "restaurante"],
 *   image: "https://exemplo.com/thumb.png",
 * })
 * // Returns: { title: 25, description: 25, content: 15, ... total: 90 }
 */
export function calculateSeoScoreBreakdown(
  input: Partial<SeoInput>
): SeoScoreBreakdown {
  const titleScore = scoreTitleQuality(input.title);
  const descriptionScore = scoreDescriptionQuality(input.description);
  const contentScore = scoreContentQuality(input);
  const technicalScore = scoreTechnicalQuality(input);
  const performanceScore = scorePerformanceQuality(input);
  const schemaScore = scoreSchemaQuality(input);

  const total =
    titleScore +
    descriptionScore +
    contentScore +
    technicalScore +
    performanceScore +
    schemaScore;

  return {
    title: titleScore,
    description: descriptionScore,
    content: contentScore,
    technical: technicalScore,
    performance: performanceScore,
    schema: schemaScore,
    total: Math.min(total, 100),
    details: [
      {
        component: "Title",
        current: titleScore,
        max: SCORE_CONFIG.title.max,
        percentage: (titleScore / SCORE_CONFIG.title.max) * 100,
      },
      {
        component: "Description",
        current: descriptionScore,
        max: SCORE_CONFIG.description.max,
        percentage: (descriptionScore / SCORE_CONFIG.description.max) * 100,
      },
      {
        component: "Content",
        current: contentScore,
        max: SCORE_CONFIG.content.max,
        percentage: (contentScore / SCORE_CONFIG.content.max) * 100,
      },
      {
        component: "Technical",
        current: technicalScore,
        max: SCORE_CONFIG.technical.max,
        percentage: (technicalScore / SCORE_CONFIG.technical.max) * 100,
      },
      {
        component: "Performance",
        current: performanceScore,
        max: SCORE_CONFIG.performance.max,
        percentage: (performanceScore / SCORE_CONFIG.performance.max) * 100,
      },
      {
        component: "Schema",
        current: schemaScore,
        max: SCORE_CONFIG.schema.max,
        percentage: (schemaScore / SCORE_CONFIG.schema.max) * 100,
      },
    ],
  };
}

/**
 * Calcula score simples (0-100)
 *
 * @param input - SEO Input
 * @returns Score 0-100
 */
export function calculateSeoScore(input: Partial<SeoInput>): number {
  return calculateSeoScoreBreakdown(input).total;
}

/**
 * Converte score em grade (A+ a F)
 *
 * @param score - Score 0-100
 * @returns Grade
 *
 * @example
 * scoreToGrade(95) // "A+"
 * scoreToGrade(80) // "A"
 * scoreToGrade(70) // "B"
 */
export function scoreToGrade(
  score: number
): "A+" | "A" | "B" | "C" | "D" | "F" {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

/**
 * Converte score em cor
 *
 * @param score - Score 0-100
 * @returns Cor Tailwind
 *
 * @example
 * scoreToColor(95) // "emerald"
 * scoreToColor(70) // "yellow"
 * scoreToColor(50) // "red"
 */
export function scoreToColor(
  score: number
): "emerald" | "green" | "yellow" | "orange" | "red" {
  if (score >= 90) return "emerald";
  if (score >= 75) return "green";
  if (score >= 60) return "yellow";
  if (score >= 50) return "orange";
  return "red";
}

/**
 * Valida se score é "saudável"
 *
 * @param score - Score 0-100
 * @returns true se score >= 60
 */
export function isHealthyScore(score: number): boolean {
  return score >= 60;
}
