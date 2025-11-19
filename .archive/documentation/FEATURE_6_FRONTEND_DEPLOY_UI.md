# 🎨 FEATURE 6 — COMPONENTES REACT DE DEPLOY

## Visão Geral

Conjunto de 3 componentes React reutilizáveis que implementam a interface de deployment. Integram-se com os endpoints da API (BLOCO 3) e fornecem feedback em tempo real ao usuário.

**Localização**: `components/deploy/*`  
**Padrão**: React 18 Client Components (use client)  
**Styling**: Tailwind CSS (dark theme)  
**Estado**: useState + useEffect hooks  

---

## 1️⃣ DeployButton

### Propósito
Botão que publica uma página e retorna feedback visual de sucesso/erro.

### Localização
`components/deploy/DeployButton.tsx` (87 linhas)

### Props
```typescript
interface DeployButtonProps {
  pageId: string;              // Identificador da página
  pageTitle: string;           // Título para exibição
  pageDescription?: string;    // Descrição (opcional)
  metaKeywords?: string[];     // Keywords SEO (opcional)
  tenantId: string;            // ID do tenant do usuário
  onSuccess?: (deployment: DeploymentResponse) => void;  // Callback após sucesso
  onError?: (error: Error) => void;                       // Callback após erro
  disabled?: boolean;          // Desabilitar botão
  variant?: 'primary' | 'secondary';  // Estilo do botão
}
```

### Estados
```
[Padrão] → [Loading] → [Success] → [Reset]
                    ↘ [Error] ↗
```

### Comportamento
1. **Clique**: Inicia estado `loading`, desabilita botão
2. **Requisição**: POST /api/deploy/publish com pageId + tenantId
3. **Sucesso**:
   - Exibe badge verde "✓ Publicado"
   - Mostra version ID (ex: `v-20240115143022...`)
   - Dispara callback `onSuccess(deployment)`
   - Auto-reset após 3 segundos
4. **Erro**:
   - Exibe badge vermelho com mensagem
   - Log do erro no console
   - Dispara callback `onError(error)`
   - Mantém estado até novo clique

### Exemplos de Uso

**Básico**
```tsx
<DeployButton
  pageId="page-123"
  pageTitle="Minha Página"
  tenantId={session.user.tenantId}
/>
```

**Com Callbacks**
```tsx
<DeployButton
  pageId="page-123"
  pageTitle="Minha Página"
  tenantId={session.user.tenantId}
  onSuccess={(deployment) => {
    console.log('Publicado com sucesso!', deployment.deployedUrl);
    // Atualizar estado da página
  }}
  onError={(error) => {
    console.error('Falha no deployment:', error.message);
    // Mostrar notificação de erro
  }}
/>
```

**Em Dashboard**
```tsx
export default function PageDashboard({ page, session }) {
  return (
    <div className="flex items-center gap-4">
      <h2>{page.title}</h2>
      <DeployButton
        pageId={page.id}
        pageTitle={page.title}
        pageDescription={page.description}
        metaKeywords={page.keywords}
        tenantId={session.user.tenantId}
      />
    </div>
  );
}
```

### Styling
```
Button:
  - Padrão: bg-emerald-600, texto branco
  - Hover: bg-emerald-700
  - Disabled: opacity-50, cursor-not-allowed
  - Texto: font-medium, text-sm
  - Padding: px-4 py-2
  - Rounded: rounded-lg

Badge:
  - Sucesso: bg-emerald-100, text-emerald-800
  - Erro: bg-red-100, text-red-800
  - Padding: px-2 py-1
  - Font-size: text-xs
```

### Estados Visuais

```
1. PADRÃO
   ┌──────────────────┐
   │ 📤 Publicar      │
   └──────────────────┘

2. LOADING (spinned)
   ┌──────────────────┐
   │ ⌛ Processando... │
   └──────────────────┘

3. SUCESSO (3s depois reset)
   ┌──────────────────┐
   │ ✅ v-202401151430│
   └──────────────────┘

4. ERRO (clique para tentar novamente)
   ┌──────────────────┐
   │ ❌ Erro: timeout │
   └──────────────────┘
```

