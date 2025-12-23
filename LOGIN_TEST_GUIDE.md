# 🔐 Guia de Teste - Desbloqueando o Login

## Problema Identificado
Você está preso na página de login porque não há usuário válido no banco de dados ou as credenciais estão incorretas.

## Solução

### Passo 1: Criar Usuário de Teste no Supabase

1. Acesse: https://supabase.com/
2. Entre no seu projeto
3. Vá para: **SQL Editor**
4. Abra um novo query
5. **Cole o conteúdo do arquivo** `CREATE_TEST_USER_READY.sql`
6. Clique em **Run** (▶️)

### Passo 2: Usar as Credenciais de Teste

Após executar o SQL, você pode fazer login com:

**Email:** `admin@teste.com`
**Senha:** `123456`

### Passo 3: Testar o Login

1. Vá para: `http://localhost:3000/auth/login`
2. Digite email: `admin@teste.com`
3. Digite senha: `123456`
4. Clique em **Entrar**
5. ✅ Você será redirecionado para `/admin` (porque é SUPERADMIN)

## O que foi corrigido no código

✅ `login-form.tsx`: Adicionado `status === 'loading'` check
✅ `auth.ts`: Session callback otimizado
✅ `jest.config.js`: Jest configurado para suportar módulos ESM

## Alternativa: Criar seu próprio usuário

Se quiser criar com dados diferentes, use:

```sql
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "isActive", "emailVerified") 
VALUES (
  gen_random_uuid()::text,
  'seu-email@teste.com',
  '$2a$12$bx2ESXZfUCkj.F1LGpYrqeHSW3RGDWfj36S0Wk.S2so24V5jONXG.',
  'Seu Nome',
  'Sobrenome',
  'SUPERADMIN',
  true,
  true
);
```

**Hash usado:** `$2a$12$bx2ESXZfUCkj.F1LGpYrqeHSW3RGDWfj36S0Wk.S2so24V5jONXG.` (para senha `123456`)

## Verificar se funciona

Após fazer login com sucesso:
- ✅ Redirecionamento automático para `/admin` (SUPERADMIN)
- ✅ Ou `/dashboard` (outros usuários)
- ✅ Sem loop infinito
- ✅ Sem erro de login

---

**Próximos Passos após Login bem-sucedido:**
1. Testar navegação entre páginas
2. Verificar que logout funciona
3. Testar redirecionamento com `callbackUrl`
4. Deploy em produção
