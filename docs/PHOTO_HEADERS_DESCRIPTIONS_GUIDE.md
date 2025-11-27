# 📸 NOVO: Campos de Cabeçalho e Descrição para Fotos

## ✨ O que mudou

Cada slot de foto agora tem **3 componentes**:

```
┌─────────────────────────────────────┐
│  📷 Imagem                          │
│  (Clique para fazer upload)         │
├─────────────────────────────────────┤
│ 📋 Cabeçalho                        │ ← NOVO!
│ (ex: PROMOÇÃO, NOVIDADE, DESTAQUE)  │
├─────────────────────────────────────┤
│ 📝 Descrição                        │ ← NOVO!
│ (Detalhes do produto/serviço)       │
│ (Opcional - só aparece se escrito)  │
└─────────────────────────────────────┘
```

---

## 🎯 Como Funciona

### Cabeçalho (📋 Acima da Imagem)
- **Tamanho**: Máximo 50 caracteres
- **Uso**: Indicar promoções, novidades, destaques
- **Exemplos**:
  - "PROMOÇÃO"
  - "NOVO PRODUTO"
  - "DESTAQUE DA SEMANA"
  - "50% OFF"
  - "EXCLUSIVO"

### Descrição (📝 Abaixo da Imagem)
- **Tamanho**: Máximo 200 caracteres
- **Uso**: Descrever o produto, serviço ou conteúdo
- **Exemplos**:
  - "Pão francês quentinho todo dia"
  - "Corte profissional com tesoura suíça"
  - "Instalação rápida e segura"
  - "Disponível em 5 cores"

---

## 🔑 Características Especiais

### Renderização Condicional
```
✅ SE o usuário preencher:
   - O texto aparece na página final

❌ SE o usuário deixar em branco:
   - O campo NÃO aparece na página
   - Mantém a página limpa
```

### Validação
- **Cabeçalho**: 0-50 caracteres (mostra contador)
- **Descrição**: 0-200 caracteres (mostra contador)
- Ambos são opcionais
- Sem limite de linhas na descrição

### Preview em Tempo Real
- Digite e veja o contador
- Campos salvos automaticamente no state
- Não perde dados se trocar de slot

---

## 📝 Exemplos por Tipo de Negócio

### 🏪 Loja Física

**Slot Centro-Top (Frente da Loja)**
- Cabeçalho: "ENTRE E CONHEÇA"
- Descrição: "Atendimento de segunda a sábado das 9h às 18h"

**Slot Hero (Destaque)**
- Cabeçalho: "PROMOÇÃO ESPECIAL"
- Descrição: "Compre 2 e ganhe 1 desconto adicional"

**Slot Centro**
- Cabeçalho: "NOVIDADES"
- Descrição: "Confira nossa nova coleção de produtos importados"

---

### 🍔 Restaurante

**Slot Centro-Top (Frente)**
- Cabeçalho: "BEM-VINDO"
- Descrição: "Aberto de segunda a domingo das 11h à meia noite"

**Slot Hero (Prato Principal)**
- Cabeçalho: "PRATO DO DIA"
- Descrição: "Moqueca capixaba com arroz integral e farofa"

**Slot Centro**
- Cabeçalho: "DRINK ESPECIAL"
- Descrição: "Mojito com rum premium, limão e hortelã fresca"

---

### 💇 Salão de Beleza

**Slot Centro-Top (Salão)**
- Cabeçalho: "SEJA BEM-VINDA"
- Descrição: "Oferecemos os melhores tratamentos capilares"

**Slot Hero (Transformação)**
- Cabeçalho: "TRANSFORMAÇÃO"
- Descrição: "Escova profissional com produto de qualidade premium"

**Slot Centro**
- Cabeçalho: "PROMOÇÃO"
- Descrição: "Manicure + Pedicure por apenas R$ 89,90"

---

### 🔧 Serviços

**Slot Centro-Top (Empresa)**
- Cabeçalho: "QUALIDADE GARANTIDA"
- Descrição: "Serviços especializados há 10 anos no mercado"

**Slot Hero (Projeto)**
- Cabeçalho: "CASE DE SUCESSO"
- Descrição: "Reforma completa entregue 15 dias antes do prazo"

**Slot Centro**
- Cabeçalho: "ORÇAMENTO GRÁTIS"
- Descrição: "Faça uma consulta sem compromisso com nossos especialistas"

