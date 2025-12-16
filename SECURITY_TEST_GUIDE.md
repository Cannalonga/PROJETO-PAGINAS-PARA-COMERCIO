# 🧪 Testes de Segurança Práticos

## OWASP Top 10 - Testes Verificação Manual

### 1. Broken Access Control (BAC)

#### Teste 1.1: IDOR - Acessar recurso de outro usuário
```bash
# 1. Fazer login com USER A
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user_a@test.com","password":"password"}'

# Salve o token: TOKEN_A

# 2. Obter ID de USER B (ex: b123-uuid)

# 3. Tentar acessar recurso de USER B com token de USER A
curl -X GET http://localhost:3000/api/users/b123-uuid \
  -H "Authorization: Bearer $TOKEN_A"

# ✅ ESPERADO: 403 Forbidden (sem acesso)
# ❌ VULNERABLE: 200 OK (conseguiu acessar)
```

#### Teste 1.2: IDOR - Listar usuários de outro tenant
```bash
# 1. USER A (tenant: 111)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "x-tenant-id: 111"

# 2. Tentar ver usuários do tenant 222
curl -X GET "http://localhost:3000/api/users?tenantId=222" \
  -H "Authorization: Bearer $TOKEN_A"

# ✅ ESPERADO: Retorna vazio ou erro 403
# ❌ VULNERABLE: Retorna usuários do tenant 222
```

#### Teste 1.3: Privilege Escalation - Elevar para ADMIN
```bash
# 1. USER NORMAL tenta mudar seu role
curl -X PATCH http://localhost:3000/api/users/self \
  -H "Authorization: Bearer $TOKEN_USER" \
  -H "Content-Type: application/json" \
  -d '{"role":"SUPERADMIN"}'

# ✅ ESPERADO: 403 Forbidden
# ❌ VULNERABLE: 200 OK (role foi alterado)
```

---

### 2. Cryptographic Failures

#### Teste 2.1: HTTPS Forced
```bash
# ✅ ESPERADO: Redirecionamento HTTP → HTTPS
curl -I http://seu-site.com

# Resposta esperada:
# HTTP/1.1 301 Moved Permanently
# Location: https://seu-site.com

# ✅ ESPERADO: HSTS Header presente
curl -I https://seu-site.com | grep "Strict-Transport-Security"
# Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

#### Teste 2.2: Password Hashing
```bash
# 1. Login com credenciais
# 2. Verificar no banco se password está com hash (não plaintext)

psql -d seu_db << EOF
SELECT email, password FROM users LIMIT 1;
EOF

# ✅ ESPERADO: password começa com $2a$12$ (bcrypt)
# ❌ VULNERABLE: password é legível (plaintext)
```

#### Teste 2.3: CSP Headers
```bash
curl -I https://seu-site.com | grep "Content-Security-Policy"

# ✅ ESPERADO (sem 'unsafe-*'):
# Content-Security-Policy: default-src 'self'; script-src 'self' https://js.stripe.com; ...

# ❌ VULNERABLE (com 'unsafe-*'):
# Content-Security-Policy: ... script-src 'self' 'unsafe-inline' 'unsafe-eval' ...
```

---

### 3. Injection

#### Teste 3.1: SQL Injection (POST)
```bash
# Tentar SQL injection em busca de usuários
curl -X GET "http://localhost:3000/api/users?role=ADMIN' OR '1'='1" \
  -H "Authorization: Bearer $TOKEN"

# ✅ ESPERADO: Erro 400 ou resultado vazio
# ❌ VULNERABLE: Retorna todos os usuários
```

#### Teste 3.2: Command Injection
```bash
# Se houver função que executa comandos shell
curl -X POST http://localhost:3000/api/export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"format":"; rm -rf / #"}'

# ✅ ESPERADO: Erro 400
# ❌ VULNERABLE: Comando é executado
```

#### Teste 3.3: Template Injection
```bash
curl -X POST http://localhost:3000/api/pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "${7*7}",
    "content": "<%= require(\"fs\").readFileSync(\"/etc/passwd\") %>"
  }'

