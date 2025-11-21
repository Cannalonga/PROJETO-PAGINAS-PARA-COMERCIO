# 🎨 Design System

Uma biblioteca completa de componentes e estilos modernos para o projeto **PáginasComércio**.

## 📦 Componentes

### UI Components (`/components/ui`)

#### Button
Componente de botão com múltiplas variantes e tamanhos.

```tsx
import { Button } from '@/components/ui'

<Button variant="primary" size="lg">
  Clique aqui
</Button>
```

**Variantes:** `primary`, `secondary`, `outline`, `ghost`, `success`, `danger`
**Tamanhos:** `sm`, `md`, `lg`, `xl`

#### Card
Container para conteúdo com estilos predefinidos.

```tsx
import { Card } from '@/components/ui'

<Card variant="glass">
  Conteúdo aqui
</Card>
```

**Variantes:** `default`, `glass`, `gradient`
**Propriedade:** `hover` (ativa efeitos ao passar o mouse)

#### Input
Campo de entrada com suporte a label, erro e helper text.

```tsx
import { Input } from '@/components/ui'

<Input 
  label="Email"
  type="email"
  error="Email inválido"
  helper="Seu endereço de email"
/>
```

#### Badge
Insignia para destacar status e categorias.

```tsx
import { Badge } from '@/components/ui'

<Badge variant="success">Ativo</Badge>
```

**Variantes:** `primary`, `secondary`, `success`, `warning`, `danger`, `info`
**Tamanhos:** `sm`, `md`

#### Grid
Sistema de grid responsivo.

```tsx
import { Grid } from '@/components/ui'

<Grid cols={3} gap="lg">
  {/* Items */}
</Grid>
```

#### Container
Wrapper com max-width responsivo.

```tsx
import { Container } from '@/components/ui'

<Container maxWidth="xl">
  Conteúdo centralizado
</Container>
```

## 🎨 Paleta de Cores

### Primárias
- **Sky** (Principal): `sky-500`
- **Emerald** (Accent): `emerald-500`

### Neutras
- Escala de Slate: `slate-0` até `slate-900`

### Semânticas
- **Sucesso**: `emerald-*`
- **Aviso**: `yellow-*`
- **Erro**: `red-*`
- **Info**: `blue-*`

## 🖼️ Tipografia

- **Font**: Inter (Google Fonts)
- **Pesos**: 400 (regular), 600 (semibold), 700 (bold)
- **Tamanhos**: Definidos por Tailwind padrão

## ✨ Animações

- **fadeIn**: Fade suave
- **slideIn**: Slide do fundo
- **pulse-subtle**: Pulso sutil

## 🔧 Utilitários

Importar de `@/lib/utils`:

```tsx
import { cn, formatCurrency, formatDate } from '@/lib/utils'

// Mesclar classnames
cn('px-4 py-2', isActive && 'bg-sky-500')

// Formatar moeda
formatCurrency(100) // "R$ 100,00"

// Formatar data
formatDate('2025-01-01') // "01 de janeiro de 2025"
```

## 📐 Espaçamento

Usando escala Tailwind padrão (4px base):
- `sm`: 4px
- `md`: 8px
- `lg`: 16px
- `xl`: 24px

## 🌙 Dark Mode

Todos os componentes são otimizados para dark mode com a paleta slate/sky.

## 📱 Responsividade

- **Mobile first** em todos os componentes
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)

## 🚀 Como Usar

```tsx
import { Button, Card, Badge, Container } from '@/components/ui'

export default function Example() {
  return (
    <Container>
      <Card variant="glass">
        <h2>Exemplo</h2>
        <Badge variant="success">Novo</Badge>
        <Button variant="primary">Ação</Button>
      </Card>
    </Container>
  )
}
```

---

**Desenvolvido para proporcionar experiência moderna e profissional.** 🎯
