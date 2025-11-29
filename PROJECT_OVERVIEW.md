# 🎯 VISÃO GERAL DO PROJETO - VITRINAFAST

## 📌 O QUE ESTAMOS CRIANDO?

**VitrinaFast** é uma plataforma SaaS que permite pequenos negócios (comércios locais) criar vitrines digitais profissionais em minutos, **sem precisar de conhecimento técnico**.

---

## 🎯 PROPÓSITO PRINCIPAL

**Objetivo:** Democratizar a presença online para pequenos comerciantes locais  
**Público-alvo:** Lojas físicas, restaurantes, prestadores de serviço, comércios locais  
**Problema que resolve:** Muitos negócios locais não têm site profissional porque é caro, complicado ou demorado  
**Solução:** Criar uma vitrine digital simples, rápida e bonita em minutos

---

## 🏗️ ARQUITETURA DO PROJETO

### Tech Stack
- **Frontend:** Next.js 14 (React) + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** Supabase PostgreSQL
- **Storage:** Cloudinary (fotos e imagens)
- **Auth:** NextAuth.js (login com email/senha)
- **Hosting:** Vercel (produção)

---

## 🔄 FLUXO PRINCIPAL (User Journey)

```
1. LANDING PAGE (/home)
   ↓
   "Criar Minha Vitrine" → /setup
   ↓
2. SETUP WIZARD (4 PASSOS)
   Passo 1: Informações Básicas
   - Nome do negócio
   - Email
   - Tipo de negócio (comércio, restaurante, serviço, etc)
   - Tipo de loja (física ou online)
   
   Passo 2: Dados de Contato
   - WhatsApp (obrigatório)
   - Telefone
   - Email de contato
   - Endereço
   - Cidade/Estado
   
   Passo 3: Fotos e Detalhes
   - Upload de fotos (máx 5)
   - Editor de imagens (zoom, rotação, crop)
   - Redes sociais (Instagram, Facebook)
   - Horário de funcionamento
   
   Passo 4: Página e Publicação
   - Título da página
   - Descrição
   - Preview da vitrine
   - Botão PUBLICAR
   ↓
3. BANCO DE DADOS - CRIA
   - Tenant (loja)
   - Page (página inicial)
   - User (vincula usuário à loja)
   ↓
4. PREVIEW PAGE (/preview/[tenantId])
   - Mostra como ficou
   - Link: /loja/[slug]
   - Botão compartilhar WhatsApp
   ↓
5. VITRINE ONLINE (/loja/[slug])
   - Página pública e indexada no Google
   - SEO otimizado
   - Design responsivo
   - Link WhatsApp funcional
```

---

## 📊 ESTRUTURA DE DADOS

### Tabelas Principais

**Tenant** (Loja/Negócio)
```
- id: UUID
- slug: "loja-do-joao" (URL única)
- name: "Loja do João"
- email: "joao@email.com"
- phone, address, city, state, zipCode
- status: ACTIVE | SUSPENDED | DRAFT
- plan: FREE | BASIC | PREMIUM | VIP
- createdAt, updatedAt
```

**Page** (Página da Vitrine)
```
- id: UUID
- slug: "principal" ou "home"
- title: "Loja do João - Seu Comércio de Confiança"
- description: "Descrição da loja"
- template: LOJA (tipo de template)
- status: PUBLISHED | DRAFT
- content: JSON (dados da página)
- tenantId: FK → Tenant
```

**User** (Usuário/Proprietário)
```
- id: UUID
- email: "joao@email.com"
- password: hash
- role: SUPERADMIN | OPERADOR
- tenantId: FK → Tenant (pode ter 0 ou 1)
- createdAt, lastLoginAt
```

**Photo** (Fotos de Produto/Vitrine)
```
- id: UUID
- url: "https://cloudinary.com/..."
- publicId: "cloudinary-public-id"
- tenantId: FK → Tenant
```

---

## 🎨 COMPONENTES PRINCIPAIS

### Pages (Rotas)

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Landing page (home) | ✅ Funcionando |
| `/setup` | Wizard 4 passos | ✅ Funcionando |
| `/auth/login` | Login | ✅ Funcionando |
| `/preview/[tenantId]` | Preview após criar | ✅ Funcionando |
| `/loja/[slug]` | Vitrine pública | ✅ Funcionando |
| `/dashboard` | Painel do proprietário | 🔄 WIP |
| `/admin` | Painel administrativo | ⏳ Futuro |

