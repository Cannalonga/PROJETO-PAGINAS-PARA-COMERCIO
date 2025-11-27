# 🎬 TESTE AO VIVO DO SISTEMA DE UPLOAD

## Abra isso e siga passo-a-passo enquanto está testando

---

## ✅ PRÉ-REQUISITO: Servidor Rodando

```bash
# Terminal 1: Inicie o servidor
npm run dev

# Você deve ver:
# ✓ Ready in Xms
# ▲ Next.js 14.2.33
# - Local: http://localhost:3000
```

Se o servidor não está rodando, execute agora antes de continuar!

---

## 🧪 TESTE 1: Acessar Página Inicial

**O que fazer:**
1. Abra seu navegador
2. Digite: `http://localhost:3000`
3. Aguarde carregar

**O que você deve ver:**
```
✓ Landing page carregou
✓ Seção com 8 áreas visíveis
✓ Botão "Começar Grátis" no topo
✓ Design moderno com Tailwind
```

**Resultado esperado:**
- ✅ Página carrega sem erros
- ✅ Layout é limpo e profissional

---

## 🧪 TESTE 2: Clicar em "Começar Grátis"

**O que fazer:**
1. Clique no botão "Começar Grátis" (azul claro)
2. Aguarde carregar

**O que você deve ver:**
```
✓ Você é direcionado para /create
✓ Formulário com 2 campos:
  - Email (campo de entrada)
  - Nome da Loja (campo de entrada)
✓ Botão "Próximo" embaixo
```

**Resultado esperado:**
- ✅ Página /create carrega
- ✅ Formulário aparece

---

## 🧪 TESTE 3: Preencher Formulário de Registro

**O que fazer:**
1. No campo "Email", digite: `teste@email.com`
2. No campo "Nome da Loja", digite: `Minha Loja Teste`
3. Clique em "Próximo"
4. Aguarde

**O que você deve ver:**
```
✓ Os dados são salvos em localStorage
✓ Você é direcionado para /setup
✓ Vê uma página com 4 passos (Step 1 ativo)
```

**Resultado esperado:**
- ✅ Formulário aceita dados
- ✅ Redirecionamento funciona

---

## 🧪 TESTE 4: Setup - Passo 1 (Tipo de Negócio)

**O que fazer:**
1. Você vê 4 opções:
   - 🏪 Loja Física
   - 🍔 Restaurante/Bar
   - 💇 Salão de Beleza
   - 🔧 Serviços
2. Clique em uma opção (vamos usar: 🏪 Loja Física)
3. Clique em "Próximo"

**O que você deve ver:**
```
✓ Opção selecionada fica destacada em azul
✓ Botão "Próximo" fica ativo
✓ Direcionado para Passo 2
```

**Resultado esperado:**
- ✅ Opção selecionável
- ✅ Transição para passo 2

---

## 🧪 TESTE 5: Setup - Passo 2 (Informações)

**O que fazer:**
1. Você vê 2 campos:
   - "Título da Página"
   - "Descrição"
2. Preencha:
   - Título: `Loja do João`
   - Descrição: `Tudo para sua casa com preço ótimo`
3. Clique em "Próximo"

**O que você deve ver:**
```
✓ Campos aceitam texto
✓ Botão "Próximo" fica ativo quando preenchido
✓ Direcionado para Passo 3 (FOTOS)
```

**Resultado esperado:**
- ✅ Formulário funciona
- ✅ Validação básica

---

## 🧪 TESTE 6: Setup - Passo 3 (Fotos) ⭐ O NOVO!

**O que fazer:**
1. Aguarde a página carregar completamente
2. Você deve ver uma grade com 6 slots

**O que você deve ver (grid responsivo):**
```
Desktop (3 colunas):
┌─────────────┐
│  HERO (2)   │
├─────┬───────┤
│ TL  │  TR   │  <- Top Left, Top Right (1 col cada)
├─────────────┤
│ CENTER (2)  │
├─────┬───────┤
│ BL  │  BR   │  <- Bottom Left, Bottom Right
└─────┴───────┘
```

**Cada slot mostra:**
```
✓ Emoji (🎯, ↖️, ↗️, 📍, ↙️, ↘️)
✓ Nome (ex: "Hero (Destaque Principal)")
✓ Descrição (ex: "A primeira imagem que os clientes veem")
✓ Área vazia com texto "📷 Clique para adicionar"
```

**Resultado esperado:**
- ✅ 6 slots visíveis
- ✅ Descrições aparecem
- ✅ Responsivo

---

## 🧪 TESTE 7: Fazer Upload na Seção de Fotos

