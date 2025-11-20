/**
 * jest.setup.js
 * 
 * Setup centralizado para toda suite de testes
 * - Mocks de router e auth
 * - Cleanup automático entre testes
 * - Validação de cleanup
 * - Mock timers global
 * - Mocks de storage
 * 
 * NOTA: Fetch é mockado pelo helpers/test-mocks.ts em cada teste
 */

require('@testing-library/jest-dom');

// ============================================================================
// CAMADA 1: MOCKS DE NEXT.JS ROUTER E AUTH
// ============================================================================

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  })),
  SessionProvider: ({ children }) => children,
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return '/test'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// ============================================================================
// CAMADA 2: CLEANUP AUTOMÁTICO ENTRE TESTES
// ============================================================================

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

afterEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// CAMADA 3: MOCKS DE STORAGE
// ============================================================================

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;
global.sessionStorage = sessionStorageMock;

