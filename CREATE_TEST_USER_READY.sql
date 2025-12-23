-- ============================================================================
-- Script para criar usuário de teste no Supabase
-- ============================================================================
-- Email: admin@teste.com
-- Senha: 123456
-- Role: SUPERADMIN
-- ============================================================================

INSERT INTO "User" (
  id,
  email,
  password,
  "firstName",
  "lastName",
  role,
  "isActive",
  "emailVerified",
  "tenantId",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "lastLoginAt"
) VALUES (
  gen_random_uuid()::text,
  'admin@teste.com',
  '$2a$12$bx2ESXZfUCkj.F1LGpYrqeHSW3RGDWfj36S0Wk.S2so24V5jONXG.',
  'Admin',
  'Teste',
  'SUPERADMIN',
  true,
  true,
  NULL,
  NOW(),
  NOW(),
  NULL,
  NULL
)
ON CONFLICT (email) DO UPDATE SET 
  password = '$2a$12$bx2ESXZfUCkj.F1LGpYrqeHSW3RGDWfj36S0Wk.S2so24V5jONXG.',
  "isActive" = true,
  "emailVerified" = true,
  "updatedAt" = NOW();
