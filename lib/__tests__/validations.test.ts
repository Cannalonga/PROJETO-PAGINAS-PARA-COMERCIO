// lib/__tests__/validations.test.ts
import {
  CreateTenantSchema,
  UpdateTenantSchema,
  TenantQuerySchema,
  CreateUserSchema,
} from '../validations'

describe('Validation Schemas', () => {
  describe('CreateTenantSchema', () => {
    it('should validate correct tenant data', () => {
      const validData = {
        name: 'Loja XYZ',
        email: 'contact@lojaxyz.com',
        phone: '(11) 98765-4321',
        cnpj: '12345678901234',
      }

      const result = CreateTenantSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject name shorter than 3 characters', () => {
      const invalidData = {
        name: 'AB',
        email: 'contact@example.com',
      }

      const result = CreateTenantSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.code).toBeDefined()
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'Valid Name',
        email: 'invalid-email',
      }

      const result = CreateTenantSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid phone format', () => {
      const invalidData = {
        name: 'Valid Name',
        email: 'contact@example.com',
        phone: '123456',
      }

      const result = CreateTenantSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject CNPJ with invalid length', () => {
      const invalidData = {
        name: 'Valid Name',
        email: 'contact@example.com',
        cnpj: '123456789',
      }

      const result = CreateTenantSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should trim whitespace from name', () => {
      const dataWithWhitespace = {
        name: '  Loja XYZ  ',
        email: 'contact@example.com',
      }

      const result = CreateTenantSchema.safeParse(dataWithWhitespace)
      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Loja XYZ')
    })

    it('should convert email to lowercase', () => {
      const mixedCaseEmail = {
        name: 'Valid Name',
        email: 'Contact@EXAMPLE.COM',
      }

      const result = CreateTenantSchema.safeParse(mixedCaseEmail)
      expect(result.success).toBe(true)
      expect(result.data?.email).toBe('contact@example.com')
    })

    it('should accept optional fields', () => {
      const minimalData = {
        name: 'Valid Name',
        email: 'contact@example.com',
      }

      const result = CreateTenantSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
      expect(result.data?.phone).toBeUndefined()
    })

    it('should accept address less than 255 characters', () => {
      const validData = {
        name: 'Valid Name',
        email: 'contact@example.com',
        address: 'Rua Principal, 123, São Paulo, SP',
      }

      const result = CreateTenantSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject address longer than 255 characters', () => {
      const invalidData = {
        name: 'Valid Name',
        email: 'contact@example.com',
        address: 'A'.repeat(256),
      }

      const result = CreateTenantSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('UpdateTenantSchema', () => {
    it('should allow partial updates', () => {
      const partialData = {
        name: 'Updated Name',
      }

      const result = UpdateTenantSchema.safeParse(partialData)
      expect(result.success).toBe(true)
    })

    it('should allow empty object', () => {
      const emptyData = {}

      const result = UpdateTenantSchema.safeParse(emptyData)
      expect(result.success).toBe(true)
    })

    it('should validate provided fields using CreateTenantSchema rules', () => {
      const invalidData = {
        email: 'invalid-email',
      }

      const result = UpdateTenantSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('TenantQuerySchema', () => {
    it('should validate query parameters with defaults', () => {
      const emptyQuery = {}

      const result = TenantQuerySchema.safeParse(emptyQuery)
      expect(result.success).toBe(true)
      expect(result.data?.page).toBe(1)
      expect(result.data?.pageSize).toBe(10)
    })

    it('should accept positive page number', () => {
      const query = { page: 2 }

      const result = TenantQuerySchema.safeParse(query)
      expect(result.success).toBe(true)
      expect(result.data?.page).toBe(2)
    })

    it('should reject page number 0', () => {
      const query = { page: 0 }

      const result = TenantQuerySchema.safeParse(query)
      expect(result.success).toBe(false)
    })

    it('should accept valid status', () => {
      const query = { status: 'ACTIVE' }

      const result = TenantQuerySchema.safeParse(query)
      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('ACTIVE')
    })

    it('should reject invalid status', () => {
      const query = { status: 'UNKNOWN' }

      const result = TenantQuerySchema.safeParse(query)
      expect(result.success).toBe(false)
    })

    it('should accept search string up to 100 characters', () => {
      const query = { search: 'loja' }

      const result = TenantQuerySchema.safeParse(query)
      expect(result.success).toBe(true)
    })

    it('should reject pageSize over 100', () => {
      const query = { pageSize: 200 }

      const result = TenantQuerySchema.safeParse(query)
      expect(result.success).toBe(false)
    })

    it('should coerce string numbers to integers', () => {
      const query = { page: '5', pageSize: '20' }

      const result = TenantQuerySchema.safeParse(query)
      expect(result.success).toBe(true)
      expect(result.data?.page).toBe(5)
      expect(result.data?.pageSize).toBe(20)
    })
  })

  describe('CreateUserSchema', () => {
    it('should validate correct user data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENTE_USER',
      }

      const result = CreateUserSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'Pass1!',
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject password without uppercase letter', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'securepass123!',
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject password without number', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'SecurePass!',
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject password without special character', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject first name shorter than 2 characters', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        firstName: 'J',
        lastName: 'Doe',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept SUPERADMIN role', () => {
      const validData = {
        email: 'admin@example.com',
        password: 'AdminPass123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPERADMIN',
      }

      const result = CreateUserSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data?.role).toBe('SUPERADMIN')
    })

    it('should default role to CLIENTE_USER', () => {
      const data = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.data?.role).toBe('CLIENTE_USER')
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = CreateUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should convert email to lowercase', () => {
      const mixedCaseData = {
        email: 'User@EXAMPLE.COM',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = CreateUserSchema.safeParse(mixedCaseData)
      expect(result.success).toBe(true)
      expect(result.data?.email).toBe('user@example.com')
    })
  })

  describe('Schema Integration', () => {
    it('should reject data with extra fields not in schema', () => {
      const dataWithExtra = {
        name: 'Valid Name',
        email: 'contact@example.com',
        unknownField: 'should be ignored',
      }

      const result = CreateTenantSchema.safeParse(dataWithExtra)
      expect(result.success).toBe(true)
      expect((result.data as any)?.unknownField).toBeUndefined()
    })

    it('should provide detailed error messages', () => {
      const invalidData = {
        name: 'AB',
        email: 'invalid-email',
      }

      const result = CreateTenantSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues.length).toBeGreaterThan(0)
      expect(result.error?.issues[0]?.message).toBeDefined()
    })
  })
})
