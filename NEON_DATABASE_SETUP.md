# 🗄️ NEON DATABASE - Guia Rápido Setup

**Status**: Você está no Neon console ✅  
**Objetivo**: Criar database para staging  
**Tempo**: 5 minutos

---

## 📋 PASSO 1: Criar Novo Projeto

Na página principal do Neon:

```
[+ New Project]  ← Clica aqui
```

Ou se já tem um projeto aberto, vai em:
```
Projects → [+ New Project]
```

---

## 📋 PASSO 2: Configurar Projeto

**Preencha:**

```
Project name:
[paginas-comercio-staging]

Database name:
[neondb]  ← deixa como está

Postgres version:
[15]  ← deixa padrão

Region:
[São Paulo] ou [us-east-1] ← escolha mais próximo
```

Clica **"Create project"**

---

## 📋 PASSO 3: Aguardar Inicialização

A Neon vai criar:
- ✅ PostgreSQL database
- ✅ Username padrão
- ✅ Password seguro

Espera ~30 segundos...

---

## 📋 PASSO 4: Copiar Connection String

Quando terminar, você verá:

```
Quick start

Connection string:
postgresql://neondb_owner:seu_password@ep-cool-name.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Opção A: Copiar Connection String

1. Clica no ícone de **"Copy"** (ao lado da string)
2. Salva em um arquivo de texto temporário

**Ou**

### Opção B: Copiar DATABASE_URL e DIRECT_URL

```
DATABASE_URL=postgresql://neondb_owner:password@host:5432/neondb?sslmode=require
DIRECT_URL=postgresql://neondb_owner:password@host:5432/neondb?sslmode=require
```

---

## ✅ O Que Você Precisa

A connection string tem esse formato:

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require
```

Você vai precisar dessa string inteira para o Vercel!

---

## 🎯 Próximo Passo

Depois que tiver a connection string:

1. ✅ Neon database criada
2. → Criar Redis (Upstash)
3. → Deploy em Vercel

---

## 💾 Salvou a Connection String?

**Para confirmar que está tudo certo:**

- [ ] Projeto criado no Neon
- [ ] Connection string copiada
- [ ] String começa com `postgresql://`
- [ ] String tem `@ep-` (host Neon)
- [ ] String tem `?sslmode=require` no final

---

## 🆘 Problemas?

**Não consegue criar projeto?**
1. Verifica se fez login (canto superior direito)
2. Se não tem conta, cria uma em https://neon.tech

**Connection string não aparece?**
1. Vai em "Connection" no menu esquerdo
2. Copia a string ali

---

**Quando tiver a string, me avisa!** 🚀

