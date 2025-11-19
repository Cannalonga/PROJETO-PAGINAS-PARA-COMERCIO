/**
 * FEATURE 7 — SEO AUTOMATION
 * BLOCO 3 — JSON-LD CATEGORIES MAPPING
 *
 * Mapeia categorias de negócio para tipos Schema.org apropriados
 * Suporta português (PT-BR) e inglês, com fallback inteligente
 *
 * @file lib/seo/seo-jsonld-categories.ts
 * @since 2025-11-19
 */

/**
 * Tipos de negócio suportados no Schema.org
 * Cada um tem seu próprio @type e propriedades
 */
export type SchemaBusinessType =
  | "LocalBusiness"
  | "Restaurant"
  | "Store"
  | "HairSalon"
  | "MedicalBusiness"
  | "ProfessionalService"
  | "HealthAndBeautyBusiness"
  | "FoodEstablishment"
  | "ShoppingMall"
  | "AutoRepair"
  | "LodgingBusiness"
  | "EntertainmentBusiness";

/**
 * Categoria interna do negócio
 */
export type BusinessCategory =
  | "RESTAURANTE"
  | "LOJA"
  | "SALON"
  | "CONSULTORIO"
  | "SERVICOS"
  | "HOTEL"
  | "BAR"
  | "PIZZARIA"
  | "PADARIA"
  | "FARMACIA"
  | "CLINICA"
  | "MECANICA"
  | "CABELEIREIRO"
  | "ESTETICA"
  | "ACADEMIA"
  | "COMERCIO"
  | "OUTRO";

/**
 * Mapeia categoria interna → Schema.org @type
 *
 * Estratégia:
 * 1. Normaliza entrada (trim, uppercase)
 * 2. Verifica categoria específica
 * 3. Fallback para LocalBusiness
 *
 * @param businessCategory - Categoria do negócio (pode ser string qualquer)
 * @returns Tipo Schema.org apropriado
 *
 * @example
 * resolveSchemaBusinessType("PIZZARIA")
 * // → "Restaurant"
 *
 * resolveSchemaBusinessType("cabeleireiro")
 * // → "HairSalon"
 *
 * resolveSchemaBusinessType("xyz-desconhecido")
 * // → "LocalBusiness"
 */
export function resolveSchemaBusinessType(
  businessCategory?: string
): SchemaBusinessType {
  if (!businessCategory) return "LocalBusiness";

  const normalized = businessCategory.trim().toUpperCase();

  // Restaurantes
  if (
    [
      "RESTAURANTE",
      "RESTAURANT",
      "PIZZARIA",
      "PIZZERIA",
      "CHURRASCARIA",
      "CHURRASCARIA",
      "PADARIA",
      "BAKERY",
      "CAFÉ",
      "CAFE",
    ].includes(normalized)
  ) {
    return "Restaurant";
  }

  // Lojas
  if (
    [
      "LOJA",
      "STORE",
      "COMÉRCIO",
      "COMERCIO",
      "SUPERMERCADO",
      "SUPERMARKET",
      "SHOPPING",
      "MALL",
    ].includes(normalized)
  ) {
    return "Store";
  }

  // Salões de beleza
  if (
    [
      "SALON",
      "SALÃO",
      "SALAO",
      "CABELEIREIRO",
      "BARBER",
      "BARBERSHOP",
      "BARBEARIA",
    ].includes(normalized)
  ) {
    return "HairSalon";
  }

  // Saúde e beleza
  if (
    [
      "ESTÉTICA",
      "ESTETICA",
      "ACADEMIA",
      "GYM",
      "ACADEMIA",
      "SPA",
      "WELLNESS",
    ].includes(normalized)
  ) {
    return "HealthAndBeautyBusiness";
  }

  // Medicina
  if (
    [
      "CONSULTORIO",
      "CONSULTÓRIO",
      "MÉDICO",
      "MEDICO",
      "CLÍNICA",
      "CLINICA",
      "HOSPITAL",
      "FARMACIA",
      "FARMÁCIA",
    ].includes(normalized)
  ) {
    return "MedicalBusiness";
  }

  // Serviços profissionais
  if (
    [
      "SERVICOS",
      "SERVIÇOS",
      "SERVICE",
      "ENCANADOR",
      "ELETRICISTA",
      "PEDREIRO",
      "PINTOR",
      "MECANICA",
      "MECÂNICA",
      "AUTOREPAIR",
    ].includes(normalized)
  ) {
    return normalized.includes("MECANICA") || normalized.includes("MECÂNICA")
      ? "AutoRepair"
      : "ProfessionalService";
  }

  // Hospedagem
  if (["HOTEL", "HOSTEL", "BED", "POUSADA"].includes(normalized)) {
    return "LodgingBusiness";
  }

  // Entretenimento
  if (
    [
      "BAR",
      "BOATE",
      "CINEMA",
      "TEATRO",
      "SHOW",
      "ENTRETENIMENTO",
      "ENTERTAINMENT",
    ].includes(normalized)
  ) {
    return "EntertainmentBusiness";
  }

  // Fallback
  return "LocalBusiness";
}