### Teste 7A: Upload do Hero (Destaque Principal)

**O que fazer:**
1. Clique em qualquer slot (vamos começar com Hero - o primeiro)
2. Seu explorador de arquivos abre
3. Selecione uma imagem do seu computador
4. Clique em "Abrir"

**O que você deve ver:**
```
CARREGANDO:
✓ O slot mostra "⏳ Carregando..."
✓ Uma animação de spinner gira
✓ Texto: "Carregando..."

PRONTO:
✓ A imagem aparece em preview
✓ Badge "✓ Pronto" aparece no canto superior direito
✓ Quando passa o mouse, aparecem 2 botões:
  - ✏️ Trocar (cor azul)
  - 🗑️ Remover (cor vermelha)
```

**Resultado esperado:**
- ✅ Upload é iniciado
- ✅ Preview aparece
- ✅ Badge de sucesso mostra

---

### Teste 7B: Testar Gerenciamento de Fotos

**O que fazer:**
1. A imagem está carregada e mostra "✓ Pronto"
2. Passe o mouse sobre a imagem
3. Clique em "✏️ Trocar"

**O que você deve ver:**
```
✓ Explorador de arquivos abre novamente
✓ Você seleciona outra imagem
✓ A imagem anterior é substituída
✓ Nova imagem aparece em preview
✓ Badge "✓ Pronto" continua
```

**Agora teste remover:**
1. Passe o mouse sobre a imagem
2. Clique em "🗑️ Remover"

**O que você deve ver:**
```
✓ A imagem desaparece
✓ O slot volta a mostrar "📷 Clique para adicionar"
✓ Você pode fazer upload novamente
```

**Resultado esperado:**
- ✅ Trocar funcionou
- ✅ Remover funcionou

---

### Teste 7C: Upload Múltiplo

**O que fazer:**
1. Faça upload em todos os 6 slots:
   - 🎯 Hero: Imagem 1
   - ↖️ Superior Esq: Imagem 2
   - ↗️ Superior Dir: Imagem 3
   - 📍 Centro: Imagem 4
   - ↙️ Inferior Esq: Imagem 5
   - ↘️ Inferior Dir: Imagem 6

**O que você deve ver:**
```
✓ Cada upload funciona independentemente
✓ Cada slot mostra sua imagem
✓ Todos com badge "✓ Pronto"
✓ Scroll funciona para ver todos
```

**Resultado esperado:**
- ✅ Múltiplos uploads funcionam
- ✅ Nenhuma imagem apaga a outra

---

## 🧪 TESTE 8: Validações de Upload

### Teste 8A: Tentar Upload de Arquivo Não-Imagem

**O que fazer:**
1. Clique em um slot vazio (ex: o que você removeu antes)
2. Tente selecionar um arquivo .txt, .pdf ou outro não-imagem
3. Clique em "Abrir"

**O que você deve ver:**
```
❌ Erro: "Apenas imagens são permitidas"
✓ O slot continua vazio
✓ Você pode tentar novamente
```

**Resultado esperado:**
- ✅ Validação funciona

---

### Teste 8B: Tentar Upload de Arquivo Muito Grande

**O que fazer:**
1. Se tiver uma imagem > 5MB, teste
2. Clique no slot
3. Selecione a imagem grande
4. Clique em "Abrir"

**O que você deve ver:**
```
❌ Erro: "Imagem muito grande (máximo 5MB)"
✓ O slot continua vazio
✓ Você pode tentar com imagem menor
```

**Resultado esperado:**
- ✅ Validação de tamanho funciona

---

## 🧪 TESTE 9: Continuar no Setup

**O que fazer:**
1. Certifique-se que tem pelo menos 1-2 imagens carregadas
2. Clique em "Próximo" (no final da página)

**O que você deve ver:**
```
✓ Você vai para Passo 4 (Revisar)
✓ Mostra um resumo com:
  - Tipo de negócio: 🏪 Loja Física
  - Título: Loja do João
  - Descrição: Tudo para sua casa com preço ótimo
  - URL: vitrinafast.com.br/loja
```

**Resultado esperado:**
- ✅ Transição funciona
- ✅ Dados aparecem no resumo

---

## 🧪 TESTE 10: Publicar Página

**O que fazer:**
1. Você está no Passo 4 (Revisar)
2. Clique no botão "✅ Publicar Página"
3. Aguarde...

**O que você deve ver:**
```
✓ Botão mostra "⏳ Salvando..." (indicador de loading)
✓ Após alguns segundos, você é redirecionado
✓ Você vai para /preview/[tenantId]
```

**Resultado esperado:**
- ✅ Dados são salvos
- ✅ Redirecionamento funciona

