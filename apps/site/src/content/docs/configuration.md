---
title: Configuration
description: "docsmint.config.ts and the typed defineConfig() API."
order: 2
---

DocsMint reads a single config file: `docs/docsmint.config.ts`.

## Typed config entrypoint

```ts
import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'Your Project',
  description: 'Short description for metadata.',
  siteUrl: 'https://docs.example.com',
  nav: [
    { label: 'docs', href: '/docs/getting-started', priority: 'core' },
    { label: 'writing', href: '/writing', priority: 'core' },
    {
      label: 'GitHub',
      href: 'https://github.com/your/repo',
      target: '_blank',
      priority: 'secondary',
    },
  ],
  footer: [{ label: 'GitHub', href: 'https://github.com/your/repo' }],
  pages: ['about', { slug: 'work', navLabel: 'my work' }],
  sections: {
    docs: { enabled: true, basePath: '/docs' },
    writing: { enabled: true, basePath: '/writing' },
  },
  navPolicy: {
    mode: 'strict',
    maxVisibleDesktop: 3,
    maxVisibleMobile: 2,
  },
})
```

## Options

### `name`

Project name. Used in page titles, the nav header, and metadata.

```javascript
name: 'my-project'
```

### `description`

Short description. Used for metadata and homepage copy.

```ts
description: 'Minimal markdown documentation builder.'
```

### `writing.description`

Controls the short intro text shown on `/writing`.

```ts
writing: {
  description: 'Engineering notes, architectural decisions, and observations.'
}
```

### `nav`

Navigation items with safe defaults and strict-mode validation support.

```ts
nav: [
  { label: 'docs', href: '/docs/getting-started', priority: 'core' },
  { label: 'writing', href: '/writing', priority: 'core' },
  { label: 'x', href: 'https://x.com/you', target: '_blank', priority: 'secondary' },
]
```

Supported item fields:

- `label: string`
- `href: string`
- `external?: boolean`
- `target?: '_self' | '_blank'`
- `rel?: string`
- `priority?: 'core' | 'secondary'`

### `footer`

Footer links. Same structure as `nav`.

```ts
footer: [
  { label: 'GitHub', href: 'https://github.com/your/repo' },
  { label: 'License', href: '/license' },
]
```

### `siteUrl`

Canonical URL. Used for sitemaps and social metadata.
This value is not rendered as visible page text by default.

```ts
siteUrl: 'https://docs.example.com'
```

### `repository`

Repository metadata used for "Edit this page" links in docs pages.

```ts
repository: {
  url: 'https://github.com/your/repo',
  branch: 'main',
  editPath: 'docs/src/content',
}
```

If `url` and `editPath` are both provided, docs pages render an edit link in the right rail.

### `search.exclude`

Optional list of path patterns to exclude from search indexing.

```ts
search: {
  exclude: [
    'docs/internal/*',
    'writing/drafts/*',
  ],
}
```

You can also exclude individual pages in frontmatter with `search: false`.

### `dateFormat`

Controls how dates appear on writing posts and the writing index. Accepts `Intl.DateTimeFormat` options.

```ts
dateFormat: { year: 'numeric', month: 'short', day: 'numeric' }
// → "Apr 11, 2026"

dateFormat: { year: 'numeric', month: '2-digit', day: '2-digit' }
// → "04/11/2026"
```

Default: `{ year: 'numeric', month: 'short', day: 'numeric' }`.

### `dateLocale`

BCP 47 locale string for date formatting.

```ts
dateLocale: 'en-US'   // "Apr 11, 2026"
dateLocale: 'fr-FR'   // "11 avr. 2026"
dateLocale: 'ja-JP'   // "2026年4月11日"
```

Default: `'en-US'`.

### `pages`

Bounded custom pages that keep the core DocsMint design system intact.

```ts
pages: [
  'about',
  { slug: 'work', navLabel: 'My Work' },
]
```

Each custom page renders from `docs/src/content/pages/<slug>.md`.

### `sections`

Enable or disable first-party sections. Base paths are currently fixed to `/docs` and `/writing`.

```ts
sections: {
  docs: { enabled: true, basePath: '/docs' },
  writing: { enabled: true, basePath: '/writing' },
}
```

### `navPolicy`

Controls visible nav budget and strict route validation.

```ts
navPolicy: {
  mode: 'strict',
  maxVisibleDesktop: 3,
  maxVisibleMobile: 2,
}
```

Overflow is rendered in a `more` popover. Search and theme toggle stay separate.

## Full example

```ts
import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'DocsMint',
  description: 'Minimal markdown docs and writing.',
  siteUrl: 'https://docs.example.com',
  nav: [
    { label: 'docs', href: '/docs/getting-started', priority: 'core' },
    { label: 'writing', href: '/writing', priority: 'core' },
    { label: 'GitHub', href: 'https://github.com/your/repo', target: '_blank' },
  ],
  footer: [{ label: 'GitHub', href: 'https://github.com/your/repo' }],
  pages: ['about', { slug: 'work', navLabel: 'My Work' }],
  sections: {
    docs: { enabled: true, basePath: '/docs' },
    writing: { enabled: true, basePath: '/writing' },
  },
  navPolicy: { mode: 'strict', maxVisibleDesktop: 3, maxVisibleMobile: 2 },
  dateLocale: 'en-US',
  dateFormat: { year: 'numeric', month: 'short', day: 'numeric' },
})
```
