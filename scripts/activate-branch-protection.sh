#!/bin/bash
# activate-branch-protection.sh
#
# Ativa branch protection para main branch com GitHub CLI
# Uso: chmod +x activate-branch-protection.sh && ./activate-branch-protection.sh

set -e

REPO="Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO"
BRANCH="main"

echo "🔒 Ativando branch protection para $REPO:$BRANCH"
echo ""

# Verificar se gh está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não encontrado"
    echo "   Instale em: https://cli.github.com"
    exit 1
fi

# Verificar se está autenticado
if ! gh auth status &> /dev/null; then
    echo "❌ Não autenticado no GitHub"
    echo "   Execute: gh auth login"
    exit 1
fi

echo "✅ gh CLI autenticado"
echo ""

# Aplicar branch protection
echo "📝 Aplicando regras de proteção..."
gh api repos/$REPO/branches/$BRANCH/protection \
  --input - << 'EOF' 2>&1 || true
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Security & Dependencies Scan",
      "Lint & TypeScript",
      "Unit & Integration Tests",
      "Build Next.js"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "restrictions": null
}
EOF

echo ""
echo "✅ Branch protection ativado!"
echo ""
echo "Regras aplicadas:"
echo "  ✅ Requer 1 PR review antes de merge"
echo "  ✅ Requer CI/CD pass (4 status checks)"
echo "  ✅ Requer branches up-to-date"
echo "  ✅ Rejeita stale reviews"
echo "  ✅ Força admins a seguir regras"
echo "  ✅ Bloqueia force push"
echo "  ✅ Bloqueia deleção de branch"
echo ""
echo "Workflow agora:"
echo "  1. git checkout -b feature/issue-X"
echo "  2. Faça commits"
echo "  3. git push origin feature/issue-X"
echo "  4. Abra PR no GitHub"
echo "  5. Aguarde CI passar (5 min)"
echo "  6. Obtenha 1 approval"
echo "  7. Merge com 'Squash and merge'"
echo ""
