// BLOCO 2 — DEPLOY PROVIDERS & ACTIVITY LOG
// Documentação Completa

/**
 * 📋 BLOCK_2_DEPLOY_PROVIDERS.md
 * ═════════════════════════════════════════════════════════════════════════
 */

# 🚀 BLOCO 2: DEPLOY PROVIDERS & ACTIVITY LOG

## Visão Geral

**Bloco 2** conecta a infraestrutura de geração estática (Bloco 1) com provedores reais de deploy.

```
BLOCO 1                    BLOCO 2                     PRODUÇÃO
═══════════════════════════════════════════════════════════════
generateStaticPageArtifacts → executeDeployment → Cloudflare R2 CDN
  (HTML, preview, etc)      (activity log)         (global, rápido)
```

### Componentes

| Arquivo | Função |
|---------|--------|
| `base-provider.ts` | Interface genérica para qualquer provider |
| `cloudflare-r2.ts` | Implementação Cloudflare R2 (recomendado) |
| `activity-log.ts` | Persistência e auditoria de deploys |
| `deploy-manager.ts` | Orquestrador principal |

---

## Arquitetura

### Provider Base

Define o contrato que todos os providers devem seguir:

```typescript
export interface DeployProvider {
  name: string;
  uploadFiles(files, options): Promise<DeployProviderUploadResult>;
  invalidateCache(params): Promise<CacheInvalidationResult>;
  deleteVersion?(params): Promise<{ success: boolean }>;
}
```

**Benefícios:**
- ✅ Fácil trocar de provider (Vercel, AWS S3, etc)
- ✅ Copilot entende a assinatura
- ✅ Testável e mockável

### Cloudflare R2 Provider

Implementação otimizada para R2:

- **Upload**: Via AWS S3 SDK com endpoint R2
- **Cache**: Auto-purge via CDN Edge (não precisa invalidar)
- **Cleanup**: deleteVersion() para remover versões antigas

```typescript
const result = await CloudflareR2Provider.uploadFiles([
  { path: "tenants/x/pages/y/v123/index.html", buffer, contentType }
], { tenantId, pageId, version });

// → { deployedUrl, previewUrl, version, metadata }
```

### Activity Log

Persistência de todos os deploys:

```typescript
// Iniciar
const record = await logDeploymentActivity({
  tenantId, pageId, version: "PENDING", status: "RUNNING", provider: "cloudflare-r2"
});

// Atualizar
await updateDeploymentStatus(record.id, "SUCCESS", {
  version: "v-20251119-1320-...",
  deployedUrl: "https://...",
  previewUrl: "https://...",
  metadata: { filesUploaded: 2, htmlSize: 15234 }
});

// Histórico
const history = await getDeploymentHistory(pageId, tenantId);
```

**Campos registrados:**
- `id`: Identificador único
- `tenantId`: Tenant (multi-tenant)
- `pageId`: Página
- `version`: Versão deploy
- `status`: PENDING, RUNNING, SUCCESS, FAILED, ROLLED_BACK
- `provider`: cloudflare-r2
- `startedAt`, `finishedAt`: Timestamps
- `errorMessage`: Se falhar
- `deployedUrl`: URL produção
- `previewUrl`: URL preview
- `metadata`: Dados extras (filesUploaded, duração, etc)

### Deploy Manager

Orquestra todo o pipeline:

```typescript
const result = await executeDeployment({
  tenantId: "tenant-123",
  pageId: "page-456",
  slug: "sobre-nos"
});

// Fluxo interno:
// 1. Cria record com status RUNNING
// 2. Gera artifacts (Bloco 1)
// 3. Prepara files (index.html, preview.html)
// 4. Upload CloudflareR2Provider.uploadFiles()
// 5. Atualiza status SUCCESS
// 6. Retorna URLs + metadata
```

---

## Fluxo Completo

```
User Action (API endpoint)
    ↓
executeDeployment(ctx)
    ↓
[Activity Log] CREATE deployment record (PENDING → RUNNING)
    ↓
generateStaticPageArtifacts(ctx)  [← Bloco 1]
    ├─ Busca dados com Prisma
    ├─ Renderiza template
    ├─ Cria preview HTML
    └─ Retorna { html, previewHtml, version }
    ↓
Prepara DeployFile[]
    ├─ index.html
    └─ preview.html
    ↓
CloudflareR2Provider.uploadFiles()
    ├─ S3 PutObject para cada file
    ├─ Cache headers (1h HTML, 1w assets)
    └─ Retorna { deployedUrl, previewUrl, version }
    ↓
[Activity Log] UPDATE deployment (RUNNING → SUCCESS)
    ├─ deployedUrl
    ├─ previewUrl
    ├─ version
    └─ metadata
    ↓
Return result ao cliente
    ├─ success: true
    ├─ deploymentId
    ├─ deployedUrl: "https://cdn.example.com/tenant/page/v-..."
    └─ previewUrl: "https://cdn.example.com/tenant/page/v-.../preview.html"
```

