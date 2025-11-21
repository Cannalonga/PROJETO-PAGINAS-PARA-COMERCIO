# 🔴 UPSTASH REDIS - Guia Rápido Setup

**Status**: Você vai para Upstash agora ✅  
**Objetivo**: Criar Redis para staging  
**Tempo**: 5 minutos

---

## 🎯 PASSO 1: Abrir Upstash

Vai para: https://console.upstash.com/

Se não tem conta, cria em: https://upstash.com/

---

## 📋 PASSO 2: Criar Novo Database

Na página principal:

```
[+ Create Database]  ← Clica aqui
```

Ou no menu superior:
```
Databases → [+ Create Database]
```

---

## 📋 PASSO 3: Configurar Database

**Preencha os campos:**

```
Database Name:
[paginas-comercio-staging]

Region:
[us-east-1]  ← Mesmo do Neon (importante!)

Type:
[Redis]  ← deixa selecionado

Database:
[Pro] ou [Free]  ← escolhe Free (gratuito)
```

Clica **"Create"**

---

## 📋 PASSO 4: Copiar REDIS_URL

Quando o database for criado, você verá:

```
┌─────────────────────────────────────┐
│ Rest API                            │
│ redis://default:ABCDE...@up-xx...   │
│ [Copy] ← CLICA AQUI                 │
└─────────────────────────────────────┘
```

Ou procura por:
```
Connection String
redis://default:PASSWORD@HOST:PORT
```

---

## ✅ O Que Você Precisa

A REDIS_URL vai parecer com isso:

```
redis://default:AbCdEf123@up-steady-chimpanzee-12345.upstash.io:6379
```

**Salva essa string!**

---

## 📝 Componentes da REDIS_URL

```
redis://[USER]:[PASSWORD]@[HOST]:[PORT]
```

| Parte | Exemplo |
|-------|---------|
| **Protocolo** | redis:// |
| **Usuário** | default |
| **Password** | AbCdEf123 |
| **Host** | up-steady-chimpanzee-12345.upstash.io |
| **Port** | 6379 |

---

## ✅ Checklist

- [ ] Criei conta/logei no Upstash
- [ ] Cliquei [+ Create Database]
- [ ] Nome: "paginas-comercio-staging"
- [ ] Region: "us-east-1"
- [ ] Type: "Redis"
- [ ] Database criado
- [ ] REDIS_URL copiada
- [ ] Começa com "redis://"
- [ ] Tem password
- [ ] Tem @up-

---

## 🎯 Quando Conseguir a URL

Salva assim:

```
=== UPSTASH REDIS ===

Database Name: paginas-comercio-staging

REDIS_URL:
redis://default:YOUR_PASSWORD@up-steady-chimpanzee-12345.upstash.io:6379
```

---

## 🚀 Próximo Passo

Depois que tiver:
1. ✅ DATABASE_URL (Neon) ← Já temos!
2. ✅ REDIS_URL (Upstash) ← Você está aqui!
3. → Deploy em Vercel

---

**Quando conseguir a REDIS_URL, me avisa!** 🚀

