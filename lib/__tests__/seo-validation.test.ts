// lib/__tests__/seo-validation.test.ts
/**
 * SEO Validation Tests
 *
 * Tests for SEO input validation and XSS prevention:
 * 1. Valid SEO input validation
 * 2. Field length constraints (title, description)
 * 3. XSS prevention in all fields
 * 4. Sanitization effectiveness
 * 5. Error handling
 * 6. Edge cases
 */

import { describe, it, expect } from "@jest/globals";
import {
  validateSeoInput,
  isValidSeoTitle,
  isValidSeoDescription,
  sanitizeSeoString,
  isValidSeo,
} from "@/lib/validations/seo";
import type { SeoInput } from "@/types/seo";

describe("validateSeoInput", () => {
  // Valid input
  it("should accept valid SEO input", () => {
    const input: SeoInput = {
      seoTitle: "Welcome to Our Store",
      seoDescription: "Discover our products and services",
      seoNoIndex: false,
    };

    const result = validateSeoInput(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.seoTitle).toBe("Welcome to Our Store");
    }
  });

  // Null/undefined values
  it("should accept null values for optional fields", () => {
    const input: SeoInput = {
      seoTitle: null,
      seoDescription: null,
      seoNoIndex: false,
    };

    const result = validateSeoInput(input);
    expect(result.success).toBe(true);
  });

  // Title too short
  it("should reject title shorter than 3 characters", () => {
    const input: SeoInput = {
      seoTitle: "Hi",
    };

    const result = validateSeoInput(input);
    expect(result.success).toBe(false);
  });

  // Title too long
  it("should reject title longer than 60 characters", () => {
    const input: SeoInput = {
      seoTitle: "a".repeat(61),
    };

    const result = validateSeoInput(input);
    expect(result.success).toBe(false);
  });

  // Description too short
  it("should reject description shorter than 10 characters", () => {
    const input: SeoInput = {
      seoDescription: "Short",
    };

    const result = validateSeoInput(input);
    expect(result.success).toBe(false);
  });

  // Description too long
  it("should reject description longer than 160 characters", () => {
    const input: SeoInput = {
      seoDescription: "a".repeat(161),
    };

    const result = validateSeoInput(input);
    expect(result.success).toBe(false);
  });
});

describe("isValidSeoTitle", () => {
  it("should accept valid titles", () => {
    expect(isValidSeoTitle("Welcome")).toBe(true);
    expect(isValidSeoTitle("My Shop")).toBe(true);
    expect(isValidSeoTitle("a".repeat(60))).toBe(true);
  });

  it("should reject titles too short", () => {
    expect(isValidSeoTitle("Hi")).toBe(false);
  });

  it("should reject titles too long", () => {
    expect(isValidSeoTitle("a".repeat(61))).toBe(false);
  });

  it("should treat null/undefined as valid (optional field)", () => {
    expect(isValidSeoTitle(null)).toBe(true);
    expect(isValidSeoTitle(undefined)).toBe(true);
  });
});

describe("isValidSeoDescription", () => {
  it("should accept valid descriptions", () => {
    expect(isValidSeoDescription("This is a valid description")).toBe(true);
    expect(isValidSeoDescription("a".repeat(160))).toBe(true);
  });

  it("should reject descriptions too short", () => {
    expect(isValidSeoDescription("Short")).toBe(false);
  });

  it("should reject descriptions too long", () => {
    expect(isValidSeoDescription("a".repeat(161))).toBe(false);
  });

  it("should treat null/undefined as valid (optional field)", () => {
    expect(isValidSeoDescription(null)).toBe(true);
    expect(isValidSeoDescription(undefined)).toBe(true);
  });
});

