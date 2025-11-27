# 🔐 AUDITORIA ENTERPRISE COMPLETA - VITRINAFAST

**Data:** 27 de Novembro de 2025  
**Auditor:** Enterprise Security Architect  
**Versão:** 1.1 (Atualizado após correções)  
**Status Geral:** 🟡 **PARCIALMENTE PRONTO** - 4 de 7 críticas corrigidas

---

## 📋 ÍNDICE

1. [Resumo Executivo](#1-resumo-executivo)
2. [Auditoria de Segurança](#2-auditoria-de-segurança)
3. [Auditoria de Código](#3-auditoria-de-código)
4. [Auditoria de Infraestrutura](#4-auditoria-de-infraestrutura)
5. [Auditoria de Banco de Dados](#5-auditoria-de-banco-de-dados)
6. [Auditoria de Performance](#6-auditoria-de-performance)
7. [Auditoria de Configuração](#7-auditoria-de-configuração)
8. [Auditoria de Testes](#8-auditoria-de-testes)
9. [Checklist de Deploy](#9-checklist-de-deploy)
10. [Plano de Rollback](#10-plano-de-rollback)
11. [Plano de Go-Live](#11-plano-de-go-live)
12. [Relatório Final](#12-relatório-final)

---

## 🔄 HISTÓRICO DE CORREÇÕES (27/11/2025)

| # | Vulnerabilidade | Status | Correção |
|---|-----------------|--------|----------|
| 1 | Webhook MP sem validação | ✅ **CORRIGIDO** | Adicionada validação HMAC + idempotência |
| 2 | Credenciais Cloudinary expostas | ✅ **CORRIGIDO** | API Key rotacionada, antiga deletada |
| 3 | Upload sem proteção | ✅ **CORRIGIDO** | Rate limiting + magic bytes validation |
| 4 | Sistema JSON não persiste | ⚠️ **PENDENTE** | Precisa migrar para banco real |
| 5 | NEXTAUTH_SECRET faltando | ⚠️ **PENDENTE** | Precisa configurar em produção |
| 6 | CSP permite XSS | ⚠️ **DEFERIDO** | Baixa prioridade para MVP |
| 7 | Logs com dados sensíveis | ✅ **CORRIGIDO** | Logs sanitizados no webhook |

---

## 1. RESUMO EXECUTIVO

### 🎯 Escopo da Auditoria
- Aplicação: VitrinaFast (Multi-tenant SaaS)
- Stack: Next.js 14, React 18, TypeScript, Prisma, PostgreSQL
- Pagamentos: Mercado Pago + Stripe
- Armazenamento: Cloudinary
- Deploy: Vercel

### 📊 Resumo de Vulnerabilidades (Atualizado)

| Severidade | Total | Corrigidas | Pendentes |
|------------|-------|------------|-----------|
| 🔴 **CRÍTICO** | 7 | 4 ✅ | 3 ⚠️ |
| 🟠 **ALTO** | 9 | 1 ✅ | 8 ⚠️ |
| 🟡 **MÉDIO** | 12 | 0 | 12 |
| 🟢 **BAIXO** | 8 | 0 | 8 |

### ⚠️ BLOQUEADORES RESTANTES PARA PRODUÇÃO
1. ~~Webhook do Mercado Pago sem validação de assinatura~~ ✅ CORRIGIDO
2. ~~Credenciais hardcoded/expostas no código~~ ✅ CORRIGIDO
3. ~~API de upload sem rate limiting~~ ✅ CORRIGIDO
4. Sistema JSON não escalável para produção ⚠️ PENDENTE
5. Sem NEXTAUTH_SECRET configurado ⚠️ PENDENTE (só em produção)
6. CSP permite `unsafe-inline` e `unsafe-eval`
7. Dados sensíveis em logs

---

## 2. AUDITORIA DE SEGURANÇA

### 2.1 🔴 VULNERABILIDADES CRÍTICAS

#### VULN-001: Webhook Mercado Pago Sem Validação de Assinatura
**Arquivo:** `app/api/webhooks/mercadopago/route.ts`  
**Severidade:** 🔴 CRÍTICA  
**OWASP:** A07:2021 - Cross-Site Request Forgery

**Problema:**
```typescript
// ATUAL - INSEGURO
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ❌ NÃO VALIDA ASSINATURA DO MERCADO PAGO
    // ❌ QUALQUER UM PODE FALSIFICAR WEBHOOKS
```

**Impacto:** Atacante pode enviar webhooks falsos e ativar contas sem pagamento.

**Correção:**
```typescript
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // ✅ VALIDAR ASSINATURA DO MERCADO PAGO
    const signature = request.headers.get('x-signature');
    const requestId = request.headers.get('x-request-id');
    
    if (!signature || !requestId) {
      console.warn('[SECURITY] Webhook sem assinatura');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const rawBody = await request.text();
    
    // Validar HMAC
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET!;
    const [ts, v1] = signature.split(',').map(part => part.split('=')[1]);
    
    const signedPayload = `${requestId}:${ts}:${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    
    if (v1 !== expectedSignature) {
      console.error('[SECURITY] Assinatura inválida do webhook');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    // ... resto do código
```

---

#### VULN-002: Credenciais do Cloudinary Expostas
**Arquivo:** `.env.local`  
**Severidade:** 🔴 CRÍTICA  
**OWASP:** A02:2021 - Cryptographic Failures

**Problema:**
```dotenv
# ❌ CREDENCIAIS REAIS NO ARQUIVO (VISÍVEIS NO CHAT)
CLOUDINARY_API_KEY="389385739289871"
CLOUDINARY_API_SECRET="gaAJFOvsiN3QGM3FvC6k8zekZtk"
```

**Impacto:** Credenciais foram expostas no histórico da conversa. Atacante pode usar sua conta Cloudinary.

**Correção IMEDIATA:**
1. Acessar https://cloudinary.com/console/settings/api-keys
2. **REVOGAR** a API Key atual
3. Gerar nova API Key/Secret
4. Atualizar `.env.local` e Vercel

---

#### VULN-003: API Upload Sem Autenticação e Rate Limiting
**Arquivo:** `app/api/upload/route.ts`  
**Severidade:** 🔴 CRÍTICA  
**OWASP:** A01:2021 - Broken Access Control

**Problema:**
```typescript
// ❌ SEM AUTENTICAÇÃO
// ❌ SEM RATE LIMITING
// ❌ QUALQUER UM PODE FAZER UPLOAD
export async function POST(request: NextRequest) {
  // Aceita uploads de qualquer pessoa
```

**Impacto:** 
- Abuse de armazenamento (custos)
- Possível upload de malware
- DoS via uploads massivos

**Correção:**
```typescript
import { createRateLimiter } from '@/lib/rate-limiter';

const uploadLimiter = createRateLimiter(10, 60 * 1000, 'upload'); // 10 por minuto

export async function POST(request: NextRequest) {
  // ✅ Rate limiting
  const rateLimitResult = await uploadLimiter(request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Muitos uploads. Aguarde 1 minuto.' },
      { status: 429 }
    );
  }

  // ✅ Validação de origem (CSRF básico)
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'Origem não permitida' }, { status: 403 });
  }

  // ✅ Validação de Content-Type real do arquivo (não apenas extensão)
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Verificar magic bytes do arquivo
  const buffer = Buffer.from(await file.arrayBuffer());
  const magicBytes = buffer.slice(0, 4).toString('hex');
  
  const validImageMagicBytes = [
    'ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', // JPEG
    '89504e47', // PNG
    '47494638', // GIF
    '52494646', // WEBP
  ];
  
  if (!validImageMagicBytes.some(m => magicBytes.startsWith(m))) {
    return NextResponse.json({ error: 'Arquivo inválido' }, { status: 400 });
  }
  
  // ... resto do upload
```

---

#### VULN-004: Sistema de Armazenamento JSON Não Seguro para Produção
**Arquivo:** `lib/store-db.ts`  
**Severidade:** 🔴 CRÍTICA  
**OWASP:** A04:2021 - Insecure Design

**Problema:**
```typescript
// ❌ DADOS PERDIDOS A CADA DEPLOY NA VERCEL
// ❌ SEM TRANSAÇÕES ACID
// ❌ RACE CONDITIONS POSSÍVEIS
// ❌ NÃO ESCALA
const DATA_FILE = join(process.cwd(), 'data', 'stores.json');
```

**Impacto:** 
- **TODOS OS DADOS SERÃO PERDIDOS** ao fazer deploy na Vercel
- Vercel usa filesystem efêmero
- Não há persistência

**Correção:** Migrar para banco de dados real

**Opção 1 - Supabase (Gratuito, recomendado):**
```bash
# 1. Criar conta em supabase.com
# 2. Criar projeto
# 3. Copiar DATABASE_URL
# 4. Adicionar em .env.local e Vercel
```

**Opção 2 - Vercel Postgres:**
```bash
# Vercel Dashboard > Storage > Create Database > Postgres
```

**Opção 3 - Temporário (Vercel KV para MVP):**
```typescript
// lib/store-db-kv.ts
import { kv } from '@vercel/kv';

export async function createStore(data: StoreData): Promise<Store> {
  const id = `store_${Date.now()}`;
  const store = { ...data, id, createdAt: new Date().toISOString() };
  await kv.set(`store:${id}`, store);
  await kv.sadd('stores:all', id);
  return store;
}

export async function getStoreById(id: string): Promise<Store | null> {
  return await kv.get(`store:${id}`);
}
```

---

#### VULN-005: NEXTAUTH_SECRET Não Configurado
**Arquivo:** `.env.local`, `lib/auth.ts`  
**Severidade:** 🔴 CRÍTICA  
**OWASP:** A02:2021 - Cryptographic Failures

**Problema:**
```typescript
// lib/auth.ts
secret: process.env.NEXTAUTH_SECRET, // ❌ NÃO EXISTE NO .env.local
```

**Impacto:** NextAuth usa segredo padrão inseguro, permitindo forjar tokens JWT.

**Correção:**
```bash
# Gerar secret seguro
openssl rand -base64 32
```

```dotenv
# .env.local
NEXTAUTH_SECRET="SEU_SECRET_GERADO_AQUI_COM_PELO_MENOS_32_CARACTERES"
NEXTAUTH_URL="http://localhost:3000"
```

---

#### VULN-006: CSP Permite unsafe-inline e unsafe-eval
**Arquivo:** `next.config.js`  
**Severidade:** 🔴 CRÍTICA  
**OWASP:** A03:2021 - Injection

**Problema:**
```javascript
// ❌ PERMITE XSS
value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ..."
```

**Impacto:** Atacante pode injetar e executar JavaScript malicioso.

**Correção (próxima iteração):**
```javascript
// Usar nonce para scripts inline
{
  key: 'Content-Security-Policy',
  value: `
    default-src 'self';
    script-src 'self' 'nonce-{NONCE}' https://cdn.jsdelivr.net;
    style-src 'self' 'nonce-{NONCE}' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://api.mercadopago.com https://res.cloudinary.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim(),
}
```

---

#### VULN-007: Dados Sensíveis em Console.log
**Arquivos:** Múltiplos  
**Severidade:** 🔴 CRÍTICA  
**OWASP:** A09:2021 - Security Logging and Monitoring Failures

**Problema:**
```typescript
// app/api/webhooks/mercadopago/route.ts
console.log('📩 Webhook Mercado Pago recebido:', JSON.stringify(body, null, 2));
// ❌ LOGA DADOS DE PAGAMENTO COMPLETOS

console.log('💰 Pagamento encontrado:', {
  id: payment.id,
  status: payment.status,
  external_reference: payment.external_reference,
  metadata: payment.metadata, // ❌ PODE CONTER DADOS SENSÍVEIS
});
```

**Impacto:** Dados de pagamento expostos em logs da Vercel (públicos para quem tem acesso).

**Correção:**
```typescript
// Criar logger estruturado que sanitiza dados
import { sanitizeForLog } from '@/lib/logger';

console.log('[WEBHOOK] Pagamento processado:', {
  paymentId: payment.id,
  status: payment.status,
  tenantId: payment.external_reference,
  // ❌ NÃO LOGAR: metadata, amount, payer info, etc.
});
```

---

### 2.2 🟠 VULNERABILIDADES ALTAS

#### VULN-008: Webhook Stripe Funcional Mas Não Integrado ao Fluxo Real
**Arquivo:** `app/api/webhooks/stripe/route.ts`  
**Severidade:** 🟠 ALTA

**Status:** Webhook do Stripe está implementado corretamente com validação de assinatura, MAS:
- Não está conectado ao sistema JSON atual
- Usa Prisma que não tem banco de dados ativo
- Código está funcional mas inoperante

---

#### VULN-009: Mercado Pago Usando Credenciais de Teste
**Arquivo:** `.env.local`  
**Severidade:** 🟠 ALTA

**Problema:**
```dotenv
# Credenciais de SANDBOX - não funcionam em produção
MERCADOPAGO_ACCESS_TOKEN="TEST-..."
```

**Correção:** Antes do go-live, trocar para credenciais de produção.

---

#### VULN-010: Sem Idempotência nos Webhooks
**Severidade:** 🟠 ALTA

**Problema:** Se webhook for reenviado, processa pagamento duplicado.

**Correção:**
```typescript
// Adicionar verificação de idempotência
const processedWebhooks = new Set<string>(); // Em produção, usar Redis

export async function POST(request: NextRequest) {
  const webhookId = request.headers.get('x-request-id');
  
  if (processedWebhooks.has(webhookId)) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  
  processedWebhooks.add(webhookId);
  // ... processar
}
```

---

#### VULN-011: Sem Validação de Tipos de Arquivo Por Magic Bytes
**Arquivo:** `app/api/upload/route.ts`  
**Severidade:** 🟠 ALTA

**Problema:** Valida apenas `file.type` que vem do cliente (falsificável).

---

#### VULN-012: Imagens Cloudinary Sem Configuração de Domínio
**Arquivo:** `next.config.js`  
**Severidade:** 🟠 ALTA

**Problema:**
```javascript
// ❌ FALTA CLOUDINARY NOS DOMÍNIOS PERMITIDOS
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**.amazonaws.com' },
    // ❌ FALTA: res.cloudinary.com
```

**Correção:**
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com' }, // ✅ ADICIONAR
    { protocol: 'https', hostname: '**.amazonaws.com' },
    // ...
  ],
}
```

---

#### VULN-013: Preview de Loja Expõe Dados Sem Autenticação
**Arquivo:** `app/preview/[tenantId]/page.tsx`  
**Severidade:** 🟠 ALTA

**Problema:** Qualquer pessoa com o ID pode ver dados da loja mesmo em DRAFT.

---

### 2.3 🟡 VULNERABILIDADES MÉDIAS

| ID | Descrição | Arquivo |
|----|-----------|---------|
| VULN-014 | Sem sanitização HTML em descrições | `PublicPageRenderer.tsx` |
| VULN-015 | localStorage sem criptografia | `app/setup/page.tsx` |
| VULN-016 | Sem limite de tamanho para JSON de fotos | `lib/store-db.ts` |
| VULN-017 | Erro genérico expõe stack trace em dev | Múltiplos |
| VULN-018 | Sem audit log para ações críticas | `app/api/stores/route.ts` |
| VULN-019 | CORS muito permissivo | `next.config.js` |
| VULN-020 | Sem proteção contra enumeration de slugs | `lib/store-db.ts` |
| VULN-021 | Email padrão hardcoded | `app/api/stores/route.ts` |
| VULN-022 | Sem validação Zod no /api/stores | `app/api/stores/route.ts` |
| VULN-023 | Palavras proibidas fáceis de bypassar | `app/setup/page.tsx` |
| VULN-024 | Sem timeout em requests externos | `lib/cloudinary.ts` |
| VULN-025 | TypeScript errors ignorados no build | `next.config.js` |

---

## 3. AUDITORIA DE CÓDIGO

### 3.1 Estrutura de Pastas ✅ BOM

```
app/
├── api/           ✅ Rotas de API bem organizadas
├── setup/         ✅ Wizard de criação
├── preview/       ✅ Preview de lojas
├── loja/          ✅ Páginas públicas
├── pagamento/     ✅ Fluxo de pagamento
lib/
├── auth.ts        ✅ Autenticação NextAuth
├── middleware.ts  ✅ Middlewares de segurança
├── store-db.ts    ⚠️ Sistema JSON temporário
├── cloudinary.ts  ✅ Upload de imagens
├── mercadopago.ts ✅ Integração MP
components/
├── PublicPageRenderer.tsx ✅ Renderização de páginas
```

### 3.2 Problemas de Código

#### ISSUE-001: TypeScript Errors Ignorados
**Arquivo:** `next.config.js`
```javascript
typescript: {
  ignoreBuildErrors: false, // ⚠️ Era true antes, verificar se há erros
}
```

#### ISSUE-002: Código Morto (Prisma não utilizado)
**Arquivos:** `app/api/checkout/route.ts`, `app/api/webhooks/mercadopago/route.ts`

```typescript
// ❌ Prisma importado mas banco não existe
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// Vai falhar em runtime
```

#### ISSUE-003: Inconsistência de Sistema de Dados
- `/api/stores` usa `store-db.ts` (JSON)
- `/api/checkout` usa Prisma
- `/api/webhooks/mercadopago` usa Prisma
- `/api/tenants/[id]` usa `store-db.ts`

**Recomendação:** Padronizar para um único sistema.

---

## 4. AUDITORIA DE INFRAESTRUTURA

### 4.1 Variáveis de Ambiente - CRÍTICO

#### ⚠️ VARIÁVEIS FALTANDO PARA PRODUÇÃO

| Variável | Status | Obrigatória |
|----------|--------|-------------|
| `NEXTAUTH_SECRET` | ❌ FALTANDO | SIM |
| `NEXTAUTH_URL` | ❌ FALTANDO | SIM |
| `DATABASE_URL` | ⚠️ INVÁLIDO (localhost) | SIM |
| `MERCADOPAGO_ACCESS_TOKEN` | ⚠️ SANDBOX | PRODUÇÃO |
| `MERCADOPAGO_WEBHOOK_SECRET` | ❌ FALTANDO | SIM |
| `STRIPE_SECRET_KEY` | ⚠️ NÃO VERIFICADO | SE USAR |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ NÃO VERIFICADO | SE USAR |
| `CLOUDINARY_*` | ⚠️ EXPOSTO | REGENERAR |

### 4.2 Vercel - Checklist

- [ ] Domínio customizado configurado
- [ ] SSL/HTTPS forçado
- [ ] Environment Variables configuradas
- [ ] Edge Functions vs Serverless adequado
- [ ] Timeouts configurados
- [ ] Logs habilitados

---

## 5. AUDITORIA DE BANCO DE DADOS

### 5.1 Status Atual: ❌ SEM BANCO DE DADOS

O sistema atual usa arquivo JSON (`data/stores.json`) que:
- ❌ Não persiste na Vercel
- ❌ Não tem ACID
- ❌ Não escala
- ❌ Não tem backup

### 5.2 Schema Prisma - BEM ESTRUTURADO ✅

O schema em `db/prisma/schema.prisma` é bem feito:
- ✅ Índices adequados
- ✅ Soft delete implementado
- ✅ Enums para status
- ✅ Relacionamentos corretos
- ✅ Constraints únicos

### 5.3 Recomendação

**URGENTE:** Migrar para banco de dados real antes do deploy.

```bash
# Opção 1: Supabase (gratuito)
npm install @supabase/supabase-js

# Opção 2: Vercel Postgres
vercel link
vercel env pull
```

---

## 6. AUDITORIA DE PERFORMANCE

### 6.1 Bundle Analysis

```
Páginas Verificadas:
- /setup: ~600 modules ⚠️ GRANDE
- /preview: ~850 modules ⚠️ MUITO GRANDE
- API routes: ~550 modules ✅ OK
```

### 6.2 Otimizações Necessárias

1. **Lazy Loading de Componentes**
```typescript
// ❌ ATUAL
import PublicPageRenderer from '@/components/PublicPageRenderer';

// ✅ MELHOR
const PublicPageRenderer = dynamic(
  () => import('@/components/PublicPageRenderer'),
  { loading: () => <Skeleton /> }
);
```

2. **Image Optimization**
```typescript
// ❌ ATUAL - img tag normal
<img src={photos[slot.id].url} />

// ✅ MELHOR - Next Image com blur
import Image from 'next/image';
<Image 
  src={url} 
  alt={alt}
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

---

## 7. AUDITORIA DE CONFIGURAÇÃO

### 7.1 next.config.js - ANÁLISE

| Configuração | Status | Recomendação |
|--------------|--------|--------------|
| `reactStrictMode` | ✅ true | Manter |
| `swcMinify` | ✅ true | Manter |
| `removeConsole` | ✅ prod only | Manter |
| `ignoreDuringBuilds` (ESLint) | ⚠️ true | Mudar para false |
| Security Headers | ✅ Configurados | Revisar CSP |
| Image domains | ⚠️ Incompleto | Adicionar Cloudinary |

### 7.2 Correções Necessárias

```javascript
// next.config.js - ADICIONAR
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com', // ✅ ADICIONAR
    },
    // ... outros
  ],
},
```

---

## 8. AUDITORIA DE TESTES

### 8.1 Status Atual: ⚠️ INSUFICIENTE

**Cobertura Estimada:** < 20%

### 8.2 Testes Críticos Faltando

| Teste | Prioridade | Arquivo |
|-------|------------|---------|
| Webhook Mercado Pago | 🔴 CRÍTICO | `__tests__/webhooks/mercadopago.test.ts` |
| Criação de Loja | 🔴 CRÍTICO | `__tests__/api/stores.test.ts` |
| Upload de Imagem | 🟠 ALTO | `__tests__/api/upload.test.ts` |
| Validação de Conteúdo | 🟠 ALTO | `__tests__/lib/content-filter.test.ts` |
| Fluxo de Checkout | 🟠 ALTO | `__tests__/e2e/checkout.test.ts` |

### 8.3 Testes E2E Obrigatórios

```typescript
// __tests__/e2e/critical-flows.test.ts
describe('Fluxos Críticos', () => {
  test('Criar loja completa', async () => {
    // 1. Preencher Step 1 (tipo de negócio)
    // 2. Preencher Step 2 (dados da loja)
    // 3. Upload de fotos
    // 4. Publicar
    // 5. Verificar que loja existe
  });

  test('Webhook de pagamento ativa loja', async () => {
    // 1. Criar loja em DRAFT
    // 2. Simular webhook approved
    // 3. Verificar status ACTIVE
  });
});
```

---

## 9. CHECKLIST DE DEPLOY

### 9.1 PRÉ-DEPLOY (OBRIGATÓRIO)

#### Segurança
- [ ] Regenerar credenciais Cloudinary (foram expostas)
- [ ] Configurar `NEXTAUTH_SECRET` (mín. 32 chars)
- [ ] Configurar `NEXTAUTH_URL`
- [ ] Trocar credenciais MP para produção
- [ ] Configurar `MERCADOPAGO_WEBHOOK_SECRET`
- [ ] Adicionar validação de assinatura no webhook MP
- [ ] Adicionar rate limiting no upload
- [ ] Remover `console.log` com dados sensíveis

#### Banco de Dados
- [ ] Criar banco de dados (Supabase/Vercel Postgres)
- [ ] Configurar `DATABASE_URL` de produção
- [ ] Rodar migrations: `npx prisma migrate deploy`
- [ ] Migrar dados do JSON para banco

#### Configuração
- [ ] Adicionar `res.cloudinary.com` nos domínios de imagem
- [ ] Revisar CSP (remover unsafe-inline se possível)
- [ ] Configurar `eslint.ignoreDuringBuilds: false`

### 9.2 DEPLOY

```bash
# 1. Commit final
git add .
git commit -m "fix: security hardening for production"

# 2. Push
git push origin main

# 3. Verificar build na Vercel
# Vercel Dashboard > Deployments

# 4. Verificar logs
vercel logs --follow
```

### 9.3 PÓS-DEPLOY

- [ ] Testar criação de loja
- [ ] Testar upload de imagens
- [ ] Testar webhook (sandbox)
- [ ] Verificar SSL (https://)
- [ ] Verificar headers de segurança
- [ ] Monitorar logs por 24h

---

## 10. PLANO DE ROLLBACK

### 10.1 Rollback via Vercel (Recomendado)

```bash
# 1. Acessar Vercel Dashboard
# 2. Ir em Deployments
# 3. Encontrar último deploy estável
# 4. Clicar em "..." > "Promote to Production"
```

### 10.2 Rollback via Git

```bash
# 1. Identificar commit estável
git log --oneline -10

# 2. Reverter para commit específico
git revert HEAD~1  # ou git revert <commit-hash>

# 3. Push
git push origin main
```

### 10.3 Rollback de Banco de Dados

```bash
# Se usando Prisma
npx prisma migrate resolve --rolled-back <migration_name>

# Ou restaurar backup
pg_restore -d DATABASE_URL backup.dump
```

---

## 11. PLANO DE GO-LIVE

### 11.1 D-7 (7 dias antes)

- [ ] Completar todas correções críticas
- [ ] Configurar banco de dados de produção
- [ ] Configurar variáveis de ambiente na Vercel
- [ ] Regenerar todas as credenciais expostas
- [ ] Testar em ambiente de staging

### 11.2 D-1 (1 dia antes)

- [ ] Code freeze (sem novos commits)
- [ ] Revisar checklist completo
- [ ] Backup de dados existentes
- [ ] Comunicar equipe/stakeholders
- [ ] Preparar rollback

### 11.3 D-Day (Dia do lançamento)

```
08:00 - Verificação final de ambiente
09:00 - Deploy para produção
09:15 - Teste de smoke (criar 1 loja)
09:30 - Teste de pagamento (sandbox)
10:00 - Liberar para usuários
10:00-18:00 - Monitoramento intensivo
```

### 11.4 Monitoramento Primeiras 24h

- [ ] Verificar logs a cada 2h
- [ ] Monitorar erros 5xx
- [ ] Verificar tempo de resposta das APIs
- [ ] Monitorar uso de memória/CPU
- [ ] Verificar webhooks recebidos
- [ ] Testar fluxo completo 3x ao dia

---

## 12. RELATÓRIO FINAL

### 12.1 Pontos Fortes do Projeto ✅

1. **Arquitetura bem estruturada** - Separação clara de responsabilidades
2. **Middlewares de segurança** - RBAC, tenant isolation, rate limiting implementados
3. **Webhook Stripe** - Implementação correta com validação de assinatura
4. **Schema Prisma** - Bem modelado com soft delete e índices
5. **Headers de segurança** - CSP, HSTS, X-Frame-Options configurados
6. **Validações Zod** - Schemas de validação robustos
7. **UI/UX** - Wizard de criação intuitivo com salvamento automático

### 12.2 Riscos Restantes ⚠️

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda de dados (JSON) | 🔴 ALTA | 🔴 CRÍTICO | Migrar para banco |
| Webhook falso MP | 🟠 MÉDIA | 🔴 CRÍTICO | Validar assinatura |
| Abuso de upload | 🟠 MÉDIA | 🟠 ALTO | Rate limiting |
| XSS via descrição | 🟡 BAIXA | 🟠 ALTO | Sanitizar HTML |

### 12.3 Conclusão

## ⚠️ **STATUS: NÃO PRONTO PARA PRODUÇÃO**

O projeto tem uma base sólida, mas apresenta **7 vulnerabilidades críticas** que devem ser corrigidas antes do deploy:

1. ❌ Webhook MP sem validação
2. ❌ Credenciais expostas
3. ❌ Upload sem proteção
4. ❌ Sistema JSON não persiste
5. ❌ NEXTAUTH_SECRET faltando
6. ❌ CSP permite XSS
7. ❌ Logs com dados sensíveis

### 12.4 Conformidade

| Framework | Status | Notas |
|-----------|--------|-------|
| **OWASP Top 10** | ⚠️ PARCIAL | A01, A02, A03, A07 com issues |
| **LGPD** | ⚠️ PARCIAL | Falta política de privacidade |
| **PCI-DSS** | ✅ N/A | Pagamentos via MP/Stripe (offloaded) |

### 12.5 Próximos Passos Recomendados

1. **IMEDIATO (Hoje)**
   - Regenerar credenciais Cloudinary
   - Adicionar validação no webhook MP
   - Configurar NEXTAUTH_SECRET

2. **CURTO PRAZO (1-3 dias)**
   - Migrar para banco de dados real
   - Adicionar rate limiting no upload
   - Remover logs sensíveis

3. **MÉDIO PRAZO (1-2 semanas)**
   - Implementar testes E2E
   - Revisar CSP
   - Adicionar monitoramento (Sentry)

---

**Relatório gerado em:** 27/11/2025  
**Próxima revisão recomendada:** Após correções críticas

---

*Este documento deve ser tratado como CONFIDENCIAL e não compartilhado externamente.*
