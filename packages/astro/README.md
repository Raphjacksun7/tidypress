# @tidypress/astro

Astro integration for projects that run TidyPress inside a normal Astro repo.

Most users should use the `tidypress` CLI only (markdown + `tidypress.config.ts` + `build/` output).

## When to use this

- You already have `astro.config.mjs` and want TidyPress routing, collections, and UI
- You extend rendering with custom Astro views under `site/views/`

## Setup

```sh
npm install @tidypress/astro tidypress
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import tidypress from '@tidypress/astro'

export default defineConfig({
  integrations: [tidypress()],
})
```

Set `TIDYPRESS_PROJECT_ROOT` to your docs directory when running Astro directly, or use `tidypress dev` / `tidypress build` (the CLI sets this automatically).

Scaffold a starter config:

```sh
tidypress init --with-astro
```
