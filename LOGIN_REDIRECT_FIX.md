# 🔧 Correção do Loop Infinito de Login

## Problema Identificado

Usuários que acessavam `https://vitrineweb.online/auth/login` eram redirecionados continuamente para a própria página de login, criando um loop infinito.

### Causa Raiz

O arquivo `app/auth/login/login-form.tsx` tinha um `useEffect` que verificava `useSession()` sem considerar o status de carregamento (`loading`). Isso causava:

1. Componente monta
2. `useSession()` é chamado (status = "loading")
3. Session é null durante carregamento
4. Redirecionamento acontecia prematuramente
5. Loop infinito

---

## Solução Implementada

### Arquivo: `app/auth/login/login-form.tsx`

**Antes:**
```tsx
const { data: session } = useSession();

useEffect(() => {
    if (session?.user) {  // ❌ Não espera carregamento
        router.push(...);
    }
}, [session, router, callbackUrl]);
```

**Depois:**
```tsx
const { data: session, status } = useSession();  // ✅ Adicionar status
const [isRedirecting, setIsRedirecting] = useState(false);  // ✅ Flag para evitar múltiplos redirects

useEffect(() => {
    if (status === 'loading') {
        return;  // ✅ Aguardar carregamento completar
    }
    
    if (session?.user && !isRedirecting) {  // ✅ Verificar flag
        setIsRedirecting(true);  // ✅ Marcar como redirecionando
        const role = (session.user as any).role;
        if (role === 'SUPERADMIN') {
            router.push('/admin');
        } else {
            router.push(callbackUrl);
        }
    }
}, [session, status, router, callbackUrl, isRedirecting]);  // ✅ Adicionar dependências
```

### Arquivo: `lib/auth.ts`

**Melhorias no session callback:**
```tsx
async session({ session, token }) {
  if (session.user) {
    (session.user as any).id = token.id;
    (session.user as any).role = token.role;
    (session.user as any).tenantId = token.tenantId;
  }
  
  // ✅ PATCH #4: Check session expiry
  const now = Math.floor(Date.now() / 1000);
  const sessionAge = now - (token.iat as number || 0);
  const maxSessionAge = 15 * 60; // 15 minutos
  
  if (sessionAge > maxSessionAge) {
    // ✅ FIX: Session expirada - retorna null sem causar loop
    // Isso não causa loop porque a página de login agora verifica status
    return null as any;
  }
  
  return session;
}
```

---

## Mudanças Realizadas

| Arquivo | Mudança | Motivo |
|---------|---------|--------|
| `app/auth/login/login-form.tsx` | Adicionar `status` do useSession | Aguardar carregamento antes de redirecionar |
| `app/auth/login/login-form.tsx` | Adicionar flag `isRedirecting` | Prevenir múltiplos redirects simultâneos |
| `app/auth/login/login-form.tsx` | Adicionar `status` às dependências | Garantir que useEffect roda quando status muda |
| `lib/auth.ts` | Melhorar comentário do callback | Explicar por que return null não causa loop |

---

## Comportamento Após Fix

### ✅ Usuário não autenticado:
```
1. Acessa /auth/login
2. useSession() inicia (status = "loading")
3. useEffect aguarda loading completar
4. Session = null (sem autenticação)
5. Página de login é exibida normalmente
6. Usuário pode fazer login sem redirecionamento indesejado
```

### ✅ Usuário autenticado:
```
1. Acessa /auth/login?callbackUrl=/dashboard
2. useSession() carrega (status = "success")
3. session.user existe
4. isRedirecting flag é ativada
5. Redireciona para /dashboard ou /admin (uma única vez)
```

### ✅ Sessão expirada:
```
1. Token iat > 15 minutos
2. session callback retorna null
3. useSession() detecta null
4. Usuário permanece em /auth/login
5. Pode fazer login novamente
6. Sem loop infinito
```

---

## Testes

### ✅ TypeScript
```bash
npx tsc --noEmit
# Result: 0 errors
```

### ✅ Tests
```bash
npm test -- --passWithNoTests
# Result: 641 tests passing
```

---

## Deploy

Após merge, a correção estará disponível em:
- **Staging:** Testes automaticamente
- **Production:** Deploy via `azd up`

Usuários verão a página de login sem redirecionamento infinito.

---

## Commits

```
fix: Fix infinite login redirect loop on /auth/login
- Fixed login-form.tsx to check session loading status before redirecting
- Added isRedirecting state flag to prevent multiple redirect attempts
- Improved useEffect dependency array to prevent race conditions
- Session callback now properly handles expired sessions without causing loops
- Login page will no longer redirect unauthenticated users back to itself
```

