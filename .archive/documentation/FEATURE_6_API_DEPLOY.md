# 📡 FEATURE 6 — API DE DEPLOYMENT

## Visão Geral

Conjunto de 5 endpoints REST que gerenciam o ciclo de vida completo do deployment de páginas estáticas para CDN. Integra-se com a infraestrutura de geração (BLOCO 1), upload (BLOCO 2) e apresenta status em tempo real.

**Localização**: `app/api/deploy/*`  
**Padrão**: Next.js 13+ App Router  
**Autenticação**: NextAuth Session + Tenant Isolation  

---

## 1️⃣ POST /api/deploy/publish

### Propósito
Publica uma página estática para o CDN (produção). Orquestra geração → upload → logging.

### Request
```bash
POST /api/deploy/publish
Content-Type: application/json
Authorization: Bearer {session-token} (via NextAuth)

{
  "pageId": "uuid-or-identifier",
  "tenantId": "from-session",              // Isolamento multi-tenant
  "pageTitle": "Página de Exemplo",        // Título para referência
  "pageDescription": "Descrição breve",    // Descrição para SEO
  "metaKeywords": ["ecommerce", "local"]   // Keywords para SEO
}
```

### Response (200 OK)
```json
{
  "success": true,
  "deploymentId": "deployment-uuid-v1",
  "status": "COMPLETED",
  "version": "v-20240115143022-tenant-abc123def456",
  "deployedUrl": "https://cdn.example.com/tenants/tenant-id/pages/page-id/index.html",
  "previewUrl": "https://app.example.com/preview/deployment-uuid",
  "provider": "cloudflare-r2",
  "startedAt": "2024-01-15T14:30:22.000Z",
  "finishedAt": "2024-01-15T14:30:45.000Z"
}
```

### Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": "pageId is required",
  "timestamp": "2024-01-15T14:30:22.000Z"
}
```

### Response (401 Unauthorized)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Session inválida ou expirada"
}
```

### Lógica Interna
1. **Validação de Sessão**: Busca JWT via `getServerSession()`
2. **Isolamento Tenant**: Extrai `tenantId` do objeto de sessão do usuário
3. **Validação de Request**: Confirma presença de `pageId`, `pageTitle`
4. **Execução do Deploy**:
   - Chama `executeDeployment()` (BLOCO 2)
   - Gera artifacts estáticos (BLOCO 1)
   - Upload para Cloudflare R2
   - Registra no activity log
5. **Resposta**: Retorna metadados do deployment com URLs de acesso

### TODOs para Integração
- [ ] Usar `getTenantFromSession(session, db)` real em vez de placeholder
- [ ] Validar `pageId` existe no Prisma `Page` model
- [ ] Implementar permissões: usuário pode publicar páginas do seu tenant?
- [ ] Configurar retry logic para falhas transitórias no Cloudflare R2

---

## 2️⃣ POST /api/deploy/preview

### Propósito
Gera preview HTML **sem publicar** para CDN. Permite validação antes do deploy real.

### Request
```bash
POST /api/deploy/preview
Content-Type: application/json

{
  "pageId": "uuid-or-identifier",
  "tenantId": "from-session",
  "pageTitle": "Página de Exemplo",
  "includeAssets": true  // true = carrega CSS/JS inline
}
```

### Response (200 OK)
```json
{
  "success": true,
  "version": "v-20240115143022-tenant-abc123def456",
  "previewHtml": "<!DOCTYPE html>...",  // HTML completo inline
  "sitemapEntry": {
    "url": "/pages/page-id",
    "changefreq": "weekly",
    "priority": 0.8,
    "lastmod": "2024-01-15T14:30:22Z"
  },
  "assetCount": 4,                       // Número de arquivos estáticos
  "generatedAt": "2024-01-15T14:30:22.000Z"
}
```

