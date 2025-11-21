/**
 * Prisma Integration Mock
 * 
 * Mock completo do Prisma ORM para testes de integração.
 * Simula comportamento de banco de dados sem acessar real database.
 * 
 * @module __tests__/mocks/prisma-integration-mock
 */

export const prismaMock = {
  tenant: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  page: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

export default prismaMock;
