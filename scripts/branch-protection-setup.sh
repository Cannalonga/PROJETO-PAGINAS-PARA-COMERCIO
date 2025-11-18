#!/bin/bash
# branch-protection-setup.sh
# 
# Setup branch protection rules for main branch
# Requires: GitHub CLI (gh) installed and authenticated
#
# Usage: chmod +x branch-protection-setup.sh && ./branch-protection-setup.sh

set -e

REPO="Cannalonga/PROJETO-PAGINAS-PARA-COMERCIO"
BRANCH="main"

echo "🔒 Configuring branch protection for $REPO:$BRANCH"
echo ""

# Update branch protection rule
gh api repos/$REPO/branches/$BRANCH/protection \
  --input - << 'EOF'
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
  "required_conversation_resolution": false,
  "restrictions": null
}
EOF

echo ""
echo "✅ Branch protection rules configured!"
echo ""
echo "Rules applied:"
echo "  ✅ Require PR review (1 approval)"
echo "  ✅ Require CI checks pass (4 gates)"
echo "  ✅ Dismiss stale reviews"
echo "  ✅ Enforce admins"
echo "  ✅ Block force pushes"
echo ""
echo "You can now:"
echo "  1. Create feature branches from main"
echo "  2. Open PRs with 1+ commit"
echo "  3. Wait for CI to pass"
echo "  4. Get 1 approval"
echo "  5. Merge to main"
