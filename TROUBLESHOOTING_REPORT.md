# 📋 RELATÓRIO DE TROUBLESHOOTING - VitrinaFast

**Data:** 29 de Novembro de 2025  
**Projeto:** PROJETO-PAGINAS-PARA-COMERCIO  
**Branch:** main  
**Repositório:** https://github.com/Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO

---

## 🎯 RESUMO EXECUTIVO

O projeto está funcional na **produção (Vercel)**, mas há problemas no **ambiente de desenvolvimento local** relacionados à criação de lojas. A conexão com o banco de dados foi corrigida, mas há inconsistências entre os dados da sessão do NextAuth e os registros no banco de dados.

---

## ✅ O QUE ESTÁ FUNCIONANDO

### Produção (Vercel)
- ✅ Deploy funcionando
- ✅ Site acessível
- ✅ Cloudinary configurado para upload de imagens

### Desenvolvimento Local
- ✅ Servidor Next.js inicia corretamente (porta 3000)
- ✅ Conexão com Supabase PostgreSQL funcionando
- ✅ Autenticação (login) funcionando
- ✅ Página de setup carrega
- ✅ Upload de imagens com zoom/rotação funcionando
- ✅ Criação do Tenant/Store no banco funciona

---

## ❌ PROBLEMA ATUAL IDENTIFICADO

### Erro Principal: `Record to update not found` (Código P2025)

**Arquivo:** `app/api/stores/route.ts` (linha 64)

**O que acontece:**
1. Usuário faz login com `admin@teste`
2. Sessão é criada com um `session.id` 
3. Usuário preenche formulário e clica "Publicar"
4. Store é criada com SUCESSO no banco (ex: `cmiket1b50000v89ykw88olro`)
5. ❌ FALHA ao vincular usuário: `prisma.user.update({ where: { id: session.id } })` não encontra o registro

**Causa Raiz:**
O `session.id` da sessão NextAuth **NÃO corresponde** a nenhum usuário na tabela `User` do banco de dados. Isso pode ter ocorrido porque:
- O usuário foi criado em uma sessão anterior com credenciais de teste
- O banco foi resetado/limpo mas os cookies de sessão permaneceram
- Há divergência entre o ID do JWT e o ID real no banco

**Logs do Servidor:**
```
[API/STORES] Creating store for user: admin@teste
[API/STORES] Store created: cmiket1b50000v89ykw88olro
prisma:error Record to update not found.
[API/STORES] Erro ao criar página: PrismaClientKnownRequestError: P2025
```

---

## 🔧 SOLUÇÕES PROPOSTAS

### Solução 1: Limpar Cookies e Refazer Login (RECOMENDADA)
1. Abra Chrome DevTools (F12)
2. Application → Cookies → localhost
3. Delete todos os cookies
4. Faça login novamente
5. O NextAuth criará um novo usuário se necessário

### Solução 2: Verificar/Criar Usuário no Banco
Execute no Supabase SQL Editor:
```sql
-- Ver usuários existentes
SELECT id, email, role, "tenantId" FROM "User";

-- Se não existir, criar manualmente
INSERT INTO "User" (id, email, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'cuid_gerado_aqui',
  'admin@teste',
  '$2a$10$...hash_da_senha...',
  'SUPERADMIN',
  true,
  NOW(),
  NOW()
);
```

### Solução 3: Modificar Código para Auto-Criar Usuário
Alterar `app/api/stores/route.ts` para verificar se usuário existe antes de atualizar:
```typescript
// Antes de atualizar, verificar se existe
const existingUser = await prisma.user.findUnique({
  where: { id: session.id }
});

if (!existingUser) {
  // Criar usuário se não existir
  await prisma.user.create({
    data: {
      id: session.id,
      email: session.email,
      tenantId: store.id,
      role: 'SUPERADMIN',
    }
  });
} else {
  // Atualizar se existir
  await prisma.user.update({
    where: { id: session.id },
    data: { tenantId: store.id, role: 'SUPERADMIN' }
  });
}
```

---

