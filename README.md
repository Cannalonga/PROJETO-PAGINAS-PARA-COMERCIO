# Plataforma Multi-Tenant para Páginas de Comércio Local

Crie páginas profissionais para seu comércio local em minutos com nossa plataforma multi-tenant moderna e escalável.

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 14 + React 18 + Tailwind CSS 4
- **Backend:** Next.js API Routes + Node.js
- **Database:** PostgreSQL (Supabase/Neon)
- **ORM:** Prisma
- **Autenticação:** NextAuth + JWT
- **Storage:** S3 / DigitalOcean Spaces
- **CDN:** Cloudflare
- **Pagamentos:** Stripe
- **Queue:** BullMQ + Redis
- **Monitoramento:** Sentry
- **Deploy:** Vercel (frontend) + Render (workers)

## 📋 Funcionalidades MVP

✅ CRUD completo de tenants, pages e users  
✅ Páginas públicas por tenant (SSG/ISR)  
✅ Painel administrativo responsivo  
✅ Upload de imagens com otimização (Sharp)  
✅ Autenticação com RBAC (4 roles)  
✅ Integração com Stripe para billing  
✅ Analytics básicos (visitas, cliques)  
✅ SSL e subdomínios automáticos  
✅ SEO otimizado (meta tags, sitemaps)  
✅ Suporte a múltiplos templates

## 📁 Estrutura de Pastas

```
project-root/
├── app/                    # Next.js app router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/            # Routes privadas
│   ├── (admin)/           # Admin dashboard
│   └── api/               # API routes
├── components/            # Componentes reutilizáveis
│   ├── common/
│   ├── forms/
│   ├── layouts/
│   └── templates/
├── lib/                   # Funções utilitárias
│   ├── prisma.ts          # Cliente Prisma
│   ├── auth.ts            # Configuração NextAuth
│   └── storage.ts         # Upload para S3
├── utils/                 # Helpers e validações
├── hooks/                 # Custom React hooks
├── styles/                # Global CSS + Tailwind
├── types/                 # TypeScript interfaces
├── services/              # Serviços de negócio
├── db/
│   └── prisma/
│       ├── schema.prisma  # Modelos do banco
│       ├── seed.ts        # Dados iniciais
│       └── migrations/
├── public/                # Assets estáticos
├── .env.example           # Variáveis de exemplo
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## ⚡ Quick Start

### Pré-requisitos
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd project-paginas-comercio

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local

# Gere o cliente Prisma
npm run prisma:generate

# Execute migrações
npm run prisma:migrate

# (Opcional) Popule dados iniciais
npm run prisma:seed

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse http://localhost:3000

## 🔐 Segurança

✅ HTTPS/HSTS  
✅ Content Security Policy (CSP)  
✅ Rate limiting  
✅ CSRF protection  
✅ SQL Injection prevention (Prisma)  
✅ XSS sanitization  
✅ Input validation com Zod  
✅ Audit logging  
✅ LGPD compliance

## 📦 Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
NEXTAUTH_SECRET=seu-secret-aleatorio-min-32-chars
DATABASE_URL=postgresql://user:pass@host/db
S3_BUCKET=seu-bucket
S3_ACCESS_KEY_ID=sua-chave
S3_SECRET_ACCESS_KEY=sua-senha
STRIPE_SECRET_KEY=sk_test_...
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Modo watch
npm run test:watch

# Testes E2E
npm run test:e2e
```

## 📈 Performance

- Lighthouse score: >90 desktop / >80 mobile
- WCAG 2.1 AA compliance
- Otimização de imagens com Sharp
- Cache estático via CDN Cloudflare
- ISR (Incremental Static Regeneration) para pages

## 🚀 Deploy

### Frontend (Vercel)
```bash
vercel deploy
```

### Workers (Render)
Deploy automático via GitHub Actions

### Banco de Dados
Migrações automáticas via Prisma Migrate

## 📚 Documentação

- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [NextAuth Docs](https://next-auth.js.org/)

## 📧 Suporte

Para dúvidas ou issues, abra uma issue no GitHub.

## 📄 Licença

MIT License - veja LICENSE.md para detalhes

---

**Desenvolvido com ❤️ para pequenos negócios**
