# 📍 Connection String vs CLI - Qual Você Precisa?

**O que você encontrou**: `npx neonctl@latest init`  
**O que você precisa**: Connection String

---

## 🎯 DIFERENÇA IMPORTANTE

### ❌ NÃO é o que você precisa:
```bash
npx neonctl@latest init
```
Isso é um **comando para setup local** do Neon CLI no seu PC

### ✅ O QUE VOCÊ PRECISA:
```
postgresql://neondb_owner:password@ep-cool-name.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
```
Isso é a **Connection String** do banco de dados

---

## 📋 ONDE ENCONTRAR A CONNECTION STRING NO NEON

### Passo 1: Acessa o Neon Console
```
https://console.neon.tech/
```

### Passo 2: Depois de criar o projeto
Você vai ver uma tela como:

```
┌─────────────────────────────────────────────┐
│ Quick start                                 │
├─────────────────────────────────────────────┤
│                                             │
│ Connection string                           │
│ postgresql://user:pass@host/db?ssl...      │
│                                             │
│ [Copy] ← CLICA AQUI                         │
│                                             │
└─────────────────────────────────────────────┘
```

### Passo 3: Ou via menu "Connection"
1. Clica em **"Connection"** no menu esquerdo
2. Procura por **"Connection string"**
3. Copia a URL completa

---

## 🔍 CONNECTION STRING TEM ESSE FORMATO

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require
```

**Exemplo real:**
```
postgresql://neondb_owner:AbCdEf123456@ep-cool-glance-123456.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
```

---

## 📊 O Que Procurar no Neon

**Procura por essas seções:**

| Local | O que fazer |
|-------|-----------|
| "Quick start" tab | Copia a Connection string |
| "Connection" menu | Vê todas as connection strings |
| "Database" → "Branches" | Seleciona a branch e copia |

---

## ✅ Como Saber que é a CORRETA

A connection string DEVE TER:

- [x] Começa com `postgresql://`
- [x] Tem username: `neondb_owner` ou similar
- [x] Tem password: `sua_senha_aleatória`
- [x] Tem `@ep-` (host Neon)
- [x] Tem `.us-east-1.aws.neon.tech` (ou outra region)
- [x] Tem `:5432` (porta PostgreSQL)
- [x] Tem `/neondb` (database name)
- [x] Tem `?sslmode=require` no final

---

## 🎯 PRÓXIMO PASSO

Você precisa:

1. **Abrir** https://console.neon.tech/
2. **Procurar** a aba "Quick start" ou "Connection"
3. **Copiar** a Connection string (não o comando CLI!)
4. **Colar** em um arquivo de texto temporário

---

## 📝 TEMPLATE PARA SALVAR

Quando conseguir, salva assim:

```
=== NEON DATABASE ===

Database Name: paginas-comercio-staging

CONNECTION STRING:
postgresql://neondb_owner:YOUR_PASSWORD@ep-XXXXX.us-east-1.aws.neon.tech:5432/neondb?sslmode=require

DATABASE_URL (para Vercel):
postgresql://neondb_owner:YOUR_PASSWORD@ep-XXXXX.us-east-1.aws.neon.tech:5432/neondb?sslmode=require

DIRECT_URL (para Prisma):
postgresql://neondb_owner:YOUR_PASSWORD@ep-XXXXX.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
```

---

**Conseguiu achar a Connection String?** 🔍