### API Routes

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/stores` | POST | Criar loja | 🔴 COM BUG |
| `/api/upload` | POST | Fazer upload de imagens | ✅ Funcionando |
| `/api/auth/[...nextauth]` | - | NextAuth | ✅ Funcionando |
| `/api/public/[slug]` | GET | Dados públicos da loja | ✅ Funcionando |

### Componentes React

- `ImageCropper.tsx` - Editor de imagens com zoom, rotação (✅ Novo!)
- `PublicPageRenderer.tsx` - Renderiza vitrine pública
- `Alert.tsx`, `Button.tsx`, `Card.tsx` - Componentes UI

---

## ✨ FEATURES PRINCIPAIS

### ✅ Implementados
- Upload de fotos com Cloudinary
- Crop de imagens com zoom e rotação
- Landing page profissional
- Wizard 4 passos guiado
- NextAuth autenticação
- PublicPageRenderer (vitrine)
- SEO otimizado para vitrines
- Responsivo (mobile, tablet, desktop)
- URL amigável `/loja/[slug]`

### 🔄 Em Desenvolvimento
- Sincronização User-Tenant no banco

### ⏳ Futuro (Phase 2+)
- Painel de edição pós-publicação
- Métricas e analytics
- Integração de pagamento (Stripe)
- Templates adicionais
- Custom domain
- Email marketing
- Sistema de agendamento

---

## 🐛 PROBLEMA ATUAL

### Erro na Criação de Loja: `Record to update not found`

**Quando ocorre:**
- Usuário preenche formulário do setup
- Clica "Publicar"
- Loja é criada no banco com sucesso
- ❌ FALHA ao vincular usuário à loja

**Causa:**
- NextAuth cria um `session.id`
- Mas esse ID não existe na tabela `User` do banco
- Causa: Cookies antigos ou sincronização perdida entre sessão e banco

**Solução Proposta:**
1. Limpar cookies do navegador
2. Fazer login novamente
3. Se não funcionar: sincronizar banco manualmente

---

## 📈 MODELO DE NEGÓCIO

### Planos de Preço
- **FREE** (R$0): Vitrine básica, sem suporte
- **BASIC** (R$9/mês): + analytics básico
- **PREMIUM** (R$29/mês): + custom domain, email marketing
- **VIP** (R$99/mês): + suporte prioritário, design customizado

### Monetização
- Subscription (principal)
- Custom domain premium
- Pagas adicionais (templates customizados, integração)

---

## 🚀 ROADMAP GERAL

### Phase 1: MVP (Atual)
- ✅ Criar vitrine básica
- ✅ Upload de fotos
- 🔴 Sincronização User-Tenant (BUG)

### Phase 2: Dashboard
- Editar vitrine após publicação
- Analytics básico (visitantes, conversões)
- Integração Stripe

### Phase 3: Templates
- Templates por categoria
- Builder visual (drag-drop)
- Temas customizáveis

### Phase 4: Marketplace
- Integração de serviços (agendamento, cardápio digital)
- Plugin system
- Community marketplace

---

## 📁 ESTRUTURA DE PASTAS

```
app/
├── page.tsx                    # Landing page
├── setup/
│   └── page.tsx               # Wizard 4 passos
├── auth/
│   └── login/page.tsx         # Login
├── api/
│   ├── stores/route.ts        # 🔴 POST criar loja (COM BUG)
│   ├── upload/route.ts        # Upload Cloudinary
│   └── auth/[...nextauth]/    # NextAuth
└── loja/[slug]/
    ├── page.tsx               # Vitrine pública
    └── layout.tsx             # SEO

components/
├── ImageCropper.tsx           # ✨ Novo! Editor de imagens
├── PublicPageRenderer.tsx     # Renderiza vitrine
└── (UI básicos)

lib/
├── prisma.ts                  # Prisma client
├── auth.ts                    # NextAuth config
├── store-db.ts               # Funções CRUD de loja
└── ...

db/prisma/
└── schema.prisma             # Schema do banco
```

---

## 🎓 RESUMO EDUCACIONAL

### O que aprendemos construindo isso:

1. **Full-Stack Next.js**: Como construir um app completo com Next.js
2. **SaaS Multi-tenant**: Como arquitetar um SaaS com múltiplos usuários/lojas
3. **Processamento de Imagens**: Upload, crop, otimização com Cloudinary
4. **Autenticação**: NextAuth com email/password
5. **SEO Dinâmico**: Metadata generation para cada loja
6. **Responsive Design**: Tailwind CSS responsive
7. **Banco de Dados**: PostgreSQL com Prisma

---

## 📞 PRÓXIMAS AÇÕES

1. **Hoje:** Resolver bug de sincronização User-Tenant
2. **Próxima semana:** Testar fluxo completo
3. **Depois:** Implementar edição pós-publicação
4. **Futuro:** Payment + analytics

---

**Última atualização:** 29 de Novembro de 2025  
**Status:** MVP em andamento (88% complete)
