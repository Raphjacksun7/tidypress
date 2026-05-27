---
title: Advanced configuration
description: Optional settings for i18n, versions, analytics, capabilities, and content snapshots.
order: 11
---

Most sites do not need this page on day one. Add these settings when the default docs and writing flow stops being enough.

## i18n

Configure locale-prefixed routes and UI labels:

```ts
import { defineConfig } from 'tidypress/config'

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
docs/src/content/
├── docs/
│   ├── getting-started.md
│   └── fr/getting-started.md
└── writing/
    ├── hello.md
    └── fr/hello.md
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

Content:

```txt
docs/src/content/docs/
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

## Content snapshot

`tidypress context` writes a compact markdown snapshot of published content:

```bash
tidypress context
tidypress context ./docs-context.md
```

Default output:

```txt
tidypress-context.md
```

The snapshot skips disabled collections, drafts, future-scheduled entries, and missing content folders. Enabled custom collections appear in the snapshot.