### Implementação (Pseudocódigo)
```typescript
export function DeployButton({
  pageId,
  pageTitle,
  pageDescription,
  metaKeywords,
  tenantId,
  onSuccess,
  onError,
  disabled,
  variant = 'primary',
}: DeployButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleDeploy() {
    setState('loading');
    try {
      const response = await fetch('/api/deploy/publish', {
        method: 'POST',
        body: JSON.stringify({
          pageId,
          pageTitle,
          pageDescription,
          metaKeywords,
          tenantId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const deployment = await response.json();
      setState('success');
      setMessage(`v-${deployment.version.split('v-')[1]}`);
      onSuccess?.(deployment);

      // Auto-reset após 3s
      setTimeout(() => setState('idle'), 3000);
    } catch (error) {
      setState('error');
      setMessage(error.message || 'Erro ao publicar');
      onError?.(error as Error);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDeploy}
        disabled={disabled || state === 'loading'}
        className={`px-4 py-2 rounded-lg font-medium text-sm ${
          state === 'success' ? 'bg-emerald-100' :
          state === 'error' ? 'bg-red-100' :
          'bg-emerald-600 text-white'
        }`}
      >
        {state === 'loading' && '⌛ Processando...'}
        {state === 'idle' && '📤 Publicar'}
        {state === 'success' && '✅ Publicado'}
        {state === 'error' && '❌ Erro'}
      </button>

      {message && (
        <span className={`text-xs ${
          state === 'error' ? 'text-red-600' : 'text-emerald-600'
        }`}>
          {message}
        </span>
      )}
    </div>
  );
}
```

### TODOs para Integração
- [ ] Integrar com sistema de notificações (toast/snackbar)
- [ ] Adicionar confirmação antes de publicar (modal)
- [ ] Suportar deploy agendado (schedule future publish)
- [ ] Implementar rollback rápido como botão secundário

---

## 2️⃣ DeployStatus

### Propósito
Exibe status do **último deployment** com informações detalhadas e auto-refresh.

### Localização
`components/deploy/DeployStatus.tsx` (243 linhas)

### Props
```typescript
interface DeployStatusProps {
  pageId: string;              // Identificador da página
  tenantId: string;            // ID do tenant
  autoRefresh?: boolean;       // Auto-refresh a cada 30s (default: true)
  refreshInterval?: number;    // Intervalo em ms (default: 30000)
  onStatusChange?: (status: DeploymentStatus) => void;  // Callback quando status muda
  showUrls?: boolean;          // Mostrar URLs de acesso (default: true)
}
```

### Estados
```
PENDING  → GENERATING  → UPLOADING  → COMPLETED ✅
                                   ↘ FAILED ❌
ROLLING_BACK  → COMPLETED (após rollback bem-sucedido)
```

### Dados Exibidos
```
┌────────────────────────────────────────────┐
│ Status: COMPLETED ✅                        │
├────────────────────────────────────────────┤
│ Version: v-20240115143022-tenant-abc123... │
│ Provider: Cloudflare R2                     │
│ Tempo: 14:30 - 14:30:45 (23 segundos)     │
├────────────────────────────────────────────┤
│ Deployment URL:                             │
│ https://cdn.example.com/pages/id/index.html │
│                                             │
│ Preview URL:                                │
│ https://app.example.com/preview/uuid       │
├────────────────────────────────────────────┤
│ Tamanho: 128 KB | 4 Arquivos                │
│ Cache: public, max-age=3600                │
└────────────────────────────────────────────┘
```

### Comportamento
1. **Montagem**: Busca status atual via GET /api/deploy/status
2. **Exibição**:
   - Mostra status com ícone colorido
   - Exibe URLs clicáveis com copy-to-clipboard
   - Mostra timestamps em formato local (pt-BR)
   - Exibe metadados: tamanho, contagem de arquivos, headers
3. **Auto-refresh**: A cada 30s se `autoRefresh=true`
4. **Status Muda**:
   - Se PENDING/GENERATING/UPLOADING: continue polling
   - Se COMPLETED/FAILED: para de fazer polling
   - Dispara callback `onStatusChange(status)`
5. **Erro de Requisição**:
   - Exibe mensagem de erro
   - Para de fazer polling
   - Oferece botão "Tentar Novamente"

