#!/usr/bin/env bash
# Print trusted-publisher settings for npm and PyPI (OIDC; no registry tokens in GitHub).
# Usage: ./scripts/setup-registry-publishers.sh [owner/repo]

set -euo pipefail

REPO="${1:-Raphjacksun7/tidypress}"
OWNER="${REPO%%/*}"
NAME="${REPO##*/}"
WORKFLOW="publish.yml"
NPM_PACKAGE="tidypress"
PYPI_PROJECT="tidypress"

cat <<EOF
Configure trusted publishing (one-time per registry):

━━━ npm (${NPM_PACKAGE}) ━━━
  https://www.npmjs.com/package/${NPM_PACKAGE}/access
  → Trusted publishing → GitHub Actions
     Repository:  ${REPO}
     Workflow:      ${WORKFLOW}
     Environment:   (leave empty)

━━━ PyPI (${PYPI_PROJECT}) ━━━
  https://pypi.org/manage/project/${PYPI_PROJECT}/settings/publishing/
  → Add a new trusted publisher → GitHub
     Owner:         ${OWNER}
     Repository:    ${NAME}
     Workflow:      ${WORKFLOW}
     Environment:   (leave empty)

━━━ GitHub Actions (already in repo) ━━━
  .github/workflows/publish.yml
  - publish-npm:  id-token: write + pnpm publish --provenance
  - publish-pypi: pypa/gh-action-pypi-publish (OIDC)

After both publishers are saved, release with:
  git tag vX.Y.Z && git push origin vX.Y.Z

No NPM_TOKEN or PYPI_API_TOKEN secrets are required.
EOF
