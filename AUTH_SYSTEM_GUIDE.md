# 🔐 SISTEMA DE AUTENTICAÇÃO - GUIA COMPLETO

## 👤 SUAS CREDENCIAIS ADMIN

```
Email Principal:    rafaelcannalonga2@hotmail.com
Email Secundário:   l2requests@gmail.com (confirmação de mudanças)
Senha Inicial:      123456
Role:               SUPERADMIN (acesso total)
Status:             Ativo ✅
```

---

## 🔄 FLUXO DE MUDANÇA DE SENHA

### Passo 1: Solicitar Mudança
```bash
POST /api/auth/change-password
Content-Type: application/json

{
  "currentPassword": "123456",
  "newPassword": "MinhaNovaS3nh@F0rt3"
}
```

**Resposta sucesso:**
```json
{
  "success": true,
  "message": "Confirmação enviada para l2requests@gmail.com. Clique no link para confirmar a mudança de senha."
}
```

### Passo 2: Verificar Email Secundário
Você receberá um email em `l2requests@gmail.com` com:
- Assunto: "Confirmação de Alteração de Senha - VitrineFast"
- Link: `http://localhost:3000/api/auth/confirm-password-change?token=XXX`
- Aviso: "Este link expira em 1 hora"

### Passo 3: Confirmar via Email (Automático)
Clique no link ou execute manualmente:

```bash
POST /api/auth/confirm-password-change
Content-Type: application/json

{
  "token": "token-recebido-no-email",
  "newPassword": "MinhaNovaS3nh@F0rt3"
}
```

**Resposta sucesso:**
```json
{
  "success": true,
  "message": "Senha alterada com sucesso! Faça login novamente."
}
```

### Passo 4: Login com Nova Senha
```
Email: rafaelcannalonga2@hotmail.com
Senha: MinhaNovaS3nh@F0rt3
```

---

## 📧 FLUXO DE EMAILS (TODO - IMPLEMENTAR)

### Email 1: Notificação em Email Principal
```
Para: rafaelcannalonga2@hotmail.com
Assunto: Solicitação de Mudança de Senha

Olá Rafael,

Uma solicitação de mudança de senha foi iniciada em sua conta.

Se foi você, por favor confirme clicando no link abaixo:
[Confirmar Mudança de Senha]

Se não foi você, ignore este email.

Válido por: 1 hora
Enviado em: [timestamp]
```

### Email 2: Confirmação em Email Secundário (OBRIGATÓRIO)
```
Para: l2requests@gmail.com
Assunto: Confirmação de Alteração de Senha - VitrineFast

Olá Rafael,

Para confirmar a mudança de senha da sua conta, clique no link abaixo:

[Confirmar Mudança de Senha]
http://localhost:3000/api/auth/confirm-password-change?token=XXX

Este link expira em 1 hora.

Código do token (se o link não funcionar):
XXX

Não solicitou mudança? Ignore este email.

VitrineFast
```

---

## 🔒 SEGURANÇA IMPLEMENTADA

| Camada | Proteção | Status |
|--------|----------|--------|
| **Senha** | Hashed com bcryptjs (12 rounds) | ✅ |
| **Tokens** | SHA256 hash (nunca armazenado em plain text) | ✅ |
| **Expiração** | 1 hora para confirmar | ✅ |
| **Verificação dupla** | Email principal + secundário | ✅ |
| **Validação** | Senha atual obrigatória | ✅ |
| **Auditoria** | `lastPasswordChangeAt` registrado | ✅ |
| **Rate Limit** | TODO - implementar em Phase 2 | ⏳ |

---

## 🗄️ BANCO DE DADOS - CAMPOS NOVOS

Adicionados ao modelo `User`:

```prisma
// Email secundário (para confirmação)
secondaryEmail String? @db.VarChar(255)
secondaryEmailVerified Boolean @default(false)

// Reset de senha
passwordResetToken String? @db.VarChar(500)
passwordResetExpires DateTime?

// Audit
lastPasswordChangeAt DateTime?
```

---

## 📋 IMPLEMENTAÇÃO PENDENTE

### 1. Email Service Integration
Escolha um dos seguintes:
- **Sendgrid** (recomendado - 100 emails/dia free)
- **Mailgun** (free tier generoso)
- **AWS SES** (barato em escala)
- **Resend** (feito para Next.js)

**Arquivo a criar:**
```typescript
lib/email.ts
// sendPasswordChangeEmail(email: string, token: string)
// sendPasswordChangeConfirmation(email: string)
```

### 2. Frontend - Página de Mudança de Senha
```
/app/settings/change-password/page.tsx

Componentes:
- Form com "Senha Atual" e "Nova Senha"
- Validação em tempo real
- Modal de confirmação
- Status após envio
```

### 3. Frontend - Link de Confirmação
```
/app/auth/confirm-password/page.tsx

Fluxo:
- Extrai token da URL
- Mostra form com "Confirmar Nova Senha"
- Valida e confirma
- Redireciona para login
```

---

## 🧪 TESTES MANUAIS

### Teste 1: Criar Usuário Admin
```sql
-- Executar CREATE_ADMIN_RAFAEL.sql no Supabase
-- Verificar se user foi criado com ambos os emails
SELECT * FROM "User" WHERE email = 'rafaelcannalonga2@hotmail.com';
```

✅ Esperado: 1 row com `secondaryEmail = 'l2requests@gmail.com'`

### Teste 2: Fazer Login
```
URL: http://localhost:3000/auth/login
Email: rafaelcannalonga2@hotmail.com
Senha: 123456
```

✅ Esperado: Login funciona → Redireciona para dashboard

### Teste 3: Chamar API de Mudança (sem email enviado ainda)
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "123456",
    "newPassword": "Test1234"
  }'
```

✅ Esperado: 
```json
{
  "success": true,
  "message": "Confirmação enviada para l2requests@gmail.com..."
}
```

### Teste 4: Confirmar Mudança (mock token)
```bash
curl -X POST http://localhost:3000/api/auth/confirm-password-change \
  -H "Content-Type: application/json" \
  -d '{
    "token": "seu-token-aqui",
    "newPassword": "Test1234"
  }'
```

✅ Esperado: Token inválido (porque email service não foi implementado ainda)

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ **Hoje:** Criar usuário admin no Supabase
2. ✅ **Hoje:** Fazer login funcionar
3. ⏳ **Phase 2:** Integrar email service
4. ⏳ **Phase 2:** Criar frontend para mudança de senha
5. ⏳ **Phase 2:** Implementar rate limiting

---

## 📞 SUPORTE

**Dúvidas sobre os fluxos?**

- `change-password`: Válida senha atual, gera token
- `confirm-password-change`: Valida token, atualiza senha
- Emails: Enviados para ambos (implementar depois)

---

**Status:** ✅ Backend pronto | ⏳ Email service pending | ⏳ Frontend pending

**Data:** 30 de Novembro 2025  
**Versão:** 1.0.0
