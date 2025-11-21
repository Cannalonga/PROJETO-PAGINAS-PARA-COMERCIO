/**
 * lib/validations/pages.ts
 * ✅ Zod schemas for page validation
 */

import { z } from 'zod';

export const createPageSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(120),
  slug: z
    .string()
    .min(3, 'Slug deve ter pelo menos 3 caracteres')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras, números e hífen'),
  description: z.string().max(500).optional().nullable(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  templateId: z.string().uuid('ID de template inválido').optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  // SEO fields
  seoTitle: z.string().min(3, 'SEO title deve ter pelo menos 3 caracteres').max(60, 'SEO title deve ter no máximo 60 caracteres').optional().nullable(),
  seoDescription: z.string().min(10, 'SEO description deve ter pelo menos 10 caracteres').max(160, 'SEO description deve ter no máximo 160 caracteres').optional().nullable(),
  seoImage: z.string().url('URL de imagem inválida').optional().nullable(),
  seoNoIndex: z.boolean().default(false).optional(),
});

export const updatePageSchema = createPageSchema.partial().strict();

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;

export const listPagesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  search: z.string().optional(),
});

export type ListPagesInput = z.infer<typeof listPagesSchema>;
