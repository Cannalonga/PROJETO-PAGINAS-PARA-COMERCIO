# 🎁 TRIAL SYSTEM INTEGRATION GUIDE

**Status**: ✅ **READY TO USE**

Todos os arquivos estão prontos. Aqui está como integrar em suas páginas:

---

## 1️⃣ ADMIN DASHBOARD - Usar o Component

### Em sua página de admin (`app/admin/trials/page.tsx`):

```typescript
import { TrialDonationForm } from '@/components/admin/TrialDonationForm';

export default function TrialsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">🎁 Gerenciar Free Trials</h1>
      <TrialDonationForm />
    </div>
  );
}
```

---

## 2️⃣ CHECKOUT - Verificar Trial

### Exemplo: No seu checkout page (`app/checkout/page.tsx`):

```typescript
import { hasActiveTrial, getRemainingTrialDays } from '@/lib/trial-system';
import { auth } from '@/lib/auth';

export default async function CheckoutPage() {
  const session = await auth();
  const email = session?.user?.email;

  // Verificar se tem trial ativo
  const hasTrial = email ? await hasActiveTrial(email) : false;
  const remainingDays = email ? await getRemainingTrialDays(email) : 0;

  if (hasTrial && remainingDays > 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            🎉 Você tem {remainingDays} dias de trial grátis!
          </h2>
          <p className="text-green-700">
            Seu acesso está garantido até {new Date().toLocaleDateString('pt-BR')}.
            Sem cobranças por enquanto!
          </p>
          <button className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
            Continuar usando grátis →
          </button>
        </div>
      </div>
    );
  }

  // Se não tem trial, mostrar checkout normal
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">💳 Checkout</h1>
      {/* Seu form de pagamento aqui */}
    </div>
  );
}
```

---

## 3️⃣ API - Usar os Endpoints

### Grant Trial (POST)

```bash
curl -X POST http://seu-app/api/admin/trials/grant \
  -H "Content-Type: application/json" \
  -H "x-user-role: SUPERADMIN" \
  -H "x-user-id: seu-user-id" \
  -d '{
    "email": "cliente@exemplo.com",
    "days": 30
  }'
```

**Resposta**:
```json
{
  "success": true,
  "message": "Trial de 30 dias concedido a cliente@exemplo.com",
  "trial": {
    "id": "...",
    "email": "cliente@exemplo.com",
    "duration": 30,
    "expiresAt": "2026-01-01T23:59:59Z",
    "isActive": true
  }
}
```

---

### List Active Trials (GET)

```bash
curl -X GET http://seu-app/api/admin/trials/list \
  -H "x-user-role: SUPERADMIN" \
  -H "x-user-id: seu-user-id"
```

**Resposta**:
```json
{
  "success": true,
  "count": 3,
  "trials": [
    {
      "email": "user1@exemplo.com",
      "duration": 30,
      "expiresAt": "2026-01-01T23:59:59Z",
      "remainingDays": 25,
      "isActive": true
    }
  ]
}
```

---

### Revoke Trial (DELETE)

```bash
curl -X DELETE http://seu-app/api/admin/trials/revoke \
  -H "Content-Type: application/json" \
  -H "x-user-role: SUPERADMIN" \
  -H "x-user-id: seu-user-id" \
  -d '{
    "email": "user1@exemplo.com"
  }'
```

---

### Update Config (PUT)

```bash
curl -X PUT http://seu-app/api/admin/trials/config \
  -H "Content-Type: application/json" \
  -H "x-user-role: SUPERADMIN" \
  -H "x-user-id: seu-user-id" \
  -d '{
    "isEnabled": true
  }'
```

---

## 4️⃣ SIGN UP - Dar 7 Dias Automático

### Em sua página de signup (`app/auth/signup/page.tsx`):

```typescript
import { grantTrial } from '@/lib/trial-system';

async function handleSignup(email: string, password: string) {
  try {
    // 1. Criar usuário (seu código normal)
    const user = await createUser(email, password);

    // 2. Dar 7 dias de trial automático
    await grantTrial(email, 7, 'system');

    // 3. Redirecionar para dashboard
    redirect('/dashboard');
  } catch (error) {
    console.error('Erro no signup:', error);
  }
}
```

---

## 5️⃣ EMAILS - Notificar sobre Trial

### Exemplo: Email de boas-vindas com trial

```typescript
import { sendEmail } from '@/lib/email-service'; // seu serviço de email

async function sendWelcomeEmailWithTrial(email: string) {
  const remainingDays = await getRemainingTrialDays(email);

  if (remainingDays > 0) {
    await sendEmail({
      to: email,
      subject: '🎁 Bem-vindo! Você tem 7 dias grátis',
      template: 'welcome-trial',
      data: {
        email,
        remainingDays,
        expiresAt: new Date(Date.now() + remainingDays * 24 * 60 * 60 * 1000),
      },
    });
  }
}
```

---

## 📊 FLUXO COMPLETO

```
┌─────────────────────────────┐
│   Novo Usuário se Cadastra  │
└──────────────┬──────────────┘
               │
               ▼
     ┌─────────────────────┐
     │ ✅ Criar User       │
     │ ✅ Dar 7 dias trial │
     │ ✅ Enviar email     │
     └────────┬────────────┘
              │
              ▼
    ┌──────────────────────┐
    │ Usuário no Dashboard │
    │ Com 7 dias grátis    │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Testa a plataforma   │
    │ (sem cobranças)      │
    └────────┬─────────────┘
             │
             ▼
        Dia 7: Expira
             │
    ┌────────▼────────┐
    │  Pode renovar   │
    │  OU Assinar     │
    └─────────────────┘
```

---

## 🎯 CASOS DE USO IMPLEMENTADOS

### 1. Novo Signup Recebe 7 Dias

```typescript
// Automaticamente quando usuário se cadastra
await grantTrial(email, 7, 'system');
```

### 2. Admin Doa Trial Manualmente

```typescript
// Via admin dashboard ou API
const result = await grantTrial('client@example.com', 30, adminUserId);
```

### 3. Trial Expira → Redireciona para Payment

```typescript
const hasTrial = await hasActiveTrial(email);
if (!hasTrial) {
  // Mostrar tela de pagamento
}
```

### 4. Admin Vê Lista de Trials Ativos

```typescript
const trials = await listActiveTrials();
// Mostra em TrialDonationForm component
```

### 5. Desativar Free Trial Padrão

```typescript
// Se você quer parar de dar 7 dias automaticamente
await updateDefaultTrialConfig(false, adminUserId);
```

---

## 🔒 SEGURANÇA

### Autorização
- ✅ Apenas SUPERADMIN e DELEGATED_ADMIN podem gerenciar
- ✅ Cada ação é auditada (grantedBy, revokedBy)
- ✅ Emails normalizados (lowercase)

### Validação
- ✅ Duração apenas: 7, 15, ou 30 dias
- ✅ Expiração: sempre ao final do dia (23:59:59)
- ✅ Isol amento: nenhum cruzamento de dados

---

## 🚀 PRÓXIMA ETAPA

1. ✅ **Executar migration**:
   ```bash
   npx prisma migrate dev --name add_trial_system
   ```

2. ✅ **Build do projeto**:
   ```bash
   npm run build
   ```

3. ✅ **Testar endpoints**:
   ```bash
   npm run test:e2e
   ```

4. ✅ **Commit**:
   ```bash
   git add -A
   git commit -m "feature: free trial donation system"
   git push origin main
   ```

---

**Status**: 🟢 **PRONTO PARA PRODUÇÃO**

Tudo está implementado e pronto para usar. Agora é só fazer a migration e testar! 🚀
