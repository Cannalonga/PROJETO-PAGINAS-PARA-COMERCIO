// src/lib/security.ts
/**
 * Security utilities for application-wide use.
 * Includes sanitization, validation, and escaping functions.
 */

/**
 * Escape HTML special characters for safe output.
 * Prevents XSS attacks and XML parsing errors.
 *
 * @param value - String to escape
 * @returns Safely escaped string
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escape JSON for safe embedding in HTML.
 * Prevents script injection through JSON.
 *
 * @param value - Value to JSON-stringify and escape
 * @returns Safely escaped JSON string
 */
export function escapeJson(value: unknown): string {
  const jsonString = JSON.stringify(value);
  return escapeHtml(jsonString);
}

/**
 * Sanitize URL to prevent javascript: and data: protocols.
 * Used for href, src, and other URL attributes.
 *
 * @param url - URL to sanitize
 * @param allowedProtocols - Allowed URL protocols (default: ['http', 'https', 'mailto', 'tel'])
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(
  url: string,
  allowedProtocols: string[] = ["http", "https", "mailto", "tel"]
): string {
  try {
    // Allow relative URLs
    if (url.startsWith("/") || url.startsWith("#")) {
      return url;
    }

    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.slice(0, -1); // Remove trailing ':'

    if (allowedProtocols.includes(protocol)) {
      return url;
    }
  } catch {
    // Invalid URL, return empty
    return "";
  }

  return "";
}

/**
 * Validate and normalize file paths to prevent directory traversal.
 * Used when handling user-provided file paths.
 *
 * @param filePath - Path to validate
 * @param basePath - Base directory (optional)
 * @returns Normalized path or null if invalid
 */
export function validateFilePath(
  filePath: string,
  basePath?: string
): string | null {
  try {
    // Normalize path
    const normalized = filePath
      .replace(/\\/g, "/")
      .split("/")
      .filter((segment) => segment && segment !== ".")
      .join("/");

    // Reject paths with .. (directory traversal)
    if (normalized.includes("..")) {
      return null;
    }

    if (basePath) {
      return `${basePath}/${normalized}`;
    }

    return `/${normalized}`;
  } catch {
    return null;
  }
}

/**
 * Create a Content Security Policy header value.
 * Used to restrict resource loading and prevent XSS.
 *
 * @param options - CSP directives
 * @returns CSP header string
 */
export function buildContentSecurityPolicy(options: {
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  fontSrc?: string[];
}): string {
  const directives: Record<string, string> = {
    "default-src": "'self'",
    "script-src": options.scriptSrc?.join(" ") ?? "'self'",
    "style-src": options.styleSrc?.join(" ") ?? "'self' 'unsafe-inline'",
    "img-src": options.imgSrc?.join(" ") ?? "'self' data: https:",
    "font-src": options.fontSrc?.join(" ") ?? "'self' data:",
    "frame-ancestors": "'none'",
  };

  return Object.entries(directives)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}