---

## 🧪 TESTE 11: Preview da Página

**O que fazer:**
1. Você chegou na página de preview
2. Observe o conteúdo

**O que você deve ver:**
```
✓ Nome da loja: "Loja do João"
✓ Email: "teste@email.com"
✓ URL: "vitrinafast.com.br/loja-do-joao"
✓ Status: "RASCUNHO 📋" (não online ainda)
✓ 2 botões:
  - ✏️ Editar Página (placeholder)
  - 🚀 Ir para Pagamento (próxima fase)
```

**Resultado esperado:**
- ✅ Preview mostra dados corretos
- ✅ Status DRAFT está visível
- ✅ Botões de ação aparecem

---

## 🧪 TESTE 12: Verificar Banco de Dados

**O que fazer (opcional - para técnicos):**
1. Acesse seu banco de dados (Neon)
2. Execute query:
   ```sql
   SELECT * FROM "Tenant" WHERE name = 'Loja do João';
   ```
3. Procure pela página criada

**O que você deve ver:**
```
✓ Registro no banco com:
  - name: "Loja do João"
  - email: "teste@email.com"
  - status: "ACTIVE"
  - plan: "FREE"
```

**Verifique a tabela Page:**
```sql
SELECT * FROM "Page" WHERE title = 'Loja do João';
```

**O que você deve ver:**
```
✓ Registro com:
  - title: "Loja do João"
  - status: "DRAFT"
  - publishedAt: NULL
  - content: JSON com as fotos
```

**Resultado esperado:**
- ✅ Dados persistem no banco

---

## 🧪 TESTE 13: Verificar Arquivos de Upload

**O que fazer:**
1. Abra um explorador de arquivos
2. Navegue até: `public/uploads/`
3. Você deve ver os arquivos

**O que você deve ver:**
```
public/uploads/
├── 1700000000000-abc123.jpg
├── 1700000001234-def456.png
├── 1700000002567-ghi789.webp
└── ... mais arquivos com nomes como timestamp-random.ext
```

**Resultado esperado:**
- ✅ Arquivos foram salvos no servidor

---

## ✅ RESULTADO FINAL

Se passou em todos os testes, você tem:

✅ Sistema de upload funcionando
✅ 6 slots personalizados
✅ Preview em tempo real
✅ Validações automáticas
✅ Gerenciamento de fotos
✅ Persistência em banco
✅ Flow completo: Landing → Registro → Setup → Preview

---

## 📊 Checklist de Testes Concluídos

- [ ] Teste 1: Landing page carrega
- [ ] Teste 2: Botão "Começar Grátis" funciona
- [ ] Teste 3: Formulário de registro funciona
- [ ] Teste 4: Passo 1 (tipo de negócio) OK
- [ ] Teste 5: Passo 2 (informações) OK
- [ ] Teste 6: Passo 3 (6 slots) OK
- [ ] Teste 7A: Upload funciona
- [ ] Teste 7B: Trocar/Remover funciona
- [ ] Teste 7C: Múltiplos uploads OK
- [ ] Teste 8A: Validação de tipo OK
- [ ] Teste 8B: Validação de tamanho OK
- [ ] Teste 9: Próximo para passo 4 OK
- [ ] Teste 10: Publicar página OK
- [ ] Teste 11: Preview carrega dados
- [ ] Teste 12: Banco de dados tem dados
- [ ] Teste 13: Arquivos estão em /uploads/

**Total**: 16 testes

---

## 🐛 Se Algo Não Funcionar

### Erro: "Upload travado em ⏳ Carregando..."
```
Solução:
1. Espere mais alguns segundos
2. Se continuar, recarregue a página (F5)
3. Tente com imagem menor (<1MB)
```

### Erro: "API não responde"
```
Solução:
1. Verifique se npm run dev está rodando
2. Abra console (F12 > Console)
3. Procure por mensagens de erro
4. Verifique se /public/uploads/ existe
```

### Erro: "Imagem não aparece"
```
Solução:
1. Verifique no console (F12 > Network)
2. Procure por erros de conexão
3. Tente fazer upload novamente
4. Tente com outro arquivo
```

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os arquivos de documentação:
   - PHOTO_UPLOAD_GUIDE.md
   - PHOTO_LAYOUT_VISUALIZATION.md
   - PHOTO_UPLOAD_TEST_CHECKLIST.md

2. Abra Developer Tools (F12) para ver erros

3. Verifique os logs do servidor (terminal npm run dev)

---

**Pronto para testar?**

👉 Abra o navegador e comece no http://localhost:3000

Boa sorte! 🚀