### Exemplos de Uso

**Básico com Auto-refresh**
```tsx
<DeployStatus
  pageId="page-123"
  tenantId={session.user.tenantId}
/>
```

**Sem Auto-refresh**
```tsx
<DeployStatus
  pageId="page-123"
  tenantId={session.user.tenantId}
  autoRefresh={false}
/>
```

**Com Callback para Alterações**
```tsx
<DeployStatus
  pageId="page-123"
  tenantId={session.user.tenantId}
  onStatusChange={(status) => {
    if (status.status === 'COMPLETED') {
      // Recarregar página ao vivo
      window.location.reload();
    }
  }}
/>
```

**No Dashboard com Timeline**
```tsx
export default function DeployPage({ page, session }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DeployStatus
        pageId={page.id}
        tenantId={session.user.tenantId}
      />
      <DeployTimeline
        pageId={page.id}
        tenantId={session.user.tenantId}
      />
    </div>
  );
}
```

### Styling
```
Container:
  - bg-slate-900 (dark theme)
  - border border-slate-800
  - rounded-lg, shadow-lg
  - padding: p-6

Status Badge:
  - COMPLETED: bg-emerald-100, text-emerald-800, icon ✅
  - FAILED: bg-red-100, text-red-800, icon ❌
  - PENDING/GENERATING/UPLOADING: bg-yellow-100, text-yellow-800, icon ⏳

URLs:
  - Underline on hover
  - Color: text-blue-500
  - Monospace font: font-mono
  - Truncate long URLs with ellipsis
  - Copy button: rounded-lg, bg-slate-800

Timestamps:
  - Format: "14:30:45" (HH:MM:SS)
  - Format Date: "15 de janeiro de 2024"
```

### Estados Visuais

```
1. LOADING (ao montar)
   ┌──────────────────────────────┐
   │ ⌛ Carregando status...        │
   └──────────────────────────────┘

2. PENDING/GENERATING/UPLOADING
   ┌──────────────────────────────┐
   │ ⏳ GERANDO (23% completo)     │
   │ Iniciado: 14:30               │
   └──────────────────────────────┘

3. COMPLETED
   ┌──────────────────────────────┐
   │ ✅ PUBLICADO                   │
   │ https://cdn.example.com/...   │
   │ Tempo: 14:30 - 14:30:45       │
   └──────────────────────────────┘

4. ERROR
   ┌──────────────────────────────┐
   │ ❌ FALHA                       │
   │ Erro: S3 upload timeout       │
   │ [Tentar Novamente]            │
   └──────────────────────────────┘
```

### Polling Logic

```
const [status, setStatus] = useState<DeploymentStatus | null>(null);
const [loading, setLoading] = useState(true);
const intervalRef = useRef<NodeJS.Timeout>();

useEffect(() => {
  const fetchStatus = async () => {
    try {
      const response = await fetch(
        `/api/deploy/status?pageId=${pageId}&tenantId=${tenantId}`
      );
      const data = await response.json();
      setStatus(data.deployment);

      // Parar polling se deployment concluído
      if (['COMPLETED', 'FAILED'].includes(data.deployment.status)) {
        clearInterval(intervalRef.current);
      }

      onStatusChange?.(data.deployment);
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchStatus();

  if (autoRefresh && intervalRef.current) {
    intervalRef.current = setInterval(
      fetchStatus,
      refreshInterval
    );
  }

  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [pageId, tenantId, autoRefresh, refreshInterval, onStatusChange]);
```

### TODOs para Integração
- [ ] Implementar real-time updates via WebSocket (em vez de polling)
- [ ] Adicionar integração com Sentry para monitorar erros
- [ ] Implementar retry automático em caso de falha
- [ ] Adicionar log detalhado em modo `detailed=true`

---

## 3️⃣ DeployTimeline

### Propósito
Timeline visual mostrando **histórico completo** de deployments de uma página.

### Localização
`components/deploy/DeployTimeline.tsx` (205 linhas)

