---
title: Advanced configuration
description: Optional settings for i18n, versions, analytics, capabilities, and content snapshots.
order: 11
---

Most sites do not need this page on day one. Add these settings when the default writing-and-work layout stops being enough.

Path trees below use the publish root `site/` from `init`. `src/content/docs/` is the **`docs` collection**, not the whole publish root.

## i18n

Configure locale-prefixed routes and UI labels:

```ts
import { defineConfig } from 'tidypress'

export default defineConfig({
  name: 'my-project',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
  },
})
```

Routes:

```txt
/docs/getting-started
/fr/docs/getting-started
/writing
/fr/writing
```

Default-locale content stays at the root path. Non-default locales use a locale prefix.

```txt
site/
└── src/content/
    ├── writing/    # dated posts (RSS, tags, archive)
    │   ├── hello.md
    │   └── fr/hello.md
    └── docs/       # docs collection — sidebar-ordered guides at /docs/…
        ├── getting-started.md
        └── fr/getting-started.md
```

If a non-default locale is missing a page, TidyPress falls back to the default-locale content for that route.

## UI strings

```ts
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'fr'],
  strings: {
    fr: {
      searchLabel: 'rechercher',
      searchPlaceholder: 'Rechercher...',
      docsTitle: 'Docs',
      writingTitle: 'Articles',
      onThisPageLabel: 'Sur cette page',
    },
  },
}
```

## Versions

Use folder-based docs versions when you need old docs to stay online:

```ts
export default defineConfig({
  name: 'my-project',
  versions: [
    { label: 'v2 (latest)', path: '/docs' },
    { label: 'v1', path: '/docs/v1' },
  ],
})
```

Content for the **`docs` collection** only — not the whole publish root:

```txt
site/src/content/docs/
├── getting-started.md
├── configuration.md
└── v1/
    ├── getting-started.md
    └── configuration.md
```

Scaffold a version:

```bash
tidypress add-version 2.0
tidypress add-version 2.0 --set-latest
```

Configured versions appear in the docs right rail above the table of contents.

## Analytics

Analytics are off by default:

```ts
analytics: { type: 'none' }
```

Supported adapters:

| Type | Notes |
|------|-------|
| `none` | default; no analytics script |
| `plausible` | Plausible-style script injection |
| `fathom` | Fathom-style script injection |
| `umami` | Umami script |

Example:

```ts
analytics: {
  type: 'plausible',
  endpoint: 'https://plausible.io/js/script.js',
  siteId: 'docs.example.com',
}
```

TidyPress renders the script tag with the configured endpoint and site id.

## Capabilities

Capabilities guard optional and experimental surfaces.

Defaults:

```txt
docs
writing
pages
theming
```

Off by default:

```txt
themingCustom
editor
export
ai
```

Enable or disable capabilities:

```ts
capabilities: {
  disable: ['pages'],
  enable: ['themingCustom'],
},
```

Writing-only sites often disable `docs` and `pages` (as the `blog` init preset does) so `/docs` and empty `/pages/` routes are not built:

```ts
capabilities: {
  disable: ['docs', 'pages'],
},
collections: {
  docs: { enabled: false, basePath: '/docs' },
  writing: { enabled: true, basePath: '/writing', kind: 'writing' },
  pages: { enabled: false, kind: 'page' },
},
```

When `docs` is disabled, the search modal placeholder defaults to **Search writing...** instead of **Search docs...**. Override with `i18n.strings` if needed.

Experimental commands require config and CLI opt-ins:

```ts
experimental: {
  ai: true,
}
```

```bash
tidypress ai suggest docs/draft.md --enable-experimental-ai
```

These surfaces are guarded on purpose. They are not part of the default docs and writing workflow.

## LLM export (`llms.txt`)

By default, every `tidypress build` writes `build/llms.txt` at the site root of the static output. It lists published pages with public URLs and includes the **full markdown body** of each entry, not just titles and excerpts.

The export skips disabled collections, drafts (`published: false`), future-scheduled entries, and missing content folders. Enabled custom collections are included.

Agents and tools can fetch `https://yoursite.example/llms.txt` after deploy, or read `site/build/llms.txt` locally after build.

**Turn it off** when you do not want that file in `build/`:

```ts
capabilities: {
  disable: ['llmsTxt'],
},
```

One-off skip for a single build:

```bash
tidypress build --no-llms-txt
```