# ✅ ESPERADO: Template não é processado (literalmente "${7*7}")
# ❌ VULNERABLE: Resultado mostra "49" ou /etc/passwd
```

---

### 4. Insecure Design

#### Teste 4.1: Missing CSRF Token
```html
<!-- Testar se formulário sem CSRF token passa -->
<form action="http://localhost:3000/api/users" method="POST">
  <input type="text" name="email" value="attacker@evil.com">
  <button>Submit</button>
</form>

<!-- ✅ ESPERADO: 403 ou erro CSRF -->
<!-- ❌ VULNERABLE: 200 OK (CSRF token não verificado) -->
```

#### Teste 4.2: Rate Limiting
```bash
# Script para testar rate limiting
for i in {1..20}; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n" \
    -s
done

# ✅ ESPERADO: Após ~5 tentativas, recebe 429 Too Many Requests
# ❌ VULNERABLE: Todas as tentativas retornam 401 (sem limite)
```

#### Teste 4.3: No 2FA
```bash
# Login bem-sucedido sem 2FA = vulnerável
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# ✅ ESPERADO: Deve pedir código 2FA
# ❌ VULNERABLE: Retorna token direto (sem 2FA)
```

---

### 5. Security Misconfiguration

#### Teste 5.1: Stack Trace Exposto
```bash
# Gerar erro intencional
curl -X GET http://localhost:3000/api/users/invalid-uuid

# ✅ ESPERADO: 
# {"error": "Invalid request"}

# ❌ VULNERABLE:
# {
#   "error": "...",
#   "stack": "Error at Function.route (/app/users/route.ts:45)"
# }
```

#### Teste 5.2: Default Credentials
```bash
# Tentar credenciais padrão
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'

# ✅ ESPERADO: 401 Unauthorized
# ❌ VULNERABLE: 200 OK (credenciais padrão funcionam)
```

#### Teste 5.3: Secrets em Source Code
```bash
# Verificar se há secrets no repositório
git log --all --source --remotes -S "process.env.JWT_SECRET" -- "*.ts"

# ✅ ESPERADO: Nenhum commit com secrets
# ❌ VULNERABLE: Secrets em plaintext no histórico
```

---

### 6. Vulnerable Components

#### Teste 6.1: npm audit
```bash
npm audit

# ✅ ESPERADO:
# up to date, audited 951 packages
# 0 vulnerabilities

# ❌ VULNERABLE:
# found X vulnerabilities (Y high, Z critical)
```

#### Teste 6.2: Outdated Dependencies
```bash
npm outdated

# ✅ ESPERADO: Tudo current ou com atualizações seguras
# ❌ VULNERABLE: Pacotes muito desatualizados (> 1 ano)
```

---

### 7. Authentication Failures

#### Teste 7.1: Session Hijacking
```bash
# 1. Obter token de USER A
TOKEN=$(curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"pass"}' | jq -r '.token')

# 2. Tentar usar token expirado
sleep 3661 # Esperar > 1 hora (se maxAge=3600)

curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"

# ✅ ESPERADO: 401 Unauthorized (token expirou)
# ❌ VULNERABLE: 200 OK (token ainda válido)
```

#### Teste 7.2: Brute Force
```bash
# Wordlist simples
for password in "123456" "password" "admin123" "letmein"; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"admin@test.com\",\"password\":\"$password\"}" \
    -w "Password: $password - Status: %{http_code}\n"
done

# ✅ ESPERADO: Após 3-5 tentativas, recebe 429 Rate Limit
# ❌ VULNERABLE: Pode fazer brute force indefinidamente
```

---

### 8. Data Integrity

#### Teste 8.1: Unsigned JWT
```bash
# 1. Decodificar JWT
TOKEN="eyJhbGc..."
echo $TOKEN | base64 -d

# 2. Verificar se `alg` é "none"
# ✅ ESPERADO: "alg": "HS256" ou "RS256"
# ❌ VULNERABLE: "alg": "none"

# 3. Se "none", poderia modificar payload
```

#### Teste 8.2: No Signature Verification
```bash
# Tentar modificar token (adicionar 1 segundo ao exp)
# JWT = header.payload.signature

