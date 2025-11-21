# 🛡️ BRANCH PROTECTION - RESUMO RÁPIDO

**Tempo**: 5 minutos  
**Dificuldade**: ⭐ Fácil

---

## 🚀 ROTEIRO RÁPIDO

### PASSO 1: Vai para GitHub Settings
```
Repo → Settings → Branches → "Add rule"
```

### PASSO 2: Preenche o Formulário

**Ruleset Name:**
```
Protect Main Branch
```

**Enforcement Status:**
```
☑ Enable
```

**Target Branches:**
```
☑ Include default branch
```

### PASSO 3: Marca ESSAS Caixas

```
☑ Require a pull request before merging
   └─ Require approvals: 1
   └─ ☑ Dismiss stale pull requests

☑ Require status checks to pass before merging
   └─ ☑ Require branches to be up to date

☑ Block force pushes

☑ Block deletions
```

### PASSO 4: Clica "Create"

✅ **PRONTO!**

---

## 📊 O Que Cada Um Faz

| Opção | O Que Faz | Por Quê |
|-------|-----------|--------|
| ✅ Pull Request | Obriga usar PR, não push direto | Qualidade + Review |
| ✅ 1 Approval | Precisa 1 pessoa revisar | Segurança |
| ✅ Dismiss Stale PRs | Invalida PR se houver novo commit | Sempre code atual |
| ✅ Status Checks | Testes devem passar | Sem bugs |
| ✅ Update Before Merge | Atualiza branch antes | Sem conflitos |
| ✅ Block Force Push | Proíbe `git push --force` | Protege histórico |
| ✅ Block Deletions | Proíbe deletar main | Acidentes não acontecem |

---

## 🎯 Resultado Final

### Antes (sem proteção)
```
Alguém faz: git push origin main
❌ Vai direto, sem teste
❌ Sem review
❌ Pode quebrar produção
```

### Depois (com proteção)
```
Alguém abre: Pull Request
✅ Testes rodam automático
✅ Precisa 1 aprovação
✅ Se tudo OK → merge seguro
✅ Vercel faz deploy automático
```

---

## 📝 Checklist

- [ ] Abri Settings → Branches
- [ ] Criei novo ruleset
- [ ] Marquei as 7 opções recomendadas
- [ ] Cliquei "Create"
- [ ] ✅ Branch protegido!

---

**Referência completa**: Vê `GITHUB_BRANCH_PROTECTION_GUIDE.md`

