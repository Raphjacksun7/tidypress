---
title: Configuration
description: The practical shape of docs/tidypress.config.ts.
order: 5
---

TidyPress reads one config file:

```txt
docs/tidypress.config.ts
```

Only `name` is required. Keep the file small until the site needs more shape.

```ts
import { defineConfig } from 'tidypress/config'

export default defineConfig({
  name: 'my-project',
  description: 'A publishing framework for Git-native authorship.',
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
description: 'A publishing framework for Git-native authorship.',
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
  { label: 'RSS', href: '/writing/rss.xml', icon: 'rss', external: false },
],
```

RSS is generated at `<writing basePath>/rss.xml` (for example `/writing/rss.xml`). The footer can link to it explicitly, or omit the link and rely on the default RSS icon when writing is enabled.

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

Internal links are strict by default. If a site has links that are generated outside TidyPress, use relaxed mode:

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
| `projects` | project cards and optional project pages |
| `page` | standalone pages |

Example projects collection:

```ts
projects: {
  enabled: true,
  basePath: '/projects',
  kind: 'projects',
  label: 'projects',
},
```

### Collection key, URL, and label

Three settings control different surfaces. They are not renamed automatically for each other.

| Setting | Controls |
|---------|----------|
| Collection **key** (for example `works`) | Content folder `docs/src/content/works/` and `home.order` entries |
| **`basePath`** | Public URLs (`/works`, `/works/sample`) |
| **`label`** | UI copy on indexes and the homepage section title |
| **`kind`** | Engine behavior (schema, layout, routing). Must be one of the kinds in the table above |

There is no `kind: 'works'`. Use `kind: 'projects'` for project cards and optional project pages, then pick any key and paths you want.

Rename a projects showcase to **works** everywhere visitors see it:

```ts
nav: [
  { label: 'writing', href: '/writing' },
  { label: 'works', href: '/works' },
],
home: {
  order: ['writing', 'works'],
},
collections: {
  docs: { enabled: false, basePath: '/docs', label: 'docs' },
  writing: { enabled: true, basePath: '/writing', kind: 'writing', label: 'writing' },
  works: {
    enabled: true,
    basePath: '/works',
    kind: 'projects',
    label: 'works',
  },
},
capabilities: {
  disable: ['docs'],
},
```

Place markdown in `docs/src/content/works/`. Match `nav` `href` values to each collection `basePath`.

### Init presets

`tidypress init` seeds content and config. `default` is an alias for `lab`.

| Preset | Shape |
|--------|--------|
| `lab` | writing + projects, docs off |
| `blog` | writing only, docs and pages off |
| `persona` | hero, projects, writing, about page |
| `docs-writing` | docs + writing |
| `custom` | docs + writing + a `playbooks` content collection |

```bash
npx tidypress init --preset blog
```

See [Examples](./examples) for runnable copies under `examples/`.

### Capabilities

Starter collections (`docs`, `writing`, `pages`) respect `capabilities.disable` and `capabilities.enable` after per-collection `enabled` flags. The blog preset disables `docs` and `pages` so empty `/pages/` routes are not generated.

```ts
capabilities: {
  disable: ['docs', 'pages'],
},
```

See [Advanced configuration](./advanced-configuration#capabilities) for the full capability list.

`sections` is the legacy shim.

## Hero bar

The home hero bar is opt-in. Set `enabled: true` to show role, pronunciation, lead, and links above homepage previews:

```ts
hero: {
  enabled: true,
  role: 'Engineer',
  pronunciation: 'your-name',
  lead: 'Short bio on the home page.',
  image: '/images/portrait.jpg',
  links: [
    { label: 'Email', href: 'mailto:you@example.com' },
    { label: 'GitHub', href: 'https://github.com/you', external: true },
  ],
},
```

Omit `hero` or leave `enabled` unset/false to hide the bar. The `persona` init preset enables a starter hero.

### Persona / CV sites

The `persona` preset gives you a hero, projects, optional writing, and an `/about` page. **Experience, education, and skills belong in markdown** on that page (or in writing posts) — not in structured config blocks.

TidyPress does not ship résumé schema (no job blocks, degree blocks, or employment location fields). That keeps the product markdown-first and avoids vague HR metadata (`hybrid`, `remote`, `present`, and similar).

When you need a CV section, use normal headings on `/about`:

```md
## Experience

**Company — Role** · 2022–2024

What you shipped.

## Education

**School — Degree** · 2020
```

Use `projects` for highlights and `writing` for essays; link out with `url` + `linkOnly` when a row is only a link.

## Pages

Two related mechanisms — do not confuse them:

| Mechanism | Purpose |
|-----------|---------|
| `pages: [...]` in config | Register root routes and optional nav labels |
| `collections.pages` with `kind: 'page'` | Astro collection under `src/content/pages/` (includes a `/pages/` index when enabled) |

For a single **About** or **CV** page at `/about`, use a file in `src/content/pages/` and list it in config:

```ts
pages: [{ slug: 'about', navLabel: 'about' }],
collections: {
  pages: { enabled: true, kind: 'page' },
},
```

```txt
docs/src/content/pages/about.md -> /about
```

**Lab** and **blog** presets disable the pages collection so an empty `/pages/` route is not generated. Enable `pages` only when you add root pages (persona enables it for `/about`).

Legacy shorthand (slug only):

```ts
pages: ['about', { slug: 'work', navLabel: 'work' }],
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

Search is powered by [Pagefind](https://pagefind.app/) and generated during `tidypress build`.

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
- [Advanced configuration](./advanced-configuration) covers i18n, versions, analytics, capabilities, and `tidypress context`.
