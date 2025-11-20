/**
 * helpers/test-mocks.ts
 * 
 * Factory para criar mocks de fetch com comportamento realista
 * 
 * SEGURANÇA: 
 * - Simula timing real de rede (delay 100-500ms)
 * - Rejeita URLs não mockadas
 * - Rastreia histórico de chamadas
 */

import { waitFor } from '@testing-library/react';

interface MockResponse {
  status: number;
  headers?: Record<string, string>;
  body: any;
  delay?: number;
  callCountMax?: number;
}

interface FetchCall {
  url: string;
  method: string;
  timestamp: number;
}

/**
 * Factory para criar mocks de fetch seguros
 */
export class FetchMockFactory {
  private mocks: Map<string, MockResponse> = new Map();
  private callHistory: FetchCall[] = [];

  constructor() {
    this.setupGlobalFetch();
  }

  /**
   * Registrar uma URL para mockear
   */
  mockUrl(
    pattern: string | RegExp,
    response: MockResponse,
    options?: { delay?: number; callCount?: number }
  ) {
    const key = pattern instanceof RegExp ? pattern.source : pattern;
    this.mocks.set(key, {
      ...response,
      delay: options?.delay ?? 150,
      callCountMax: options?.callCount,
    });
    return this;
  }

  /**
   * Setup global.fetch com interceptação
   */
  private setupGlobalFetch() {
    (global.fetch as any) = jest.fn(async (url: string, options?: RequestInit) => {
      const urlStr = String(url);
      
      // 1. Procurar mock registrado
      const mock = this.findMock(urlStr);
      
      if (!mock) {
        throw new Error(
          `❌ UNMOCKED FETCH: ${urlStr}\n` +
          `Register with: mockFetch.mockUrl('${urlStr}', {...})`
        );
      }

      // 2. Registrar chamada
      this.callHistory.push({
        url: urlStr,
        method: options?.method || 'GET',
        timestamp: Date.now(),
      });

      // 3. Simular latência de rede
      await new Promise(resolve => 
        setTimeout(resolve, mock.delay || 150)
      );

      // 4. Retornar resposta mockada
      return {
        ok: mock.status < 400,
        status: mock.status,
        headers: new Headers(mock.headers || {}),
        json: async () => mock.body,
        text: async () => JSON.stringify(mock.body),
        clone: () => this.createResponse(mock),
      } as Response;
    });
  }

  /**
   * Encontrar mock que corresponde à URL
   */
  private findMock(url: string): MockResponse | null {
    for (const [pattern, response] of this.mocks) {
      if (this.patternMatches(pattern, url)) {
        return response;
      }
    }
    return null;
  }

  /**
   * Testar se pattern corresponde URL
   */
  private patternMatches(pattern: string, url: string): boolean {
    try {
      const regex = new RegExp(pattern);
      return regex.test(url);
    } catch {
      return pattern === url || url.includes(pattern);
    }
  }

  /**
   * Criar objeto Response completo
   */
  private createResponse(mock: MockResponse): Response {
    return {
      ok: mock.status < 400,
      status: mock.status,
      json: async () => mock.body,
    } as Response;
  }

  /**
   * Histórico de chamadas para asserções
   */
  getCallHistory() {
    return [...this.callHistory];
  }

  /**
   * Quantas vezes uma URL foi chamada
   */
  getCallCount(pattern: string | RegExp): number {
    return this.callHistory.filter(call =>
      pattern instanceof RegExp
        ? pattern.test(call.url)
        : call.url.includes(pattern)
    ).length;
  }

  /**
   * Limpar histórico
   */
  reset() {
    this.callHistory = [];
    this.mocks.clear();
  }
}

/**
 * Factory helper global para testes
 */
export const createMockFetch = () => new FetchMockFactory();
