#!/usr/bin/env bash
# 90-second TidyPress demo: init lab preset → build → open paths.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Keep demo inside the repo so Astro/Vite resolve bundled deps reliably (not /tmp).
DEMO_DIR="${ROOT}/.cache/tidypress-quickstart-demo"
rm -rf "$DEMO_DIR"
CLI_BIN="${ROOT}/packages/cli/bin/tidypress.js"
CLI="${CLI:-node "$CLI_BIN"}"
DIST_INDEX="${ROOT}/packages/cli/dist/index.js"

if [[ ! -f "$CLI_BIN" ]] || [[ ! -f "$DIST_INDEX" ]]; then
  echo "Build the CLI first: pnpm --dir \"$ROOT/packages/cli\" run build" >&2
  exit 1
fi

mkdir -p "$DEMO_DIR"
cd "$DEMO_DIR"

echo "→ init (lab preset + siteUrl)"
$CLI init --preset lab --site-url https://tidypress-demo.example
test -f "$DEMO_DIR/docs/tidypress.config.ts" || {
  echo "init failed: docs/tidypress.config.ts missing" >&2
  exit 1
}

echo "→ build"
$CLI build

BUILD_DIR="$DEMO_DIR/docs/build"
test -f "$BUILD_DIR/index.html"
test -f "$BUILD_DIR/pagefind/pagefind.js"
test -f "$BUILD_DIR/llms.txt"
test -f "$BUILD_DIR/sitemap-index.xml"

echo ""
echo "Done. Static site:"
echo "  $BUILD_DIR/index.html"
echo "  $BUILD_DIR/llms.txt"
echo ""
echo "Preview: tidypress preview  (from $DEMO_DIR)"