### Lógica Interna
1. **Isolamento Tenant**: Extrai tenant do JWT
2. **Geração de Artifacts**: Chama `generateStaticPageArtifacts()` (BLOCO 1)
3. **Renderização HTML**: Transforma artifacts em HTML com templates
4. **NÃO faz upload**: Retorna apenas HTML + metadados
5. **Resposta**: Retorna preview renderizado para inspeção

### Casos de Uso
- Validar SEO antes de publicar
- Inspecionar HTML final gerado
- Testar responsividade de renderização
- Preview rápido sem commit ao CDN

### TODOs para Integração
- [ ] Implementar template engine real (atualmente placeholder)
- [ ] Suportar CSS-in-JS frameworks (Tailwind, styled-components, etc.)
- [ ] Adicionar opção para incluir/excluir JS (for previewing static-only pages)
- [ ] Implementar cache de previews por 5 minutos

---

## 3️⃣ GET /api/deploy/status

### Propósito
Retorna status do **último deployment** de uma página específica.

### Request
```bash
GET /api/deploy/status?pageId=uuid-or-identifier&tenantId=from-session

Query Parameters:
- pageId (required): Identificador da página
- tenantId (required): ID do tenant (para isolamento)
- detailed (optional): true = include deployment logs and metadata
```

### Response (200 OK)
```json
{
  "success": true,
  "deployment": {
    "id": "deployment-uuid-v1",
    "status": "COMPLETED",
    "version": "v-20240115143022-tenant-abc123def456",
    "provider": "cloudflare-r2",
    "urls": {
      "deployed": "https://cdn.example.com/tenants/tenant-id/pages/page-id/index.html",
      "preview": "https://app.example.com/preview/deployment-uuid"
    },
    "timestamps": {
      "createdAt": "2024-01-15T14:30:22.000Z",
      "startedAt": "2024-01-15T14:30:22.000Z",
      "finishedAt": "2024-01-15T14:30:45.000Z",
      "duration": "23 segundos"
    },
    "metadata": {
      "artifactCount": 4,
      "totalSize": "128 KB",
      "cacheControl": "public, max-age=3600"
    }
  }
}
```

### Response (404 Not Found)
```json
{
  "success": false,
  "error": "No deployment found",
  "pageId": "uuid-or-identifier",
  "message": "Nenhum deployment existe para esta página"
}
```

### Status Possíveis
- `PENDING`: Aguardando processamento
- `GENERATING`: Gerando artifacts estáticos
- `UPLOADING`: Enviando para Cloudflare R2
- `COMPLETED`: Publicado com sucesso
- `FAILED`: Falha no processo
- `ROLLING_BACK`: Revertendo para versão anterior

### Frequência de Chamadas
Recomendado: A cada 30 segundos ou sob demanda após POST /publish

### TODOs para Integração
- [ ] Buscar dados do `DeploymentRecord` model do Prisma
- [ ] Filtrar por `tenantId` para segurança
- [ ] Calcular duração real: `(finishedAt - startedAt) / 1000`
- [ ] Implementar campo `detailedLogs` se `detailed=true`

---

## 4️⃣ GET /api/deploy/history

### Propósito
Retorna **timeline histórica** de todos os deployments de uma página com paginação.

### Request
```bash
GET /api/deploy/history?pageId=uuid&tenantId=from-session&limit=20&offset=0

Query Parameters:
- pageId (required): Identificador da página
- tenantId (required): ID do tenant
- limit (optional): Máximo 100, padrão 20
- offset (optional): Paginação, padrão 0
- status (optional): Filtrar por status (COMPLETED, FAILED, etc.)
```

