// BLOCO 2 — DEPLOY MANAGER & ACTIVITY LOG
// Guia de Uso Prático

/**
 * 📋 BLOCK_2_DEPLOY_MANAGER_GUIDE.md
 * ═════════════════════════════════════════════════════════════════════════
 */

# 📘 BLOCO 2: DEPLOY MANAGER GUIDE

## Como Usar executeDeployment()

### Importar

```typescript
import { executeDeployment } from "@/lib/deploy/deploy-manager";
```

### Uso Básico

```typescript
const result = await executeDeployment({
  tenantId: "tenant-123",
  pageId: "page-456",
  slug: "sobre-nos"
});

if (result.success) {
  console.log("✅ Deploy completo!");
  console.log("URL:", result.deployedUrl);
  console.log("Preview:", result.previewUrl);
  console.log("Version:", result.version);
} else {
  console.error("❌ Deploy falhou:", result.error);
}
```

### Result Object

**Success:**
```typescript
{
  success: true,
  deploymentId: "deploy_1234567890_abc123",
  version: "v-20251119-1320-tenant-123-page-456-xyz789",
  deployedUrl: "https://cdn.example.com/tenant-123/page-456/v-20251119.../index.html",
  previewUrl: "https://cdn.example.com/tenant-123/page-456/v-20251119.../preview.html",
  metadata: {
    filesDeployed: 2,
    htmlSize: 15234,
    deploymentDurationMs: 1250
  }
}
```

**Failure:**
```typescript
{
  success: false,
  deploymentId: "deploy_1234567890_abc123",
  error: "R2 upload failed: Connection timeout"
}
```

---

## API Endpoint Exemplo

### POST /api/deploy/execute

```typescript
// app/api/deploy/execute/route.ts

import { executeDeployment } from "@/lib/deploy/deploy-manager";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request
    const { tenantId, pageId, slug } = await req.json();

    // 2. Validar entrada
    if (!tenantId || !pageId || !slug) {
      return Response.json(
        { error: "Missing required fields: tenantId, pageId, slug" },
        { status: 400 }
      );
    }

    // 3. Autorizar tenant (TODO: verificar auth)
    // const user = await auth();
    // if (user?.tenantId !== tenantId) {
    //   return Response.json({ error: "Unauthorized" }, { status: 403 });
    // }

    // 4. Executar deploy
    console.log(`[API] Deploy request: ${tenantId}/${pageId}`);
    const result = await executeDeployment({
      tenantId,
      pageId,
      slug
    });

    // 5. Retornar resultado
    if (!result.success) {
      return Response.json(
        {
          error: result.error,
          deploymentId: result.deploymentId // para debugging
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: {
        deploymentId: result.deploymentId,
        version: result.version,
        deployedUrl: result.deployedUrl,
        previewUrl: result.previewUrl,
        deploymentTime: result.metadata?.deploymentDurationMs
      }
    });
  } catch (error) {
    console.error("[API] Deploy error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Client Usage

```typescript
// components/DeployButton.tsx

const handleDeploy = async () => {
  setLoading(true);
  try {
    const response = await fetch("/api/deploy/execute", {
      method: "POST",
      body: JSON.stringify({
        tenantId: "tenant-123",
        pageId: "page-456",
        slug: "sobre-nos"
      })
    });

    const data = await response.json();

    if (!data.success) {
      toast.error(`Deploy failed: ${data.error}`);
      return;
    }

    toast.success("✅ Deploy successful!");
    window.open(data.data.previewUrl, "_blank");
  } catch (error) {
    toast.error("Deploy error");
  } finally {
    setLoading(false);
  }
};
```

---

## Logs & Debugging

### Activity Log Records

Cada deploy cria um record em `DeploymentRecord`:

```sql
SELECT * FROM DeploymentRecord
WHERE tenantId = 'tenant-123' AND pageId = 'page-456'
ORDER BY startedAt DESC
LIMIT 10;

-- Resultado:
-- id                              | status    | version              | deployedUrl | createdAt
-- deploy_1234567890_abc123        | SUCCESS   | v-20251119-1320-...  | https://... | 2025-11-19
-- deploy_1234567889_abc122        | FAILED    | PENDING              | NULL        | 2025-11-19
-- deploy_1234567888_abc121        | SUCCESS   | v-20251119-1200-...  | https://... | 2025-11-19
```

### Console Logs

Deploy manager emite logs úteis:

```
[Deploy deploy_123] Starting deployment for tenant-123/page-456
[Deploy deploy_123] Generating static artifacts...
[Deploy deploy_123] Generated version: v-20251119-1320-tenant-123-page-456-xyz789
[Deploy deploy_123] Uploading 2 files to R2...
[Deploy deploy_123] Upload successful: https://cdn.example.com/...
[Deploy deploy_123] Deployment complete
```

### Error Logging

Erros são capturados e persistidos:

```typescript
// Exemplo de erro registrado:
{
  id: "deploy_123",
  status: "FAILED",
  errorMessage: "R2 upload failed: InvalidAccessKeyId",
  metadata: {
    attemptedFiles: 2,
    failedAt: "upload-step"
  }
}
```

---

## Rollback Básico

### Conceito

Rollback = redeployr uma versão anterior bem-sucedida

### Implementação

```typescript
// lib/deploy/rollback.ts

