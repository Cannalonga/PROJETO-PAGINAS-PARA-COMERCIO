# 🔐 MERCADOPAGO - SETUP PRODUCTION READY

**Objetivo**: Trocar de TEST keys para APP_USR (Production)

---

## 📋 PASSO 1: ACESSAR O PAINEL MERCADOPAGO

### 1. Ir para o Dashboard
```
https://www.mercadopago.com.br/developers/panel/app
```

### 2. Login (use sua conta)
```
Email: [sua conta MP]
Senha: [sua senha]
```

### 3. Selecione sua Aplicação
```
Se não tiver criado ainda:
  → "Criar Novo App"
  → Nome: "Páginas para Comércio"
  → Tipo: "E-commerce"
```

---

## 🔑 PASSO 2: COLETAR CREDENCIAIS

### A) Access Token (o mais importante)

```
1. No painel, vá para: Configurações → Credenciais
2. Procure por: "Access Token"
3. Tipos:
   ✅ TEST-... (Desenvolvimento/Teste)
   ✅ APP_USR-... (Produção)

4. COPIAR O TOKEN APP_USR-...
   Exemplo: APP_USR-1234567890abcdefghijklmnopqrstuvwxyz
```

### B) Public Key

```
1. Na mesma aba: Configurações → Credenciais
2. Procure por: "Public Key"
3. Tipos:
   ✅ TEST-... (Desenvolvimento)
   ✅ APP_USR-... (Produção)

4. COPIAR O PUBLIC KEY APP_USR-...
   Exemplo: APP_USR-pub-1234567890abcdefghijklmnopqrstuvwxyz
```

### C) Webhook Secret

```
1. Vá para: Configurações → Webhooks
2. Clique em "Criar Novo Webhook"
3. URL: https://seu-dominio.com/api/webhooks/mercadopago
4. Events para marcar:
   ✅ payment.created
   ✅ payment.updated
   ✅ payment.completed
   ✅ plan.updated

5. Após salvar, o sistema gera um "Secret Token"
6. COPIAR esse token
   Exemplo: 1234567890abcdefghijklmnopqrstu
```

---

## 📝 PASSO 3: ATUALIZAR SEU `.env.local`

Abra o arquivo `.env.local` na raiz do projeto:

```dotenv
# MERCADOPAGO - PRODUCTION
MERCADOPAGO_ACCESS_TOKEN="APP_USR-COPIE-AQUI-O-TOKEN-DO-PAINEL"
MERCADOPAGO_PUBLIC_KEY="APP_USR-pub-COPIE-AQUI-A-PUBLIC-KEY"
MERCADOPAGO_WEBHOOK_SECRET="COPIE-AQUI-O-WEBHOOK-SECRET"
```

**Exemplo real (FAKE - não funciona):**
```dotenv
MERCADOPAGO_ACCESS_TOKEN="APP_USR-1234567890abcdefghijklmnopqrstuvwxyz-fake"
MERCADOPAGO_PUBLIC_KEY="APP_USR-pub-1234567890abcdefghijklmnopqrstuvwxyz-fake"
MERCADOPAGO_WEBHOOK_SECRET="wx1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6-fake"
```

---

## ✅ PASSO 4: TESTAR A INTEGRAÇÃO

### 1. Reiniciar o servidor
```bash
npm run dev
```

### 2. Tentar fazer um checkout
```
Ir para: http://localhost:3000/checkout
Selecionar um plano
Clicar em "Assinar"
```

### 3. Verificar no Painel MercadoPago
```
Ir para: Painel → Vendas → Transações
Deve aparecer uma transação com status PENDING ou COMPLETED
```

### 4. Testar Webhook
```
Painel → Webhooks → Clique no webhook
→ "Testar Envio"
Deve receber com sucesso (código 200)
```

---

## 🚨 CHECKLIST PRE-LAUNCH

- [ ] Access Token `APP_USR-...` configurado em `.env.local`
- [ ] Public Key `APP_USR-pub-...` configurado
- [ ] Webhook Secret gerado e salvo
- [ ] Webhook URL configurada: `https://seu-dominio.com/api/webhooks/mercadopago`
- [ ] Webhook testado com sucesso
- [ ] Transação de teste realizada e aparece no painel
- [ ] Email de confirmação de pagamento foi enviado
- [ ] Supabase registrou a transação no banco

---

## 🔒 SEGURANÇA - ANTES DE PUBLICAR

### 1. **NÃO commitar `.env.local` no Git**
```bash
# Verificar se está no .gitignore
cat .gitignore | grep env.local
# Deve mostrar: *.env.local
```

### 2. **Usar Environment Variables no Vercel/Hosting**
```
Se usar Vercel:
  1. Painel Vercel → Seu projeto
  2. Settings → Environment Variables
  3. Adicionar:
     MERCADOPAGO_ACCESS_TOKEN = APP_USR-...
     MERCADOPAGO_PUBLIC_KEY = APP_USR-pub-...
     MERCADOPAGO_WEBHOOK_SECRET = webhook-secret
  4. Deploy
```

### 3. **Limpar histórico Git (se commitou sem querer)**
```bash
# Ver se foi commitado
git log --all --oneline | grep env

# Se foi, remover com:
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local' \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 🧪 MODO TESTE vs PRODUÇÃO

### TEST Mode (o que você está)
```
✅ Pode fazer múltiplos testes
✅ Não cobra cartão de verdade
✅ Transações aparecem como "PENDING"
✅ Bom para desenvolver

Token começa com: TEST-...
```

### PRODUÇÃO (o que você quer)
```
✅ Cobra cartões de verdade
✅ Transações aparecem como "COMPLETED"
✅ Seu dinheiro entra na conta
✅ Pronto para clientes reais

Token começa com: APP_USR-...
```

---

## 📱 WEBHOOK TESTING (Importante!)

Seu webhook está em: `app/api/webhooks/mercadopago/route.ts`

Ele recebe eventos assim:

```json
{
  "id": "123456789",
  "type": "payment",
  "data": {
    "id": "1234567890"
  }
}
```

Para testar:
```bash
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -H "x-signature: test-signature" \
  -d '{
    "type": "payment",
    "data": {"id": "123456789"}
  }'
```

---

## 💡 TROUBLESHOOTING

### ❌ "Token não reconhecido"
→ Copiar token completo do painel (sem espaços)

### ❌ "Webhook retornando 403"
→ Verificar se `MERCADOPAGO_WEBHOOK_SECRET` está correto

### ❌ "Transação não aparece"
→ Esperar 30 segundos, recarregar painel MP

### ❌ "Erro no checkout"
→ Verificar console do navegador + `npm run build`

---

## ✅ QUANDO TIVER TUDO PRONTO

1. Access Token ✅
2. Public Key ✅
3. Webhook Secret ✅
4. `.env.local` atualizado ✅
5. Webhook testado ✅

**Você está PRODUCTION READY!** 🚀

---

**Tempo estimado**: 15-20 minutos  
**Dificuldade**: Muito fácil (3/10)  
**Risco**: Nenhum (TEST mode é seguro)
