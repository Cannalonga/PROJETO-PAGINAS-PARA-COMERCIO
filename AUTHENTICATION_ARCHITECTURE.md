# Arquitetura de Autenticação - VitrineFast

## 🌐 Rotas Públicas (SEM Autenticação Obrigatória)

Estas rotas são acessíveis a qualquer visitante, autenticado ou não:

```
GET /                           # Landing page (home)
GET /(public)/[slug]            # Páginas públicas por slug
GET /(public)/t/[tenantSlug]/[pageSlug]  # Páginas de loja por tenant
GET /about                      # Sobre
GET /api/public/*               # APIs públicas
```

### Como essas páginas funcionam:
- ❌ Não usam `useSession()`
- ❌ Não redirecionam para login
- ✅ Renderizam para todos os visitantes
- ✅ Podem exibir links "Entrar" e "Começar Grátis"

---

## 🔐 Rotas Protegidas (REQUEREM Autenticação)

Estas rotas forçam autenticação. Visitantes não autenticados são redirecionados para `/auth/login`:

```
GET  /dashboard                 # Dashboard do usuário
GET  /admin                     # Painel de admin
GET  /auth/change-password      # Mudar senha (apenas logado)
GET  /store/[slug]              # Loja do proprietário
POST /api/pages/*               # Criar/editar páginas
POST /api/users/*               # Gerenciar usuários
```

### Como essas páginas funcionam:
- ✅ Usam `useSession()`
- ✅ Verificam se há sessão ativa
- ✅ Redirecionam para `/auth/login?callbackUrl=/original-page` se não autenticado
- ✅ Após login, usuário é redirecionado de volta para a página original

---

## 🔑 Autenticação Setup

### SessionProvider (Global)
```tsx
// app/layout.tsx
<Providers>
  {children}
</Providers>

// components/providers.tsx
<SessionProvider>
  {children}
</SessionProvider>
```

**⚠️ Importante:** O `SessionProvider` envolve TODA a aplicação, mas isso é **normal e correto**. Ele NÃO força login - apenas fornece contexto de sessão disponível quando necessário.

### NextAuth Configuration
```tsx
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // Email + Password
    }),
  ],
  pages: {
    signIn: '/auth/login',  // Página de login customizada
  },
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60,  // 15 minutos (PATCH #4)
  },
}
```

---

## 🛡️ Segurança

### Isolamento de Rotas
- Rotas em `(public)` são servidas estaticamente
- Rotas em `(auth)` são apenas login/register
- Rotas principais requerem autenticação

### Headers de Segurança (middleware.ts)
- HSTS: Force HTTPS
- CSP: Content Security Policy (PATCH #6)
- X-Frame-Options: DENY (proteção contra clickjacking)
- Permissions-Policy: Bloqueia geolocation, microphone, etc

### Rate Limiting (lib/middleware.ts)
- Por usuário: 100 requests por minuto
- Por IP: 1000 requests por minuto

---

## ✅ Testando Acesso Público

### ✅ Estas devem funcionar SEM login:
```bash
curl https://seu-dominio.com/
curl https://seu-dominio.com/about
curl https://seu-dominio.com/[slug-da-pagina]
curl https://seu-dominio.com/t/[tenant]/[page]
```

### ❌ Estas REQUEREM login:
```bash
curl https://seu-dominio.com/dashboard
# ↓ Será redirecionado para /auth/login
```

---

## 🐛 Troubleshooting

### Problema: "Acesso negado, preciso fazer login em páginas públicas"

**Possíveis causas:**

1. **❌ Você está acessando uma rota protegida**
   - `/dashboard` - requer login ✅ (esperado)
   - `/admin` - requer login ✅ (esperado)
   - `/store/[slug]` - pode variar
   - `/setup` - check if protected

2. **❌ Cookies de sessão expirada em cache**
   - Solução: Limpar cookies do navegador
   - Dev Tools → Application → Cookies → Delete all

3. **❌ Erro no deployment**
   - Verifique se `NEXTAUTH_SECRET` está definido
   - Verifique se database está acessível
   - Verifique logs: `azd logs`

---

## 📋 Rotas por Tipo

### 📄 Páginas Estáticas (Public)
- `app/page.tsx` - Home
- `app/about/page.tsx` - Sobre
- `app/(public)/[slug]/page.tsx` - Página pública por slug
- `app/(public)/t/[tenantSlug]/[pageSlug]/page.tsx` - Página de loja

### 🔐 Páginas Protegidas (Requer Auth)
- `app/dashboard/page.tsx` - Dashboard
- `app/admin/page.tsx` - Admin
- `app/create/page.tsx` - Criar página
- `app/auth/change-password/page.tsx` - Mudar senha

### 🔑 Autenticação
- `app/auth/login/page.tsx` - Login
- `app/auth/register/page.tsx` - Registro

---

## 🚀 Deploy

### Variáveis de Ambiente Necessárias
```env
NEXTAUTH_SECRET=seu-secret-aleatorio
NEXTAUTH_URL=https://seu-dominio.com
DATABASE_URL=postgresql://...
```

### Verificar Deploy
```bash
azd up
# Verificar se páginas públicas estão acessíveis
curl https://seu-dominio.com/
# Verificar se /dashboard redireciona para login
curl https://seu-dominio.com/dashboard -L
```

---

## 📝 Notas

- ✅ Todas as páginas com `(public)` são public-first
- ✅ `SessionProvider` é global mas não força login
- ✅ `useSession()` é chamado apenas em rotas protegidas
- ✅ Headers de segurança aplicados a TODAS as rotas
- ✅ Rate limiting ativo em APIs

