# 📸 Sistema de Upload de Imagens - Guia Completo

## ✨ O que foi implementado

Você agora tem um **sistema completo de upload de imagens** com 6 slots diferentes para posicionar fotos na sua página:

### 6 Slots de Fotos Disponíveis

```
┌─────────────────────────────────────────┐
│          🎯 HERO (2 colunas)            │  ← Destaque Principal
├──────────────────┬──────────────────────┤
│  ↖️ SUPERIOR     │   ↗️ SUPERIOR        │  ← Cantos Superiores
│     ESQUERDO    │     DIREITO          │
├──────────────────┴──────────────────────┤
│      📍 CENTRO (2 colunas)               │  ← Centro da Página
├──────────────────┬──────────────────────┤
│  ↙️ INFERIOR    │   ↘️ INFERIOR        │  ← Cantos Inferiores
│     ESQUERDO    │     DIREITO          │
└──────────────────┴──────────────────────┘
```

### Cada Slot Possui

- **Emoji Visual**: Identifica rapidamente a posição
- **Nome Descritivo**: Clareza sobre onde a imagem aparecerá
- **Descrição**: Dica do que funciona melhor naquele espaço
- **Preview em Tempo Real**: Ver a imagem que você enviou

## 🚀 Como Usar

### Passo 1: Acessar Setup
```
1. Entre em http://localhost:3000
2. Clique em "Começar Grátis"
3. Preencha email e nome da loja
4. Prossiga até o Passo 3 (Fotos)
```

### Passo 2: Fazer Upload
```
1. Veja os 6 slots de fotos
2. Clique em qualquer slot para adicionar imagem
3. Selecione uma imagem do seu computador
4. Aguarde "⏳ Carregando..."
5. A imagem aparecerá em preview quando pronta
```

### Passo 3: Gerenciar Fotos
```
✓ Pronto - Status quando a imagem foi carregada
✏️ Trocar - Substitua a foto por outra
🗑️ Remover - Apague a foto do slot
```

## 📋 Especificações Técnicas

### Validações de Upload
- ✅ Apenas imagens (JPG, PNG, WebP, GIF, etc)
- ✅ Tamanho máximo: 5MB por imagem
- ✅ Nomeação automática com timestamp
- ✅ Salvo em `/public/uploads/`

### Exemplos de Nomes de Arquivo
```
1700000000000-ab1cd2.jpg
1700000001234-xy9zw5.png
1700000002567-qr8st3.webp
```

### Armazenamento no Banco
As fotos são salvas como JSON com seus slots:
```json
{
  "photos": [
    { "slot": "hero", "url": "/uploads/1700000000000-ab1cd2.jpg" },
    { "slot": "left-top", "url": "/uploads/1700000001234-xy9zw5.png" },
    { "slot": "center", "url": "/uploads/1700000002567-qr8st3.webp" }
  ]
}
```

## 🎨 Layout Responsivo

### Desktop (3 colunas)
```
[HERO                    ]
[LEFT-TOP  ][RIGHT-TOP  ]
[CENTER                  ]
[LEFT-BOT  ][RIGHT-BOT  ]
```

### Mobile (1 coluna)
```
[HERO]
[LEFT-TOP]
[RIGHT-TOP]
[CENTER]
[LEFT-BOT]
[RIGHT-BOT]
```

## 💡 Dicas

### Para Melhor Resultado

#### 🎯 Hero (Destaque Principal)
- Use a imagem mais impactante do seu negócio
- Recomendado: 1200x600px (landscape)
- Bom para: Foto da loja completa, prato principal, rosto profissional

#### ↖️ Superior Esquerdo & ↗️ Superior Direito
- Imagens quadradas funcionam melhor
- Recomendado: 500x500px
- Bom para: Detalhes, produtos, pessoas

#### 📍 Centro
- Área destaque secundária
- Use para contar sua história
- Recomendado: 1200x600px ou quadrado

#### ↙️ Inferior Esquerdo & ↘️ Inferior Direito
- Rodapé visual da página
- Bom para: Créditos, reconhecimentos, depoimentos

### Formatos Recomendados
- **JPG**: Fotos naturais (menores, rápidas)
- **PNG**: Imagens com transparência
- **WebP**: Qualidade alta + tamanho pequeno (moderno)

### Tamanhos Ideais
- Hero: 1200x600px (2:1 ratio)
- Cantos: 500x500px (1:1 ratio)
- Centro: 1200x600px ou 500x500px

## 🔧 Estrutura de Arquivos

```
app/
├── api/
│   └── upload/
│       └── route.ts          (API de upload)
├── setup/
│   └── page.tsx              (Step 3 com slots)
│
public/
└── uploads/
    └── *.jpg, *.png, etc     (Imagens carregadas)
```

## ✅ Checklist de Uso

- [ ] Acessei http://localhost:3000
- [ ] Cliquei em "Começar Grátis"
- [ ] Preenchi email e nome da loja
- [ ] Cheguei ao Passo 3 (Fotos)
- [ ] Fiz upload da primeira imagem (Hero)
- [ ] Fiz upload de mais imagens nos outros slots
- [ ] Vi o preview em tempo real
- [ ] Testei trocar/remover fotos
- [ ] Cliquei em "Próximo" para revisar
- [ ] Cliquei em "Publicar Página" para salvar

## 🐛 Solução de Problemas

### Erro: "Apenas imagens são permitidas"
✅ Solução: Verifique se você selecionou um arquivo de imagem (JPG, PNG, WebP, etc)

### Erro: "Imagem muito grande (máximo 5MB)"
✅ Solução: Comprima a imagem ou reduza o tamanho antes de fazer upload

### Erro: "Erro ao fazer upload"
✅ Solução: Tente novamente. Se persistir, verifique se o servidor está rodando

### Upload travado em "⏳ Carregando..."
✅ Solução: 
1. Aguarde mais alguns segundos
2. Se não funcionar, feche e tente novamente
3. Use uma imagem menor

### Imagem não aparece após upload
✅ Solução:
1. Verifique a conexão com internet
2. Tente fazer upload novamente
3. Tente com outro arquivo de imagem

## 📊 Próximos Passos

Após fazer upload de todas as fotos:

1. **Revisar** (Passo 4)
   - Ver um resumo de todas as informações
   - Confirmar o URL da sua página

2. **Publicar Página**
   - Clicar em "✅ Publicar Página"
   - Página salva como DRAFT
   - Redirecionado para preview

3. **Editar ou Pagar**
   - Na página de preview, você pode:
   - ✏️ Editar - Modificar informações
   - 🚀 Ir para Pagamento - Publicar a página

## 📞 Suporte

Se encontrar qualquer problema:

1. Verifique se o servidor está rodando
   ```
   npm run dev
   ```

2. Abra DevTools (F12) e verifique o console
3. Verifique a pasta `/public/uploads/` para ver arquivos salvos
4. Verifique os logs do servidor

---

**Status**: ✅ IMPLEMENTADO E TESTADO
**Servidor**: http://localhost:3000
**Data**: 23 de Novembro de 2024
