#!/usr/bin/env bash
# Apply recommended GitHub repository settings for tidypress (branch protection, labels).
# Requires: gh auth login
# Usage: ./scripts/setup-github-repo.sh [owner/repo] [branch]

set -euo pipefail

REPO="${1:-Raphjacksun7/tidypress}"
BRANCH="${2:-main}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/" >&2
  exit 1
fi

echo "Configuring ${REPO} (branch: ${BRANCH})..."

create_label() {
  gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force 2>/dev/null || true
}

create_label bug d73a4a "Something is not working"
create_label enhancement a2eeef "New feature or improvement"
create_label maintainer fef2c0 "Maintainer-only tracking"
create_label "good first issue" 7057ff "Good for newcomers"
create_label docs 0075ca "Documentation"

gh repo edit "$REPO" --enable-issues 2>/dev/null || true
gh repo edit "$REPO" --enable-discussions 2>/dev/null || true

# Status check names match workflow name: CI → job id (see .github/workflows/ci.yml)
PROTECTION_JSON="$(mktemp)"
cat >"$PROTECTION_JSON" <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      { "context": "validate" },
      { "context": "install-e2e" }
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF

if gh api -X PUT "repos/${REPO}/branches/${BRANCH}/protection" --input "$PROTECTION_JSON" 2>/dev/null; then
  echo "Branch protection applied on ${BRANCH}."
else
  echo "Could not apply branch protection via API." >&2
  echo "Set manually: https://github.com/${REPO}/settings/rules" >&2
  echo "  - Require pull request, 1 approval, squash merge" >&2
  echo "  - Require status checks: validate, install-e2e (or CI / validate, CI / install-e2e)" >&2
fi
rm -f "$PROTECTION_JSON"

echo "Done. Verify: https://github.com/${REPO}/settings"
