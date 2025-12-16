/**
 * jest.setup.js
 * Global test setup - executa antes de todos os testes
 */

// Mock Node globals that jsdom doesn't provide
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init?.method || 'GET';
      this.headers = init?.headers || {};
      this.body = init?.body || null;
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = init?.headers || {};
      this.ok = this.status >= 200 && this.status < 300;
    }
    
    static json(data, init) {
      return new Response(JSON.stringify(data), {
        status: init?.status || 200,
        headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
      });
    }
    
    json() {
      return Promise.resolve(JSON.parse(this.body));
    }
  };
}

// Mock Prisma Client - needs to be before imports
jest.mock('@/lib/prisma', () => {
  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    page: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(() => Promise.resolve({ _count: { id: 0 } })),
    },
    store: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $use: jest.fn(),
    $disconnect: jest.fn(() => Promise.resolve()),
  };
  return { prisma: mockPrisma };
}, { virtual: true });

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
