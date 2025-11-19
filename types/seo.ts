/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 1 — SEO ENGINE CORE
 *
 * Tipos principais para o sistema de automação SEO
 * Agnóstico de implementação - funciona com qualquer fonte de dados
 *
 * @file types/seo.ts
 * @since 2025-11-19
 */

/**
 * Variante de idioma/locale para hreflang
 * BLOCO 2: Suporte a multi-idioma
 */
export interface SeoLocaleVariant {
  /** Código do idioma/região no formato IETF: ex: "pt-BR", "en-US", "es-ES" */
  locale: string;

  /** Slug específico para este idioma (se diferente do principal) */
  slug?: string;

  /** URL absoluta específica (se já montada) */
  absoluteUrl?: string;

  /** Se é a versão default/canônica */
  isDefault?: boolean;
}

/**
 * Dados de localização geográfica
 * BLOCO 2: Suporte a geotags
 */
export interface SeoGeoLocation {
  city?: string;
  region?: string;
  countryCode?: string; // ex: "BR", "US", "ES"
  latitude?: number;
  longitude?: number;
}

/**
 * Entrada principal para geração de SEO
 * Contém todos os dados necessários para gerar tags, schema, score
 * BLOCO 1 + BLOCO 2
 */
export interface SeoInput {
  /** Título da página (max 60 chars recomendado) */
  title: string;

  /** Descrição meta (max 155 chars recomendado) */
  description: string;

  /** Slug da página para URL canônica */
  slug: string;

  /** Nome do negócio (para LocalBusiness schema) */
  businessName?: string;

  /** Categoria do negócio (restaurante, loja, serviço, etc) */
  businessCategory?: string;

  /** URL da imagem para OG Image / Twitter Image */
  image?: string;

  /** Keywords para SEO (mínimo 3 recomendado) */
  keywords?: string[];

  /** Data de publicação (para JSON-LD datePublished) */
  publishedAt?: Date;

  /** Data de última atualização (para JSON-LD dateModified) */
  updatedAt?: Date;

  /** Endereço do negócio (para LocalBusiness geolocalização) */
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };

  /** Coordenadas para GeoCoordinates */
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  /** Telefone do negócio (para LocalBusiness) */
  telephone?: string;

  /** Email do negócio */
  email?: string;

  /** URL do website principal do negócio */
  businessUrl?: string;

  /** Horários de funcionamento (para OpeningHours) */
  openingHours?: Array<{
    dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    opens: string; // "09:00"
    closes: string; // "18:00"
  }>;

  /** Preço range para negócio (PriceRange) */
  priceRange?: "$" | "$$" | "$$$" | "$$$$";

  /** Tipo de conteúdo (website, article, product, local_business, etc) */
  contentType?: "website" | "article" | "product" | "local_business" | "service" | "organization";

  /** Idioma da página (BCP 47) */
  language?: string;

  /** Está em draft? Se true, vai ser noindex */
  isDraft?: boolean;

  /** Força noindex específico (além de draft) */
  isNoIndex?: boolean;

  /** Pode ser indexado? (override de isDraft) */
  isIndexable?: boolean;

  /** Autor do conteúdo */
  author?: string;

  /** Tipo de artigo se contentType === "article" */
  articleType?: "NewsArticle" | "BlogPosting" | "ScholarlyArticle";

  /** Duração do conteúdo em minutos (para article/video) */
  readingTimeMinutes?: number;

  /** Tags adicionais (categorias, assuntos) */
  tags?: string[];

  /** Tenant ID para contexto multi-tenant */
  tenantId?: string;

  /** Page ID para referência interna */
  pageId?: string;

  /** ===== BLOCO 2: ADVANCED META TAGS ===== */

  /** Domain principal com protocolo (ex: https://meusite.com) */
  domain?: string;

  /** Variantes de idioma para hreflang (BLOCO 2) */
  locales?: SeoLocaleVariant[];

  /** Dados de localização geográfica (BLOCO 2) */
  location?: SeoGeoLocation;
}

/**
 * Saída do gerador SEO
 * Contém todos os tags, schema, e pontuação
 * BLOCO 1 + BLOCO 2
 */
export interface SeoOutput {
  /** Meta tags HTML (title, description, canonical, etc) */
  metaTags: string;

  /** Open Graph tags (OG) para redes sociais */
  openGraph: string;

  /** Twitter Card tags */
  twitterCard: string;

  /** JSON-LD Schema structured data */
  jsonLd: Record<string, any>;

  /** Pontuação SEO (0-100) */
  score: number;

  /** URL canônica */
  canonicalUrl: string;

  /** Recomendações para melhorar SEO */
  recommendations: SeoRecommendation[];

  /** ===== BLOCO 2: ADVANCED META TAGS ===== */

  /** Hreflang tags para multi-idioma */
  hreflangTags?: string;

  /** Meta robots tag (noindex, nofollow) */
  robotsMeta?: string;

  /** Geolocation tags */
  geoTags?: string;

