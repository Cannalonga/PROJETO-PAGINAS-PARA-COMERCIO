# 🔧 Guia de Remediação de Vulnerabilidades

## VULNERABILIDADE 1: Secrets Hardcoded (CRÍTICA)

### Problema
```
❌ .env rastreado no git com credenciais reais:
DATABASE_URL="postgresql://user:PASSWORD@host"
JWT_SECRET="dev-secret-key"
```

### Solução - Passo 1: Revogar Credentials
```bash
# 1.1 Supabase - Mudar password PostgreSQL
# Login em https://supabase.com
# Project → Settings → Database → Change Password

# 1.2 Gerar novos secrets
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "Novos secrets gerados - salve em GitHub Secrets"
```

### Solução - Passo 2: Remover do Git History
```bash
# ⚠️ DESTRUIDOR - fazer backup antes!

# 2.1 Remover .env do histórico
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# 2.2 Fazer garbage collection
cd .git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
cd ..

# 2.3 Force push (avisa equipe ANTES)
git push origin main --force
git push origin --all --force
git push origin --tags --force
```

### Solução - Passo 3: Configurar .env.local
```bash
# 3.1 Criar .env.local (nunca commitar)
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://..."
JWT_SECRET="seu-novo-secret"
NEXTAUTH_SECRET="seu-novo-nextauth-secret"
STRIPE_SECRET_KEY="sk_live_..."
MERCADOPAGO_ACCESS_TOKEN="APP_USR_..."
EOF

# 3.2 Garantir que está em .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
git add .gitignore
git commit -m "chore: Add .env files to .gitignore"
```

### Solução - Passo 4: GitHub Secrets para CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      JWT_SECRET: ${{ secrets.JWT_SECRET }}
      NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
      STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
    steps:
      - uses: actions/checkout@v3
      - name: Build & Deploy
        run: npm run build && npm run deploy
```

---

## VULNERABILIDADE 2: CSP com 'unsafe-inline' (ALTA)

### Arquivo: middleware.ts

### Problema
```typescript
❌ ATUAL:
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com

Permite:
- Inline scripts: <script>alert('XSS')</script>
- eval() execution
- Qualquer domínio cdn.jsdelivr.net
```

### Solução
```typescript
// ✅ NOVO - middleware.ts (linhas 36-43)

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' https://js.stripe.com",
  "style-src 'self' https://fonts.googleapis.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https:",
  "frame-src https://js.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ')

res.headers.set('Content-Security-Policy', cspHeader)
```

### Se Precisa de Inline Scripts
```typescript
// ✅ Usar nonce em vez de 'unsafe-inline'

// middleware.ts
const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

// Passar nonce para componentes via headers
res.headers.set('x-nonce', nonce);

// CSP com nonce
const cspHeader = [
  "script-src 'self' 'nonce-" + nonce + "' https://js.stripe.com",
  // ...outras directives
].join('; ')

// Nos componentes React:
// <script nonce={nonce}>{inlineCode}</script>
```

### Testing da CSP
```bash
# Usar https://csp-evaluator.withgoogle.com/
# Copiar seu CSP header e testar

# Ou via curl:
curl -I https://seu-site.com | grep "Content-Security-Policy"
```

---

## VULNERABILIDADE 3: Session Timeout Longo (ALTA)

### Arquivo: lib/auth.ts

### Problema
```typescript
❌ ATUAL:
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60 // 30 DIAS!
}

Risco: Token roubado = acesso por 30 dias
```

### Solução - Passo 1: Reduzir maxAge
```typescript
// ✅ NOVO - lib/auth.ts

export const authOptions: NextAuthOptions = {
  // ...outros configs...
  
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 MINUTOS
    updateAge: 60 * 60, // Refresh a cada 1 hora
  },
  
  pages: {
    signIn: '/auth/login',
  },
  
  callbacks: {
    // ...
  },
}
```

### Solução - Passo 2: Implementar Refresh Token (Opcional)
```typescript
// ✅ Refresh token strategy (mais robusto)

// lib/auth.ts
import jwt from 'jsonwebtoken';

const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // 15 minutos
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // 7 dias
  );
  
  return { accessToken, refreshToken };
};

// Armazenar refreshToken no banco:
await prisma.refreshToken.create({
  data: {
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});
```

### Solução - Passo 3: Logout em Tempo Real
```typescript
// app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Invalidar refresh tokens
  await prisma.refreshToken.deleteMany({
    where: { userId: session.user.id },
  });
  
  // Revogar JWT (implementar blacklist se necessário)
  
  return NextResponse.json({ ok: true });
}
```

---

## VULNERABILIDADE 4: Secrets sem Rotação (ALTA)

### Problema
```
❌ Secrets nunca mudam:
- JWT_SECRET criado em 2023, ainda ativo em 2024
- Se comprometido = acesso permanente
```

### Solução - Passo 1: Usar AWS Secrets Manager
```typescript
// lib/secrets.ts

import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: 'us-east-1' });

export async function getSecret(secretName: string) {
  try {
    const response = await client.getSecretValue({
      SecretId: secretName,
    });
    
    return response.SecretString;
  } catch (error) {
    console.error('Failed to retrieve secret:', secretName);
    throw error;
  }
}

// Usar em lib/auth.ts:
const secret = await getSecret('prod/jwt-secret');
const token = jwt.sign(payload, secret);
```

### Solução - Passo 2: Rotação Automática
```bash
# AWS Secrets Manager - Configure rotation a cada 90 dias

