# 🔄 PLANO DE ROLLBACK - VITRINAFAST

Este documento descreve os procedimentos de rollback em caso de problemas após o deploy.

---

## 🚨 QUANDO FAZER ROLLBACK

### Indicadores Críticos (Rollback Imediato)
- ❌ Aplicação retornando 500 em todas as páginas
- ❌ Erro de conexão com banco de dados
- ❌ Checkout/Pagamento não funciona
- ❌ Upload de imagens falha completamente
- ❌ Dados de clientes comprometidos

### Indicadores de Alerta (Avaliar Rollback)
- ⚠️ Tempo de resposta > 5 segundos
- ⚠️ Taxa de erro > 5%
- ⚠️ Funcionalidade parcialmente quebrada
- ⚠️ UI com problemas visuais graves

---

## 📋 PROCEDIMENTOS DE ROLLBACK

### Método 1: Rollback via Vercel Dashboard (Mais Rápido)

**Tempo estimado: 2-3 minutos**

```
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto "vitrinafast"
3. Clique em "Deployments"
4. Encontre o último deploy ESTÁVEL (geralmente 1 antes do atual)
5. Clique nos "..." à direita
6. Selecione "Promote to Production"
7. Confirme a ação
```

### Método 2: Rollback via Vercel CLI

**Tempo estimado: 3-5 minutos**

```bash
# 1. Listar deployments recentes
vercel ls --limit 10

# 2. Identificar o deployment estável (antes do problema)
# Exemplo de output:
# vitrinafast-abc123.vercel.app  Production  2h ago
# vitrinafast-xyz789.vercel.app  Previous    1d ago  <-- Este

# 3. Promover o deployment estável
vercel promote vitrinafast-xyz789.vercel.app --yes

# 4. Verificar
vercel ls
```

### Método 3: Rollback via Git

**Tempo estimado: 5-10 minutos**

```bash
# 1. Identificar o commit estável
git log --oneline -10

# 2. Criar branch de hotfix a partir do commit estável
git checkout -b hotfix/rollback [commit-hash-estavel]

# 3. Push para trigger novo deploy
git push origin hotfix/rollback

# 4. No Vercel, promover este deploy para produção
# Ou fazer merge para main
```

### Método 4: Rollback de Banco de Dados

**⚠️ APENAS SE HOUVER CORRUPÇÃO DE DADOS**

**Supabase:**
```
1. Acesse https://supabase.com/dashboard
2. Selecione o projeto
3. Vá em Database > Backups
4. Selecione backup anterior ao problema
5. Restaure
```

**Vercel Postgres:**
```bash
# Point-in-time recovery (se habilitado)
# Contatar suporte Vercel
```

---

## 📊 MATRIZ DE DECISÃO

| Problema | Ação | Tempo Máx. |
|----------|------|------------|
| App não carrega | Rollback Vercel | 5 min |
| Erro em nova funcionalidade apenas | Hotfix rápido | 30 min |
| Dados corrompidos | Rollback + Restore DB | 1 hora |
| Credenciais comprometidas | Revogar + Atualizar | 15 min |
| Performance degradada | Monitorar ou rollback | 15 min |

---

## 🛠️ SCRIPTS DE EMERGÊNCIA

### Script: Verificar Saúde da Aplicação
```powershell
# Verificar se a aplicação está respondendo
$response = Invoke-WebRequest -Uri "https://seu-dominio.com" -Method Head -TimeoutSec 10
if ($response.StatusCode -eq 200) {
    Write-Host "✅ Aplicação OK" -ForegroundColor Green
} else {
    Write-Host "❌ Aplicação com problemas: $($response.StatusCode)" -ForegroundColor Red
}

# Verificar API
$apiResponse = Invoke-RestMethod -Uri "https://seu-dominio.com/api/health" -TimeoutSec 10
Write-Host "API Status: $($apiResponse.status)"
```

### Script: Rollback Rápido
```powershell
# Rollback para último deploy estável
$stableDeployment = "vitrinafast-xyz789.vercel.app" # Atualizar com ID real
vercel promote $stableDeployment --yes
Write-Host "✅ Rollback executado para: $stableDeployment" -ForegroundColor Green
```

---

## 📝 LOG DE ROLLBACKS

Manter registro de todos os rollbacks realizados:

| Data | Hora | Motivo | Método | Responsável | Tempo p/ Resolver |
|------|------|--------|--------|-------------|-------------------|
| | | | | | |
| | | | | | |
| | | | | | |

---

## 📞 COMUNICAÇÃO EM CASO DE ROLLBACK

### Template de Comunicação Interna

```
🚨 ALERTA: Rollback em Produção

Data/Hora: [DATA/HORA]
Motivo: [DESCRIÇÃO DO PROBLEMA]
Ação: Rollback para versão [VERSÃO]
Status: [EM ANDAMENTO / CONCLUÍDO]
Tempo de indisponibilidade: [TEMPO]
Responsável: [NOME]

Próximos passos:
1. [AÇÃO 1]
2. [AÇÃO 2]
```

### Template de Comunicação para Usuários (Se necessário)

```
⚠️ Manutenção Temporária

Estamos realizando uma manutenção de emergência para garantir 
a melhor experiência possível.

Previsão de retorno: [HORÁRIO]

Pedimos desculpas pelo inconveniente.
```

---

## ✅ CHECKLIST PÓS-ROLLBACK

- [ ] Aplicação funcionando normalmente
- [ ] Verificar logs por novos erros
- [ ] Testar funcionalidades críticas
- [ ] Verificar integridade de dados
- [ ] Comunicar equipe sobre status
- [ ] Documentar incidente
- [ ] Planejar correção definitiva
