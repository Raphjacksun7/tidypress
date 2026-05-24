---
title: Configuration
description: The practical shape of docs/docsmint.config.ts.
order: 5
---

DocsMint reads one config file:

```txt
docs/docsmint.config.ts
```

Only `name` is required. Keep the file small until the site needs more shape.

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

## Site metadata

```ts
name: 'my-project',
description: 'Minimal markdown docs and writing.',
siteUrl: 'https://example.com',
```

`name` appears in titles and the header. `description` is used for metadata and homepage copy. `siteUrl` is used for canonical URLs, sitemap output, and social metadata.

## Navigation

Use `nav` for header links and `footer` for lower-page links.

```ts
nav: [
  { label: 'docs', href: '/docs' },
  { label: 'writing', href: '/writing' },
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

Internal links are strict by default. If a site has links that are generated outside DocsMint, use relaxed mode:

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

## Presentation settings

Keep presentation separate from the base config:

- [Site layout](./site-layout) covers sidebar groups, chapter navigation, homepage previews, indexes, tags, and icons.
- [Theme](./theme-typography) covers typography, theme mode, code highlighting, and custom tokens.
- [Advanced configuration](./advanced-configuration) covers i18n, versions, analytics, capabilities, and `docsmint context`.
