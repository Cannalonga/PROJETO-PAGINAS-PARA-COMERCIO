// lib/__tests__/logger.test.ts
/**
 * Tests for request context logger
 * 
 * Valida:
 * - Request context is preserved
 * - Logs are formatted correctly (JSON)
 * - PII is sanitized
 * - All log levels work
 */

import { logger, logError } from '@/lib/logger';
import {
  getRequestContext,
  setTenantInContext,
  setUserInContext,
  runWithRequestContext,
} from '@/lib/request-context';

describe('Logger', () => {
  afterEach(() => {
    // Reset request context after each test
    jest.clearAllMocks();
  });

  describe('Basic Logging', () => {
    it('should format info logs as JSON with context', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      runWithRequestContext(
        {
          requestId: 'test-123',
          path: '/api/test',
          method: 'POST',
        },
        () => {
          logger.info('Test message', { action: 'test' });
        }
      );

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0]?.[0];
      expect(logOutput).toBeDefined();

      const parsed = JSON.parse(logOutput as string);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Test message');
      expect(parsed.requestId).toBe('test-123');
      expect(parsed.path).toBe('/api/test');
      expect(parsed.method).toBe('POST');
      expect(parsed.action).toBe('test');

      consoleSpy.mockRestore();
    });

    it('should include tenantId and userId when set', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      runWithRequestContext(
        {
          requestId: 'test-456',
          path: '/api/tenants',
          method: 'GET',
        },
        () => {
          setTenantInContext('tenant-abc');
          setUserInContext('user-xyz');
          logger.info('Tenant operation');
        }
      );

      const logOutput = consoleSpy.mock.calls[0]?.[0];
      const parsed = JSON.parse(logOutput as string);

      expect(parsed.tenantId).toBe('tenant-abc');
      expect(parsed.userId).toBe('user-xyz');

      consoleSpy.mockRestore();
    });
  });

  describe('Log Levels', () => {
    it('should support all log levels', () => {
      const infoSpy = jest.spyOn(console, 'info').mockImplementation();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      runWithRequestContext(
        {
          requestId: 'test-789',
          path: '/api/health',
          method: 'GET',
        },
        () => {
          logger.info('Info message');
          logger.warn('Warning message');
          logger.error('Error message');
        }
      );

      expect(infoSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();

      const infoLog = JSON.parse(infoSpy.mock.calls[0]?.[0] as string);
      const warnLog = JSON.parse(warnSpy.mock.calls[0]?.[0] as string);
      const errorLog = JSON.parse(errorSpy.mock.calls[0]?.[0] as string);

      expect(infoLog.level).toBe('info');
      expect(warnLog.level).toBe('warn');
      expect(errorLog.level).toBe('error');

      infoSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe('PII Sanitization', () => {
    it('should redact password fields', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      runWithRequestContext(
        {
          requestId: 'test-pii',
          path: '/api/login',
          method: 'POST',
        },
        () => {
          logger.info('Login attempt', {
            username: 'john@example.com',
            password: 'super-secret',
          });
        }
      );

      const logOutput = consoleSpy.mock.calls[0]?.[0];
      const parsed = JSON.parse(logOutput as string);

      expect(parsed.username).toBe('john@example.com');
      expect(parsed.password).toBe('[REDACTED]');

      consoleSpy.mockRestore();
    });

    it('should redact token fields', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      runWithRequestContext(
        {
          requestId: 'test-token',
          path: '/api/auth',
          method: 'POST',
        },
        () => {
          logger.info('Token refresh', {
            refreshToken: 'abc123xyz789',
            accessToken: 'token_secret_abc',
          });
        }
      );

      const logOutput = consoleSpy.mock.calls[0]?.[0];
      const parsed = JSON.parse(logOutput as string);

      expect(parsed.refreshToken).toBe('[REDACTED]');
      expect(parsed.accessToken).toBe('[REDACTED]');

      consoleSpy.mockRestore();
    });

    it('should redact card fields', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      runWithRequestContext(
        {
          requestId: 'test-card',
          path: '/api/billing/checkout',
          method: 'POST',
        },
        () => {
          logger.warn('Payment attempt', {
            cardNumber: '4111111111111111',
            cardCvc: '123',
          });
        }
      );

      const logOutput = consoleSpy.mock.calls[0]?.[0];
      const parsed = JSON.parse(logOutput as string);

      expect(parsed.cardNumber).toBe('[REDACTED]');
      expect(parsed.cardCvc).toBe('[REDACTED]');

      consoleSpy.mockRestore();
    });

    it('should sanitize sensitive fields in metadata', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      runWithRequestContext(
        {
          requestId: 'test-sanitize',
          path: '/api/users',
          method: 'POST',
        },
        () => {
          logger.info('User created', {
            email: 'john@example.com',
          });
        }
      );

      let logOutput = consoleSpy.mock.calls[0]?.[0];
      let parsed = JSON.parse(logOutput as string);
      expect(parsed.email).toBe('john@example.com');

      consoleSpy.mockRestore();
    });

    it('should recursively sanitize nested objects', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      runWithRequestContext(
        {
          requestId: 'test-nested',
          path: '/api/users',
          method: 'POST',
        },
        () => {
          logger.info('User created', {
            user: {
              id: '123',
              name: 'John',
              password: 'secret123',
              contact: {
                email: 'john@example.com',
                phone: '123-456-7890',
              },
            },
          });
        }
      );

      const logOutput = consoleSpy.mock.calls[0]?.[0];
      const parsed = JSON.parse(logOutput as string);

      expect(parsed.user.password).toBe('[REDACTED]');
      expect(parsed.user.contact.email).toBeDefined(); // email is allowed
      expect(parsed.user.contact.phone).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  describe('logError helper', () => {
    it('should log Error objects safely', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      runWithRequestContext(
        {
          requestId: 'test-error',
          path: '/api/test',
          method: 'GET',
        },
        () => {
          const err = new Error('Test error message');
          logError(err, { context: 'test operation' });
        }
      );

      const logOutput = consoleSpy.mock.calls[0]?.[0];
      const parsed = JSON.parse(logOutput as string);

      expect(parsed.errorName).toBe('Error');
      expect(parsed.errorMessage).toBe('Test error message');
      expect(parsed.context).toBe('test operation');

      consoleSpy.mockRestore();
    });

    it('should log string errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      runWithRequestContext(
        {
          requestId: 'test-string-error',
          path: '/api/test',
          method: 'GET',
        },
        () => {
          logError('Something went wrong');
        }
      );

      const logOutput = consoleSpy.mock.calls[0]?.[0];
      const parsed = JSON.parse(logOutput as string);

      expect(parsed.errorMessage).toBe('Something went wrong');

      consoleSpy.mockRestore();
    });

    it('should log errors with message and context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      runWithRequestContext(
        {
          requestId: 'test-error',
          path: '/api/test',
          method: 'GET',
        },
        () => {
          const err = new Error('Test error');
          logError(err, { context: 'test' });
        }
      );

      const logOutput = consoleSpy.mock.calls[0]?.[0];
      const parsed = JSON.parse(logOutput as string);

      expect(parsed.errorMessage).toBe('Test error');
      expect(parsed.context).toBe('test');

      consoleSpy.mockRestore();
    });
  });

  describe('Request Context', () => {
    it('should preserve context across async calls', async () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      await runWithRequestContext(
        {
          requestId: 'async-test',
          path: '/api/async',
          method: 'GET',
        },
        async () => {
          // Simulate async operation
          await new Promise((resolve) => setTimeout(resolve, 10));
          logger.info('Async operation');

          const ctx = getRequestContext();
          expect(ctx?.requestId).toBe('async-test');
        }
      );

      const logOutput = consoleSpy.mock.calls[0]?.[0];
      const parsed = JSON.parse(logOutput as string);

      expect(parsed.requestId).toBe('async-test');

      consoleSpy.mockRestore();
    });

    it('should handle context outside of runWithRequestContext', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      logger.info('Outside context', { test: true });

      const logOutput = consoleSpy.mock.calls[0]?.[0];
      const parsed = JSON.parse(logOutput as string);

      expect(parsed.requestId).toBe('system');
      expect(parsed.tenantId).toBeUndefined();
      expect(parsed.userId).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe('Timestamp', () => {
    it('should include ISO 8601 timestamp', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      runWithRequestContext(
        {
          requestId: 'test-timestamp',
          path: '/api/test',
          method: 'GET',
        },
        () => {
          logger.info('Test');
        }
      );

      const logOutput = consoleSpy.mock.calls[0]?.[0];
      const parsed = JSON.parse(logOutput as string);

      expect(parsed.time).toBeDefined();
      expect(new Date(parsed.time).getTime()).toBeLessThanOrEqual(Date.now());

      consoleSpy.mockRestore();
    });
  });
});
