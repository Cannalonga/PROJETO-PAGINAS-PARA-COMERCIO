// Types para todo o projeto
export type UserRole = 'SUPERADMIN' | 'OPERADOR' | 'CLIENTE_ADMIN' | 'CLIENTE_USER';
export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PageTemplate = 'LOJA' | 'RESTAURANTE' | 'SERVICOS' | 'CONSULTORIO' | 'SALON' | 'CUSTOM';
export type BillingStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
export type BillingPlan = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
export type EventType = 'PAGE_VIEW' | 'BUTTON_CLICK' | 'FORM_SUBMISSION' | 'PHONE_CALL' | 'WHATSAPP_CLICK';

// Interfaces para Tenant
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  cnpj?: string;
  status: TenantStatus;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  customDomain?: string;
  logoUrl?: string;
  faviconUrl?: string;
  billingStatus: BillingStatus;
  billingPlan: BillingPlan;
  stripeCustomerId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces para User
export interface User {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  tenantId?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces para Page
export interface Page {
  id: string;
  slug: string;
  title: string;
  description?: string;
  template: PageTemplate;
  status: PageStatus;
  content?: Record<string, any>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoImage?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  hours?: Record<string, any>;
  ctaText?: string;
  ctaUrl?: string;
  heroImage?: string;
  gallery?: string[];
  publishedAt?: Date;
  scheduledPublishAt?: Date;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces para Payment
export interface Payment {
  id: string;
  tenantId: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces para Analytics
export interface AnalyticsEvent {
  id: string;
  tenantId: string;
  eventType: EventType;
  metadata?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

// DTOs para requisições
export interface CreateTenantDTO {
  name: string;
  cnpj?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logoUrl?: string;
}

export interface UpdateTenantDTO extends Partial<CreateTenantDTO> {
  id: string;
}

export interface CreatePageDTO {
  slug: string;
  title: string;
  description?: string;
  template: PageTemplate;
  tenantId: string;
  content?: Record<string, any>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  hours?: Record<string, any>;
  heroImage?: string;
}

export interface UpdatePageDTO extends Partial<CreatePageDTO> {
  id: string;
  status?: PageStatus;
}

// Response envelope
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
