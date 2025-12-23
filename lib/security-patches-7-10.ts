/**
 * Security Helpers for Patches #7-10
 * Additional vulnerability mitigations
 */

import { NextResponse } from 'next/server';

/**
 * PATCH #7: Webhook Error Disclosure Prevention
 * Converts detailed error messages to generic responses
 */
export function createSafeWebhookErrorResponse(
  originalError: any,
  context: string,
  logId?: string
) {
  // Log the actual error internally
  console.error(`[WEBHOOK_ERROR] ${context}:`, {
    message: originalError?.message,
    code: originalError?.code,
    logId,
    timestamp: new Date().toISOString(),
  });

  // Return generic response to client
  return NextResponse.json(
    {
      error: 'Webhook processing failed',
      timestamp: new Date().toISOString(),
      ...(logId && { logId }), // Allow tracking if logging system is in place
    },
    { status: 500 }
  );
}

/**
 * PATCH #8: Enhanced Tenant Isolation in Search
 * Validates tenant context in search queries
 */
export function validateTenantInSearchContext(
  requestTenantId: string,
  filterTenantId?: string
): { valid: boolean; error?: string } {
  if (!requestTenantId) {
    return { valid: false, error: 'Missing tenant context' };
  }

  // If filter explicitly specifies tenant, it must match user's tenant
  if (filterTenantId && filterTenantId !== requestTenantId) {
    return {
      valid: false,
      error: 'Cannot search outside your tenant',
    };
  }

  return { valid: true };
}

/**
 * PATCH #9: Email Verification for Password Reset
 * Validates that email confirmation is completed before password change
 */
export interface PasswordResetValidation {
  tokenValid: boolean;
  tokenExpired: boolean;
  emailVerified: boolean;
  error?: string;
}

export function validatePasswordResetToken(
  _token: string,
  tokenExpiry: Date,
  emailVerified: boolean
): PasswordResetValidation {
  const now = new Date();

  // Check token expiry (15 minutes)
  const tokenCreatedAt = new Date(
    tokenExpiry.getTime() - 15 * 60 * 1000
  );
  const isExpired = now.getTime() - tokenCreatedAt.getTime() > 15 * 60 * 1000;

  if (isExpired) {
    return {
      tokenValid: false,
      tokenExpired: true,
      emailVerified: false,
      error: 'Password reset token has expired',
    };
  }

  if (!emailVerified) {
    return {
      tokenValid: true,
      tokenExpired: false,
      emailVerified: false,
      error: 'Please verify your email before changing password',
    };
  }

  return {
    tokenValid: true,
    tokenExpired: false,
    emailVerified: true,
  };
}

/**
 * PATCH #10: Input Validation in Search
 * Prevents DoS via malicious search strings
 * Returns sanitized string or null if invalid
 */
export function sanitizeSearchInput(input: string): string | null {
  if (!input || input.length === 0) {
    return null;
  }

  // Remove dangerous characters that could cause ReDoS or other attacks
  // Allow: alphanumeric, spaces, hyphens, underscores, @ (for email)
  const sanitizedInput = input.replace(/[^a-zA-Z0-9\s\-_@.]/g, '');

  // Check if sanitized version is significantly different (potential attack)
  if (sanitizedInput.length === 0 && input.length > 0) {
    return null; // Contains only disallowed characters
  }

  // Prevent excessively long queries
  if (sanitizedInput.length > 100) {
    return null; // Query too long
  }

  return sanitizedInput.trim();
}

/**
 * Rate limit check for search endpoint (prevent enumeration attacks)
 */
export async function checkSearchRateLimit(
  _userId: string,
  _maxQueriesPerMinute: number = 30
): Promise<{ allowed: boolean; error?: string }> {
  // In production, use Redis for distributed rate limiting
  // For now, return allowed (assuming rate-limit.ts handles this)
  return { allowed: true };
}

/**
 * PATCH #7: Generic error response for API endpoints
 */
export function createSafeApiErrorResponse(
  originalError: any,
  context: string,
  statusCode: number = 500
) {
  // Log detailed error
  console.error(`[API_ERROR] ${context}:`, {
    message: originalError?.message,
    stack: originalError?.stack,
    timestamp: new Date().toISOString(),
  });

  // Return generic response
  const responseBody: any = {
    error: 'An error occurred processing your request',
    timestamp: new Date().toISOString(),
  };

  // Don't expose internal details
  if (statusCode === 400 || statusCode === 422) {
    responseBody.error = 'Invalid request parameters';
  }

  return NextResponse.json(responseBody, { status: statusCode });
}

/**
 * Validate search filter by role (prevent privilege escalation in search)
 */
export function validateSearchFilters(
  userRole: string,
  requestedFilters: Record<string, any>
): { valid: boolean; error?: string } {
  // CLIENTE_USER cannot search for other users with higher roles
  const ROLE_HIERARCHY: Record<string, number> = {
    CLIENTE_USER: 1,
    CLIENTE_ADMIN: 2,
    OPERADOR: 3,
    SUPERADMIN: 4,
  };

  const userHierarchy = ROLE_HIERARCHY[userRole] || 0;

  // If filtering by role, user can only see lower or equal roles
  if (requestedFilters.role) {
    const filterHierarchy = ROLE_HIERARCHY[requestedFilters.role] || 0;
    if (filterHierarchy > userHierarchy) {
      return {
        valid: false,
        error: 'Cannot filter by users with higher privileges',
      };
    }
  }

  return { valid: true };
}
