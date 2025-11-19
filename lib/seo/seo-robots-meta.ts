/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 2 — ROBOTS META INTELIGENTE
 *
 * Gera <meta name="robots" content="..."> baseado em
 * status da página (draft, published, noindex, etc)
 *
 * @file lib/seo/seo-robots-meta.ts
 * @since 2025-11-19
 */

/**
 * Configuração para robots meta
 */
export interface RobotsConfig {
  /** Página em rascunho? (força noindex, nofollow) */
  isDraft?: boolean;

  /** Força noindex independente de draft */
  isNoIndex?: boolean;

  /** Permite index? (default: true se não draft) */
  allowIndex?: boolean;

  /** Permite follow de links? (default: true) */
  allowFollow?: boolean;
}

/**
 * Valores possíveis para robots meta
 */
export type RobotsValue =
  | "index,follow"
  | "index,nofollow"
  | "noindex,follow"
  | "noindex,nofollow";

/**
 * Retorna a tag <meta name="robots" ...> adequada
 *
 * Regras de prioridade:
 * 1. Draft → noindex, nofollow (proteção)
 * 2. isNoIndex → noindex, allow-follow
 * 3. Padrão → index, follow
 *
 * @param config - Configuração de robots
 * @returns String HTML com meta tag
 *
 * @example
 * // Página em draft
 * buildRobotsMeta({ isDraft: true })
 * // Returns: <meta name="robots" content="noindex,nofollow" />
 *
 * // Página noindex mas deixa follow
 * buildRobotsMeta({ isNoIndex: true })
 * // Returns: <meta name="robots" content="noindex,follow" />
 *
 * // Página normal
 * buildRobotsMeta({ isDraft: false })
 * // Returns: <meta name="robots" content="index,follow" />
 */
export function buildRobotsMeta(config: RobotsConfig): string {
  const { isDraft, isNoIndex, allowIndex, allowFollow } = config;

  // Regra 1: Draft sempre protegido
  if (isDraft === true) {
    return `<meta name="robots" content="noindex,nofollow" />`;
  }

  // Regra 2: Força noindex
  if (isNoIndex === true) {
    return `<meta name="robots" content="noindex,follow" />`;
  }

  // Regra 3: Respeita override de allowIndex/allowFollow
  const index = allowIndex === false ? "noindex" : "index";
  const follow = allowFollow === false ? "nofollow" : "follow";

  return `<meta name="robots" content="${index},${follow}" />`;
}

/**
 * Retorna apenas o valor (sem a tag completa)
 *
 * @param config - Configuração
 * @returns Ex: "index,follow"
 */
export function getRobotsValue(config: RobotsConfig): RobotsValue {
  const tag = buildRobotsMeta(config);
  const match = tag.match(/content="([^"]+)"/);
  return (match?.[1] as RobotsValue) ?? "index,follow";
}

/**
 * Valida se um valor de robots é válido
 *
 * @param value - Valor a validar
 * @returns true se válido
 */
export function isValidRobotsValue(value: string): boolean {
  const valid: RobotsValue[] = [
    "index,follow",
    "index,nofollow",
    "noindex,follow",
    "noindex,nofollow",
  ];
  return valid.includes(value as RobotsValue);
}

/**
 * Interpreta uma tag robots meta existente
 *
 * @param tag - Tag HTML completa ou valor
 * @returns Objeto com interpretação
 *
 * @example
 * parseRobotsMeta("noindex,nofollow")
 * // Returns: { indexable: false, followable: false, isDraft: true }
 *
 * parseRobotsMeta("<meta name="robots" content="index,follow" />")
 * // Returns: { indexable: true, followable: true, isDraft: false }
 */
export function parseRobotsMeta(tag: string): {
  indexable: boolean;
  followable: boolean;
  isDraft: boolean;
} {
  const value = tag.includes("content=")
    ? tag.match(/content="([^"]+)"/)?.[1] ?? ""
    : tag;

  const indexable = !value.includes("noindex");
  const followable = !value.includes("nofollow");
  const isDraft = value === "noindex,nofollow";

  return { indexable, followable, isDraft };
}

/**
 * Gera robots meta baseado em rota (padrão recomendado)
 *
 * @param route - Rota da página
 * @returns Configuração recomendada de robots
 *
 * @example
 * getRobotsForRoute("/produtos/pizza")
 * // Returns: { isDraft: false, allowIndex: true, allowFollow: true }
 *
 * getRobotsForRoute("/admin/dashboard")
 * // Returns: { isDraft: true, allowIndex: false, allowFollow: false }
 */
export function getRobotsForRoute(route: string): RobotsConfig {
  const lower = route.toLowerCase();

  // Rotas administrativas
  if (
    lower.includes("/admin") ||
    lower.includes("/dashboard") ||
    lower.includes("/settings")
  ) {
    return { isDraft: true, allowIndex: false, allowFollow: false };
  }

  // Rotas privadas
  if (
    lower.includes("/private") ||
    lower.includes("/api") ||
    lower.includes("/internal")
  ) {
    return { isNoIndex: true, allowFollow: false };
  }

  // Rotas de preview/rascunho
  if (
    lower.includes("/preview") ||
    lower.includes("/draft") ||
    lower.includes("/staging")
  ) {
    return { isDraft: true };
  }

  // Páginas públicas normais
  return { isDraft: false, allowIndex: true, allowFollow: true };
}

/**
 * Cria config robotics para diferentes tipos de conteúdo
 *
 * @param contentType - Tipo de conteúdo
 * @returns Configuração recomendada
 */
export function getRobotsForContentType(
  contentType?: string
): RobotsConfig {
  switch (contentType?.toLowerCase()) {
    case "draft":
    case "rascunho":
      return { isDraft: true };

    case "archived":
    case "arquivado":
      return { isNoIndex: true, allowFollow: true };

    case "private":
    case "privado":
      return { isNoIndex: true, allowFollow: false };

    case "published":
    case "publicado":
    default:
      return { isDraft: false };
  }
}
