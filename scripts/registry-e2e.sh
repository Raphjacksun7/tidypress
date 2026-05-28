#!/usr/bin/env bash
# Full registry e2e: npm, pnpm, and pip install tidypress from public registries
# into isolated workspaces under .cache/registry-e2e/ (gitignored).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export TIDYPRESS_REGISTRY_E2E_VERSION="${TIDYPRESS_REGISTRY_E2E_VERSION:-$(npm view tidypress version)}"
echo "Registry e2e version: ${TIDYPRESS_REGISTRY_E2E_VERSION}"
echo "Workspaces: ${ROOT}/.cache/registry-e2e/{npm,pnpm,pip}-${TIDYPRESS_REGISTRY_E2E_VERSION}/"
echo ""

pnpm --dir "$ROOT/packages/cli" run build
pnpm --dir "$ROOT/packages/cli" exec tsx --test --test-timeout=3600000 test/registry-e2e.test.ts

echo ""
echo "Registry e2e OK (npm, pnpm, pip)"