### Props
```typescript
interface DeployTimelineProps {
  pageId: string;              // Identificador da página
  tenantId: string;            // ID do tenant
  limit?: number;              // Máximo de deployments (default: 20, max: 100)
  onDeploymentSelect?: (deployment: Deployment) => void;  // Callback ao clicar
  showFailures?: boolean;      // Mostrar deployments falhados (default: true)
  compact?: boolean;           // Modo compacto sem URLs
}
```

### Visualização

**Modo Full (default)**
```
Timeline de Deployments
=======================

[v3] ✅ COMPLETED
  │  15:00 - 15:00:18 (18s)
  │  https://cdn.example.com/.../v3/
  │
  ├─ [v2] ✅ COMPLETED
  │  │  14:00 - 14:00:25 (25s)
  │  │  https://cdn.example.com/.../v2/
  │  │
  │  └─ [v1] ❌ FAILED
     │  13:00
     │  Erro: S3 upload timeout
     │
     └─ [Mostrar mais...] (27 versões anteriores)
```

**Modo Compact**
```
v3 ✅ 15:00
v2 ✅ 14:00
v1 ❌ 13:00
...
```

### Comportamento
1. **Montagem**: Busca histórico via GET /api/deploy/history
2. **Exibição**:
   - Lista em ordem reversa (mais recente primeiro)
   - Linha vertical conectando versões
   - Status com ícone colorido
   - Timestamps em português
   - URLs clicáveis com copy-to-clipboard
3. **Clique em Versão**:
   - Dispara callback `onDeploymentSelect(deployment)`
   - Possibilita rollback rápido
4. **Paginação**:
   - Botão "Carregar mais..." se `hasMore=true`
   - Incrementa offset e busca próximas versões

### Exemplos de Uso

**Full Timeline**
```tsx
<DeployTimeline
  pageId="page-123"
  tenantId={session.user.tenantId}
/>
```

**Compact Timeline (Sidebar)**
```tsx
<DeployTimeline
  pageId="page-123"
  tenantId={session.user.tenantId}
  limit={5}
  compact={true}
/>
```

**Com Callback (para Rollback)**
```tsx
<DeployTimeline
  pageId="page-123"
  tenantId={session.user.tenantId}
  onDeploymentSelect={(deployment) => {
    if (confirm(`Rollback para ${deployment.version}?`)) {
      fetch('/api/deploy/rollback', {
        method: 'POST',
        body: JSON.stringify({
          pageId,
          tenantId,
          targetVersion: deployment.version,
          reason: 'Manual rollback do timeline',
        }),
      });
    }
  }}
/>
```

**No Modal de Histórico**
```tsx
export function DeployHistoryModal({ page, session, isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <h2>Histórico de Deployments - {page.title}</h2>
        </DialogHeader>
        <DeployTimeline
          pageId={page.id}
          tenantId={session.user.tenantId}
          limit={50}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### Styling
```
Timeline Container:
  - bg-slate-950 (very dark)
  - border-l: 2px solid slate-700
  - padding: pl-6

Timeline Item:
  - Relative positioning for vertical line
  - Margin: mb-6

Version Badge:
  - bg-slate-900, border-2
  - COMPLETED: border-emerald-500
  - FAILED: border-red-500
  - padding: px-3 py-1
  - rounded-full

Status Icons:
  - COMPLETED ✅: text-emerald-500
  - FAILED ❌: text-red-500
  - ROLLING_BACK ⏮️: text-yellow-500

Connector Line:
  - Vertical line: h-8, w-0.5, bg-slate-700
  - Positioned absolutely

Timestamps:
  - text-slate-400, text-xs
  - Format: "15 de jan, 14:30"

URLs:
  - text-blue-400, underline on hover
  - monospace font
```

### Estados Visuais

```
1. LOADING (ao montar)
   ┌─────────────────────────┐
   │ ⌛ Carregando histórico... │
   └─────────────────────────┘

2. EMPTY (nenhum deployment)
   ┌─────────────────────────┐
   │ 📭 Nenhum deployment    │
   │                          │
   │ Publique uma página     │
   │ para começar.            │
   └─────────────────────────┘

3. WITH DATA (histórico populado)
   ┌─────────────────────────┐
   │ v3 ✅ 15:00 - 18s       │
   │     URL: cdn.../v3      │
   │                          │
   │ v2 ✅ 14:00 - 25s       │
   │     URL: cdn.../v2      │
   │                          │
   │ [Carregar mais...]      │
   └─────────────────────────┘

