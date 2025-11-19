// BLOCO 2 — CLOUDFLARE R2 SETUP
// Guia de Configuração

/**
 * 📋 BLOCK_2_ENV_SETUP.md
 * ═════════════════════════════════════════════════════════════════════════
 */

# 🔧 BLOCO 2: CLOUDFLARE R2 ENVIRONMENT SETUP

## Pré-requisitos

- ✅ Conta Cloudflare (grátis ou paga)
- ✅ Node.js 16+ (para AWS SDK)
- ✅ npm ou yarn

---

## Passo 1: Criar Bucket R2

### No Cloudflare Dashboard

1. **Login** em [https://dash.cloudflare.com](https://dash.cloudflare.com)

2. **Sidebar** → R2 Storage

3. **Create bucket**
   - Nome: `pages-storage`
   - Region: Escolher (recomendado: us-west-2)
   - Click "Create"

4. **Note Account ID**
   ```
   Settings → Account ID: copie (ex: 123abc456def789)
   ```

---

## Passo 2: Gerar Access Token

### No Cloudflare Dashboard

1. **R2 → Settings**

2. **R2 API Token** section

3. **Create Token**
   - Token name: `pages-deploy`
   - TTL: Leave empty (never expires)
   - Permissions: ✅ Edit (para upload)
   - Click "Create"

4. **COPIE E GUARDE SEGURO**
   ```
   Access Key ID: xxxxxxxxx
   Secret Access Key: yyyyyyyyy
   ```
   ⚠️ Você não pode ver novamente! Se perder, delete e recrie.

---

## Passo 3: Configurar CDN (Opcional mas Recomendado)

### Adicionar Custom Domain

1. **R2 → Settings**

2. **Domain settings**

3. **Connect domain**
   - Domain: `cdn.seuapp.com` (seu domínio)
   - Click "Connect"

4. **Add DNS record**
   ```
   Type: CNAME
   Name: cdn
   Content: <seu-account-id>.r2.cloudflarestorage.com
   ```

5. **Wait 5-10 minutes** for DNS propagation

---

## Passo 4: Instalar Dependências

### NPM

```bash
npm install @aws-sdk/client-s3
```

### Yarn

```bash
yarn add @aws-sdk/client-s3
```

---

## Passo 5: Configurar Environment Variables

### .env.local (desenvolvimento)

```env
# Cloudflare R2
R2_BUCKET=pages-storage
R2_ACCESS_KEY=your_access_key_here
R2_SECRET_KEY=your_secret_key_here
R2_ACCOUNT_ID=your_account_id_here
R2_CDN_DOMAIN=cdn.seuapp.com
```

### .env.production (produção)

```env
# Use CI/CD secrets em vez de .env
R2_BUCKET=pages-storage
R2_ACCESS_KEY=${CLOUDFLARE_R2_ACCESS_KEY}
R2_SECRET_KEY=${CLOUDFLARE_R2_SECRET_KEY}
R2_ACCOUNT_ID=${CLOUDFLARE_R2_ACCOUNT_ID}
R2_CDN_DOMAIN=cdn.seuapp.com
```

### GitHub Actions (exemplo)

```yaml
# .github/workflows/deploy.yml

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    env:
      CLOUDFLARE_R2_ACCESS_KEY: ${{ secrets.CLOUDFLARE_R2_ACCESS_KEY }}
      CLOUDFLARE_R2_SECRET_KEY: ${{ secrets.CLOUDFLARE_R2_SECRET_KEY }}
      CLOUDFLARE_R2_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_R2_ACCOUNT_ID }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run deploy
```

---

## Passo 6: Descomente TODOs no Código

### cloudflare-r2.ts

```typescript
// Procure por estes linhas:

// ❌ ANTES:
// const r2Client = new S3Client({
//   region: "auto",
//   ...
// });

// ✅ DEPOIS:
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

// Faça o mesmo para:
// - uploadFiles() (linhas 50-65)
// - deleteVersion() (linhas 115-130)
```

### activity-log.ts

```typescript
// Descomente prisma import:
import { prisma } from "@/lib/prisma";

// Descomente os .create(), .update(), .findUnique(), etc
```

### deploy-manager.ts

```typescript
// Descomente os imports e funções que usam activity-log
```

---

## Passo 7: Testar Conexão

### Script de Teste

```bash
# Crie: scripts/test-r2.js

const { S3Client, HeadBucketCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

async function test() {
  try {
    await client.send(
      new HeadBucketCommand({ Bucket: process.env.R2_BUCKET })
    );
    console.log("✅ R2 conexão OK");
  } catch (error) {
    console.error("❌ R2 erro:", error.message);
  }
}

test();
```

### Executar Teste

```bash
node scripts/test-r2.js

# Output esperado:
# ✅ R2 conexão OK
```

---

## Passo 8: Prisma Schema (Importante!)

### schema.prisma

```prisma
model DeploymentRecord {
  id            String   @id @default(cuid())
  tenantId      String   @indexed
  pageId        String   @indexed
  version       String
  status        String   // PENDING, RUNNING, SUCCESS, FAILED, ROLLED_BACK
  provider      String   // cloudflare-r2
  startedAt     DateTime @default(now())
  finishedAt    DateTime?
  errorMessage  String?
  deployedUrl   String?
  previewUrl    String?
  metadata      Json?

  @@index([tenantId])
  @@index([pageId])
  @@index([status])
  @@index([startedAt])
}
```

### Executar Migração

```bash
# Criar migração
npx prisma migrate dev --name add-deployment-record

# Deploy (produção)
npx prisma migrate deploy
```

---

## Passo 9: Permissões R2 (Opcional mas Recomendado)

### Criar Token com Permissões Limitadas

1. **R2 → Settings → API Token**

2. **Create API Token**
   - Permissions:
     ✅ `files:read`
     ✅ `files:write`
     ❌ `delete` (não necessário)
     ❌ `admin:read` (não necessário)
   - Resources: `pages-storage` bucket only

3. **Salve as credenciais**

---

## Passo 10: Teste Completo (Deploy)

### Deploy Test

```typescript
// scripts/test-deploy.ts

import { executeDeployment } from "@/lib/deploy/deploy-manager";

async function test() {
  console.log("Testing deployment...");

  const result = await executeDeployment({
    tenantId: "test-tenant",
    pageId: "test-page",
    slug: "test-page"
  });

  if (result.success) {
    console.log("✅ Deploy successful!");
    console.log("URL:", result.deployedUrl);
    console.log("Version:", result.version);
  } else {
    console.error("❌ Deploy failed:", result.error);
  }
}

test().catch(console.error);
```

### Run

```bash
npx ts-node scripts/test-deploy.ts
```

---

## Custo R2

| Armazenamento | Custo |
|---------------|-------|
| Primeiros 10GB/mês | Grátis |
| Próximos 1TB/mês | $0.015/GB |
| >1TB/mês | $0.03/GB |

**Para SaaS típico com 100 tenants × 10 páginas:**
- ~100GB de HTML = **$0.50/mês**
- Uploads ilimitados

---

## Troubleshooting

### Erro: "InvalidAccessKeyId"

```
❌ R2 upload failed: InvalidAccessKeyId

Solução:
1. Verificar R2_ACCESS_KEY em .env
2. Gerar novo token em Cloudflare
3. Confirmar Account ID está correto
```

### Erro: "NoSuchBucket"

```
❌ R2 upload failed: NoSuchBucket

Solução:
1. Verificar R2_BUCKET em .env
2. Confirmar bucket existe em Cloudflare Dashboard
3. Bucket name case-sensitive (deve ser "pages-storage")
```

### Erro: "Network timeout"

```
❌ R2 upload failed: ETIMEDOUT

Solução:
1. Testar conexão: node scripts/test-r2.js
2. Verificar internet
3. Aumentar timeout em cloudflare-r2.ts
```

### URLs retornam 404

```
❌ Arquivo uploadado mas não acessível

Solução:
1. Verificar R2_CDN_DOMAIN em .env
2. Aguardar DNS propagation (5-10 min)
3. Testar URL diretamente em browser
4. Verificar CORS settings em Cloudflare
```

---

## Commands Rápidos

```bash
# Testar R2
node scripts/test-r2.js

# Testar Deploy
npx ts-node scripts/test-deploy.ts

# Ver logs
tail -f logs/deploy.log

# Limpar antigos
npx prisma db:seed  # Se implementar cleanup
```

---

## Checklist Final

- [ ] Conta Cloudflare criada
- [ ] Bucket R2 criado
- [ ] Access Token gerado
- [ ] Account ID copiado
- [ ] .env.local configurado
- [ ] AWS SDK instalado (`npm install @aws-sdk/client-s3`)
- [ ] test-r2.js executado com sucesso
- [ ] TODOs descomentados em cloudflare-r2.ts
- [ ] Prisma schema adicionado
- [ ] Migração Prisma executada
- [ ] Teste completo de deploy executado
- [ ] CDN domain configurado (opcional)

---

## Next Steps

✅ Quando tudo estiver funcionando:
1. Integre com API endpoint (veja BLOCK_2_DEPLOY_MANAGER_GUIDE.md)
2. Crie frontend components (Bloco 3)
3. Configure CI/CD com GitHub Actions
4. Monitore custos em Cloudflare Dashboard

---
