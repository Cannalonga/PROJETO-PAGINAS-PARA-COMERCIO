# 🧹 GUIA DE LIMPEZA DA IDE - APÓS RESTART

**Status**: ✅ Pacotes instalados  
**Próximo passo**: Executar linter fixes

---

## ✅ JÁ FEITO

1. ✅ Instalados pacotes faltantes:
   - `@sentry/profiling-node`
   - `rate-limiter-flexible`

2. ✅ Documentado relatório de erros em `IDE_ERRORS_REPORT.md`

3. ✅ 283 erros catalogados e priorizados

---

## 🔧 LIMPEZA AUTOMÁTICA (Execute após restart)

### Opção 1: ESLint Auto-Fix
```bash
npm run lint -- --fix
```

### Opção 2: TypeScript Check
```bash
npx tsc --noEmit
```

### Opção 3: Full Cleanup
```bash
npm run lint -- --fix
npm test
npm run build
```

---

## 📋 ERROS CRÍTICOS A RESOLVER

### 1. Unificar Tipos PageBlock
**Arquivo**: `components/PageEditor/Editor.tsx`

Problema: Dois PageBlock types diferentes
- `types/index.ts`
- `lib/page-editor.ts`

Solução:
```typescript
// Use apenas um tipo em todo projeto
import type { PageBlock } from '@/types'
```

### 2. Validar Prisma Schema
**Arquivos afetados**:
- `app/api/deploy/status/route.ts`
- `app/api/deploy/rollback/route.ts`

Problema: `deploymentRecord` não existe

Solução: 
```bash
# Verificar schema
npx prisma db push

# Ou remover referências se modelo não precisa
```

### 3. Configurar GitHub Secrets
**Arquivo**: `.github/workflows/ci.yml`

Secrett faltantes:
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID

Ação: Adicionar em Settings → Secrets and variables

---

## 🚀 PRÓXIMO RESTART - CHECKLIST

Ao abrir VS Code depois do restart:

- [ ] Abra Terminal
- [ ] Execute: `npm run lint -- --fix`
- [ ] Execute: `npx tsc --noEmit` para verificar
- [ ] Execute: `npm test` para confirmar tests
- [ ] Feche e reabra VS Code (para IDE reindexar)

---

**Tempo estimado**: 5-10 minutos para limpeza completa

Após isso, IDE estará 100% limpa e pronta para produção! ✨
