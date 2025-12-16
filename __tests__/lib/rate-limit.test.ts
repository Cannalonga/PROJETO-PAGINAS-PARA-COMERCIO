/**
 * __tests__/lib/rate-limit.test.ts
 * ✅ Tests for rate limiting functionality
 */

import { rateLimit, rateLimitProfiles } from '@/lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve permitir requisições dentro do limite', async () => {
    const config = { maxRequests: 3, windowSeconds: 60 };

    const res1 = await rateLimit('test-ip:route', config);
    const res2 = await rateLimit('test-ip:route', config);
    const res3 = await rateLimit('test-ip:route', config);

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    expect(res3.success).toBe(true);
  }, 15000);

  it('deve bloquear requisições acima do limite', async () => {
    const config = { maxRequests: 2, windowSeconds: 60 };

    await rateLimit('test-ip-2:route', config);
    await rateLimit('test-ip-2:route', config);
    const res3 = await rateLimit('test-ip-2:route', config);

    expect(res3.success).toBe(false);
    expect(res3.remaining).toBe(0);
    expect(res3.retryAfter).toBeDefined();
  }, 15000);

  it('deve resetar contador após a janela expirar', async () => {
    const config = { maxRequests: 2, windowSeconds: 60 };
    const key = 'test-ip-3:route';

    await rateLimit(key, config);
    await rateLimit(key, config);
    const res3 = await rateLimit(key, config);

    // Janela ainda ativa
    expect(res3.success).toBe(false);

    // Avançar tempo em 61 segundos
    jest.advanceTimersByTime(61 * 1000);

    const res4 = await rateLimit(key, config);
    // Após reset, deve permitir novamente
    expect(res4.success).toBe(true);
  }, 15000);

  it('deve retornar remaining correto', async () => {
    const config = { maxRequests: 5, windowSeconds: 60 };

    const res1 = await rateLimit('test-ip-4:route', config);
    expect(res1.remaining).toBe(4);

    const res2 = await rateLimit('test-ip-4:route', config);
    expect(res2.remaining).toBe(3);

    const res3 = await rateLimit('test-ip-4:route', config);
    expect(res3.remaining).toBe(2);
  }, 15000);

  it('deve usar diferentes chaves para IPs diferentes', async () => {
    const config = { maxRequests: 2, windowSeconds: 60 };

    // IP 1: 2 requisições
    await rateLimit('ip-1:route', config);
    await rateLimit('ip-1:route', config);

    // IP 2: deve ter seu próprio limite
    const res1 = await rateLimit('ip-2:route', config);
    const res2 = await rateLimit('ip-2:route', config);
    const res3 = await rateLimit('ip-2:route', config);

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    expect(res3.success).toBe(false); // IP2 atinge limite
  }, 15000);
});

describe('rateLimitProfiles', () => {
  it('deve ter perfis predefinidos', () => {
    expect(rateLimitProfiles.auth).toBeDefined();
    expect(rateLimitProfiles.public).toBeDefined();
    expect(rateLimitProfiles.authenticated).toBeDefined();
    expect(rateLimitProfiles.upload).toBeDefined();
    expect(rateLimitProfiles.analytics).toBeDefined();
    expect(rateLimitProfiles.webhook).toBeDefined();
  });

  it('auth deve ser mais restritivo que public', () => {
    expect(rateLimitProfiles.auth.maxRequests).toBeLessThan(rateLimitProfiles.public.maxRequests);
  });

  it('upload deve ser muito restritivo', () => {
    expect(rateLimitProfiles.upload.maxRequests).toBeLessThan(15);
  });
});
