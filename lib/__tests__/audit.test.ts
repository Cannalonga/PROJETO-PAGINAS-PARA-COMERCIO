/**
 * lib/__tests__/audit.test.ts
 * 
 * Teste básico da função de auditoria
 * Expande conforme adiciona funcionalidades
 */

import { maskPii } from '@/lib/audit';

describe('Audit Logging', () => {
  describe('maskPii', () => {
    it('should mask email addresses', () => {
      const data = { email: 'user@example.com' };
      const masked = maskPii(data);
      expect(masked.email).toMatch(/u\*+@example\.com/);
      expect(masked.email).not.toContain('user@example.com');
    });

    it('should mask phone numbers', () => {
      const data = { phone: '+55 11 98765-4321' };
      const masked = maskPii(data);
      expect(masked.phone).toContain('****');
      expect(masked.phone).not.toContain('98765-4321');
    });

    it('should redact passwords', () => {
      const data = { password: 'secret123' };
      const masked = maskPii(data);
      expect(masked.password).toBe('***REDACTED***');
    });

    it('should not mask non-PII fields', () => {
      const data = { name: 'John Doe', action: 'login' };
      const masked = maskPii(data);
      expect(masked.name).toBe('John Doe');
      expect(masked.action).toBe('login');
    });

    it('should preserve original object (immutability)', () => {
      const original = { email: 'user@example.com', name: 'Test' };
      const masked = maskPii(original);
      expect(original.email).toBe('user@example.com');
      expect(masked.email).not.toBe('user@example.com');
    });
  });
});