# ✅ ESPERADO: 401 Unauthorized (signature inválida)
# ❌ VULNERABLE: 200 OK (token modificado aceito)
```

---

### 9. Logging & Monitoring

#### Teste 9.1: Sensitive Data in Logs
```bash
# 1. Fazer login
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"secret123"}'

# 2. Verificar logs
docker logs seu-container | grep -i "email\|password"

# ✅ ESPERADO: Nenhum log contendo email ou password
# ❌ VULNERABLE: Logs contêm "[AUTH] User: test@test.com"
```

#### Teste 9.2: No Audit Trail
```bash
# Fazer mudança sensível (ex: mudar role)
curl -X PATCH http://localhost:3000/api/users/USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"SUPERADMIN"}'

# Verificar se foi logado no auditLog
psql -d seu_db -c "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1;"

# ✅ ESPERADO: Log contendo: user_id, action, old_value, new_value, timestamp
# ❌ VULNERABLE: Nenhum log ou log incompleto
```

---

### 10. SSRF Protection

#### Teste 10.1: Server-Side Request Forgery
```bash
# Se houver endpoint que faz requisições (ex: upload de URL)
curl -X POST http://localhost:3000/api/images/from-url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:8080/admin"}'

# ✅ ESPERADO: 403 ou erro (URL não permitida)
# ❌ VULNERABLE: Consegue acessar localhost/admin
```

---

## 🧬 Teste de Segurança Automático

### Setup Semgrep
```bash
# 1. Instalar Semgrep
brew install semgrep # macOS
# ou
apt-get install semgrep # Linux

# 2. Rodar verificação
semgrep --config=p/owasp-top-ten --config=p/security-audit app/

# 3. Exemplo de output:
# ❌ Unsafe use of eval() at app/api/dangerous.ts:15
# ⚠️  Hardcoded secret at lib/auth.ts:45
# ⚠️  Missing CSRF token at app/form.tsx:10
```

### Setup OWASP Dependency Check
```bash
# 1. Instalar
npm install -g snyk

# 2. Verificar dependências
snyk test

# 3. Output:
# Vulnerabilities: 0 high, 0 medium, 0 low
```

### Setup ESLint Security
```bash
# package.json
{
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-plugin-security": "^1.5.0"
  }
}

# .eslintrc.json
{
  "plugins": ["security"],
  "rules": {
    "security/detect-eval-with-expression": "error",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "warn",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-non-literal-require": "error",
    "security/detect-object-injection": "warn",
    "security/detect-possible-timing-attack": "warn",
    "security/detect-unsafe-dyn": "warn"
  }
}

# npm run lint
```

---

## 📊 Checklist de Testes

```
ANTES DE CADA RELEASE:

[ ] npm audit (0 vulnerabilidades)
[ ] npm outdated (sem packages críticos desatualizados)
[ ] Testar IDOR com diferentes usuários
[ ] Testar CSRF (POST sem token falha)
[ ] Testar rate limiting (429 após limite)
[ ] Testar CSP (inline scripts bloqueados)
[ ] Verificar logs (sem emails/passwords)
[ ] Teste de autenticação (session < 15 min)
[ ] Teste de HTTPS (redirecionamento funciona)
[ ] Scan com Semgrep (sem issues críticas)
[ ] Pen test manual (OWASP Top 10)

QA: [ ] Passou todos os testes de segurança
SEC: [ ] Review realizado
OPS: [ ] Pronto para deploy
```

---

## 🔗 Ferramentas Recomendadas

**Automático:**
- [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/)
- [Semgrep](https://semgrep.dev)
- [Snyk](https://snyk.io)
- [npm audit](https://docs.npmjs.com/cli/v6/commands/npm-audit)

**Manual:**
- [Burp Suite Community](https://portswigger.net/burp/communitydownload)
- [OWASP ZAP](https://www.zaproxy.org/)
- [Postman](https://www.postman.com/)

**Monitoramento:**
- [Sentry](https://sentry.io) - Error tracking
- [Datadog](https://www.datadoghq.com/) - Security monitoring
- [LogRocket](https://logrocket.com/) - Session replay

---

**Próximo passo:** Executar testes e documentar resultados em SECURITY_TEST_RESULTS.md