### Response (200 OK)
```json
{
  "success": true,
  "deployments": [
    {
      "id": "deployment-uuid-v3",
      "version": "v-20240115150000-tenant-abc123def456",
      "status": "COMPLETED",
      "provider": "cloudflare-r2",
      "timestamps": {
        "createdAt": "2024-01-15T15:00:00.000Z",
        "finishedAt": "2024-01-15T15:00:18.000Z",
        "duration": "18 segundos"
      },
      "urls": {
        "deployed": "https://cdn.example.com/.../v3/index.html"
      }
    },
    {
      "id": "deployment-uuid-v2",
      "version": "v-20240115140000-tenant-abc123def456",
      "status": "COMPLETED",
      "provider": "cloudflare-r2",
      "timestamps": {
        "createdAt": "2024-01-15T14:00:00.000Z",
        "finishedAt": "2024-01-15T14:00:25.000Z",
        "duration": "25 segundos"
      },
      "urls": {
        "deployed": "https://cdn.example.com/.../v2/index.html"
      }
    },
    {
      "id": "deployment-uuid-v1",
      "version": "v-20240115130000-tenant-abc123def456",
      "status": "FAILED",
      "provider": "cloudflare-r2",
      "error": "S3 upload timeout",
      "timestamps": {
        "createdAt": "2024-01-15T13:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "count": 3,
    "limit": 20,
    "offset": 0,
    "total": 47,
    "hasMore": true
  }
}
```

### Visualização no Timeline
```
[v3] ✅ COMPLETED   15:00 - 15:00:18
  ↓
[v2] ✅ COMPLETED   14:00 - 14:00:25
  ↓
[v1] ❌ FAILED      13:00
```

### TODOs para Integração
- [ ] Buscar últimos N deployments ordenados por `createdAt DESC`
- [ ] Implementar filtro por `status`
- [ ] Limitar máximo de 100 registros por requisição
- [ ] Calcular `hasMore` = `total > (offset + limit)`
- [ ] Usar índice no Prisma: `@index([pageId, createdAt])`

---

## 5️⃣ POST /api/deploy/rollback

### Propósito
Inicia **rollback** para versão anterior ou alvo especificado. Reefetua upload da versão anterior.

### Request
```bash
POST /api/deploy/rollback
Content-Type: application/json

{
  "pageId": "uuid-or-identifier",
  "tenantId": "from-session",
  "targetVersion": "v-20240115140000-tenant-abc123def456",  // Optional
  "reason": "Conteúdo com erro detectado"                    // Para logging
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Rollback iniciado com sucesso",
  "targetDeployment": {
    "id": "deployment-uuid-v2",
    "version": "v-20240115140000-tenant-abc123def456",
    "status": "ROLLING_BACK"
  },
  "nextSteps": [
    "Aguardando conclusão do upload (2-5 segundos)",
    "CDN será invalidado automaticamente",
    "Páginas renderizadas via SSR até conclusão do rollback"
  ]
}
```

### Response (404 Not Found)
```json
{
  "success": false,
  "error": "Target version not found",
  "targetVersion": "v-20240115140000-tenant-abc123def456"
}
```

### Lógica Interna
1. **Validação**: Confirma sessão e tenant
2. **Busca de Versão Anterior**:
   - Se `targetVersion` não informada: usa penúltima versão bem-sucedida
   - Se informada: busca exata por version string
3. **Detecção de Artifacts**:
   - Procura versão no Cloudflare R2 ou backup local
   - Marca deployment como `ROLLING_BACK`
4. **Re-upload** (TODO):
   - Restaura artifacts da versão anterior
   - Efetua upload para Cloudflare R2
   - Invalida cache do CDN
   - Marca deployment como `COMPLETED`

### Casos de Uso
- Conteúdo com erro detectado em produção
- Rollback automático por sistema de monitoramento
- Reversão manual por gestão de conteúdo
- Testes A/B: voltar para versão original após teste

### TODOs para Integração
- [ ] Implementar busca de penúltima versão bem-sucedida
- [ ] Validar acesso a artifacts armazenados (Cloudflare R2 or S3)
- [ ] Efetuar re-upload (atualmente stub)
- [ ] Invalidar cache via CDN API
- [ ] Registrar razão do rollback no activity log para auditoria
- [ ] Implementar rate limiting: máximo 5 rollbacks/dia por página

---

## 🔐 Autenticação & Autorização

