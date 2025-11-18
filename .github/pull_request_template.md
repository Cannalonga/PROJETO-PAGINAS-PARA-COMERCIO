name: Pull Request
description: "Padrão de PR para Week 2+ features"
title: "[WIP] "
labels: ["development"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        ## 📋 Descrição
        Resuma brevemente as mudanças desta PR.

  - type: textarea
    id: description
    attributes:
      label: "O que foi alterado?"
      description: "Descreva as mudanças implementadas"
      placeholder: |
        - Adicionei endpoint GET /api/users
        - Apliquei middleware de segurança
        - Adicionei testes unitários
      rows: 5
    validations:
      required: true

  - type: markdown
    attributes:
      value: "## ✅ Checklist"

  - type: checkboxes
    id: checklist
    attributes:
      label: "Validações antes do merge"
      options:
        - label: "Código segue o padrão estabelecido (middleware stack)"
          required: true
        - label: "Testes passam localmente (`npm test`)"
          required: true
        - label: "Build passa (`npm run build`)"
          required: true
        - label: "TypeScript strict (`npx tsc --noEmit`)"
          required: true
        - label: "ESLint sem erros (`npm run lint`)"
          required: true
        - label: "Testes de segurança incluídos (IDOR, PII masking)"
          required: false
        - label: "Audit log adicionado para mutations"
          required: false
        - label: "Documentação atualizada se necessário"
          required: false

  - type: markdown
    attributes:
      value: "## 🔗 Relacionadas"

  - type: input
    id: related_issue
    attributes:
      label: "Número da Issue (ex: #1)"
      description: "Link a issue principal"
      placeholder: "Closes #1"

  - type: markdown
    attributes:
      value: "## 🧪 Como testar?"

  - type: textarea
    id: testing
    attributes:
      label: "Passos para reproduzir"
      description: "Como testar as mudanças? Inclua exemplos com curl/Postman"
      placeholder: |
        1. Abra POST /api/users
        2. Envie: { "email": "test@example.com", "password": "Test123!" }
        3. Confirme que retorna 201 com user data
      rows: 5
    validations:
      required: false

  - type: markdown
    attributes:
      value: "## 📸 Screenshots (se aplicável)"

  - type: textarea
    id: screenshots
    attributes:
      label: "Screenshots ou vídeos"
      description: "Cole imagens se houver mudanças na UI"
    validations:
      required: false

  - type: markdown
    attributes:
      value: "## 🔐 Segurança"

  - type: checkboxes
    id: security
    attributes:
      label: "Validações de segurança"
      options:
        - label: "Middleware de autenticação aplicado"
          required: false
        - label: "Validação de tenant isolation"
          required: false
        - label: "Rate limiting configurado"
          required: false
        - label: "PII masking em logs"
          required: false
        - label: "RBAC verificado"
          required: false

  - type: dropdown
    id: pr_type
    attributes:
      label: "Tipo de PR"
      options:
        - "🐛 Bug Fix"
        - "✨ Feature"
        - "📚 Documentation"
        - "🔧 Refactor"
        - "⚡ Performance"
        - "🔐 Security"
      required: true
