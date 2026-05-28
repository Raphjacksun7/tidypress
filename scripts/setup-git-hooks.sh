#!/bin/sh
# Install repo git hooks (called from root package.json "prepare").
set -e

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/scripts/git-hooks"
DEST="$ROOT/.git/hooks"

if [ ! -d "$ROOT/.git" ]; then
  echo "setup-git-hooks: skip (not a git checkout)"
  exit 0
fi

mkdir -p "$DEST"

for hook in prepare-commit-msg; do
  if [ ! -f "$SRC/$hook" ]; then
    echo "setup-git-hooks: missing $SRC/$hook" >&2
    exit 1
  fi
  cp "$SRC/$hook" "$DEST/$hook"
  chmod +x "$DEST/$hook"
done

echo "setup-git-hooks: installed prepare-commit-msg"