---

## Configuração

### 1. Cloudflare R2 Setup

Você precisa de:
- Conta Cloudflare
- Bucket R2
- Token de acesso (Access Key + Secret)
- Domínio CDN

Veja **BLOCK_2_ENV_SETUP.md** para instruções completas.

### 2. Variáveis de Ambiente

```env
R2_BUCKET=pages-storage
R2_ACCESS_KEY=your_access_key
R2_SECRET_KEY=your_secret_key
R2_ACCOUNT_ID=your_account_id
R2_CDN_DOMAIN=cdn.example.com
```

### 3. Prisma Schema (TODO)

Você precisa adicionar ao seu `schema.prisma`:

```prisma
model DeploymentRecord {
  id            String   @id @default(cuid())
  tenantId      String
  pageId        String
  version       String
  status        String   // PENDING, RUNNING, SUCCESS, FAILED, ROLLED_BACK
  provider      String   // cloudflare-r2, aws-s3, etc
  startedAt     DateTime @default(now())
  finishedAt    DateTime?
  errorMessage  String?
  deployedUrl   String?
  previewUrl    String?
  metadata      Json?

  @@index([tenantId])
  @@index([pageId])
  @@index([status])
}
```

---

## Exemplos de Uso

### Exemplo 1: Deploy básico (API endpoint)

```typescript
// app/api/deploy/execute/route.ts
import { executeDeployment } from "@/lib/deploy/deploy-manager";

export async function POST(req: Request) {
  try {
    const { tenantId, pageId, slug } = await req.json();

    const result = await executeDeployment({
      tenantId,
      pageId,
      slug
    });

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    return Response.json({
      success: true,
      deployedUrl: result.deployedUrl,
      previewUrl: result.previewUrl,
      version: result.version
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

### Exemplo 2: Histórico de deploys

```typescript
// Mostrar timeline em frontend
const history = await getDeploymentHistory(pageId, tenantId);

history.forEach((deployment) => {
  console.log(`
    ${deployment.version}
    Status: ${deployment.status}
    Deployed: ${deployment.deployedUrl}
    Date: ${deployment.startedAt}
  `);
});
```

### Exemplo 3: Trocar provider (fácil!)

```typescript
// Para usar AWS S3 em vez de R2:
import { AWSS3Provider } from "@/lib/deploy/providers/aws-s3";

// Em deploy-manager.ts:
const uploadResult = await AWSS3Provider.uploadFiles(files, options);

// Pronto! Nenhuma outra mudança necessária
```

---

## Troubleshooting

### Problema: "R2 upload failed: InvalidAccessKeyId"

**Solução:**
- Verifique R2_ACCESS_KEY e R2_SECRET_KEY
- Gere novo token em Cloudflare Dashboard
- Confirme R2_ACCOUNT_ID está correto

### Problema: "Deployment not found"

**Solução:**
- Prisma não está configurado (veja schema acima)
- Ou deploymentId está errado
- Verifique logs em activity-log.ts

### Problema: "Files uploaded but URLs 404"

**Solução:**
- CDN domain (R2_CDN_DOMAIN) está errado?
- Arquivo não foi uploadado com sucesso?
- Cloudflare distribuição não está ativa?

### Problema: Deployment lento (>10s)

**Solução:**
- Arquivo HTML muito grande? (compress-brotli)
- Renderização de template lenta? (cache template)
- Network latência? (Cloudflare Workers para upload local)

---

## Performance

| Operação | Tempo | Notas |
|----------|-------|-------|
| generateStaticPageArtifacts | 100-500ms | Depende da renderização template |
| CloudflareR2Provider.uploadFiles | 500ms-2s | 2 files, network latency |
| Activity log (DB) | 50-100ms | Prisma + database |
| **Total deploy** | **1-3s** | Aceitável para SaaS |

---

## Segurança

✅ **Tenant isolation**: tenantId em todos os paths
✅ **Version control**: Cada version tem ID único
✅ **Activity audit**: Todos os deploys registrados
✅ **Error handling**: Não expõe stack traces ao cliente
✅ **Rate limiting**: TODO - adicionar em API endpoint

---

## Próximos Passos

1. Configure R2 (veja BLOCK_2_ENV_SETUP.md)
2. Descomente TODOs em cloudflare-r2.ts
3. Implemente Prisma schema (DeploymentRecord)
4. Teste com `executeDeployment()`
5. Crie API endpoint POST /api/deploy/execute
6. Integre com frontend (Bloco 3)

---
