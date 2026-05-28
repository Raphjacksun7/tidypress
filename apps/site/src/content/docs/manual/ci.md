---
title: CI and deployment
description: Cache build inputs and upload only the static build/ artifact.
order: 5
---

TidyPress builds are deterministic static sites. In CI, cache compiler inputs and publish only `build/`.

## What to upload

Upload the contents of your publish root’s `build/` folder:

```txt
site/build/
├── index.html
├── assets/
├── pagefind/
└── ...
```

Do not upload:

- `~/.cache/tidypress/` (local compiler cache)
- `node_modules/`

## GitHub Actions pattern

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/tidypress
    key: tidypress-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml', '**/tidypress.config.ts', '**/src/content/**') }}
    restore-keys: |
      tidypress-${{ runner.os }}-

- run: pnpm exec tidypress build

- run: pnpm exec wrangler pages deploy apps/site/build --project-name=tidypress --branch=main
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

Add `wrangler` as a devDependency in the repo that runs CI, then use `pnpm exec wrangler` — `wrangler-action` may try to install Wrangler during the job and fail on a private pnpm workspace root.

```yaml
# optional: create project once
- run: pnpm exec wrangler pages project create tidypress --production-branch main
  continue-on-error: true
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

Adjust `apps/site/build` to your publish root’s `build/` path when your config lives at the project root.

Set `CI=true` so TidyPress emits structured JSON build logs.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `CI=true` | JSON structured logs from Astro |
| `TIDYPRESS_JSON_LOGS=1` | Force JSON logs locally |
| `TIDYPRESS_PROJECT_ROOT` | Set automatically by the CLI; required only when running Astro directly with `@tidypress/astro` |
| `TIDYPRESS_PUBLISH_ROOT` | Explicit publish root when auto-discovery is ambiguous |
