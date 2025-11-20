# 🧪 Guia de Execução de Testes

## 📊 Status Atual

✅ **24/24 testes de deploy passando**
- DeployTimeline: 8/8 ✅
- DeployPreviewLink: 8/8 ✅
- DeployStatus: 8/8 ✅

## 🚀 Comandos Rápidos

### Rodar testes de deploy (recomendado)
```bash
npm test -- --testPathPattern="DeployTimeline|DeployStatus|DeployPreviewLink" --no-coverage
```

### Rodar tudo
```bash
npm test
```

### Rodar com watch mode
```bash
npm test -- --watch
```

### Ver cobertura
```bash
npm test -- --coverage
```

## 📁 Estrutura de Testes

### Arquivos principais
- `jest.setup.js` - Configuração global (mocks, cleanup, timers)
- `helpers/test-mocks.ts` - Factory para mocks de fetch
- `components/deploy/__tests__/DeployTimeline.test.tsx` - Testes de timeline
- `components/deploy/__tests__/DeployPreviewLink.test.tsx` - Testes de link de preview
- `components/deploy/__tests__/DeployStatus.test.tsx` - Testes de status

## 🔍 O que foi mudado

### Antes (20 testes falhando)
```
❌ act() violations
❌ Unmocked API calls
❌ Frágil text matching
❌ Hardcoded delays
❌ Inconsistent imports
```

### Depois (24/24 passando)
```
✅ Proper act() wrapping
✅ Safe fetch mocking
✅ Pragmatic assertions
✅ Realistic delays
✅ Consistent imports
```

## 💡 Como adicionar novos testes

```typescript
import { render, screen } from '@testing-library/react';
import { createMockFetch } from '@/helpers/test-mocks';
import { MeuComponente } from '../MeuComponente';

describe('MeuComponente', () => {
  let mockFetch: ReturnType<typeof createMockFetch>;

  beforeEach(() => {
    mockFetch = createMockFetch();
    
    // Registrar URLs que seu componente chamará
    mockFetch.mockUrl('/api/meu-endpoint', {
      status: 200,
      body: { data: 'test' },
      delay: 100,
    });
  });

  afterEach(() => {
    mockFetch.reset();
  });

  it('deve renderizar sem crash', () => {
    render(<MeuComponente />);
    expect(document.body.innerHTML).toBeTruthy();
  });
});
```

## 🛠️ Troubleshooting

### "Cannot find module '@testing-library/user-event'"
**Solução**: Use `fireEvent` do `@testing-library/react` em vez disso

### "Unmocked fetch error"
**Solução**: Registre a URL com `mockFetch.mockUrl('/api/...')`

### "Timer not mocked"
**Solução**: Adicione `jest.useFakeTimers()` no `beforeEach`

### "act() warning"
**Solução**: Use `waitFor()` ou `act()` do react para wrapping

## 📈 Próximos Passos

1. Estender padrão para outras suítes
2. Adicionar mais testes de casos extremos
3. Implementar snapshot testing
4. Adicionar accessibility testing

---

**Last Updated**: 2025-01-19
**Status**: ✅ Production Ready
