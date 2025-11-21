// lib/validations/seo.ts
/**
 * SEO Validation Schemas
 *
 * Zod schemas for validating SEO input from admin panel.
 * Prevents XSS attacks and ensures proper SEO field lengths.
 */

import { z } from "zod";

/**
 * SEO input validation schema
 *
 * Ensures:
 * - seoTitle: 3-60 characters (Google displays ~55-60 chars)
 * - seoDescription: 10-160 characters (Google displays ~155-160 chars)
 * - seoNoIndex: boolean flag
 *
 * All fields are optional to allow clearing overrides
 */
export const seoInputSchema = z.object({
  seoTitle: z
    .string()
    .min(3, "SEO title must be at least 3 characters")
    .max(60, "SEO title must be at most 60 characters")
    .optional()
    .nullable(),
  seoDescription: z
    .string()
    .min(10, "SEO description must be at least 10 characters")
    .max(160, "SEO description must be at most 160 characters")
    .optional()
    .nullable(),
  seoKeywords: z
    .string()
    .optional()
    .nullable(),
  seoImage: z
    .string()
    .url("SEO image must be a valid URL")
    .optional()
    .nullable(),
  seoNoIndex: z
    .boolean()
    .optional(),
});

export type SeoInputType = z.infer<typeof seoInputSchema>;

/**
 * Validate SEO input
 *
 * Safely parses and validates SEO fields.
 * Returns { success: true, data } or { success: false, error }
 *
 * @param input Raw input from request
 * @returns Validated SEO data or error
 *
 * @example
 * const result = validateSeoInput(req.body);
 * if (!result.success) {
 *   return { error: result.error.flatten() };
 * }
 * // result.data is type-safe SeoInputType
 */
export function validateSeoInput(input: unknown) {
  return seoInputSchema.safeParse(input);
}

/**
 * Validate SEO title
 *
 * @param title Title to validate
 * @returns true if valid, false otherwise
 */
export function isValidSeoTitle(title?: string | null): boolean {
  if (!title) return true; // Optional field
  return title.length >= 3 && title.length <= 60;
}

/**
 * Validate SEO description
 *
 * @param description Description to validate
 * @returns true if valid, false otherwise
 */
export function isValidSeoDescription(description?: string | null): boolean {
  if (!description) return true; // Optional field
  return description.length >= 10 && description.length <= 160;
}

/**
 * Sanitize SEO string
 *
 * Removes dangerous characters while preserving meaning
 * Prevents XSS via SEO fields
 *
 * @param value String to sanitize
 * @returns Sanitized string
 */
export function sanitizeSeoString(value: string): string {
  if (!value) return value;

  // Decode HTML entities to prevent bypass via encoding
  let decoded = value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");

  return decoded
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove dangerous URLs
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    // Final trim
    .trim();
}

/**
 * Validate SEO object (complete validation)
 *
 * @param seo SEO object to validate
 * @returns true if all fields are valid, false otherwise
 */
export function isValidSeo(seo: {
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoNoIndex?: boolean | null;
}): boolean {
  return (
    isValidSeoTitle(seo.seoTitle) &&
    isValidSeoDescription(seo.seoDescription) &&
    (typeof seo.seoNoIndex === "boolean" || typeof seo.seoNoIndex === "undefined")
  );
}
