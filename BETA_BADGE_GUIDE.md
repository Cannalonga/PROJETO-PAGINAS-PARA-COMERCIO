# 🎨 BETA BADGE COMPONENT - USAGE GUIDE

**Status**: ✅ Ready to Use  
**File**: `components/BetaBadge.tsx`  
**Data**: December 1, 2025

---

## 📋 O Que É

Componente React profissional para indicar que a plataforma está em fase de teste/beta.

**Designs inclusos:**
- 🎯 Banner (topo da página)
- 🎈 Floating (canto flutuante)
- 📝 Inline (dentro do conteúdo)
- 🏷️ Tag (apenas o badge)

---

## 🚀 COMO USAR

### Opção 1: Banner no Topo (RECOMENDADO PARA LANDING)

```tsx
// app/page.tsx (ou sua landing page)
import { BetaBadge } from '@/components/BetaBadge';

export default function Home() {
  return (
    <>
      <BetaBadge variant="banner" />
      
      {/* Seu conteúdo aqui (add margin-top!) */}
      <main className="pt-24">
        {/* ... */}
      </main>
    </>
  );
}
```

**Resultado:**
```
┌─────────────────────────────────────────────┐
│ 🔴 BETA                                     │ X
│ Estamos testando a plataforma               │
│ Sua opinião importa! Nos conte              │
└─────────────────────────────────────────────┘
```

---

### Opção 2: Floating no Canto (Para App)

```tsx
// app/layout.tsx
import { BetaBadge } from '@/components/BetaBadge';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        <BetaBadge variant="floating" />
      </body>
    </html>
  );
}
```

**Resultado:**
```
[Conteúdo da página...]

                      ┌──────────────────┐
                      │ 🔴 BETA          | X
                      │ Plataforma       │
                      │ em fase de teste │
                      └──────────────────┘
```

---

### Opção 3: Inline (Dentro de Seção)

```tsx
// components/PricingSection.tsx
import { BetaBadge } from '@/components/BetaBadge';

export function PricingSection() {
  return (
    <section>
      <h2>Nossos Planos</h2>
      
      <BetaBadge variant="inline" />
      
      {/* Seus planos aqui */}
    </section>
  );
}
```

**Resultado:**
```
Nossos Planos

┌─────────────────────────────┐
│ 🔴 BETA                     │ X
│ Estamos em fase de testes!  │
│ Sua opinião é fundamental   │
│ Enviar Feedback →           │
└─────────────────────────────┘

[Planos...]
```

---

### Opção 4: Apenas o Tag

```tsx
// Para usar junto com outro texto
import { BetaTag } from '@/components/BetaBadge';

export function ProductCard() {
  return (
    <div>
      <h3>
        Nosso novo recurso
        <BetaTag />
      </h3>
    </div>
  );
}
```

**Resultado:**
```
Nosso novo recurso 🔴 BETA
```

---

## 🎨 CUSTOMIZAÇÃO

### Remover após fechar

```tsx
const [showBeta, setShowBeta] = useState(true);

return (
  <>
    {showBeta && (
      <BetaBadge 
        variant="banner"
        onClose={() => setShowBeta(false)}
      />
    )}
  </>
);
```

### Mudar email de feedback

Edite no `BetaBadge.tsx`:

```tsx
// Procure por:
href="mailto:feedback@paginasparaocomercio.com"

// E mude para:
href="mailto:seu-email@dominio.com"
```

### Mudar cores

```tsx
// De: bg-amber-100 text-amber-800
// Para: bg-blue-100 text-blue-800

// Procure no componente e substitua todas as cores
```

---

## 📧 EMAIL PARA FEEDBACK

Certifique-se que o email está correto:

```tsx
// Atual (substitua):
feedback@paginasparaocomercio.com

// Opções:
1. seu-email@paginasparaocomercio.com
2. support@paginasparaocomercio.com
3. beta@paginasparaocomercio.com
```

---

## 🎯 RECOMENDAÇÕES DE USO

| Página | Variante | Recomendação |
|--------|----------|--------------|
| Landing Page | `banner` | ✅ Show beta, não assusta |
| App Dashboard | `floating` | ✅ Não atrapalha, fica discreto |
| Pricing | `inline` | ✅ Context claro (dentro pricing) |
| Feature Nova | `inline` | ✅ Explica status da feature |
| Navbar | `tag` | ✅ Pequeno badge ao lado do título |

---

## 🎨 DESIGN DETAILS

### Cores
- **Background**: Amber (cor aquecer, não assusta)
- **Text**: Gradient + Pulse animation
- **Icons**: Pulsing dot (indica ativo)

### Responsividade
- ✅ Mobile-first design
- ✅ Adapta a telas pequenas
- ✅ Sem scroll horizontal

### Accessibility
- ✅ Proper contrast ratio
- ✅ Close button accessible
- ✅ Email link semantic

---

## 📱 EXEMPLOS DE LAYOUT

### Landing Page Completa

```tsx
'use client';

import { BetaBadge, BetaTag } from '@/components/BetaBadge';

export default function Home() {
  return (
    <>
      {/* Banner Beta no topo */}
      <BetaBadge variant="banner" />

      {/* Main content com margin-top */}
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <h1>
            Página para o Comércio <BetaTag />
          </h1>
          <p>A solução que o seu negócio precisava</p>
        </section>

        {/* Features */}
        <section className="py-20">
          <h2>Por que escolher a gente?</h2>
          {/* ... features ... */}
        </section>

        {/* Pricing (com badge inline) */}
        <section className="py-20">
          <h2>Nossos Planos</h2>
          <BetaBadge variant="inline" />
          {/* ... planos ... */}
        </section>
      </main>
    </>
  );
}
```

---

## ✅ ANTES DE PUBLICAR

- [ ] Email de feedback configurado corretamente
- [ ] Página ajustada para `pt-24` (se usar banner)
- [ ] Testado em mobile
- [ ] Links de feedback funcionam
- [ ] Cor combina com design da página
- [ ] Copy review ("estamos testando", etc)

---

## 🚀 DEPOIS QUE SAIR DO BETA

Apenas mude:

```tsx
// De:
<BetaBadge variant="banner" />

// Para:
{/* <BetaBadge variant="banner" /> */}

// Ou delete completamente
```

---

## 💡 DICAS

1. **Use banner na landing** - Mostra profissionalismo
2. **Email importante** - Faça fácil reportar bugs
3. **Aceite feedback** - Vale mais que ouro
4. **Atualize quando corrigir** - Mostre progresso
5. **Remova quando pronto** - Quando versão 1.0 sair

---

**Pronto para usar! Deploy now! 🚀**
