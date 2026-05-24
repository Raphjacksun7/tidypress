# @docsmint/astro

Astro integration for projects that run DocsMint inside a normal Astro repo.

Most users should use the `docsmint` CLI only (markdown + `docsmint.config.ts` + `build/` output).

## When to use this

- You already have `astro.config.mjs` and want DocsMint routing, collections, and UI
- You extend rendering with custom Astro views under `site/views/`

## Setup

```sh
npm install @docsmint/astro docsmint
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import docsmint from '@docsmint/astro'

export default defineConfig({
  integrations: [docsmint()],
})
```

Set `DOCSMINT_PROJECT_ROOT` to your docs directory when running Astro directly, or use `docsmint dev` / `docsmint build` (the CLI sets this automatically).

Scaffold a starter config:

```sh
docsmint init --with-astro
```