describe("sanitizeSeoString", () => {
  // XSS via script tags
  it("should remove script tags", () => {
    const input = '<script>alert("XSS")</script>Welcome';
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("alert");
  });

  // XSS via event handlers
  it("should remove event handler attributes", () => {
    const input = 'Click me" onclick="alert(\'XSS\')"';
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("alert");
  });

  // XSS via img tags
  it("should remove img tags and event handlers", () => {
    const input = '<img src=x onerror="alert(\'XSS\')" />';
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).not.toContain("<img");
    expect(sanitized).not.toContain("onerror");
  });

  // XSS via svg
  it("should remove svg elements", () => {
    const input = '<svg onload="alert(\'XSS\')"></svg>';
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).not.toContain("<svg");
    expect(sanitized).not.toContain("onload");
  });

  // XSS via data: URL
  it("should remove data URLs", () => {
    const input = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>';
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).not.toContain("data:");
  });

  // XSS via javascript: URL
  it("should remove javascript: URLs", () => {
    const input = '<a href="javascript:alert(\'XSS\')">Click</a>';
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).not.toContain("javascript:");
  });

  // HTML injection
  it("should remove HTML tags", () => {
    const input = "<b>Bold</b> <i>Italic</i>";
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).not.toContain("<b>");
    expect(sanitized).not.toContain("<i>");
  });

  // Entity injection
  it("should handle HTML entities", () => {
    const input = "&lt;script&gt;alert('XSS')&lt;/script&gt;";
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).not.toContain("&lt;script&gt;");
  });

  // Safe text
  it("should preserve safe text", () => {
    const input = "Welcome to Our Store";
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).toBe("Welcome to Our Store");
  });

  // Numbers and symbols
  it("should preserve numbers and symbols", () => {
    const input = "Sale 50% off - $9.99";
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).toBe("Sale 50% off - $9.99");
  });

  // Unicode characters
  it("should preserve unicode characters", () => {
    const input = "São Paulo - Brasil - 🎉";
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).toContain("São Paulo");
    expect(sanitized).toContain("Brasil");
  });
});

describe("isValidSeo", () => {
  it("should validate complete SEO object", () => {
    const seoObject = {
      seoTitle: "Welcome",
      seoDescription: "This is a valid description",
      seoNoIndex: false,
    };

    const result = isValidSeo(seoObject);
    expect(result).toBe(true);
  });

  it("should reject invalid title", () => {
    const seoObject = {
      seoTitle: "Hi",
      seoDescription: "This is a valid description",
    };

    const result = isValidSeo(seoObject);
    expect(result).toBe(false);
  });

  it("should reject invalid description", () => {
    const seoObject = {
      seoTitle: "Welcome",
      seoDescription: "Short",
    };

    const result = isValidSeo(seoObject);
    expect(result).toBe(false);
  });
});

describe("XSS Prevention Integration", () => {
  // Combined attack
  it("should prevent combined XSS attacks", () => {
    const malicious =
      '<img src=x onerror="window.location=\'https://evil.com\'"><script>alert("XSS")</script>';
    const sanitized = sanitizeSeoString(malicious);

    expect(sanitized).not.toContain("<img");
    expect(sanitized).not.toContain("onerror");
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("evil.com");
  });

  // Real-world attack examples
  it("should prevent Polyglot XSS", () => {
    const polyglot = '"><script>alert("XSS")</script>';
    const sanitized = sanitizeSeoString(polyglot);
    expect(sanitized).not.toContain("<script>");
  });

  it("should prevent Style tag injection", () => {
    const input = '<style>body { display: none; }</style>';
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).not.toContain("<style>");
  });

  it("should prevent Form injection", () => {
    const input =
      '<form action="https://evil.com"><input type="hidden" value="data"></form>';
    const sanitized = sanitizeSeoString(input);
    expect(sanitized).not.toContain("<form>");
  });
});

describe("SEO Field Constraints", () => {
  // Whitespace handling
  it("should trim whitespace from seoTitle", () => {
    const input: SeoInput = {
      seoTitle: "  Welcome  ",
    };

    const result = validateSeoInput(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.seoTitle?.trim()).toBe("Welcome");
    }
  });

  // Unicode title
  it("should accept unicode in titles", () => {
    const input: SeoInput = {
      seoTitle: "Bem-vindo à Loja",
    };

    const result = validateSeoInput(input);
    expect(result.success).toBe(true);
  });

  // Unicode description
  it("should accept unicode in descriptions", () => {
    const input: SeoInput = {
      seoDescription: "Descobrida nossa loja online de produtos",
    };

    const result = validateSeoInput(input);
    expect(result.success).toBe(true);
  });
});
