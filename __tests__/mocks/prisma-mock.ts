/**
 * __tests__/mocks/prisma-mock.ts
 * ✅ Mock de Prisma para testes
 */

export const prismaMock = {
  page: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  template: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  tenant: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));
