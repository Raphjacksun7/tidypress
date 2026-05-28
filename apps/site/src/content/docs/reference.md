---
title: CLI reference
description: Commands, config fields, frontmatter, components, and deploy targets.
order: 14
---

This is the compact reference. Use the focused guides when you need context.

## CLI

Global flags:

```bash
tidypress --help
tidypress --version
tidypress --verbose <command>
```

No command defaults to `tidypress dev`.

Core commands:

```bash
tidypress init [--preset <name>]
tidypress init [--starter <name>]
tidypress dev [--port <n>]
tidypress build [--output <dir>] [--no-llms-txt]
tidypress preview [--port <n>]
tidypress clean
tidypress deploy [target]
tidypress deploy [target] --with-ci
```

Every `tidypress build` writes `build/llms.txt` with full published markdown for agents.

Starter presets. `default` is an alias for `lab`:

| Preset | Seeds |
|--------|-------|
| `lab` (default) | writing + projects |
| `persona` | hero, projects, writing, about page |
| `blog` | writing only |
| `docs-writing` | docs + writing |
| `body-of-work` | works, projects, writing, reference, process; docs off |
| `body-of-work-docs` | body-of-work + enabled `docs` |
| `custom` | docs, writing, and a `playbooks` content collection |

Maintenance and scaffold commands:

```bash
tidypress migrate-sections
tidypress doctor
tidypress release-check
tidypress add-version <label> [--set-latest]
tidypress domain setup [domain] --platform <platform>
tidypress import <medium|devto|substack|ghost> <url-or-path>
tidypress convert <file.ipynb> [--output <file.mdx>]      # Python wrapper
tidypress extract-docs <path> [--lang py|ts|go]           # Python wrapper
```

`devto` fetches public article markdown from the Dev.to API. Other import providers write a review scaffold.

`domain`, `editor`, `export`, and `ai` are scaffold or planning surfaces unless explicitly documented by their command output. The Python-only commands are available through the Python package entrypoint.

Experimental commands:

```bash
tidypress editor --enable-experimental-editor
tidypress export <pdf|epub|archive> [source] --enable-experimental-export
tidypress ai <suggest|translate|changelog> [args...] --enable-experimental-ai
```

Experimental commands require config and CLI opt-ins. See [Advanced configuration](./advanced-configuration).

## Config fields

```ts
interface TidyPressConfig {
  name: string
  description?: string
  hero?: TidyPressHero
  home?: TidyPressHome // order, previewLimit, collections display, preset: lab | blog | docs-writing | persona
  nav?: NavItem[]
  footer?: FooterItem[] | TidyPressFooterSettings
  pages?: PageEntry[]
  collections?: TidyPressCollections
  siteUrl?: string
  repository?: TidyPressRepository
  search?: TidyPressSearch
  branding?: TidyPressBranding
  typography?: TidyPressTypography
  theme?: TidyPressTheme
  capabilities?: TidyPressCapabilities
  experimental?: TidyPressExperimental
  versions?: TidyPressVersion[]
  i18n?: TidyPressI18n
  analytics?: TidyPressAnalytics
  docs?: TidyPressDocs
  writing?: TidyPressWriting
  dateLocale?: string
  dateFormat?: Intl.DateTimeFormatOptions
  navPolicy?: TidyPressNavPolicy
  extensions?: TidyPressRenderingExtensions
  sections?: unknown // legacy shim
}
```

Only `name` is required.

### Footer