# 1. No console AWS:
# Secrets Manager → Select Secret → Rotation

# 2. Lambda para rotação:
# Quando secret muda, notificar aplicação

# 3. Versioning em JWT:
# {
#   "v": 1, // Version ID
#   "kid": "key_2024_12", // Key ID
#   "iat": 1702800000
# }
```

### Solução - Passo 3: Graceful Key Rollover
```typescript
// lib/jwt-manager.ts

const JWT_SECRETS = {
  current: process.env.JWT_SECRET_CURRENT,
  previous: process.env.JWT_SECRET_PREVIOUS, // Mantém por 7 dias
};

export function signJWT(payload: any) {
  return jwt.sign(payload, JWT_SECRETS.current, {
    expiresIn: '15m',
    kid: getCurrentKeyId(),
  });
}

export function verifyJWT(token: string) {
  const decoded = jwt.decode(token, { complete: true });
  
  const secret = decoded?.header?.kid?.includes('previous')
    ? JWT_SECRETS.previous
    : JWT_SECRETS.current;
  
  return jwt.verify(token, secret);
}
```

---

## VULNERABILIDADE 5: JSON.parse sem Try-Catch (MÉDIA)

### Arquivo: app/api/webhooks/mercadopago/route.ts:141

### Problema
```typescript
❌ ATUAL:
const body = JSON.parse(rawBody);  // Pode crash se inválido
```

### Solução
```typescript
// ✅ NOVO

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    
    // Validar JSON antes de parsear
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error('Invalid JSON received:', e.message);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    // Validar estrutura esperada
    if (!body.id || !body.action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Processar webhook...
    
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## VULNERABILIDADE 6: Logging Expõe Dados (MÉDIA)

### Arquivo: lib/auth.ts

### Problema
```typescript
❌ ATUAL:
console.log('[AUTH] User found:', !!user, user?.email);
// ✗ Email apareça em logs!

console.log('[AUTH] Invalid password for user:', normalizedEmail);
// ✗ Email no log de falha!
```

### Solução
```typescript
// ✅ NOVO - lib/auth.ts

import { logger } from '@/lib/logger'; // Winston/Pino

async authorize(credentials) {
  // ... validações ...
  
  const user = await prisma.user.findFirst({
    where: { email: normalizedEmail, deletedAt: null },
    include: { tenant: true },
  });

  logger.info('[AUTH] Authentication attempt', {
    userId: user?.id, // ✅ Apenas ID, sem email
    success: !!user,
    timestamp: new Date().toISOString(),
  });

  if (!user || !user.isActive) {
    logger.warn('[AUTH] User not found or inactive', {
      userId: user?.id, // ✅ Apenas ID
    });
    throw new Error('User not found or inactive');
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password
  );

  if (!isPasswordValid) {
    logger.warn('[AUTH] Invalid password', {
      userId: user?.id, // ✅ Apenas ID
      attempt: '1', // Counter sem dados sensíveis
    });
    throw new Error('Invalid password');
  }

  logger.info('[AUTH] User authenticated', {
    userId: user?.id,
    role: user?.role,
  });

  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role,
    tenantId: user.tenantId || undefined,
  };
}
```

### Configurar Logger com Masking
```typescript
// lib/logger.ts

import winston from 'winston';

const maskSensitive = (info: any) => {
  // Remove emails, passwords, tokens
  const msg = info.message.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '[EMAIL]');
  return msg;
};

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message: maskSensitive(message),
        ...meta,
      });
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

---

## VULNERABILIDADE 7: Falta de 2FA (BAIXA)

### Solução - Implementar TOTP

```typescript
// lib/2fa.ts

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const generate2FASecret = async (email: string) => {
  const secret = speakeasy.generateSecret({
    name: `PaginasComercio (${email})`,
    issuer: 'PaginasComercio',
    length: 32,
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode,
  };
};

export const verify2FAToken = (secret: string, token: string) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // 60 segundos de tolerância
  });
};
```

```typescript
// app/api/auth/2fa/enable/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { generate2FASecret } from '@/lib/2fa';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { secret, qrCode } = await generate2FASecret(session.user.email);

  // Armazenar secret temporariamente
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorSecretTemp: secret,
      twoFactorVerified: false,
    },
  });

  return NextResponse.json({ qrCode, secret });
}
```

---

## 📋 Checklist de Implementação

```
FASE 1 - CRÍTICA (24 horas):
[ ] Revogar todas as credentials
[ ] Remover .env do git history
[ ] Gerar novos secrets
[ ] Deploy com novos secrets

FASE 2 - ALTA (72 horas):
[ ] Implementar CSP restritivo
[ ] Reduzir session maxAge para 15 min
[ ] Configurar AWS Secrets Manager
[ ] Deploy + teste de segurança

FASE 3 - MÉDIA (2 semanas):
[ ] Remover emails dos logs
[ ] Adicionar try-catch JSON.parse
[ ] Implementar CSRF tokens
[ ] Validar rate limiting

FASE 4 - BAIXA (1 mês):
[ ] Implementar 2FA
[ ] Adicionar MFA for admins
[ ] Setup WAF (Cloudflare)
[ ] Testes de penetração

CONTÍNUO:
[ ] npm audit em CI/CD
[ ] Security reviews mensais
[ ] Atualizar dependências
[ ] Monitoramento de logs
```

---

**Próximas etapas:** Implementar as correções acima em ordem de prioridade.