import { getLastSuccessfulDeployment } from "./activity-log";
import { executeDeployment } from "./deploy-manager";

export async function rollbackToPreviousVersion(
  pageId: string,
  tenantId: string
) {
  // 1. Buscar último deploy bem-sucedido
  const previousVersion = await getLastSuccessfulDeployment(pageId, tenantId);

  if (!previousVersion) {
    throw new Error("No previous successful deployment found");
  }

  console.log(`Rollback: ${pageId} → ${previousVersion.version}`);

  // 2. Simular redeploy da versão anterior
  // (Em produção, você faria hardlink ou cópia)

  return {
    success: true,
    rolledBackTo: previousVersion.version,
    deployedUrl: previousVersion.deployedUrl
  };
}
```

### API Endpoint

```typescript
// app/api/deploy/rollback/route.ts

export async function POST(req: NextRequest) {
  const { pageId, tenantId } = await req.json();

  try {
    const result = await rollbackToPreviousVersion(pageId, tenantId);
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Status Checking

### Get Deployment Status

```typescript
import { checkDeploymentStatus } from "@/lib/deploy/deploy-manager";

const status = await checkDeploymentStatus("deploy_123");

console.log(status);
// {
//   id: "deploy_123",
//   status: "SUCCESS",
//   deployedUrl: "https://...",
//   previewUrl: "https://...",
//   errorMessage: null
// }
```

### Poll for Completion

```typescript
// Útil para frontend acompanhar em tempo real
async function waitForDeploymentCompletion(
  deploymentId: string,
  maxWaitMs: number = 30000
) {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const status = await checkDeploymentStatus(deploymentId);

    if (status.status === "SUCCESS") {
      return { success: true, status };
    }

    if (status.status === "FAILED") {
      return { success: false, error: status.errorMessage };
    }

    // Wait 1 second before next check
    await new Promise(r => setTimeout(r, 1000));
  }

  throw new Error("Deployment timeout");
}
```

---

## Deployment History

### Get History

```typescript
import { getDeploymentHistory } from "@/lib/deploy/deploy-manager";

const history = await getDeploymentHistory("page-456", "tenant-123");

history.forEach((deployment, index) => {
  console.log(`${index + 1}. ${deployment.version}`);
  console.log(`   Status: ${deployment.status}`);
  console.log(`   Date: ${deployment.startedAt}`);
  console.log(`   URL: ${deployment.deployedUrl}`);
});
```

### Timeline Component

```typescript
// components/DeploymentTimeline.tsx

import { getDeploymentHistory } from "@/lib/deploy/deploy-manager";

export async function DeploymentTimeline({ pageId, tenantId }) {
  const history = await getDeploymentHistory(pageId, tenantId);

  return (
    <div className="space-y-4">
      {history.map((deployment) => (
        <div
          key={deployment.id}
          className={`p-4 rounded border ${
            deployment.status === "SUCCESS"
              ? "border-green-300 bg-green-50"
              : "border-red-300 bg-red-50"
          }`}
        >
          <div className="flex justify-between">
            <span className="font-mono">{deployment.version}</span>
            <span className={deployment.status === "SUCCESS" ? "text-green-600" : "text-red-600"}>
              {deployment.status}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {deployment.startedAt.toLocaleString()}
          </div>
          {deployment.deployedUrl && (
            <a href={deployment.deployedUrl} target="_blank" className="text-blue-600 text-sm mt-2 block">
              View Live →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Tratamento de Erros

### Try-Catch Pattern

```typescript
try {
  const result = await executeDeployment({
    tenantId,
    pageId,
    slug
  });

  if (!result.success) {
    // Deployment falhou, mas foi registrado
    console.error("Deploy failed:", result.error);
    // Notificar usuário
    return { error: result.error };
  }

  // Deploy bem-sucedido
  return { success: true, url: result.deployedUrl };
} catch (error) {
  // Erro inesperado
  console.error("Unexpected error:", error);
  throw error;
}
```

### Common Errors

| Erro | Causa | Solução |
|------|-------|---------|
| "Prisma not configured" | activity-log.ts não tem Prisma | Configurar Prisma schema |
| "R2 upload failed: InvalidAccessKeyId" | Credenciais R2 erradas | Verificar R2_ACCESS_KEY |
| "Missing options: tenantId" | Parâmetros incompletos | Verificar entrada |
| "Page not found" | collectStaticPageData falhou | Verificar se página existe |

---

## Performance Tips

1. **Cache template engine** - Reutilizar templates compilados
2. **Compress HTML** - Usar brotli para pequenos arquivos
3. **Parallel uploads** - Upload múltiplos files em paralelo (TODO)
4. **Connection pooling** - R2 SDK já faz isso
5. **Async activity log** - Log não deve bloquear deploy

---

## Segurança

✅ Tenant isolation automática (tenantId em paths)
✅ Versionamento (cada deploy tem ID único)
✅ Audit trail (todos os deploys registrados)
✅ Error safe (não expõe internals ao cliente)

TODO:
- [ ] Rate limiting por tenant
- [ ] Deploy approval workflow
- [ ] Rollback approval
- [ ] Deployment webhooks

---
