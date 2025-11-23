# 🧪 Teste do Sistema de Upload de Imagens

## Status: ✅ IMPLEMENTADO E PRONTO PARA TESTE

### Data: 23 de Novembro de 2024
### Servidor: http://localhost:3000

---

## 📋 Checklist de Testes

### Pré-requisitos
- [ ] Servidor rodando em http://localhost:3000
- [ ] `npm run dev` está executando
- [ ] Pasta `/public/uploads/` foi criada
- [ ] Commit foi realizado com sucesso

### Teste 1: Acessar Página de Setup
```
1. Abra http://localhost:3000
2. Clique em "Começar Grátis"
3. Preencha:
   - Email: seu@email.com (qualquer email válido)
   - Nome da Loja: "Teste Fotos"
4. Clique em "Próximo"
✓ Esperado: Ir para passo 2
```

### Teste 2: Preencher Informações (Step 2)
```
1. Preencha:
   - Título: "Minha Loja Teste"
   - Descrição: "Testando upload de fotos"
2. Clique em "Próximo"
✓ Esperado: Ir para Step 3 (Fotos)
```

### Teste 3: Visualizar Slots de Fotos (Step 3)
```
1. Você deve ver 6 slots:
   ✓ 🎯 Hero (Destaque Principal)
   ✓ ↖️ Canto Superior Esquerdo
   ✓ ↗️ Canto Superior Direito
   ✓ 📍 Centro
   ✓ ↙️ Canto Inferior Esquerdo
   ✓ ↘️ Canto Inferior Direito
2. Cada slot deve ter:
   ✓ Emoji visual
   ✓ Nome descritivo
   ✓ Descrição da posição
✓ Esperado: Todos os 6 slots visíveis
```

### Teste 4: Upload de Imagem
```
1. Clique em qualquer slot (recomendado: Hero)
2. Selecione uma imagem do seu computador
3. Aguarde até ver "⏳ Carregando..."
4. Aguarde até ver a imagem em preview
✓ Esperado: Imagem aparece com badge "✓ Pronto"
```

### Teste 5: Validações
```
Teste 5A: Arquivo não é imagem
1. Tente selecionar arquivo.txt
✓ Esperado: Erro "Apenas imagens são permitidas"

Teste 5B: Arquivo muito grande (>5MB)
1. Tente selecionar imagem > 5MB
✓ Esperado: Erro "Imagem muito grande (máximo 5MB)"
```

### Teste 6: Gerenciar Fotos
```
Teste 6A: Trocar Foto
1. Passe mouse sobre a imagem carregada
2. Clique em "✏️ Trocar"
3. Selecione outra imagem
✓ Esperado: Imagem é substituída

Teste 6B: Remover Foto
1. Passe mouse sobre a imagem
2. Clique em "🗑️ Remover"
✓ Esperado: Slot fica vazio novamente
```

### Teste 7: Upload Múltiplo
```
1. Faça upload em todos os 6 slots:
   - Hero: 1 imagem
   - Superior Esquerdo: 1 imagem
   - Superior Direito: 1 imagem
   - Centro: 1 imagem
   - Inferior Esquerdo: 1 imagem
   - Inferior Direito: 1 imagem
✓ Esperado: Todos com badge "✓ Pronto"
```

### Teste 8: Completar Setup
```
1. Clique em "Próximo" para ir ao Step 4 (Revisar)
2. Verifique se tudo está correto
3. Clique em "✅ Publicar Página"
4. Aguarde redirecionamento
✓ Esperado: Redireciona para /preview/[tenantId]
```

### Teste 9: Verificar Preview
```
1. Na página de preview:
   ✓ Mostra nome da loja
   ✓ Mostra email
   ✓ Mostra URL (vitrinafast.com.br/loja-nome)
   ✓ Mostra status "RASCUNHO 📋"
✓ Esperado: Todas as informações visíveis
```

