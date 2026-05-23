---
title: Configuration
description: The practical shape of docs/docsmint.config.ts.
order: 5
---

DocsMint reads one config file:

```txt
docs/docsmint.config.ts
```

Typed config:

```ts
import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'my-project',
  description: 'Minimal markdown docs and writing.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  collections: {
    docs: { enabled: true, basePath: '/docs', label: 'docs' },
    writing: { enabled: true, basePath: '/writing', kind: 'writing', label: 'writing' },
  },
  siteUrl: 'https://example.com',
})
```

Only `name` is required. Everything else has defaults.

## Site metadata

```ts
name: 'my-project',
description: 'Minimal markdown docs and writing.',
siteUrl: 'https://example.com',
```

`name` appears in titles and the header. `description` is used for metadata and homepage copy. `siteUrl` is used for canonical URLs, sitemap output, and social metadata.

## Navigation

```ts
nav: [
  { label: 'docs', href: '/docs', priority: 'core' },
  { label: 'writing', href: '/writing', priority: 'core' },
  { label: 'GitHub', href: 'https://github.com/you/project', target: '_blank' },
],
footer: [
  { label: 'GitHub', href: 'https://github.com/you/project' },
  { label: 'RSS', href: '/rss.xml', icon: 'rss', external: false },
],
```

Navigation is strict by default. Internal `href` values are validated against built routes.

Footer links render as text by default. Set `icon` to render an icon link instead:

```ts
footer: [
  { label: 'GitHub', href: 'https://github.com/you/project', icon: 'github' },
  { label: 'X', href: 'https://x.com/you', icon: 'x' },
  { label: 'Privacy', href: '/privacy', external: false },
]
```

Supported footer icons: `github`, `x`, `linkedin`, `discord`, `youtube`, `instagram`, `bluesky`, `facebook`, `reddit`, `twitch`, `mastodon`, `slack`, `telegram`, `tiktok`, `npm`, `rss`, and `email`.

Relaxed mode:

```ts
navPolicy: {
  mode: 'relaxed',
}
```

## Collections

Collections map content folders to route families.

```ts
collections: {
  docs: {
    enabled: true,
    basePath: '/docs',
    label: 'docs',
  },
  writing: {
    enabled: true,
    basePath: '/writing',
    kind: 'writing',
    label: 'writing',
  },
  guides: {
    enabled: true,
    basePath: '/guides',
    kind: 'content',
    label: 'guides',
  },
}
```

Kinds:

| Kind | Use for |
|------|---------|
| omitted on `docs` | the main docs collection |
| `content` | docs-like sections |
| `writing` | dated posts |
| `page` | standalone pages |

`sections` is the legacy shim.

## Pages

Root pages:

```ts
pages: [
  'about',
  { slug: 'work', navLabel: 'work' },
]
```

The files live in `docs/src/content/pages/`:

```txt
docs/src/content/pages/about.md -> /about
```

## Branding

```ts
branding: {
  icon: '/favicon.svg',
  favicon: '/favicon-white.svg',
}
```

Place files in `docs/public/`.

## Sidebar, Theme, and Display

Keep the root config small. These pages cover the optional display and presentation surfaces:

- [Sidebar navigation](./sidebar-navigation) for explicit sidebar groups and chapter paging
- [Display options](./display-options) for homepage and collection index layout
- [Theme and typography](./theme-typography) for typography scale, color tokens, and code highlighting

## Search

Search is powered by [Pagefind](https://pagefind.app/) and generated during `docsmint build`.

```ts
search: {
  exclude: ['docs/internal/*', 'writing/drafts/*'],
}
```

Exclude one page with frontmatter:

```yaml
---
search: false
---
```

## Repository links

Docs pages can show an “Edit this page” link:

```ts
repository: {
  url: 'https://github.com/you/project',
  branch: 'main',
  editPath: 'docs/src/content',
}
```

## Focused config pages

The details are split into smaller pages:

- [i18n](./i18n) for locale routes and UI strings
- [Versions](./versions) for versioned docs folders
- [Sidebar navigation](./sidebar-navigation) for explicit sidebar groups and chapter paging
- [Display options](./display-options) for homepage previews and collection index layout
- [Theme and typography](./theme-typography) for typography and code highlighting
- [Capabilities](./capabilities) for feature gates and experimental commands
- [Analytics](./analytics) for optional analytics scripts
- [Context export](./context-export) for `docsmint context`
- [Python wrapper](./python) for Python entrypoint helpers
- [Extensibility](./extensibility) for custom renderers and doc forms
- [Reference](./reference) for compact command and schema notes

## Homepage and collection display

Homepage previews default to writing first, then docs. Writing dates are shown by default; descriptions and tags are hidden unless enabled.

Collection indexes have their own display settings, separate from homepage previews.

See [Display options](./display-options).