/**
 * Retorna descrição amigável da categoria para o usuário
 *
 * @param type - Schema.org type
 * @returns Descrição legível
 *
 * @example
 * getBusinessTypeLabel("Restaurant")
 * // → "Restaurante, Pizzaria, Café, etc"
 */
export function getBusinessTypeLabel(type: SchemaBusinessType): string {
  switch (type) {
    case "Restaurant":
      return "Restaurante, Pizzaria, Café";
    case "Store":
      return "Loja, Comércio, Supermercado";
    case "HairSalon":
      return "Salão de Beleza, Cabeleireiro";
    case "HealthAndBeautyBusiness":
      return "Estética, Academia, Spa";
    case "MedicalBusiness":
      return "Consultório, Clínica, Farmácia";
    case "AutoRepair":
      return "Mecânica, Oficina";
    case "ProfessionalService":
      return "Serviços Profissionais";
    case "LodgingBusiness":
      return "Hotel, Hospedagem";
    case "EntertainmentBusiness":
      return "Bar, Boate, Cinema";
    case "LocalBusiness":
    default:
      return "Negócio Local";
  }
}

/**
 * Valida se uma categoria é reconhecida
 *
 * @param category - Categoria a validar
 * @returns true se reconhecida
 */
export function isValidBusinessCategory(category?: string): boolean {
  if (!category) return true; // opcional
  return resolveSchemaBusinessType(category) !== "LocalBusiness" ||
    category.toUpperCase() === "OUTRO"
    ? true
    : false;
}

/**
 * Lista todas as categorias suportadas
 *
 * @returns Array de categorias
 */
export function getSupportedCategories(): BusinessCategory[] {
  return [
    "RESTAURANTE",
    "LOJA",
    "SALON",
    "CONSULTORIO",
    "SERVICOS",
    "HOTEL",
    "BAR",
    "PIZZARIA",
    "PADARIA",
    "FARMACIA",
    "CLINICA",
    "MECANICA",
    "CABELEIREIRO",
    "ESTETICA",
    "ACADEMIA",
    "COMERCIO",
    "OUTRO",
  ];
}

/**
 * Constante: mapeamento completo de categorias
 */
export const CATEGORY_MAPPING: Record<BusinessCategory, SchemaBusinessType> = {
  RESTAURANTE: "Restaurant",
  PIZZARIA: "Restaurant",
  PADARIA: "Restaurant",
  BAR: "EntertainmentBusiness",
  LOJA: "Store",
  COMERCIO: "Store",
  SALON: "HairSalon",
  CABELEIREIRO: "HairSalon",
  ESTETICA: "HealthAndBeautyBusiness",
  ACADEMIA: "HealthAndBeautyBusiness",
  CONSULTORIO: "MedicalBusiness",
  CLINICA: "MedicalBusiness",
  FARMACIA: "MedicalBusiness",
  MECANICA: "AutoRepair",
  HOTEL: "LodgingBusiness",
  SERVICOS: "ProfessionalService",
  OUTRO: "LocalBusiness",
};
