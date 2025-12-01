# 🔗 CONFIGURAR WEBHOOK MERCADOPAGO + CREDENCIAIS PRODUÇÃO

**Data**: December 1, 2025  
**Status**: Aguardando DNS propagar (24-48h)  
**Objetivo**: Integrar MercadoPago em produção com novo domínio

---

## 📋 PASSO 1: ACESSAR PAINEL MERCADOPAGO

### 1. Ir para o painel
```
https://www.mercadopago.com.br/developers/panel
```

### 2. Fazer login com sua conta

### 3. Ir em "Credentials" ou "Credenciais"
```
Menu → Credentials
```

---

## 🔑 PASSO 2: OBTER CREDENCIAIS DE PRODUÇÃO

### Você verá algo assim:

```
┌─────────────────────────────────┐
│ PRODUCTION                      │
├─────────────────────────────────┤
│ Access Token: APP_USR-...       │
│ Public Key: APP_USR-pub-...     │
└─────────────────────────────────┘
```

### **COPIE ESTES 2 VALORES:**

**Access Token:**
```
APP_USR-[números longos]
```

**Public Key:**
```
APP_USR-pub-[números longos]
```

---

## 🎯 PASSO 3: ADICIONAR CREDENCIAIS NO `.env.local`

### Abra seu arquivo `.env.local` e adicione:

```bash
# MercadoPago Production Credentials
MERCADOPAGO_ACCESS_TOKEN="APP_USR-[cole aqui o access token]"
MERCADOPAGO_PUBLIC_KEY="APP_USR-pub-[cole aqui o public key]"

# App URL (será usado no webhook)
NEXT_PUBLIC_APP_URL="https://vitrineweb.online"
```

### ⚠️ **NUNCA** commit `.env.local` no Git!
```
Ele já deve estar no .gitignore
```

---

## 🔐 PASSO 4: CONFIGURAR WEBHOOK NO MERCADOPAGO

### **IMPORTANTE**: Espere o domínio propagar primeiro!

Quando `vitrineweb.online` estiver funcionando:

### 1. Ir em Settings → Webhooks
```
https://www.mercadopago.com.br/developers/panel/webhooks
```

### 2. Remover webhook antigo (se existir)
```
URL antiga: https://seu-projeto.vercel.app/api/webhooks/mercadopago
❌ Clique em "Delete" ou "Remover"
```

### 3. Criar novo webhook
```
Clique em "Create New Webhook" ou "Novo Webhook"
```

### 4. Preencher dados:
```
URL: https://vitrineweb.online/api/webhooks/mercadopago

Eventos:
☑️ payment.created
☑️ payment.updated
☑️ payment.failed
☑️ order.completed
```

### 5. Salvar
```
Clique em "Save" ou "Salvar"
```

### 6. **COPIAR O WEBHOOK SECRET**
```
MP vai gerar um secret (parece com: "123abc456def789ghi...")
COPIE ESTE VALOR!
```

---

## 📝 PASSO 5: ADICIONAR WEBHOOK SECRET NO `.env.local`

```bash
# MercadoPago Webhook
MERCADOPAGO_WEBHOOK_SECRET="[cole aqui o secret do webhook]"
```

### Seu `.env.local` agora deve ter:

```bash
# MercadoPago Production
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
MERCADOPAGO_PUBLIC_KEY="APP_USR-pub-..."
MERCADOPAGO_WEBHOOK_SECRET="webhook-secret-..."
NEXT_PUBLIC_APP_URL="https://vitrineweb.online"
```

---

## ✅ PASSO 6: VERIFICAR WEBHOOK

### 1. Voltar ao painel MercadoPago
```
Settings → Webhooks
```

### 2. Procurar pelo webhook novo
```
https://vitrineweb.online/api/webhooks/mercadopago
```

### 3. Clicar para ver detalhes
```
Deve mostrar eventos enviados
Se nenhum erro, está funcionando! ✅
```

---

## 🚀 PASSO 7: ATUALIZAR CÓDIGO (se necessário)

### Verificar `lib/mercadopago.ts`

O código já deve estar pronto para usar as variáveis:

```typescript
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});
```

### Se tiver URLs hardcoded, atualizar para:

```typescript
const webhookUrl = process.env.NEXT_PUBLIC_APP_URL + 
  '/api/webhooks/mercadopago';
```