## 📁 ARQUIVOS IMPORTANTES

### Configuração de Ambiente

**`.env.local`** (Desenvolvimento):
```env
DATABASE_URL="<SET_IN_ENVIRONMENT_VARIABLES>"
DIRECT_URL="<SET_IN_ENVIRONMENT_VARIABLES>"
NEXTAUTH_SECRET="<SET_IN_ENVIRONMENT_VARIABLES>"
NEXTAUTH_URL="http://localhost:3000"
REDIS_DISABLED="true"
CLOUDINARY_CLOUD_NAME="<SET_IN_ENVIRONMENT_VARIABLES>"
CLOUDINARY_API_KEY="<SET_IN_ENVIRONMENT_VARIABLES>"
CLOUDINARY_API_SECRET="<SET_IN_ENVIRONMENT_VARIABLES>"
```

### Arquivos Modificados na Sessão
1. **`lib/auth/with-auth-handler.ts`** - Corrigido para não exigir tenant em rotas de criação
2. **`components/ImageCropper.tsx`** - Melhorado com zoom, rotação e aspect ratio
3. **`app/api/upload/route.ts`** - Suporte a mais formatos de imagem

---

## 🗄️ INFORMAÇÕES DO BANCO DE DADOS

**Supabase Project ID:** `cpkefbgvvtxguhedhoqi`  
**Região:** `us-east-2`  
**Pooler Host:** `aws-1-us-east-2.pooler.supabase.com`  
**Porta Session:** `5432`  
**Porta Transaction:** `6543`  
**Senha Atual:** `<REVOGADA - USE NOVA SENHA DO SUPABASE>`

### Tabelas Principais
- `Tenant` - Lojas/Negócios
- `User` - Usuários
- `Page` - Páginas das vitrines
- `Photo` - Fotos dos produtos

---

## 🔄 PRÓXIMOS PASSOS

1. **URGENTE:** Sincronizar usuários no banco com sessões NextAuth
2. Verificar se a tabela `User` tem o email `admin@teste`
3. Se não existir, criar o usuário manualmente ou implementar auto-criação
4. Testar fluxo completo de criação de loja
5. Atualizar variáveis de ambiente no Vercel se necessário

---

## 📞 COMANDOS ÚTEIS

```powershell
# Iniciar servidor de desenvolvimento
cd "c:\Users\rafae\Desktop\PROJETOS DE ESTUDOS\PROJETO PÁGINAS DO COMERCIO LOCAL\PAGINAS PARA O COMERCIO APP"
npm run dev

# Regenerar Prisma Client
npx prisma generate

# Ver schema do banco
npx prisma studio

# Resetar banco (CUIDADO - apaga dados!)
npx prisma migrate reset
```

---

## 🐛 OUTROS PROBLEMAS CONHECIDOS

### 1. JWT_SESSION_ERROR (Cookies Antigos)
- **Causa:** Cookies de sessão com secret antigo
- **Solução:** Limpar cookies do navegador

### 2. "unexpected message from server" (Intermitente)
- **Causa:** Conexão com pooler do Supabase instável
- **Solução:** Usar porta 5432 (Session) em vez de 6543 (Transaction)

### 3. CSP blocking blob: images
- **Status:** ✅ RESOLVIDO
- **Arquivo:** `next.config.js` - adicionado `blob:` em img-src

---

## 📊 HISTÓRICO DE ALTERAÇÕES (29/11/2025)

| Hora | Alteração | Status |
|------|-----------|--------|
| -- | Problema: `.env` exposto no GitHub | ✅ Resolvido - Secrets removidos |
| -- | Vercel deployment errors | ✅ Resolvido |
| -- | Senha do banco resetada múltiplas vezes | ✅ Revogada - Use nova |
| -- | ImageCropper com zoom/rotação | ✅ Funcionando |
| -- | Conexão banco (pooler vs direct) | ✅ Usando porta 5432 |
| -- | Erro 404/500 em /api/stores | 🔄 Em andamento |

---

**Última atualização:** 29/11/2025
**Autor:** GitHub Copilot
