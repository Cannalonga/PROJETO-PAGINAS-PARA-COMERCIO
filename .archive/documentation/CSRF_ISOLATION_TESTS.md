# FASE 2 — CSRF + TENANT ISOLATION TESTING

## 📋 Checklist de Testes

Estes comandos validam P0.1 (CSRF) + P0.2 (Tenant Isolation) implementados.

---

## 1️⃣ CSRF TOKEN — Obter Token

```bash
# GET /api/csrf-token
curl -i -X GET http://localhost:3000/api/csrf-token \
  -H "Content-Type: application/json"
```

**Resposta esperada (200):**
```json
{
  "success": true,
  "csrfToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0"
}
```

**Observações:**
- Cookie `csrf_token` é automaticamente setado na resposta
- Token é string hex de 64 caracteres (32 bytes)
- Cookie tem `HttpOnly: false` (frontend consegue ler)
- Cookie tem `SameSite: Strict` (não envia em cross-site)

---

## 2️⃣ CSRF PROTECTION — POST sem token

```bash
# Tentar POST SEM csrf token (deve falhar com 403)
curl -i -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {VALID_JWT_TOKEN}" \
  -d '{
    "name": "Test Tenant",
    "email": "test@example.com"
  }'
```

**Resposta esperada (403):**
```json
{
  "success": false,
  "error": {
    "code": "CSRF_TOKEN_INVALID",
    "message": "Invalid CSRF token"
  }
}
```

---

## 3️⃣ CSRF PROTECTION — POST com token válido

```bash
# Passo 1: Obter token
TOKEN_RESPONSE=$(curl -s -X GET http://localhost:3000/api/csrf-token \
  -H "Content-Type: application/json" \
  -c /tmp/cookies.txt)

CSRF_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.csrfToken')

echo "✅ CSRF Token: $CSRF_TOKEN"

# Passo 2: Usar token em POST (com cookie)
curl -i -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {VALID_JWT_TOKEN}" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -b /tmp/cookies.txt \
  -d '{
    "name": "Test Tenant Secure",
    "email": "secure@example.com"
  }'
```

**Resposta esperada (201):**
```json
{
  "success": true,
  "data": {
    "id": "tenant_123...",
    "slug": "test-tenant-secure",
    "name": "Test Tenant Secure",
    "email": "secure@example.com",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Tenant created successfully"
}
```

---

## 4️⃣ CSRF PROTECTION — Token Mismatch (cookie ≠ header)

```bash
# Passo 1: Obter token
RESPONSE=$(curl -s -X GET http://localhost:3000/api/csrf-token \
  -H "Content-Type: application/json" \
  -c /tmp/cookies.txt)

CSRF_TOKEN=$(echo $RESPONSE | jq -r '.csrfToken')

# Passo 2: Tentar POST com token INVÁLIDO
curl -i -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {VALID_JWT_TOKEN}" \
  -H "x-csrf-token: invalid_token_123456789" \
  -b /tmp/cookies.txt \
  -d '{
    "name": "Attempted Hack",
    "email": "hack@example.com"
  }'
```

**Resposta esperada (403):**
```json
{
  "success": false,
  "error": {
    "code": "CSRF_TOKEN_INVALID",
    "message": "Invalid CSRF token"
  }
}
```

---

## 5️⃣ TENANT ISOLATION — Verificar que dados são isolados por tenant

### Cenário: Dois tenants criados, verificar isolamento

**Setup (um único terminal para rastrear):**

```bash
# 1. Obter CSRF token
TOKEN_RESPONSE=$(curl -s -X GET http://localhost:3000/api/csrf-token \
  -H "Content-Type: application/json" \
  -c /tmp/cookies.txt)
CSRF_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.csrfToken')

# 2. Criar Tenant A
TENANT_A=$(curl -s -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_SUPERADMIN}" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -b /tmp/cookies.txt \
  -d '{
    "name": "Tenant A Company",
    "email": "tenanta@example.com"
  }' | jq -r '.data.id')

echo "✅ Tenant A created: $TENANT_A"

# 3. Obter novo CSRF token
TOKEN_RESPONSE=$(curl -s -X GET http://localhost:3000/api/csrf-token \
  -H "Content-Type: application/json" \
  -c /tmp/cookies2.txt)
CSRF_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.csrfToken')

# 4. Criar Tenant B
TENANT_B=$(curl -s -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_SUPERADMIN}" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -b /tmp/cookies2.txt \
  -d '{
    "name": "Tenant B Corp",
    "email": "tenantb@example.com"
  }' | jq -r '.data.id')

echo "✅ Tenant B created: $TENANT_B"
```

**Verificação de Isolamento:**
Com Tenant Isolation ativo, um usuário de Tenant A **não deve conseguir**:
- Ver dados de Tenant B
- Atualizar dados de Tenant B
- Deletar dados de Tenant B

Isto é garantido por `getTenantScopedDb(auth.tenantId)` forçando filtro de tenantId.

---

## 6️⃣ AUTENTICAÇÃO — Validar que endpoints exigem auth

```bash
# Tentar GET sem Authorization header (deve falhar)
curl -i -X GET http://localhost:3000/api/tenants \
  -H "Content-Type: application/json"
```

**Resposta esperada (401):**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Authentication required"
  }
}
```

---

## 7️⃣ ROLE-BASED ACCESS — Validar autorização por role

```bash
# Tentar POST com JWT de CLIENTE_USER (deve falhar)
curl -i -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {JWT_CLIENTE_USER}" \
  -H "x-csrf-token: {VALID_TOKEN}" \
  -b /tmp/cookies.txt \
  -d '{
    "name": "Unauthorized Tenant",
    "email": "unauth@example.com"
  }'
```

**Resposta esperada (403):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Role CLIENTE_USER not allowed for this action"
  }
}
```

---

## 📊 Matriz de Testes

| Teste | P0.1 CSRF | P0.2 Isolation | Auth | Expected |
|-------|-----------|----------------|------|----------|
| 1. GET /api/csrf-token | ✅ | - | No | 200 + token |
| 2. POST sem token | ✅ | - | Yes | 403 |
| 3. POST com token válido | ✅ | ✅ | Yes | 201 |
| 4. POST token inválido | ✅ | - | Yes | 403 |
| 5. Tenant isolation | - | ✅ | Yes | Isolamento funciona |
| 6. GET sem auth | - | - | ✅ | 401 |
| 7. POST role insuficiente | - | - | ✅ | 403 |

---

## 🐛 Debugging

### Problema: "CSRF token not found"
**Solução:** Certifique-se que:
1. GET /api/csrf-token foi chamado antes
2. Cookie é preservado (-b /tmp/cookies.txt)
3. Header x-csrf-token é incluído em POST

### Problema: "Auth required" em teste válido
**Solução:** Verificar:
1. JWT token é válido (não expirado)
2. Header é "Authorization: Bearer {TOKEN}"
3. Token foi gerado com JWT_SECRET correto

### Problema: Tenant Isolation falha
**Solução:** Verificar:
1. lib/tenant-isolation.ts está importado corretamente
2. getTenantScopedDb() é chamado com tenantId correto
3. auth.tenantId vem de extractContext()

---

## ✅ Validação Completa

Quando TODOS os 7 testes passarem:

```bash
echo "✅ P0.1 CSRF Protection — WORKING"
echo "✅ P0.2 Tenant Isolation — WORKING"
echo "✅ Authentication Middleware — WORKING"
echo "✅ Role-Based Access Control — WORKING"
echo ""
echo "🚀 Ready for P0.3 (Audit Logging)"
```
