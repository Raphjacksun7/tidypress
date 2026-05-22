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
  branding: {
    icon: '/favicon.svg',
    favicon: '/favicon-white.svg',
  },
  typography: { scale: 'medium' },
  capabilities: {
    enable: ['themingCustom'],
  },
  theme: {
    mode: 'custom',
    tokens: {
      light: { bg: '#ffffff', fg: '#111111' },
      dark: { bg: '#0b0b0b', fg: '#f5f5f5' },
    },
  },
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
  collections: {
    docs: { enabled: true, basePath: '/docs', kind: 'docs', label: 'docs' },
    writing: { enabled: true, basePath: '/writing', kind: 'writing', label: 'writing' },
    playbooks: { enabled: true, basePath: '/playbooks', kind: 'docs', label: 'playbooks' },
    guides: { enabled: true, basePath: '/guides', kind: 'docs', label: 'guides' },
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
description: 'Static publishing for engineers who want docs and writing they own.'
```

### `branding`

Optional. Controls the icon shown beside the site name and the browser-tab favicon. Nothing is applied if `branding` is omitted — it is fully opt-in.

```ts
branding: {
  icon: '/favicon.svg',
  favicon: '/favicon-white.svg',
}
```

#### `branding.icon`

Path to the image shown beside `site.name` in the homepage `<h1>` and the nav header link. The icon is sized to match the surrounding text (`1.08em`) and does not affect line height.

**SVG files** are inlined directly into the HTML so they inherit `currentColor` — they appear dark on light backgrounds and light on dark backgrounds automatically, with no extra configuration.

**Raster files** (PNG, JPEG, WebP, etc.) are rendered as `<img>` elements and automatically converted to monochrome via CSS filters. They invert correctly when the theme switches between light and dark.

```ts
branding: { icon: '/logo.svg' }   // SVG: inlined, theme-aware via currentColor
branding: { icon: '/logo.png' }   // Raster: monochrome filter, theme-aware via CSS invert
```

#### `branding.favicon`

Path to the browser-tab favicon. Falls back to `branding.icon` if omitted.

**SVG favicons** are referenced directly with `type="image/svg+xml"`. Place the file in `docs/src/content/public/` so it is served at the root.

**Raster favicons** are linked directly as regular image assets. They do not receive runtime monochrome conversion, so use a pre-styled raster favicon when you need a specific tab appearance.

```ts
branding: {
  icon: '/favicon.svg',       // theme-adaptive icon in UI
  favicon: '/favicon-white.svg', // separate white variant for the browser tab
}
```

<Callout type="tip">
For the browser tab favicon, use a white SVG variant (e.g. `favicon-white.svg`) when you want it to always appear white regardless of the OS theme. Use the same path for both `icon` and `favicon` when a single adaptive file is enough.
</Callout>

### `writing.description`

Controls the short intro text shown on `/writing`.

```ts
writing: {
  description: 'Engineering notes, architectural decisions, and observations.'
}
```

### `typography.scale`

Global text scale for the whole UI and content.

```ts
typography: { scale: 'default' } // 100%
typography: { scale: 'medium' }  // 110%
typography: { scale: 'large' }   // 120%
```

Recommended naming:
- `default`: standard reading size
- `medium`: slightly larger for comfort
- `large`: high-comfort / accessibility-focused size

### `theme` (V1 contract)

Theme configuration is normalized through a typed contract:

- `mode: 'guardrailed' | 'custom'`
- `preset: 'baseline'` (current V1 preset)
- `tokens` (custom mode only): `light` + `dark` token maps using this guarded surface:
  - `bg`, `fg`, `muted`, `border`, `surface`, `codeBg`, `codeFg`

```ts
theme: {
  mode: 'guardrailed',
  preset: 'baseline',
}
```

```ts
capabilities: { enable: ['themingCustom'] },
theme: {
  mode: 'custom',
  tokens: {
    light: { bg: '#ffffff', fg: '#111111' },
    dark: { bg: '#0b0b0b', fg: '#f5f5f5' },
  },
}
```

Custom mode requires the `themingCustom` capability (via `capabilities.enable`). When `theming` is disabled, DocsMint falls back to the guardrailed baseline theme.

### `capabilities`

Capability toggles are resolved deterministically through the central registry.

```ts
capabilities: {
  enable: ['themingCustom', 'ai'],
  disable: ['writing'],
}
```

V1 theming capability keys:

- `theming` (stable, enabled by default)
- `themingCustom` (stable, disabled by default)

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

### `collections`

Collections are the source of truth for content routing. The default starter preset includes `docs`, `writing`, and `pages`, but those are not hardcoded limits.

```ts
collections: {
  docs: { enabled: true, basePath: '/docs', kind: 'docs', label: 'docs' },
  writing: { enabled: true, basePath: '/writing', kind: 'writing', label: 'writing' },
  playbooks: { enabled: true, basePath: '/playbooks', kind: 'docs', label: 'playbooks' },
  journal: { enabled: true, basePath: '/journal', kind: 'writing', label: 'journal' },
  company: { enabled: true, basePath: '/company', kind: 'page', label: 'company' },
}
```

Supported fields per collection:

- `enabled?: boolean` - enables route generation for the collection
- `basePath?: string` - absolute path segment (for example `/playbooks`)
- `kind?: 'docs' | 'writing' | 'page'` - rendering behavior
- `label?: string` - nav label fallback

### `sections` (legacy shim)

`sections` is kept for backward compatibility and maps to `collections.docs` + `collections.writing`. Prefer `collections` for all new configuration.

```ts
// Legacy input still accepted:
sections: {
  docs: { enabled: true, basePath: '/docs' },
  writing: { enabled: true, basePath: '/writing' },
}
```

Migration lifecycle:

- Current: accepted as compatibility input.
- Recommended now: move to `collections`.
- Practical path: run `docsmint migrate-sections` and copy generated entries from
  `docs/.docsmint/migrations/sections-to-collections.json`.
- Precedence: when both are present, `collections` wins and `sections` is ignored for that key.

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
  description: 'Engineering notes, docs, and long-form writing.',
  branding: {
    icon: '/favicon.svg',
    favicon: '/favicon-white.svg',
  },
  typography: { scale: 'medium' },
  siteUrl: 'https://docs.example.com',
  repository: {
    url: 'https://github.com/your/repo',
    branch: 'main',
    editPath: 'docs/src/content',
  },
  nav: [
    { label: 'docs', href: '/docs/getting-started', priority: 'core' },
    { label: 'writing', href: '/writing', priority: 'core' },
    { label: 'GitHub', href: 'https://github.com/your/repo', target: '_blank' },
  ],
  footer: [{ label: 'GitHub', href: 'https://github.com/your/repo' }],
  pages: ['about', { slug: 'work', navLabel: 'My Work' }],
  collections: {
    docs: { enabled: true, basePath: '/docs', kind: 'docs', label: 'docs' },
    writing: { enabled: true, basePath: '/writing', kind: 'writing', label: 'writing' },
    playbooks: { enabled: true, basePath: '/playbooks', kind: 'docs', label: 'playbooks' },
  },
  navPolicy: { mode: 'strict', maxVisibleDesktop: 3, maxVisibleMobile: 2 },
  search: { exclude: ['docs/internal/*'] },
  dateLocale: 'en-US',
  dateFormat: { year: 'numeric', month: 'short', day: 'numeric' },
})
```
