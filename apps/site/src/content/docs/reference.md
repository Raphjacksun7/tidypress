---
title: Reference
description: CLI commands, config schema, frontmatter fields, and component API.
order: 6
---

## CLI commands

```bash
docsmint init               # scaffold docs/ in the current project
docsmint dev [--port <n>]   # dev server at localhost:4321
docsmint build              # production build → docs/.docsmint/dist/
docsmint preview            # preview the production build locally
docsmint clean              # remove docs/.docsmint/ to force reinstall
docsmint deploy [target]    # build and dispatch deployment flow
docsmint context [output]   # write LLM-friendly content snapshot
```

The CLI walks up from the current directory to find `docs/docsmint.config.ts`.

## Config schema

```typescript
interface DocsMintConfig {
  name: string
  description?: string
  branding?: {
    /** Icon shown beside site name in homepage h1 and nav. SVG or raster. */
    icon?: string
    /** Browser-tab favicon. Falls back to branding.icon when omitted. */
    favicon?: string
  }
  typography?: {
    scale?: 'default' | 'medium' | 'large'
  }
  writing?: {
    description?: string
  }
  nav?: {
    label: string
    href: string
    external?: boolean
    target?: '_self' | '_blank'
    rel?: string
    priority?: 'core' | 'secondary'
  }[]
  footer?: { label: string; href: string }[]
  siteUrl?: string
  repository?: {
    url?: string
    branch?: string
    editPath?: string
  }
  search?: {
    exclude?: string[]
  }
  dateFormat?: Intl.DateTimeFormatOptions
  dateLocale?: string
  pages?: (string | {
    slug: string
    navLabel?: string
  })[]
  sections?: {
    docs?: {
      enabled?: boolean
      basePath?: '/docs'
    }
    writing?: {
      enabled?: boolean
      basePath?: '/writing'
    }
  }
  navPolicy?: {
    mode?: 'strict' | 'relaxed'
    maxVisibleDesktop?: number
    maxVisibleMobile?: number
  }
}
```

Only `name` is required.

Typography scale defaults to `'default'` (100%). Use `'medium'` (110%) or `'large'` (120%) to increase UI text size globally.

## Branding system

DocsMint includes an opt-in branding system for icons and favicons. It is inactive by default — nothing renders unless `branding` is set in your config.

### Icon rendering

The `branding.icon` path is rendered beside `site.name` in two places: the homepage `<h1>` and the nav header link.

| File type | Rendering method | Theme adaptation |
|-----------|-----------------|-----------------|
| SVG (≤ 12 KB) | Inlined `<svg>` in HTML | `currentColor` — inherits text color automatically |
| SVG (> 12 KB) | CSS `mask-image` + `background-color: currentColor` | `currentColor` — same result, external URL |
| Raster (PNG, etc.) | `<img>` with CSS filters | `grayscale + brightness(0)` in light, `+ invert(1)` in dark |

### Favicon rendering

The `branding.favicon` path (or `branding.icon` as fallback) is injected as `<link rel="icon">` in the `<head>`.

| File type | Behaviour |
|-----------|-----------|
| SVG | Served directly with `type="image/svg+xml"`. Color is whatever is baked into the SVG. Use a white variant for a white tab icon. |
| Raster (PNG, etc.) | A canvas script converts the image to monochrome on load, producing a data URL. Updates live on theme change — no reload required. |

### Public asset placement

Place favicon and icon files inside `docs/src/content/public/` so they are copied to the root of the built site:

```
docs/src/content/public/
├── favicon.svg          ← default gray (#52525b), theme-adaptive icon
└── favicon-white.svg    ← white variant for browser tab
```

Reference them in config with a leading slash:

```ts
branding: {
  icon: '/favicon.svg',
  favicon: '/favicon-white.svg',
}
```

## Frontmatter

**Docs pages** (`docs/src/content/docs/*.md`):

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Page heading and `<title>` |
| `description` | string | no | Meta description |
| `order` | number | no | Sidebar sort position. Pages without `order` fall back to alphabetical |
| `search` | boolean | no | Set `false` to exclude this page from search |

**Writing posts** (`docs/src/content/writing/*.md`):

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Post heading and `<title>` |
| `date` | string | yes | ISO 8601 (`YYYY-MM-DD`). Determines sort order |
| `description` | string | no | Meta description |
| `author` | string | no | Displayed below the date |
| `search` | boolean | no | Set `false` to exclude this page from search |

## Component API

### `<Callout type?>`

| Prop | Type | Default |
|------|------|---------|
| `type` | `"note" \| "warning" \| "tip"` | `"note"` |

### `<Tooltip tip>`

| Prop | Type | Required |
|------|------|----------|
| `tip` | string | yes |

### `<FileTree>`

No props. Slot content is a markdown list. Two spaces per indent level. Wrap filenames in `**` to highlight. Directories collapse on click.

### `<Tabs labels>`

| Prop | Type | Required |
|------|------|----------|
| `labels` | `string[]` | yes |

`labels` must match the number of `<Tab>` children.

### `<Tab>`

No props. Slot wrapper for one tab panel. Must be a direct child of `<Tabs>`.

### `<Mermaid code>`

| Prop | Type | Required |
|------|------|----------|
| `code` | string | yes |

Renders Mermaid diagrams client-side. Adapts to light/dark theme automatically.

### `<Image src alt ...>`

| Prop | Type | Required |
|------|------|----------|
| `src` | `string \| ImageMetadata` | yes |
| `alt` | string | yes |
| `caption` | string | no |
| `width` | number | no |
| `height` | number | no |

## Build output

```
docs/.docsmint/dist/
├── index.html
├── docs/
│   └── getting-started/
│       └── index.html
├── writing/
│   └── hello-world/
│       └── index.html
├── _astro/              ← CSS + JS bundles (content-hashed)
├── sitemap-index.xml
└── pagefind/            ← full-text search index
```

## Search

Search is powered by [Pagefind](https://pagefind.app). It indexes all built HTML pages. The index is generated automatically during `docsmint build`.

Search is **not available in dev mode** — run `docsmint build` then `docsmint preview` to use it.

Press `/` anywhere on the site to open the search dialog.

## Deploy targets

```bash
docsmint deploy                   # artifact-only
docsmint deploy ./out/docs        # local copy
docsmint deploy file:///tmp/site  # local copy via file URI
docsmint deploy gs://bucket/docs  # external target instruction mode
```