---

## 🧪 PASSO 8: TESTAR LOCALMENTE

### 1. Rodar em desenvolvimento
```bash
npm run dev
```

### 2. Abrir seu site
```
https://vitrineweb.online
```

### 3. Testar checkout MercadoPago
```
Use cartão de teste: 4111 1111 1111 1111
Validade: 11/25
CVC: 123
```

### 4. Verificar webhook
```
Dashboard MercadoPago → Webhooks
Deve mostrar evento "payment.created"
```

---

## 🌐 PASSO 9: FAZER PUSH PARA GITHUB

```bash
# Não inclua .env.local (já está no .gitignore)
git add -A
git commit -m "prod: mercadopago production credentials + webhook"
git push origin main
```

### Vercel vai fazer deploy automático! ✅

---

## ✨ PASSO 10: ADICIONAR BETA BADGE (opcional mas recomendado)

### 1. Abrir `app/page.tsx` (ou sua landing page)

### 2. Adicionar import
```typescript
import { BetaBadge } from '@/components/BetaBadge';
```

### 3. Adicionar componente
```typescript
export default function Home() {
  return (
    <>
      <BetaBadge variant="banner" />
      <main>
        {/* seu conteúdo */}
      </main>
    </>
  );
}
```

### 4. Commit
```bash
git add app/page.tsx
git commit -m "feat: add beta badge to landing"
git push origin main
```

---

## 📋 CHECKLIST FINAL

```
☐ Nameservers do Vercel configurados no Hostinger (✅ feito)
☐ Esperou 24-48h para DNS propagar
☐ Testou: https://vitrineweb.online (funciona)
☐ Vercel mostra "Valid Configuration"
☐ Copiou Access Token de produção do MercadoPago
☐ Copiou Public Key de produção do MercadoPago
☐ Adicionou credenciais no .env.local
☐ Criou novo webhook no MercadoPago
☐ Copiou webhook secret
☐ Adicionou webhook secret no .env.local
☐ Testou checkout com cartão de teste
☐ Verificou webhook recebendo eventos
☐ Fez push para GitHub (deploy automático)
☐ Adicionou Beta Badge (opcional)
```

---

## 🎯 RESULTADO FINAL

Quando tudo estiver pronto:

```
✅ https://vitrineweb.online funciona
✅ MercadoPago conectado com credenciais PROD
✅ Webhook recebendo transações reais
✅ Beta Badge mostrando "Em Desenvolvimento"
✅ Pronto para começar a vender! 🎉
```

---

## 🆘 TROUBLESHOOTING

### ❌ "Webhook não recebe eventos"
```
1. Verificar se .env.local tem MERCADOPAGO_WEBHOOK_SECRET
2. Verificar se URL no webhook é https://vitrineweb.online/...
3. Verificar se deploy foi feito (git push)
4. Testar: npm run dev (local)
```

### ❌ "Erro ao processar pagamento"
```
1. Verificar Access Token está correto
2. Verificar se é token PROD (APP_USR-...)
3. Recarregar página e tentar novamente
4. Verificar console do navegador (F12)
```

### ❌ "Cartão de teste não funciona"
```
Use exatamente:
- Número: 4111 1111 1111 1111
- Validade: 11/25 (ou qualquer futura)
- CVC: 123
- Email: qualquer@email.com
```

---

## 📞 PRÓXIMOS PASSOS

Depois que tudo funcionar:

1. ✅ Testar com pagamentos reais (valores baixos)
2. ✅ Verificar transações no dashboard MercadoPago
3. ✅ Validar que webhook registra tudo
4. ✅ Começar a divulgar seu site
5. ✅ Ganhar dinheiro! 💰

---

## ⏰ TIMELINE

| Etapa | Status | Tempo |
|-------|--------|-------|
| DNS propagar | ⏳ Em andamento | 24-48h |
| Verificar domínio | ⏳ Depois | 5 min |
| Configurar MercadoPago | ⏳ Depois | 10 min |
| Fazer push + deploy | ⏳ Depois | 5 min |
| Testar pagamento | ⏳ Depois | 10 min |

---

**Você está MUITO PERTO! Apenas aguarde o DNS propagar!** 🚀

Quando o domínio funcionar, é só seguir este guia que terá tudo rodando em PRODUÇÃO! 🎉
