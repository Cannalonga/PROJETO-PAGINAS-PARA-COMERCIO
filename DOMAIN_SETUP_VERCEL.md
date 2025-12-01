# 🌐 APONTAR DOMÍNIO vitrineweb.online PARA VERCEL

**Data**: December 1, 2025  
**Domínio**: vitrineweb.online  
**Hosting**: Vercel  
**Tempo estimado**: 10 minutos + 24-48h de espera

---

## 🎯 O QUE VAMOS FAZER

```
Registrador (onde você comprou)
        ↓
   DNS Settings
        ↓
   Adicionar records do Vercel
        ↓
   Esperar propagar
        ↓
https://vitrinedigitalcc.online funciona! ✅
```

---

## 📋 PASSO 1: ACESSAR PAINEL VERCEL

### 1. Ir para Vercel
```
https://vercel.com/dashboard
```

### 2. Selecionar seu projeto
```
Projects → Seu projeto
```

### 3. Ir em Settings
```
Clique em "Settings" (engrenagem no topo)
```

### 4. Ir em Domains
```
Menu esquerdo → Domains
```

### 5. Adicionar novo domínio
```
Clique em "Add" ou "Add Domain"
Escreva: vitrineweb.online
Clique em "Add"
```

---

## 📝 PASSO 2: VERCEL GERA OS DNS RECORDS

Vercel vai mostrar algo assim:

```
┌─────────────────────────────────────────────────┐
│ Your domain configuration                       │
├─────────────────────────────────────────────────┤
│                                                 │
│ Name: vitrinedigitalcc.online                  │
│ Type: A                                         │
│ Value: 76.76.19.89                             │
│                                                 │
│ OR (escolha uma opção)                         │
│                                                 │
│ Name: vitrinedigitalcc.online                  │
│ Type: CNAME                                     │
│ Value: cname.vercel-dns.com                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

**COPIE ESTES VALORES!** (você vai precisar)

---

## 🔧 PASSO 3: ACESSAR REGISTRADOR (Namecheap, GoDaddy, etc)

### Onde você registrou o domínio?

**Se foi Namecheap:**
```
1. Ir em: https://www.namecheap.com/dashboard
2. Clique em "Domain List"
3. Encontre: vitrinedigitalcc.online
4. Clique em "Manage"
```

**Se foi GoDaddy:**
```
1. Ir em: https://www.godaddy.com/account
2. Encontre: vitrinedigitalcc.online
3. Clique em "Manage DNS"
```

**Se foi outro registrador:**
```
Procure por: "DNS Settings", "Name Servers", "DNS Records"
```

---

## 📍 PASSO 4: ADICIONAR DNS RECORDS

### Opção A: Usar CNAME (RECOMENDADO)

**1. Encontre a seção de DNS Records**

**2. Procure por records existentes e DELETE:**
```
❌ Delete qualquer record "CNAME" ou "A" existente
```

**3. Criar novo record CNAME**
```
Name (Host): @
Type: CNAME
Value (Points to): cname.vercel-dns.com
TTL: 3600 (ou padrão)
```

**4. Salvar e esperar propagar (24-48h)**

---

### Opção B: Usar A Record (alternativa)

**Se CNAME não funcionar:**

```
Name (Host): @
Type: A
Value: 76.76.19.89
TTL: 3600 (ou padrão)
```

---

## ✅ PASSO 5: VERIFICAR NO VERCEL

### Voltar ao Vercel

```
Settings → Domains → vitrineweb.online
```

### Status pode ser:

```
✅ Valid Configuration
   Pronto! Seu domínio está apontando

⏳ Pending Verification
   Espere 24-48h e recarregue

❌ Invalid Configuration
   Verificar se os DNS records estão corretos
