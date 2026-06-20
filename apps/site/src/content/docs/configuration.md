---
title: Configuration
description: The shape of tidypress.config.ts — collections, nav, and site metadata.
order: 5
---

TidyPress reads one config file at the publish root: `site/tidypress.config.ts`. That file defines how writing, work, and the **`docs` collection** are routed—not the prose itself.

```txt
site/tidypress.config.ts
```

Only `name` is required. Keep the file small until the site needs more shape.

```ts
import { defineConfig } from 'tidypress'

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

`name` appears in titles and the header. `description` is used for metadata and homepage copy. `siteUrl` is used for canonical URLs, sitemap output, RSS, and social metadata.

Pass it at init when you know the domain:

```bash
npx tidypress init --site-url https://yoursite.example
```

`tidypress doctor` and `tidypress build` warn when `siteUrl` is still the `https://example.com` placeholder. Until it is set, builds omit absolute canonical/OG URLs and the Astro sitemap (no fake `example.com` hosts). See [Conventions](./conventions).

## Navigation

Use `nav` for header links.

```ts
nav: [
  { label: 'docs', href: '/docs' },
  { label: 'writing', href: '/writing' },
  { label: 'GitHub', href: 'https://github.com/you/project' },
],
```

Navigation is strict by default. Internal `href` values are validated against built routes.

If a site has links that are generated outside TidyPress, use relaxed mode:

```ts
navPolicy: {
  mode: 'relaxed',
}
```

## Footer