`footer` is a link array or a settings object. See [Configuration → Footer](./configuration#footer) for layout, defaults, icons, RSS, i18n, and examples.

```ts
type TidyPressFooterInput = FooterItem[] | TidyPressFooterSettings

interface TidyPressFooterSettings {
  main?: { start?: string | FooterMainLink[]; end?: string | FooterMainLink[] }
  aside?: string // alias for main.end
  copyright?: string // tokens: {year}, {name}
  showCredit?: boolean // default true
  credit?: { prefix?: string; label?: string; href?: string }
  links?: FooterItem[]
}

interface FooterMainLink {
  label: string
  href: string
  external?: boolean
}

interface FooterItem {
  label: string
  href: string
  icon?: FooterItemIcon
  external?: boolean
}

type FooterItemIcon =
  | 'github' | 'x' | 'linkedin' | 'discord' | 'youtube' | 'instagram'
  | 'bluesky' | 'facebook' | 'reddit' | 'twitch' | 'mastodon' | 'slack'
  | 'telegram' | 'tiktok' | 'npm' | 'rss' | 'email'
```

## Typography scale

```ts
type TidyPressTypographyScale = 'small' | 'medium' | 'large'
```

`medium` is the default when `typography` is omitted. `default` and `extra` are accepted aliases: `default` → `medium`, `extra` → `large`.

## Collection kinds

```ts
type TidyPressCollectionKind = 'content' | 'writing' | 'projects' | 'page'
```

`collections.docs` is the main docs collection. It has no `kind` or `render`.

```ts
interface TidyPressHero {
  enabled?: boolean
  role?: string
  pronunciation?: string
  lead?: string
  image?: string
  links?: Array<{ label: string; href: string; external?: boolean }>
}
```

Hero renders only when `hero.enabled === true`.

## Capability names

```ts
type TidyPressCapabilityName =
  | 'docs'
  | 'writing'
  | 'pages'
  | 'editor'
  | 'export'
  | 'ai'
  | 'theming'
  | 'themingCustom'
  | 'llmsTxt'
```

## Theme token names

```ts
type TidyPressThemeTokenName =
  | 'bg'
  | 'fg'
  | 'muted'
  | 'border'
  | 'surface'
  | 'codeBg'
  | 'codeFg'
```

## Frontmatter

Docs:

```yaml
---
title: Getting started
description: First steps.
order: 1
form: doc
paging: bottom
tags: [setup, docs]
search: true
published: true
scheduled: 2026-06-01T09:00:00Z
---
```

Writing:

```yaml
---
title: Release notes
date: "2026-05-22"
description: Notes from the latest release.
author: Raph
featured: true
ogImage: /images/release.png
tags: [release]
search: true
published: true
scheduled: 2026-06-01T09:00:00Z
---
```

Projects:

```yaml
---
title: Sample project
description: One line about the work.
status: active
featured: true
url: https://example.com
linkOnly: true
repo: https://github.com/you/project
tags: [oss]
published: true
---
```

Pages:

```yaml
---
title: About
description: About this project.
search: true
---
```

## Docs forms

| Form | Layout |
|------|--------|
| `doc` | default docs page with sidebar, TOC, and chapter navigation |
| `manual` | procedural page chrome and step styling |

Docs chapter navigation defaults to both top and bottom. Use `paging: false`, `'none'`, `'top'`, or `'bottom'` globally under `docs` or per page frontmatter.

## Components

| Component | Purpose |
|-----------|---------|
| `<Callout type?>` | note, warning, or tip |
| `<Tooltip tip>` | inline hover text |
| `<FileTree>` | collapsible file tree |
| `<Tabs labels>` | tabbed examples |
| `<Tab>` | one tab panel |
| `<Mermaid code>` | Mermaid diagram |
| `<Image src alt ...>` | optimized or public image with caption |
| `<Steps>` | numbered procedural wrapper |
| `<Step title?>` | single procedural step |

See [Components](./components).

## Build output

```txt
site/build/
├── index.html
├── llms.txt
├── docs/
├── writing/
├── assets/
├── pagefind/
└── sitemap-index.xml
```

Search is generated by [Pagefind](https://pagefind.app/) during `tidypress build`.

`llms.txt` lists published pages with public URLs and full markdown bodies (respects `published` / `scheduled`). Disable with `--no-llms-txt` or `capabilities.disable: ['llmsTxt']`. See [Advanced configuration](./advanced-configuration).

## Deploy targets

```bash
tidypress deploy                   # print build/ path
tidypress deploy ./public-docs     # copy build/ locally
tidypress deploy file:///tmp/site  # copy build/ locally
tidypress deploy vercel            # calls vercel CLI
tidypress deploy netlify           # calls netlify CLI
tidypress deploy surge             # calls surge CLI
tidypress deploy github-pages      # calls npx gh-pages
tidypress deploy cloudflare        # calls wrangler
tidypress deploy docker            # writes Dockerfile + docker-compose.yml
tidypress deploy static            # report build/ path for artifact-only deploy
tidypress deploy s3://bucket/path  # calls aws s3 sync
tidypress deploy ssh://host/path   # calls rsync
tidypress deploy gs://bucket/path  # prints external upload instructions
```

Provider targets require their local CLIs or tools. Targets that only report the `build/` path are artifact flows, not full hosted deploys.

## Python wrapper

```bash
pip install tidypress
```

The Python package delegates site commands to the Node.js CLI. Node.js 22.12 or newer is still required for rendering.

Python-native helpers include notebook conversion and source extraction.

See [Python wrapper](./python).