```

---

## 🧪 PASSO 6: TESTAR SEU DOMÍNIO

### Depois que der "Valid Configuration"

**Abra no navegador:**
```
https://vitrineweb.online
```

**Deve mostrar sua aplicação!**

---

## 📧 PASSO 7: ATUALIZAR MERCADOPAGO

Agora que seu domínio está apontando:

### 1. Ir no painel MercadoPago
```
https://www.mercadopago.com.br/developers/panel
```

### 2. Configurações → Webhooks

**Remover webhook antigo:**
```
URL antiga: https://seu-projeto.vercel.app/api/webhooks/mercadopago
❌ Deletar
```

**Criar novo webhook:**
```
URL nova: https://vitrineweb.online/api/webhooks/mercadopago
Eventos: payment.created, payment.updated
Salvar
```

**Copiar o Webhook Secret gerado**

### 3. Atualizar .env.local
```
MERCADOPAGO_WEBHOOK_SECRET="seu-webhook-secret-novo"
```

---

## 🎨 PASSO 8: ATUALIZAR URLS NO PROJETO (opcional)

Se tiver URLs hardcoded:

```typescript
// Procure por:
https://seu-projeto.vercel.app

// Troque para:
https://vitrinedigitalcc.online

// Ou use variável de ambiente:
process.env.NEXT_PUBLIC_APP_URL
```

---

## 📋 CHECKLIST

```
☐ Registrou vitrineweb.online (✅ feito)
☐ Acessou Vercel → Settings → Domains
☐ Adicionou o domínio no Vercel
☐ Vercel gerou os DNS records
☐ Acessou registrador (Namecheap, GoDaddy, etc)
☐ Adicionou record CNAME no DNS
☐ Esperou 24-48h de propagação
☐ Testou https://vitrinedigitalcc.online
☐ Vercel mostra "Valid Configuration"
☐ Atualizou webhook no MercadoPago
☐ Adicionou MERCADOPAGO_WEBHOOK_SECRET
☐ Deploy!
```

---

## 🆘 TROUBLESHOOTING

### ❌ "Não funciona ainda"
```
Pode ser DNS não propagou ainda
Espere 24-48h
Recarregue várias vezes
```

### ❌ "ERR_INVALID_RESPONSE"
```
Verificar se DNS records estão corretos
Verificar se o record foi salvo no registrador
Tentar limpar cache: Ctrl+Shift+Delete
```

### ❌ "Certificate error"
```
HTTPS pode demorar até 24h
Vercel cria certificado automaticamente
Espere um pouco mais
```

### ❌ "Webhook retorna 403"
```
Verificar MERCADOPAGO_WEBHOOK_SECRET
Verificar se está em .env.local
Tentar: npm run dev
```

---

## ✅ QUANDO TUDO ESTIVER FUNCIONANDO

```
1. https://vitrinedigitalcc.online funciona ✅
2. Webhook recebe transações ✅
3. MercadoPago integrado ✅
4. Beta badge aparece ✅
5. Pronto para vender! 🚀
```

---

## 🎯 RESUMO

| Etapa | Ação | Tempo |
|-------|------|-------|
| 1 | Vercel → Settings → Domains | 2 min |
| 2 | Copiar DNS records | 1 min |
| 3 | Registrador → DNS Settings | 2 min |
| 4 | Adicionar record CNAME | 2 min |
| 5 | Esperar propagar | 24-48h |
| 6 | Testar domínio | 1 min |
| 7 | Atualizar MercadoPago | 2 min |
| 8 | Deploy | 2 min |

**Total ativo: ~15 minutos**  
**Total com espera: ~24-48h**

---

## 🚀 PRÓXIMO PASSO

Assim que seu domínio funcionar, você estará 100% pronto para:
```
✅ Receber pagamentos reais
✅ Ter webhook funcionando
✅ Mostrar Beta Badge profissional
✅ Começar a vender para clientes reais
```

---

**Boa sorte! Você está quase lá!** 🎉

Qual registrador você usou? (Namecheap, GoDaddy, etc?)  
Posso dar instruções mais específicas se precisar!
