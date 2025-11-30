-- ============================================================================
-- CRIAR USUÁRIO ADMIN MASTER GOD - RAFAEL CANNALONGA
-- ============================================================================
-- Email Principal: rafaelcannalonga2@hotmail.com
-- Email Secundário: l2requests@gmail.com (para confirmação de mudanças)
-- Senha: 123456 (hash: $2a$12$eP.rSi2TOHdEUw6iphIuzuembSkdUpSuRAekE17ZAvngT2O2JOSXe)
--
-- IMPORTANTE: Execute isso NO SUPABASE SQL EDITOR
-- ============================================================================

-- Remover se existir
DELETE FROM "User" WHERE email IN ('rafaelcannalonga2@hotmail.com', 'l2requests@gmail.com');

-- Criar usuário admin
INSERT INTO "User" (
  id,
  email,
  password,
  "firstName",
  "lastName",
  role,
  "secondaryEmail",
  "secondaryEmailVerified",
  "isActive",
  "emailVerified",
  "createdAt",
  "updatedAt",
  "lastLoginAt",
  "lastPasswordChangeAt"
) VALUES (
  'admin-master-rafael-' || gen_random_uuid()::text,
  'rafaelcannalonga2@hotmail.com',
  '$2a$12$eP.rSi2TOHdEUw6iphIuzuembSkdUpSuRAekE17ZAvngT2O2JOSXe',
  'Rafael',
  'Cannalonga',
  'SUPERADMIN',
  'l2requests@gmail.com',
  true,
  true,
  true,
  NOW(),
  NOW(),
  NULL,
  NOW()
);

-- Verificar criação
SELECT 
  id,
  email,
  "secondaryEmail",
  role,
  "isActive",
  "emailVerified",
  "secondaryEmailVerified",
  "createdAt"
FROM "User" 
WHERE email = 'rafaelcannalonga2@hotmail.com';

-- ============================================================================
-- RESULTADO ESPERADO:
-- 1 row com:
-- - email: rafaelcannalonga2@hotmail.com ✅
-- - secondaryEmail: l2requests@gmail.com ✅
-- - role: SUPERADMIN ✅
-- - isActive: true ✅
-- - emailVerified: true ✅
-- - secondaryEmailVerified: true ✅
-- ============================================================================
