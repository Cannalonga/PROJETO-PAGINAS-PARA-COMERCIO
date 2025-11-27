# 🎯 PLANO DE GO-LIVE - VITRINAFAST

Data Planejada: [A DEFINIR]
Horário: 09:00 - 10:00 (horário de baixo tráfego)
Responsável: [NOME]

---

## 📅 CRONOGRAMA

### D-7 (7 dias antes do Go-Live)

#### Segurança
- [ ] Todas as vulnerabilidades críticas corrigidas
- [ ] Credenciais Cloudinary regeneradas e atualizadas
- [ ] NEXTAUTH_SECRET configurado em produção
- [ ] MERCADOPAGO_WEBHOOK_SECRET configurado
- [ ] Revisão de código por segundo desenvolvedor

#### Infraestrutura
- [ ] Banco de dados de produção criado (Supabase/Vercel Postgres)
- [ ] Migrations executadas em produção
- [ ] Backup automatizado configurado
- [ ] Domínio customizado configurado
- [ ] SSL/HTTPS verificado

#### Testes
- [ ] Todos os testes unitários passando
- [ ] Testes de integração executados
- [ ] Teste de carga básico realizado
- [ ] Teste de pagamento em sandbox

---

### D-3 (3 dias antes)

#### Preparação Final
- [ ] Todas as variáveis de ambiente configuradas na Vercel
- [ ] Credenciais do Mercado Pago de PRODUÇÃO obtidas
- [ ] Webhook do MP configurado para URL de produção
- [ ] DNS propagado (se novo domínio)
- [ ] Monitoramento configurado (Vercel Analytics / Sentry)

#### Comunicação
- [ ] Equipe informada sobre data/hora do go-live
- [ ] Plano de contingência revisado
- [ ] Contatos de emergência atualizados
- [ ] Template de comunicação para usuários preparado

---

### D-1 (1 dia antes)

#### Freeze
- [ ] ❄️ **CODE FREEZE** - Nenhum commit novo
- [ ] Deploy final em staging
- [ ] Teste completo end-to-end em staging
- [ ] Verificar todos os logs
- [ ] Backup completo do banco de produção

#### Preparação Operacional
- [ ] Checklist de deploy impresso/acessível
- [ ] Plano de rollback revisado
- [ ] Acessos verificados (Vercel, MP, Cloudinary, DB)
- [ ] Ambiente de desenvolvimento limpo e pronto

---

### D-Day (Dia do Go-Live)

#### 08:00 - Preparação (1h)
- [ ] Equipe reunida (presencial ou online)
- [ ] Verificar status de todos os serviços
- [ ] Último backup do banco
- [ ] Acessar todos os dashboards necessários

#### 09:00 - Deploy (30min)
```bash
# 1. Verificar última vez
git pull origin main
npm run build
npm test

# 2. Deploy
git push origin main
# ou
vercel --prod
```

- [ ] Deploy iniciado
- [ ] Aguardar conclusão do build
- [ ] Verificar logs de deploy

#### 09:30 - Validação (30min)

**Testes Críticos:**
| # | Teste | Status |
|---|-------|--------|
| 1 | Página inicial carrega | [ ] |
| 2 | Criar nova loja | [ ] |
| 3 | Upload de imagem | [ ] |
| 4 | Página pública da loja | [ ] |
| 5 | Fluxo de checkout (sandbox) | [ ] |
| 6 | Verificar logs por erros | [ ] |
| 7 | Testar em mobile | [ ] |
| 8 | Verificar SSL | [ ] |

#### 10:00 - Go/No-Go Decision

```
✅ GO: Todos os testes passaram
   → Continuar para monitoramento
   
❌ NO-GO: Algum teste crítico falhou
   → Executar rollback imediato
   → Reagendar go-live
```

#### 10:00-18:00 - Monitoramento Intensivo

**A cada 2 horas:**
- [ ] Verificar logs da Vercel
- [ ] Verificar métricas de performance
- [ ] Testar criação de loja
- [ ] Verificar webhooks recebidos
- [ ] Checar uso de recursos (Cloudinary, DB)

**Alertas para observar:**
- Taxa de erro > 1%
- Tempo de resposta > 3s
- Erros de conexão com DB
- Falhas em webhooks
- Erros de upload

---

### D+1 (Dia seguinte)

- [ ] Revisão completa de logs das últimas 24h
- [ ] Verificar se há erros recorrentes
- [ ] Coletar métricas de performance
- [ ] Documentar quaisquer issues encontrados
- [ ] Planejar correções se necessário
- [ ] Retrospectiva do go-live

---

### D+7 (Uma semana depois)

- [ ] Análise de métricas da primeira semana
- [ ] Feedback de usuários coletado
- [ ] Issues identificados e priorizados
- [ ] Performance otimizada se necessário
- [ ] Documentação atualizada
- [ ] Celebrar o lançamento bem-sucedido! 🎉

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Meta | Crítico |
|---------|------|---------|
| Uptime | > 99.5% | < 95% |
| Tempo de resposta (P95) | < 2s | > 5s |
| Taxa de erro | < 0.5% | > 2% |
| Lojas criadas com sucesso | > 95% | < 80% |
| Uploads bem-sucedidos | > 99% | < 90% |

---

## 🚨 PLANO DE CONTINGÊNCIA

### Se algo der errado durante o deploy:
1. **PARAR** imediatamente
2. **AVALIAR** o problema (2 min máx)
3. **DECIDIR**: corrigir ou rollback
4. Se rollback → Seguir `ROLLBACK_PLAN.md`
5. **COMUNICAR** equipe
6. **DOCUMENTAR** o incidente

### Contatos de Emergência:
- Vercel Support: https://vercel.com/support
- Mercado Pago: https://www.mercadopago.com.br/developers/pt/support
- Cloudinary: https://support.cloudinary.com

---

## 📝 LOG DO GO-LIVE

```
Data: ___/___/______
Horário início: ____:____
Horário conclusão: ____:____

Status Final: [ ] SUCESSO  [ ] ROLLBACK  [ ] PARCIAL

Incidentes:
_________________________________________________________
_________________________________________________________

Ações de follow-up:
_________________________________________________________
_________________________________________________________

Assinatura: _____________________
```

---

## ✅ APROVAÇÕES

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Desenvolvedor | | | |
| Reviewer | | | |
| Product Owner | | | |
