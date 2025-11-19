/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 3 — JSON-LD ORCHESTRATOR
 *
 * Orquestra construção completa de JSON-LD com scoring e recomendações
 * Integra todas as funcionalidades do BLOCO 3
 *
 * @file lib/seo/seo-jsonld-orchestrator.ts
 * @since 2025-11-19
 */

import type { SeoInput } from "../../types/seo";
import {
  buildLocalBusinessJsonLd,
  calculateLocalBusinessCompleteness,
  validateLocalBusinessJsonLd,
  type LocalBusinessInput,
  type LocalBusinessJsonLd,
} from "./seo-jsonld-localbusiness";

/**
 * Resultado final do orquestrador
 */
export interface JsonLdResult {
  /** JSON-LD pronto para usar */
  jsonLd: LocalBusinessJsonLd;

  /** Score de completude do schema (0-100) */
  schemaScore: number;

  /** Warnings de campos recomendados ausentes */
  schemaWarnings: string[];

  /** Dicas de ação para melhorar o schema */
  recommendations: string[];

  /** Sucesso na geração */
  success: boolean;
}

/**
 * Recomendações específicas para melhorar SEO local
 */
function generateRecommendations(jsonLd: LocalBusinessJsonLd): string[] {
  const recs: string[] = [];

  if (!jsonLd.address) {
    recs.push(
      "📍 Adicione endereço completo: rua, número, cidade, estado, CEP e país"
    );
  } else if (!jsonLd.address.postalCode) {
    recs.push("📍 Adicione CEP ao endereço para melhor localização");
  }

  if (!jsonLd.telephone && !jsonLd.email) {
    recs.push(
      "📞 Adicione pelo menos telefone ou email para contato direto"
    );
  } else if (!jsonLd.telephone) {
    recs.push(
      "📞 Adicione telefone (WhatsApp também funciona) para aumentar conversão"
    );
  }

  if (!jsonLd.openingHoursSpecification) {
    recs.push(
      "⏰ Informe horário de funcionamento (segunda a domingo) para aparecer em horários locais do Google"
    );
  }

  if (!jsonLd.geo) {
    recs.push(
      "🗺️ Adicione coordenadas de latitude/longitude para melhor posicionamento no Google Maps"
    );
  } else if (!jsonLd.address) {
    recs.push("🗺️ Combine coordenadas com endereço completo para máxima precisão");
  }

  if (!jsonLd.aggregateRating) {
    recs.push(
      "⭐ Adicione nota média e número de avaliações de clientes (solicite reviews!)"
    );
  }

  if (!jsonLd.sameAs || jsonLd.sameAs.length === 0) {
    recs.push(
      "📱 Vincule perfis sociais (Instagram, Facebook, etc) para validação de identidade"
    );
  } else if (jsonLd.sameAs.length === 1) {
    recs.push("📱 Adicione mais perfis sociais (mínimo 2 para credibilidade)");
  }

  if (!jsonLd.image) {
    recs.push(
      "🖼️ Adicione imagem de alta qualidade (logo ou foto do local) para previsualizações"
    );
  }

  if (!jsonLd.priceRange) {
    recs.push(
      "💰 Defina faixa de preço ($, $$, $$$, $$$$) para ajudar clientes a filtrar"
    );
  }

  if (!jsonLd.description || jsonLd.description.length < 50) {
    recs.push(
      "📝 Escreva descrição detalhada do negócio (mínimo 50 caracteres) com palavras-chave"
    );
  }

  return recs;
}

/**
 * Converte SeoInput para LocalBusinessInput
 *
 * Mapeamento de BLOCO 1 (SeoInput) → BLOCO 3 (LocalBusinessInput)
 * Usa campos existentes: businessName, description, coordinates, telephone, email, businessUrl
 *
 * @param input - SeoInput (formato do BLOCO 1)
 * @param canonicalUrl - URL canônica da página
 * @returns LocalBusinessInput (formato BLOCO 3)
 */
function mapSeoInputToLocalBusinessInput(
  input: SeoInput,
  canonicalUrl: string
): LocalBusinessInput {
  // Mapear coordenadas para address se não houver address estruturado
  const hasStructuredAddress = input.coordinates?.latitude && input.coordinates?.longitude;
  
  return {
    name: input.businessName || input.title,
    title: input.title,
    description: input.description,
    canonicalUrl,
    image: input.image,
    businessCategory: input.businessCategory,
    // Usar campos de BLOCO 1
    address: hasStructuredAddress ? {
      city: input.location?.city,
      // Outros campos viriam de geolocalização reversa ou precisariam ser adicionados
    } : undefined,
    contact: {
      phone: input.telephone,
      email: input.email,
      // Pegar de businessUrl se disponível
    },
    location: input.coordinates ? {
      latitude: input.coordinates.latitude,
      longitude: input.coordinates.longitude,
    } : input.location ? {
      latitude: input.location.latitude,
      longitude: input.location.longitude,
    } : undefined,
    openingHours: undefined, // Não disponível em BLOCO 1, adicionar em futuro BLOCO 5
    priceRange: undefined, // Não disponível em BLOCO 1
    socialProfiles: undefined, // Não disponível em BLOCO 1
    rating: undefined, // Não disponível em BLOCO 1
  };
}

