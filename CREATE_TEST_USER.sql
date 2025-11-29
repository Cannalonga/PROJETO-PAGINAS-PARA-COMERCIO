-- Script para criar usuário de teste manualmente no Supabase
-- Execute isso no SQL Editor do Supabase

-- Primeiro, hash a senha "123456" usando bcryptjs (11 rounds)
-- Hash: $2a$12$dXJ3SW6G7P50eS3OLV5PyO29AHC/LmvkD2dLbHZ3Ll9SXZWOLqJfK

INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "isActive", "emailVerified", "tenantId", "createdAt", "updatedAt", "deletedAt", "lastLoginAt")
VALUES (
  'test-user-dev-' || gen_random_uuid()::text,
  'admin@teste',
  '$2a$12$dXJ3SW6G7P50eS3OLV5PyO29AHC/LmvkD2dLbHZ3Ll9SXZWOLqJfK',
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
ON CONFLICT (email, "deletedAt") DO UPDATE SET
  password = '$2a$12$dXJ3SW6G7P50eS3OLV5PyO29AHC/LmvkD2dLbHZ3Ll9SXZWOLqJfK'
RETURNING id, email, role;
