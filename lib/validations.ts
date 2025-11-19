import { z } from 'zod';

/**
 * PAGE ID VALIDATION
 */
export const validatePageId = (pageId: string): boolean => {
  return /^[a-z0-9]{10,}$/i.test(pageId);
};

/**
 * TENANT VALIDATIONS
 */
export const CreateTenantSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase(),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 98765-4321')
    .optional(),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos')
    .optional(),
  address: z
    .string()
    .max(255, 'Endereço muito longo')
    .optional(),
  metadata: z.record(z.any()).optional(),
});

export const UpdateTenantSchema = CreateTenantSchema.partial();

export const TenantQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  search: z.string().max(100).optional(),
});

/**
 * USER VALIDATIONS
 */
export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[!@#$%^&*]/, 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)'),
  firstName: z
    .string()
    .min(2, 'Primeiro nome deve ter no mínimo 2 caracteres')
    .max(100, 'Primeiro nome muito longo'),
  lastName: z
    .string()
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
    .max(100, 'Sobrenome muito longo'),
  role: z.enum(['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER']).default('CLIENTE_USER'),
  tenantId: z.string().uuid('Tenant ID inválido').optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['SUPERADMIN', 'OPERADOR', 'CLIENTE_ADMIN', 'CLIENTE_USER']).optional(),
  isActive: z.boolean().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual obrigatória'),
  newPassword: z
    .string()
    .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter letra maiúscula')
    .regex(/[0-9]/, 'Deve conter número')
    .regex(/[!@#$%^&*]/, 'Deve conter caractere especial'),
});

/**
 * PAGE VALIDATIONS
 */
export const CreatePageSchema = z.object({
  title: z
    .string()
    .min(3, 'Título mínimo 3 caracteres')
    .max(100, 'Título máximo 100 caracteres'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')
    .optional(),
  template: z.enum(['LOJA', 'RESTAURANTE', 'SERVICOS', 'PROFISSIONAL']).default('LOJA'),
  content: z.record(z.any()).optional(),
  seoDescription: z.string().max(160, 'Meta description máximo 160 caracteres').optional(),
  seoKeywords: z.string().max(255).optional(),
  isPublished: z.boolean().default(false),
  tenantId: z.string().uuid('Tenant ID obrigatório'),
});

export const UpdatePageSchema = CreatePageSchema.partial().omit({ tenantId: true });

export const PageQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  template: z.enum(['LOJA', 'RESTAURANTE', 'SERVICOS', 'PROFISSIONAL']).optional(),
  isPublished: z.boolean().optional(),
  tenantId: z.string().uuid().optional(),
});

/**
 * ANALYTICS VALIDATIONS
 */
export const AnalyticsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  eventType: z.string().optional(),
  tenantId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * PAYMENT VALIDATIONS
 */
export const CreatePaymentSchema = z.object({
  tenantId: z.string().uuid('Tenant ID obrigatório'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  billingPlan: z.enum(['STARTER', 'BUSINESS', 'ENTERPRISE']),
  paymentMethodId: z.string().optional(),
});

/**
 * Type Inference
 */
export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;
export type TenantQueryInput = z.infer<typeof TenantQuerySchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type CreatePageInput = z.infer<typeof CreatePageSchema>;
export type UpdatePageInput = z.infer<typeof UpdatePageSchema>;
export type PageQueryInput = z.infer<typeof PageQuerySchema>;
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