/**
 * Orquestra construção completa do JSON-LD
 *
 * Fluxo:
 * 1. Mapeia SeoInput → LocalBusinessInput
 * 2. Constrói JSON-LD LocalBusiness
 * 3. Valida completude
 * 4. Calcula score
 * 5. Gera recomendações
 * 6. Retorna resultado completo
 *
 * @param input - SeoInput com dados de negócio
 * @param canonicalUrl - URL canônica da página
 * @returns JsonLdResult com JSON-LD, score e recomendações
 *
 * @example
 * const result = buildJsonLdFromSeo({
 *   title: "Pizzaria do João",
 *   description: "Melhor pizza de SP",
 *   businessName: "Pizzaria do João",
 *   businessCategory: "PIZZARIA",
 *   address: { city: "São Paulo", region: "SP", countryCode: "BR" },
 *   contact: { phone: "11 3000-0000" },
 * }, "https://pizzarias.com.br/pizzaria-joao");
 *
 * // Retorna:
 * // {
 * //   jsonLd: { @context, @type, name, ... },
 * //   schemaScore: 65,
 * //   schemaWarnings: ["Endereço incompleto", ...],
 * //   recommendations: ["📞 Adicione telefone", ...],
 * //   success: true
 * // }
 */
export function buildJsonLdFromSeo(
  input: SeoInput,
  canonicalUrl: string
): JsonLdResult {
  try {
    // 1. Map to LocalBusinessInput
    const localBusinessInput = mapSeoInputToLocalBusinessInput(
      input,
      canonicalUrl
    );

    // 2. Build LocalBusiness
    const jsonLd = buildLocalBusinessJsonLd(localBusinessInput);

    // 3. Validate
    const validation = validateLocalBusinessJsonLd(jsonLd);

    // 4. Calculate score
    const schemaScore = calculateLocalBusinessCompleteness(jsonLd);

    // 5. Generate recommendations
    const recommendations = generateRecommendations(jsonLd);

    return {
      jsonLd,
      schemaScore,
      schemaWarnings: validation.warnings,
      recommendations,
      success: true,
    };
  } catch (error) {
    // Fallback em caso de erro
    return {
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: input.businessName ?? input.title,
        url: canonicalUrl,
      },
      schemaScore: 10,
      schemaWarnings: [
        "Erro ao gerar JSON-LD completo: " +
          (error instanceof Error ? error.message : "desconhecido"),
      ],
      recommendations: [
        "Verifique todos os campos de endereço, contato e localização",
      ],
      success: false,
    };
  }
}

/**
 * Versão async (para operações futuras como validação em API)
 *
 * @param input - SeoInput
 * @param canonicalUrl - URL canônica
 * @returns Promise<JsonLdResult>
 */
export async function buildJsonLdFromSeoAsync(
  input: SeoInput,
  canonicalUrl: string
): Promise<JsonLdResult> {
  // Pode ser estendido futuramente para validar contra API Google
  return buildJsonLdFromSeo(input, canonicalUrl);
}

/**
 * Comparação entre scores (antes e depois)
 *
 * Útil para mostrar progresso ao comerciante
 *
 * @param before - Score anterior (0-100)
 * @param after - Score novo (0-100)
 * @returns { improvement: number, percentageGain: number, message: string }
 *
 * @example
 * compareSchemaScores(40, 75)
 * // → { improvement: 35, percentageGain: 87.5, message: "Melhoria impressionante! 🚀" }
 */
export function compareSchemaScores(before: number, after: number): {
  improvement: number;
  percentageGain: number;
  message: string;
} {
  const improvement = after - before;
  const percentageGain =
    before > 0 ? ((improvement / before) * 100).toFixed(1) : "∞";

  let message = "Sem mudança 😐";

  if (improvement > 30) {
    message = "Melhoria impressionante! 🚀";
  } else if (improvement > 15) {
    message = "Bom progresso! 📈";
  } else if (improvement > 5) {
    message = "Melhorando 👍";
  } else if (improvement < -5) {
    message = "Atenção: score reduziu ⚠️";
  }

  return {
    improvement,
    percentageGain: typeof percentageGain === "string" ? 100 : Number(percentageGain),
    message,
  };
}

/**
 * Gera relatório descritivo do JSON-LD
 *
 * Útil para logging e debug
 *
 * @param result - JsonLdResult
 * @returns String descritiva
 *
 * @example
 * console.log(debugJsonLdResult(result));
 * // OUTPUT:
 * // ✅ JSON-LD Generated Successfully
 * // Schema Score: 75/100
 * // Type: Restaurant
 * // Fields Populated:
 * //   ✓ Name
 * //   ✓ Address
 * //   ✗ Phone
 * // Recommendations: 3 items
 */
export function debugJsonLdResult(result: JsonLdResult): string {
  const lines: string[] = [];

  lines.push(result.success ? "✅ JSON-LD Generated Successfully" : "❌ Error");
  lines.push(`Schema Score: ${result.schemaScore}/100`);
  lines.push(`Type: ${result.jsonLd["@type"]}`);

  if (result.schemaWarnings.length > 0) {
    lines.push("Missing Fields:");
    for (const w of result.schemaWarnings) {
      lines.push(`  ✗ ${w}`);
    }
  }

  if (result.recommendations.length > 0) {
    lines.push(`Recommendations: ${result.recommendations.length} items`);
    for (const rec of result.recommendations.slice(0, 3)) {
      lines.push(`  • ${rec}`);
    }
    if (result.recommendations.length > 3) {
      lines.push(
        `  ... and ${result.recommendations.length - 3} more`
      );
    }
  }

  return lines.join("\n");
}
