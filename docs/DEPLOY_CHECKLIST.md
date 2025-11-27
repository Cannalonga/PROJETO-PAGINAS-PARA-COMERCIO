# 🚀 CHECKLIST DE DEPLOY PARA PRODUÇÃO - VITRINAFAST

Este documento deve ser seguido ANTES de fazer deploy em produção.

---

## ⚠️ PRÉ-REQUISITOS OBRIGATÓRIOS

### 1. Segurança - CRÍTICO

- [ ] **Regenerar credenciais Cloudinary** (foram expostas)
  ```
  1. Acesse https://cloudinary.com/console/settings/api-keys
  2. Clique em "Regenerate API Key"
  3. Atualize .env.local e Vercel
  ```

- [ ] **Gerar NEXTAUTH_SECRET**
  ```powershell
  # PowerShell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
  ```

- [ ] **Configurar MERCADOPAGO_WEBHOOK_SECRET**
  ```
  1. Acesse https://www.mercadopago.com.br/developers/panel/app
  2. Selecione sua aplicação
  3. Vá em "Webhooks" > Configurações
  4. Copie o "Secret key para validação"
  ```

### 2. Banco de Dados - CRÍTICO

- [ ] **Criar banco de dados de produção**
  
  **Opção A - Supabase (Recomendado - Gratuito):**
  ```
  1. Acesse https://supabase.com
  2. Crie um novo projeto
  3. Vá em Settings > Database
  4. Copie a "Connection string"
  5. Use como DATABASE_URL
  ```

  **Opção B - Vercel Postgres:**
  ```
  1. No Vercel Dashboard, vá em "Storage"
  2. Crie um novo "Postgres Database"
  3. Copie as variáveis de conexão
  ```

- [ ] **Rodar migrations**
  ```bash
  npx prisma migrate deploy
  ```

### 3. Variáveis de Ambiente na Vercel

Acesse: Vercel Dashboard > Project > Settings > Environment Variables

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `NEXTAUTH_SECRET` | (gerado acima) | Production |
| `NEXTAUTH_URL` | `https://seu-dominio.com` | Production |
| `DATABASE_URL` | (URL do Supabase/Vercel Postgres) | Production |
| `MERCADOPAGO_ACCESS_TOKEN` | `APP_USR-...` (produção!) | Production |
| `MERCADOPAGO_PUBLIC_KEY` | `APP_USR-...` | Production |
| `MERCADOPAGO_WEBHOOK_SECRET` | (do painel MP) | Production |
| `CLOUDINARY_CLOUD_NAME` | (novo após regenerar) | Production |
| `CLOUDINARY_API_KEY` | (novo após regenerar) | Production |
| `CLOUDINARY_API_SECRET` | (novo após regenerar) | Production |

---

## 📋 CHECKLIST DE DEPLOY

### Fase 1: Verificação Local (30 min)

```bash
# 1. Verificar se não há erros de TypeScript
npx tsc --noEmit

# 2. Verificar se não há erros de ESLint
npm run lint

# 3. Rodar testes
npm test

# 4. Build de produção local
npm run build

# 5. Testar build localmente
npm start
```

### Fase 2: Preparação (15 min)

- [ ] Código commitado e pushado
- [ ] Branch principal (main) limpa
- [ ] Todas variáveis configuradas na Vercel
- [ ] Domínio customizado configurado (se aplicável)

### Fase 3: Deploy (10 min)

```bash
# Se usando Vercel CLI
vercel --prod

# Ou simplesmente push para main (se CI/CD configurado)
git push origin main
```

### Fase 4: Validação Pós-Deploy (30 min)

- [ ] **Teste 1:** Acessar página inicial
- [ ] **Teste 2:** Criar uma loja de teste completa
- [ ] **Teste 3:** Fazer upload de imagem
- [ ] **Teste 4:** Acessar página pública da loja
- [ ] **Teste 5:** Simular checkout (modo sandbox)
- [ ] **Teste 6:** Verificar webhook (logs da Vercel)
- [ ] **Teste 7:** Verificar SSL (https://)
- [ ] **Teste 8:** Verificar headers de segurança

### Fase 5: Monitoramento (24h)

- [ ] Configurar alertas de erro no Vercel
- [ ] Verificar logs a cada 4 horas
- [ ] Monitorar tempo de resposta das APIs
- [ ] Verificar uso do Cloudinary (quota)
- [ ] Verificar status dos webhooks no MP

---

## 🔧 COMANDOS ÚTEIS

### Verificar status do deploy
```bash
vercel ls
```

### Ver logs em tempo real
```bash
vercel logs --follow
```

### Verificar variáveis de ambiente
```bash
vercel env ls production
```

### Fazer rollback rápido
```bash
# Ver deploys anteriores
vercel ls

# Promover deploy anterior para produção
vercel promote [deployment-url]
```

---

## ❌ O QUE NÃO FAZER

1. ❌ Deploy na sexta-feira às 17h
2. ❌ Deploy sem testar localmente
3. ❌ Deploy com credenciais de teste
4. ❌ Deploy sem backup do banco
5. ❌ Deploy sem verificar variáveis
6. ❌ Deploy com console.log de dados sensíveis

---

## 📞 CONTATOS DE EMERGÊNCIA

- **Vercel Status:** https://www.vercel-status.com/
- **Mercado Pago Status:** https://www.mercadopago.com.br/developers/pt/support
- **Cloudinary Status:** https://status.cloudinary.com/
- **Supabase Status:** https://status.supabase.com/

---

## ✅ ASSINATURAS

| Verificação | Responsável | Data | OK |
|-------------|-------------|------|-----|
| Segurança verificada | | | [ ] |
| Banco configurado | | | [ ] |
| Variáveis configuradas | | | [ ] |
| Testes passando | | | [ ] |
| Deploy autorizado | | | [ ] |