---

## 🧪 Como Testar

1. **Abra o navegador**
   ```
   http://localhost:3000
   ```

2. **Clique em "Começar Grátis"**

3. **Passe pelos passos**
   - Passo 1: Escolha tipo de negócio
   - Passo 2: Preencha título e descrição
   - **Passo 3: NOVO - Faça upload e teste os campos**

4. **No Passo 3, para cada foto:**
   - Faça upload da imagem
   - Digite um **cabeçalho** (ex: "PROMOÇÃO")
   - Digite uma **descrição** (ex: "50% OFF neste fim de semana")
   - Veja os contadores de caracteres
   - Deixe alguns campos vazios para testar

5. **Passo 4 (Revisar)**
   - Clique em "Publicar Página"
   - Veja na preview qual aparecem

6. **Teste a Renderização Condicional:**
   - Volta para editar (futura feature)
   - Observe que campos vazios não aparecerão

---

## 💾 Dados Salvos

Cada foto é salva com essa estrutura:

```json
{
  "slot": "hero",
  "url": "/uploads/1700000000000-abc123.jpg",
  "header": "PROMOÇÃO ESPECIAL",
  "description": "50% OFF em todos os produtos"
}
```

### No Banco de Dados

```json
{
  "photos": [
    {
      "slot": "center-top",
      "url": "/uploads/...",
      "header": "BEM-VINDO",
      "description": "Horário: 9h-22h"
    },
    {
      "slot": "hero",
      "url": "/uploads/...",
      "header": "DESTAQUE",
      "description": "Novo produto em estoque"
    }
  ]
}
```

---

## ✅ Checklist de Teste

- [ ] Carreguei uma imagem
- [ ] Preenchi o cabeçalho
- [ ] Preenchi a descrição
- [ ] Vi o contador de caracteres funcionar
- [ ] Deixei um campo vazio
- [ ] Publiquei a página
- [ ] Na preview, o campo vazio não apareceu
- [ ] Todos os campos preenchidos apareceram

---

## 🎨 Layout

### Com Dados Preenchidos

```
┌─────────────────────────┐
│  PROMOÇÃO ESPECIAL      │  ← Cabeçalho (header)
├─────────────────────────┤
│                         │
│    [IMAGEM 500x300]     │
│                         │
├─────────────────────────┤
│ 50% OFF em todos os     │  ← Descrição (description)
│ produtos da loja até    │
│ domingo à noite!        │
└─────────────────────────┘
```

### Com Descrição Vazia

```
┌─────────────────────────┐
│  PROMOÇÃO ESPECIAL      │  ← Cabeçalho aparece
├─────────────────────────┤
│                         │
│    [IMAGEM 500x300]     │
│                         │
└─────────────────────────┘
← Descrição NÃO aparece (campo vazio)
```

### Sem Cabeçalho e Descrição

```
┌─────────────────────────┐
│                         │
│    [IMAGEM 500x300]     │
│                         │
└─────────────────────────┘
← Apenas a imagem (ambos vazios)
```

---

## 🎯 Casos de Uso

### Usar Cabeçalho para:
- ✅ Indicar promoções
- ✅ Marcar novidades
- ✅ Destacar características especiais
- ✅ Chamar atenção a ofertas
- ✅ Indicar sazonalidade

### Usar Descrição para:
- ✅ Descrever o produto
- ✅ Explicar o serviço
- ✅ Informar ingredientes/especificações
- ✅ Comunicar vantagens
- ✅ Motivar à ação (CTA)

### Deixar Vazio quando:
- ❌ Não há informação relevante
- ❌ A imagem é auto-explicativa
- ❌ Quer manter a página limpa
- ❌ O conteúdo aparece na imagem

---

## 📊 Resumo

| Aspecto | Detalhe |
|--------|---------|
| **Cabeçalho** | 50 caracteres máx, aparece acima |
| **Descrição** | 200 caracteres máx, aparece abaixo |
| **Renderização** | Condicional (vazio = não aparece) |
| **Obrigatório** | Ambos opcionais |
| **Contador** | Mostra em tempo real |
| **Salvo em** | Campo `header` e `description` no JSON |

---

## 🚀 Próximo Passo

Teste agora mesmo:
1. `npm run dev`
2. `http://localhost:3000`
3. "Começar Grátis" → Passo 3 → Carregue uma foto e teste!

**Bom teste! 🎉**