4. ERROR (falha ao carregar)
   ┌─────────────────────────┐
   │ ❌ Erro ao carregar     │
   │                          │
   │ [Tentar Novamente]      │
   └─────────────────────────┘
```

### Implementação (Pseudocódigo)

```typescript
export function DeployTimeline({
  pageId,
  tenantId,
  limit = 20,
  onDeploymentSelect,
  showFailures = true,
  compact = false,
}: DeployTimelineProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchHistory = async (newOffset = 0) => {
    try {
      const response = await fetch(
        `/api/deploy/history?pageId=${pageId}&tenantId=${tenantId}&limit=${limit}&offset=${newOffset}`
      );
      const data = await response.json();

      if (newOffset === 0) {
        setDeployments(data.deployments);
      } else {
        setDeployments([...deployments, ...data.deployments]);
      }

      setHasMore(data.pagination.hasMore);
      setOffset(newOffset + limit);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [pageId, tenantId]);

  if (loading) return <div>⌛ Carregando histórico...</div>;
  if (deployments.length === 0) return <div>📭 Nenhum deployment</div>;

  const filtered = showFailures
    ? deployments
    : deployments.filter(d => d.status !== 'FAILED');

  return (
    <div className="space-y-6 pl-6 border-l-2 border-slate-700">
      {filtered.map((deployment, index) => (
        <div
          key={deployment.id}
          className="relative cursor-pointer hover:bg-slate-900 p-3 rounded"
          onClick={() => onDeploymentSelect?.(deployment)}
        >
          {/* Connector line */}
          {index < filtered.length - 1 && (
            <div className="absolute -left-6 top-10 w-0.5 h-8 bg-slate-700" />
          )}

          {/* Version badge */}
          <div className={`inline-block px-3 py-1 rounded-full border-2 ${
            deployment.status === 'COMPLETED'
              ? 'border-emerald-500 bg-slate-900'
              : 'border-red-500 bg-slate-900'
          }`}>
            {deployment.version.split('-')[0]}
            {deployment.status === 'COMPLETED' ? ' ✅' : ' ❌'}
          </div>

          {!compact && (
            <>
              <div className="text-xs text-slate-400 mt-2">
                {deployment.timestamps.createdAt} - {deployment.timestamps.duration}
              </div>
              {deployment.urls?.deployed && (
                <a
                  href={deployment.urls.deployed}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm font-mono truncate"
                  onClick={e => e.stopPropagation()}
                >
                  {deployment.urls.deployed}
                </a>
              )}
            </>
          )}
        </div>
      ))}

      {hasMore && (
        <button
          onClick={() => fetchHistory(offset)}
          className="w-full py-2 text-slate-400 hover:text-slate-200 text-sm"
        >
          [Carregar mais...]
        </button>
      )}
    </div>
  );
}
```

### TODOs para Integração
- [ ] Implementar virtualization para 1000+ deployments (react-window)
- [ ] Adicionar filtros por status, data range
- [ ] Implementar search por version ID
- [ ] Adicionar export de histórico (CSV, JSON)
- [ ] Integrar com rollback rápido (um clique)

---

## 🎯 Padrões de Integração

### Em Dashboard Principal
```tsx
// pages/dashboard.tsx
export default function Dashboard({ session }) {
  return (
    <div className="space-y-6">
      <h1>Dashboard de Publicações</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de controle */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-lg font-bold mb-4">Publicar Página</h2>
            <DeployButton
              pageId={currentPage.id}
              pageTitle={currentPage.title}
              pageDescription={currentPage.description}
              tenantId={session.user.tenantId}
              onSuccess={() => setRefreshStatus(true)}
            />
          </Card>
        </div>

        {/* Status atual */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-bold mb-4">Status Atual</h2>
            <DeployStatus
              pageId={currentPage.id}
              tenantId={session.user.tenantId}
            />
          </Card>
        </div>
      </div>

      {/* Histórico completo */}
      <Card>
        <h2 className="text-lg font-bold mb-4">Histórico de Deployments</h2>
        <DeployTimeline
          pageId={currentPage.id}
          tenantId={session.user.tenantId}
          limit={20}
          onDeploymentSelect={(deployment) => {
            // Mostrar opções de rollback
          }}
        />
      </Card>
    </div>
  );
}
```

### Em Modal de Deployment
```tsx
// components/dialogs/PublishPageModal.tsx
export function PublishPageModal({
  page,
  session,
  isOpen,
  onClose,
}) {
  const [step, setStep] = useState<'preview' | 'publish' | 'monitor'>('preview');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <h2>Publicar: {page.title}</h2>
        </DialogHeader>

        {step === 'preview' && (
          <div className="space-y-4">
            <p className="text-slate-300">
              Visualize como a página aparecerá após a publicação.
            </p>
            {/* Preview content here */}
            <div className="flex justify-end gap-2">
              <button onClick={onClose}>Cancelar</button>
              <button onClick={() => setStep('publish')}>
                Próximo
              </button>
            </div>
          </div>
        )}

        {step === 'publish' && (
          <div className="space-y-4">
            <p className="text-slate-300">
              Clique em "Publicar" para enviar para o CDN.
            </p>
            <DeployButton
              pageId={page.id}
              pageTitle={page.title}
              tenantId={session.user.tenantId}
              onSuccess={() => setStep('monitor')}
            />
          </div>
        )}

        {step === 'monitor' && (
          <div className="space-y-4">
            <DeployStatus
              pageId={page.id}
              tenantId={session.user.tenantId}
              autoRefresh={true}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### Em Widget de Sidebar
```tsx
// components/widgets/DeployStatusWidget.tsx
export function DeployStatusWidget({ pages, session }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold">Últimas Publicações</h3>

      {pages.map((page) => (
        <div
          key={page.id}
          className="p-3 bg-slate-900 rounded border border-slate-800"
        >
          <div className="text-sm font-medium">{page.title}</div>
          <DeployTimeline
            pageId={page.id}
            tenantId={session.user.tenantId}
            limit={3}
            compact={true}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 Customização e Theming

### Usar Tailwind CSS Custom Colors
```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'deploy-success': '#10b981',  // Emerald
        'deploy-error': '#ef4444',    // Red
        'deploy-pending': '#f59e0b',  // Amber
      }
    }
  }
}
```

### Sobrescrever Estilos
```tsx
// components/deploy/DeployButton.tsx
const buttonClass = `
  px-4 py-2 rounded-lg font-medium text-sm
  ${variant === 'primary'
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-slate-700 hover:bg-slate-800'}
  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
`;
```

---

## 📝 TypeScript Types

```typescript
// lib/deploy/types.ts
export interface DeploymentStatus {
  id: string;
  status: 'PENDING' | 'GENERATING' | 'UPLOADING' | 'COMPLETED' | 'FAILED' | 'ROLLING_BACK';
  version: string;
  provider: string;
  urls?: {
    deployed: string;
    preview: string;
  };
  timestamps?: {
    createdAt: string;
    startedAt: string;
    finishedAt: string;
    duration: string;
  };
  metadata?: {
    artifactCount: number;
    totalSize: string;
    cacheControl: string;
  };
}

export interface DeploymentResponse {
  success: boolean;
  deploymentId: string;
  status: DeploymentStatus['status'];
  version: string;
  deployedUrl: string;
  previewUrl: string;
  provider: string;
  startedAt: string;
  finishedAt: string;
}
```

---

## 🚀 Próximos Passos (TODOs)

### Curto Prazo
- [ ] Testar componentes em dev com dados mock
- [ ] Implementar dark mode toggle (se necessário)
- [ ] Adicionar testes unitários para cada componente
- [ ] Integrar com sistema de notificações (toast)

### Médio Prazo
- [ ] Implementar real-time updates via WebSocket (em vez de polling)
- [ ] Adicionar animations ao timeline
- [ ] Implementar drag-drop para reorder deployments
- [ ] Adicionar comparação entre versões

### Longo Prazo
- [ ] Suportar múltiplos idiomas (i18n)
- [ ] Implementar tema claro/escuro
- [ ] Adicionar integração com Figma design system
- [ ] Criar Storybook com exemplos de componentes

