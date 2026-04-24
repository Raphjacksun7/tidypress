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
```

The CLI walks up from the current directory to find `docs/docsmint.config.ts`.

## Config schema

```typescript
interface MkdocxConfig {
  name: string
  description: string
  nav?: { label: string; href: string }[]
  footer?: { label: string; href: string }[]
  siteUrl?: string
  dateFormat?: Intl.DateTimeFormatOptions
  dateLocale?: string
}
```

All fields except `name` and `description` are optional.

## Frontmatter

**Docs pages** (`src/content/docs/*.md`):

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Page heading and `<title>` |
| `description` | string | no | Meta description |
| `order` | number | no | Sidebar sort position. Default: 99 |

**Writing posts** (`src/content/writing/*.md`):

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Post heading and `<title>` |
| `date` | string | yes | ISO 8601 (`YYYY-MM-DD`). Determines sort order |
| `description` | string | no | Meta description |
| `author` | string | no | Displayed below the date |

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

## Upgrading

```bash
pip install --upgrade docsmint \
  --index-url https://centiro.pkgs.visualstudio.com/_packaging/Internal_Python/pypi/simple/ \
  --extra-index-url https://pypi.org/simple/

docsmint clean   # remove cached template, force reinstall on next run
```