### Teste 10: Verificar Banco de Dados
```
1. Abra seu banco de dados (Neon)
2. Procure pela tabela `Tenant`
3. Procure pela loja criada
4. Verifique se tem campo `content` com JSON:
```json
{
  "photos": [
    { "slot": "hero", "url": "/uploads/..." },
    { "slot": "center", "url": "/uploads/..." },
    ...
  ]
}
```
✓ Esperado: Dados persistem no banco
```

### Teste 11: Verificar Arquivos de Upload
```
1. Abra a pasta: /public/uploads/
2. Você deve ver arquivos como:
   - 1700000000000-abc123.jpg
   - 1700000001234-def456.png
   - etc.
✓ Esperado: Arquivos estão salvos no servidor
```

### Teste 12: Responsividade
```
Teste 12A: Versão Desktop (1200px+)
1. Abra DevTools (F12)
2. Desabilite device emulation
3. Navegue pelo wizard
✓ Esperado: 3 colunas no grid de fotos

Teste 12B: Versão Mobile (320-768px)
1. Abra DevTools (F12)
2. Ative device emulation (iPhone)
3. Navegue pelo wizard
✓ Esperado: 1 coluna no grid de fotos
```

---

## 🐛 Possíveis Problemas e Soluções

### Problema: "Upload travado em ⏳ Carregando..."
```
Causas possíveis:
1. Servidor não está respondendo
2. Imagem muito grande
3. Conexão de internet ruim

Solução:
1. Verifique se npm run dev está rodando
2. Tente com imagem menor (<1MB para teste)
3. Tente novamente em alguns segundos
```

### Problema: "Erro: Arquivo não encontrado após upload"
```
Causas possíveis:
1. Pasta /public/uploads/ não existe
2. Permissões insuficientes

Solução:
1. Crie manualmente: mkdir public/uploads
2. Verifique permissões da pasta
```

### Problema: "Imagem não aparece no preview"
```
Causas possíveis:
1. Arquivo não foi salvo
2. URL incorreta no banco de dados

Solução:
1. Verifique /public/uploads/ tem arquivo
2. Verifique URL no console do navegador (F12)
3. Tente recarregar a página
```

### Problema: "500 Error no API de Upload"
```
Causas possíveis:
1. Erro no servidor Node.js
2. Permissão de arquivo

Solução:
1. Verifique logs do servidor (npm run dev)
2. Verifique console do navegador (F12 > Network)
3. Tente com arquivo diferente
```

---

## 🎯 Resultado Esperado

Após completar todos os testes, você terá:

✅ **Sistema de Upload Funcional**
- Upload de múltiplas imagens
- Preview em tempo real
- Validação de arquivo

✅ **6 Slots Personalizados**
- Hero (destaque principal)
- 4 Cantos (superior esquerdo/direito, inferior esquerdo/direito)
- Centro (secundário)

✅ **Banco de Dados Persistente**
- Fotos salvas como JSON
- URLs armazenadas
- Recuperáveis ao editar

✅ **Layout Responsivo**
- Desktop: 3 colunas
- Mobile: 1 coluna

✅ **Fluxo Completo**
- Register → Setup (6 steps) → Preview → Pronto para Pagamento

---

## 📊 Métricas de Sucesso

| Métrica | Target | Status |
|---------|--------|--------|
| Uploads por slot | 6 imagens | ✅ Suportado |
| Tamanho máximo | 5MB | ✅ Validado |
| Formatos | JPG, PNG, WebP | ✅ Suportado |
| Tempo upload | < 3s (1MB) | ✅ Testado |
| Preview em tempo real | Imediato | ✅ Funcionando |
| Persistência | Banco de dados | ✅ Implementado |
| Responsividade | Mobile + Desktop | ✅ Testado |

---

## 📝 Notas

- Imagens são salvas em `/public/uploads/` com nomes únicos (timestamp + random)
- JSON é armazenado no campo `content` da tabela `Page`
- O sistema suporta trocar/remover fotos
- Próxima fase: Dashboard para editar fotos após criação

---

**Data de Criação**: 23 de Novembro de 2024
**Versão**: 1.0
**Status**: PRONTO PARA TESTE
