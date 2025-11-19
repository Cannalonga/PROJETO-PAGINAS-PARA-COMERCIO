# ▶️ COMEÇAR AGORA - Quick Start Guide

## 🚀 5 Passos para Começar o Desenvolvimento

---

## **PASSO 1: Configurar Banco de Dados (⏱️ 5 min)**

### Opção A: Supabase (Recomendado - Free tier até 500MB)
```bash
# 1. Ir para https://supabase.com
# 2. Criar uma nova project (gratuito)
# 3. Copiar a CONNECTION STRING
# 4. Colar em .env.local:

DATABASE_URL=postgresql://[user]:[password]@[host]:5432/[db]
DIRECT_URL=postgresql://[user]:[password]@[host]:5432/[db]
```

### Opção B: Neon (Free tier até 3GB)
```bash
# 1. Ir para https://neon.tech
# 2. Sign up e criar projeto
# 3. Copiar connection string
# 4. Colar em .env.local
```

### Opção C: PostgreSQL Local (Desenvolvimento rápido)
```bash
# Instalar PostgreSQL (Windows/Mac/Linux)
# https://www.postgresql.org/download/

# Criar banco local:
psql -U postgres
CREATE DATABASE paginas_comercio;

# Em .env.local:
DATABASE_URL=postgresql://postgres:password@localhost:5432/paginas_comercio
DIRECT_URL=postgresql://postgres:password@localhost:5432/paginas_comercio
```

---

## **PASSO 2: Preparar Variáveis de Ambiente (⏱️ 3 min)**

```bash
# Copiar template para local
cp .env.example .env.local

# Editar com seus valores:
nano .env.local  # ou abrir em VS Code
```

### Variáveis Obrigatórias (para começar):
```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NextAuth (gerar random string de 32+ chars)
NEXTAUTH_SECRET=seu-random-secret-bem-longo-com-maiuscula-numero-simbolo
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Variáveis Opcionais (deixar em branco por enquanto):
```env
# Storage (configurar semana 4)
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# Payments (configurar semana 5)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

---

## **PASSO 3: Sincronizar Banco de Dados (⏱️ 5 min)**

```bash
# Gerar Prisma Client (necessário após schema.prisma changes)
npm run prisma:generate

# Criar tabelas no banco
npm run prisma:migrate dev --name init

# (Opcional) Popular com dados demo
npm run prisma:seed
```

**O que acontece:**
- ✅ Prisma cria as tabelas no banco
- ✅ Gera tipos TypeScript automáticamente
- ✅ (Opcional) Popula com 2 tenants + 3 users + 2 pages para testar

---

## **PASSO 4: Iniciar Servidor de Desenvolvimento (⏱️ 2 min)**

```bash
npm run dev
```

**Saída esperada:**
```
  ▲ Next.js 14.2.33
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1234ms
```

---

## **PASSO 5: Validar que Tudo Funciona (⏱️ 3 min)**

### No Browser:
1. Abrir http://localhost:3000 ✅
2. Deverá ver landing page com 3 cards
3. Clicar em "Entrar" e "Criar Conta" (não devem quebrar)

### Via cURL/Postman:
```bash
# Health check
curl http://localhost:3000/api/health

# Listar tenants (deve retornar JSON vazio [] ou com dados de seed)
curl http://localhost:3000/api/tenants
```

---

## ✅ Checklist Inicial

- [ ] DATABASE_URL configurada em .env.local
- [ ] NEXTAUTH_SECRET preenchida
- [ ] `npm run prisma:migrate dev` executado
- [ ] `npm run dev` rodando sem erros
- [ ] http://localhost:3000 abre no browser
- [ ] API `/api/health` retorna `{ success: true }`
- [ ] API `/api/tenants` retorna array JSON

---

## 🎯 Próximos Passos (Semana 2)

Quando banco estiver funcionando, começar em ordem:

1. **Auth Login/Register** → `app/(auth)/login`
2. **CRUD Pages** → `app/api/pages/route.ts`
3. **CRUD Users** → `app/api/users/route.ts`
4. **Admin Dashboard** → `app/(admin)/dashboard`

---

## 🐛 Troubleshooting

### ❌ "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
```

### ❌ "ECONNREFUSED - Cannot connect to database"
- Verificar DATABASE_URL em .env.local
- Verificar que PostgreSQL está rodando
- Testar conexão: `psql $DATABASE_URL`

### ❌ "Port 3000 already in use"
```bash
npm run dev -- --port 3001  # Usar outra porta
```

### ❌ "NEXTAUTH_SECRET is not valid"
```bash
# Gerar novo secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copiar output para NEXTAUTH_SECRET em .env.local
```

### ❌ Build falha com "TypeScript error"
```bash
npm run type-check  # Ver os erros específicos
rm -rf .next        # Limpar cache
npm run build       # Tentar novamente
```

---

## 📞 Precisa de Ajuda?

### Verificar logs:
```bash
# Ver erros do servidor (npm run dev já mostra)
# Ver console do browser (F12 > Console)
# Ver network requests (F12 > Network)
```

### Resetar tudo:
```bash
# Limpar banco (⚠️ deleta dados!)
npm run prisma:migrate reset

# Limpar cache e node_modules
rm -rf .next node_modules package-lock.json
npm install

# Reexecutar
npm run dev
```

---

## 🎓 Arquivos Importantes para Consultar

| Arquivo | Objetivo |
|---------|----------|
| `README.md` | Documentação geral |
| `PROJECT_STATUS.md` | Status e roadmap |
| `ARCHITECTURAL_RECOMMENDATIONS.md` | Recomendações técnicas |
| `db/prisma/schema.prisma` | Modelos de dados |
| `.env.example` | Variáveis necessárias |
| `app/page.tsx` | Landing page (home) |
| `app/api/tenants/route.ts` | Exemplo de API |

---

## ✨ Começar!

```bash
# Resuma em um comando:
cp .env.example .env.local && \
npm run prisma:generate && \
npm run prisma:migrate dev --name init && \
npm run dev
```

**Pronto! 🚀 Seu projeto está rodando!**

Próxima etapa: Abrir VS Code e começar a implementar as features da Semana 2.