### NextAuth Integration
```typescript
// Todas as rotas usam:
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Tenant Isolation
```typescript
// Verificar que usuário pertence ao tenant
const userTenant = session.user.tenantId;
const requestTenant = req.body.tenantId; // from client

if (userTenant !== requestTenant) {
  // Bloquear acesso cross-tenant
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Permissões Futuras
- [ ] `deploy:publish` - Permissão para publicar
- [ ] `deploy:preview` - Permissão para visualizar previews
- [ ] `deploy:rollback` - Permissão para revertências
- [ ] `deploy:view_history` - Permissão para ver histórico

---

## 📊 Rate Limiting

### Limites Recomendados
| Endpoint | Limite | Janela |
|----------|--------|--------|
| POST /publish | 10 | 1 hora |
| POST /preview | 30 | 1 hora |
| GET /status | 60 | 1 minuto |
| GET /history | 30 | 1 hora |
| POST /rollback | 5 | 1 dia |

### Implementação
```typescript
// TODO: Integrar Redis-based rate limiter
// Usar chave: `deploy:${endpoint}:${tenantId}:${pageId}`
// Ou: `deploy:${endpoint}:${tenantId}` para rate limit por tenant
```

---

## 🔄 Fluxo Completo de Deployment

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PREVIEW (Optional - Validar antes de publicar)          │
│    POST /api/deploy/preview                                │
│    ↓ Retorna HTML sem upload                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PUBLISH (Main flow)                                     │
│    POST /api/deploy/publish                                │
│    ↓ Gera + Upload + Log                                   │
│    ↓ Retorna deployment ID + URLs                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. MONITOR (Poll status)                                   │
│    GET /api/deploy/status?pageId=...                       │
│    ↓ Check a cada 30 segundos até COMPLETED ou FAILED      │
│    ↓ Retorna timestamps + URLs de acesso                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. HISTORY (Audit trail)                                   │
│    GET /api/deploy/history?pageId=...                      │
│    ↓ Retorna timeline de todas as versões                  │
│    ↓ Identifica versões com falha                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌─────────────────┬─────────────────┐
        │                 │                 │
    ✅ SUCESSO        ❌ FALHA         ⏮️ ROLLBACK
        │                 │                 │
        └──────────────────┼────────────────┘
                           │
                    POST /api/deploy/rollback
                    ↓ Restaura versão anterior
                    ↓ Re-upload + Cache invalidate
                    ↓ Marca como COMPLETED
```

---

## 📝 Estrutura de Erro Padronizada

Todas as respostas de erro seguem:
```json
{
  "success": false,
  "error": "Error Type",                    // Tipo específico
  "message": "Descrição em português",      // Mensagem amigável
  "details": "Detalhes técnicos",          // Context para debug
  "timestamp": "2024-01-15T14:30:22.000Z"  // ISO timestamp
}
```

### Códigos HTTP
- `200`: Sucesso
- `400`: Validação falhou (request inválido)
- `401`: Não autenticado
- `403`: Não autorizado (permissão insuficiente)
- `404`: Recurso não encontrado
- `409`: Conflito (ex: deployment já em progresso)
- `429`: Rate limit excedido
- `500`: Erro do servidor

---

## 🚀 Próximos Passos (TODOs)

### Curto Prazo
- [ ] Integrar Prisma `DeploymentRecord` model
- [ ] Configurar variáveis de ambiente para Cloudflare R2
- [ ] Implementar `getTenantFromSession()` real
- [ ] Testar fluxo end-to-end com dados reais

### Médio Prazo
- [ ] Adicionar webhook notifications (Slack, email)
- [ ] Implementar retry logic automático
- [ ] Adicionar observability (Sentry, NewRelic)
- [ ] Criar alertas para deployments falhados

### Longo Prazo
- [ ] Suportar múltiplos provedores (AWS, Azure Blob, etc.)
- [ ] Implementar versioning automático com Git
- [ ] Adicionar approval workflows para conteúdo sensível
- [ ] Implementar A/B testing com múltiplas versões ativas

