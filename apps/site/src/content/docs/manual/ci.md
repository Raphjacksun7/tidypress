---
title: CI and deployment
description: Cache build inputs and upload only the static build/ artifact.
order: 5
---

DocsMint builds are deterministic static sites. In CI, cache compiler inputs and publish only `build/`.

## What to upload

Upload the contents of your docs directory `build/` folder:

```txt
docs/build/          # or apps/site/build/ when config lives at project root
├── index.html
├── assets/
├── pagefind/
└── ...
```

Do not upload:

- `~/.cache/docsmint/` (local compiler cache)
- `node_modules/`
- legacy `.docsmint/` (removed in current CLI versions)

## GitHub Actions pattern

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/docsmint
    key: docsmint-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml', '**/docsmint.config.ts', '**/src/content/**') }}
    restore-keys: |
      docsmint-${{ runner.os }}-

- run: npx docsmint build

- uses: cloudflare/pages-action@v1
  with:
    directory: apps/site/build   # adjust to your docsDir/build
```

Set `CI=true` so DocsMint emits structured JSON build logs.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `CI=true` | JSON structured logs from Astro |
| `DOCSMINT_JSON_LOGS=1` | Force JSON logs locally |
| `DOCSMINT_PROJECT_ROOT` | Set automatically by the CLI; required only when running Astro directly with `@docsmint/astro` |