  /** ===== BLOCO 3: ADVANCED JSON-LD ===== */

  /** Score de completude do schema JSON-LD (0-100) */
  schemaScore?: number;

  /** Warnings sobre campos do schema ausentes */
  schemaWarnings?: string[];

  /** Recomendações para melhorar o schema */
  schemaRecommendations?: string[];

  /** JSON-LD completo gerado (LocalBusiness) */
  schemaJsonLd?: Record<string, any>;
}

/**
 * Recomendação individual de SEO
 */
export interface SeoRecommendation {
  /** Categoria da recomendação */
  category: "TITLE" | "DESCRIPTION" | "KEYWORDS" | "CONTENT" | "PERFORMANCE" | "TECHNICAL" | "SCHEMA";

  /** Mensagem amigável */
  message: string;

  /** Impacto esperado */
  impact: "LOW" | "MEDIUM" | "HIGH";

  /** Score ganho se implementado */
  potentialGain: number;

  /** Sugestão de ação */
  suggestion?: string;

  /** Exemplo correto */
  example?: string;
}

/**
 * Configuração do motor SEO
 */
export interface SeoConfig {
  /** Domain principal (ex: meusite.com) */
  domain: string;

  /** Protocol (https por padrão) */
  protocol?: "https" | "http";

  /** Tenant ID para contexto */
  tenantId?: string;

  /** Desabilitar recomendações (faster mode) */
  skipRecommendations?: boolean;

  /** Desabilitar JSON-LD (rare) */
  skipJsonLd?: boolean;

  /** Locale padrão (pt-BR) */
  defaultLocale?: string;

  /** Social handles para Twitter Card */
  twitterHandle?: string;

  /** Facebook App ID para OG */
  facebookAppId?: string;

  /** Business name padrão (se não fornecido em input) */
  defaultBusinessName?: string;
}

/**
 * Preview para display no dashboard/editor
 */
export interface SeoPreview {
  /** Preview do título no Google */
  googleTitle: string;

  /** Preview da descrição no Google */
  googleDescription: string;

  /** Preview da URL */
  googleUrl: string;

  /** Preview do OG para social */
  socialTitle: string;

  /** Preview da imagem social */
  socialImage?: string;

  /** Preview da descrição social */
  socialDescription: string;

  /** URL compartilhável */
  shareUrl: string;
}

/**
 * Score breakdown para análise detalhada
 */
export interface SeoScoreBreakdown {
  /** Pontuação de Título */
  title: number;

  /** Pontuação de Descrição */
  description: number;

  /** Pontuação de Conteúdo */
  content: number;

  /** Pontuação de Técnico (canonical, robots, etc) */
  technical: number;

  /** Pontuação de Performance (imagens, carregamento) */
  performance: number;

  /** Pontuação de Schema JSON-LD */
  schema: number;

  /** Pontuação total (0-100) */
  total: number;

  /** Breakdown por componente */
  details: Array<{
    component: string;
    current: number;
    max: number;
    percentage: number;
  }>;
}

/**
 * Auditoria SEO completa
 */
export interface SeoAudit {
  /** ID único da auditoria */
  id: string;

  /** Timestamp */
  createdAt: Date;

  /** Score */
  score: SeoScoreBreakdown;

  /** Recomendações prioritizadas */
  recommendations: SeoRecommendation[];

  /** Problemas críticos */
  criticalIssues: string[];

  /** Avisos */
  warnings: string[];

  /** Tudo bem? */
  isHealthy: boolean;

  /** Grade (A+, A, B, C, etc) */
  grade: "A+" | "A" | "B" | "C" | "D" | "F";

  /** JSON-LD válido? */
  schemaValid: boolean;

  /** Canonical correto? */
  canonicalValid: boolean;

  /** Metadata completa? */
  metadataComplete: boolean;
}

/**
 * Cache de SEO por página
 */
export interface SeoCacheEntry {
  /** Key para cache (slug + tenant) */
  key: string;

  /** Output cacheado */
  output: SeoOutput;

  /** Timestamp */
  cachedAt: Date;

  /** TTL em minutos */
  ttlMinutes: number;

  /** Versão de hash do input */
  inputHash: string;

  /** Valido? */
  isValid: boolean;
}

/**
 * Event para auditoria de mudanças SEO
 */
export interface SeoChangeEvent {
  /** ID único do evento */
  id: string;

  /** Tenant ID */
  tenantId: string;

  /** Page ID */
  pageId: string;

  /** Slug */
  slug: string;

  /** Tipo de mudança */
  changeType: "TITLE_UPDATED" | "DESCRIPTION_UPDATED" | "KEYWORDS_UPDATED" | "SCHEMA_UPDATED" | "STATUS_CHANGED";

  /** Valor anterior */
  oldValue?: string;

  /** Novo valor */
  newValue: string;

  /** Impacto esperado no score */
  expectedImpact?: number;

  /** Autor da mudança */
  changedBy?: string;

  /** Timestamp */
  changedAt: Date;
}