Community links for the docs site live in [`CONTRIBUTING.md`](https://github.com/Raphjacksun7/tidypress/blob/main/CONTRIBUTING.md) on GitHub (bug reports, feature requests, security). The product site footer can point to those URLs via `footer.main` link slots.

The page footer has two bands:

| Band | Position | Purpose |
|------|----------|---------|
| **Main** (`main`) | Top | Two plain-text slots (`start` / `end`). Hidden when both are empty and the site has only one locale. |
| **Sub** | Bottom | Icon/text links on the left; attribution on the right. |

The main band is the future extension point for richer blocks (menus, grids, newsletter, banners, and so on). Today it is text only. Markup uses `data-footer-zone` and `data-footer-slot` attributes so later releases can hang structured blocks off the same layout.

### Config shapes

`footer` accepts either:

1. **Link array** — shorthand for sub-footer links only.
2. **Object** — full control over main band, links, copyright, and product credit.

```ts
footer: [
  { label: 'GitHub', href: 'https://github.com/you/project', icon: 'github' },
],
```

```ts
footer: {
  main: {
    start: 'Acme Labs',
    end: 'Questions? hello@example.com',
  },
  copyright: '© {year} {name}',
  links: [
    { label: 'GitHub', href: 'https://github.com/you/project', icon: 'github' },
    { label: 'RSS', href: '/writing/rss.xml', icon: 'rss', external: false },
  ],
},
```

`aside` is accepted as an alias for `main.end`.

### Defaults

Unless you override them:

| Field | Default |
|-------|---------|
| `copyright` | `© {year} {name}` (`{year}` = build year, `{name}` = `name`) |
| `showCredit` | `true` — appends a product credit link on the attribution line |
| `credit` | `prefix: ', Made with '`, `label: 'tidypress'`, `href: 'https://tidypress.pages.dev/'` |
| `links` | If you omit GitHub, one is added using `repository.url` when set, otherwise `https://github.com/you` |
| `main` | Empty — main band hidden until you set `start` / `end` or enable multi-locale i18n |

You do **not** need `showCredit: true` in config; it is already on. Set `showCredit: false` only when you want to hide the product credit segment.

Attribution renders as one line, for example: `© 2026 my-project, Made with tidypress`.

### Field reference

**`main`** — top band text slots. Each slot is plain `string` text or an array of inline links (shown with ` · ` separators).

| Key | Type | Description |
|-----|------|-------------|
| `start` | `string` \| `FooterMainLink[]` | Left slot. |
| `end` | `string` \| `FooterMainLink[]` | Right slot. Language switcher renders here when `i18n.locales` has more than one entry. |

`FooterMainLink` fields: `label`, `href`, optional `external: false` for same-tab internal paths.

```ts
main: {
  start: [
    { label: 'Improve these docs', href: 'https://github.com/you/project/tree/main/apps/site/src/content/docs' },
    { label: 'Share a feature idea', href: 'https://github.com/you/project/issues/new' },
  ],
  end: 'Questions? hello@example.com',
},
```

**`copyright`** — `string` on the sub-footer attribution line. Supports `{year}` and `{name}` tokens.

**`showCredit`** — `boolean`. Default `true`. Set `false` to omit the product credit segment (copyright still shows).

**`credit`** — partial override of the product credit segment. Used only when `showCredit` is true.

| Key | Type | Default |
|-----|------|---------|
| `prefix` | `string` | `', Made with '` |
| `label` | `string` | `tidypress` |
| `href` | `string` | `https://tidypress.pages.dev/` |

**`links`** — `FooterItem[]` in the sub-footer (left). Each item:

| Key | Type | Description |
|-----|------|-------------|
| `label` | `string` | Required. Visible text for text links; screen-reader label for icon links. |
| `href` | `string` | Required. |
| `icon` | `FooterItemIcon` | When set, renders a built-in SVG icon instead of text. |
| `external` | `boolean` | `false` keeps same-tab navigation for internal paths. Icon links default to external/new tab unless `external: false`. |

### Built-in footer icons

Set `icon` to one of:

`github`, `x`, `linkedin`, `discord`, `youtube`, `instagram`, `bluesky`, `facebook`, `reddit`, `twitch`, `mastodon`, `slack`, `telegram`, `tiktok`, `npm`, `rss`, `email`

Text links (no `icon`) render as plain text in the sub-footer.

### Repository URL

`repository.url` feeds the default GitHub footer link when `links` does not already include a `github` icon:

```ts
repository: {
  url: 'https://github.com/you/project',
  branch: 'main',
  editPath: 'site/src/content',
```

`editPath` is relative to the repo root and should cover all collections you want “edit on GitHub” links for. See [Repository links](#repository-links).

### Writing and RSS

When the writing collection is enabled, TidyPress generates a feed at `<writing basePath>/rss.xml`. With the default path, that is `/writing/rss.xml`. Add a footer link when you want the RSS icon in the sub-footer:

```ts
{ label: 'RSS', href: '/writing/rss.xml', icon: 'rss', external: false },
```

### i18n

With multiple locales, a language switcher appears in `main.end` (footer main band). Customize its accessible name via `i18n.strings.<locale>.languageLabel`. See [i18n](./i18n).

### Examples

**Hide product credit** (copyright only):

```ts
footer: {
  showCredit: false,
  links: [{ label: 'GitHub', href: 'https://github.com/you/project', icon: 'github' }],
},
```

**Custom product credit**:

```ts
footer: {
  credit: {
    prefix: ' · Built with ',
    label: 'TidyPress',
    href: 'https://tidypress.pages.dev/',
  },
},
```

**Icon and text links**:

```ts
footer: {
  links: [
    { label: 'GitHub', href: 'https://github.com/you/project', icon: 'github' },
    { label: 'X', href: 'https://x.com/you', icon: 'x' },
    { label: 'Privacy', href: '/privacy', external: false },
  ],
},
```

## Collections

Collections map folders under `src/content/` to route families. The collection key `docs` is the **docs collection** at `/docs/…`; it is not the publish root folder `site/` from `init`.

```ts
collections: {
  writing: {
    enabled: true,
    basePath: '/writing',
    kind: 'writing',
    label: 'writing',
  },
  docs: {
    enabled: false,
    basePath: '/docs',
    label: 'docs',
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
| omitted on `docs` | the `docs` collection, sidebar-ordered routes |
| `content` | reference shelves, playbooks, ADRs |
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
| Collection key `works` | Content folder `site/src/content/works/` and `home.order` entries |
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

Place markdown in `site/src/content/works/`. Match `nav` `href` values to each collection `basePath`.

### Init presets

`tidypress init` seeds content and config. `default` is an alias for `lab`.

| Preset | Shape |
|--------|--------|
| `lab` | writing + projects, docs off |
| `blog` | writing only, docs and pages off |
| `persona` | hero, projects, writing, about page |
| `body-of-work` | works, projects, writing, reference, process, pages; docs disabled |
| `body-of-work-docs` | body-of-work + enabled `docs` |
| `docs-writing` | docs + writing |
| `custom` | docs + writing + a `playbooks` content collection |

```bash
npx tidypress init --preset blog --site-url https://yoursite.example
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

The `persona` preset gives you a hero, projects, optional writing, and an `/about` page. **Experience, education, and skills belong in markdown** on that page or in writing posts — not in structured config blocks.

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
| `collections.pages` with `kind: 'page'` | Astro collection under `src/content/pages/`; includes a `/pages/` index when enabled |

For a single **About** or **CV** page at `/about`, use a file in `src/content/pages/` and list it in config:

```ts
pages: [{ slug: 'about', navLabel: 'about' }],
collections: {
  pages: { enabled: true, kind: 'page' },
},
```

```txt
site/src/content/pages/about.md -> /about
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

Place files in `site/public/`.

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
  editPath: 'site/src/content',
}
```

## Presentation settings

Keep presentation separate from the base config:

- [Site layout](./site-layout) covers sidebar groups, chapter navigation, homepage previews, indexes, tags, and icons.
- [Theme](./theme-typography) covers typography, theme mode, code highlighting, and custom tokens.
- [Advanced configuration](./advanced-configuration) covers i18n, versions, analytics, capabilities, and `build/llms.txt`.
