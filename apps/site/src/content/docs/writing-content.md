---
title: Markdown and frontmatter
description: Content folders, frontmatter fields, links, assets, drafts, and scheduling.
order: 4
---

All markdown sits under the publish root: `site/` with `tidypress.config.ts`, `src/content/`, and `build/`.

Collections are typed directories under `src/content/`. **Writing** and **projects** or **works** often lead the home page. The **`docs` collection** serves sidebar-ordered pages at `/docs/…`.

## Collections

```txt
site/
└── src/content/
    ├── writing/    # dated posts (RSS, tags, archive)
    ├── projects/   # cards + optional pages (lab preset)
    ├── works/      # body-of-work preset
    ├── reference/  # facts shelf (body-of-work)
    ├── process/    # decisions shelf (body-of-work)
    ├── pages/      # root routes (e.g. /about)
    └── docs/       # docs collection — sidebar-ordered guides at /docs/…
```

`writing` uses dates and feeds. `docs` uses sidebar order. `kind: 'projects'` drives the home showcase. Directory names follow collection **keys** in config. `pages` maps to root routes.

## Docs frontmatter

```yaml
---
title: Install
description: Install and configure the project.
order: 1
form: doc
---
```

Fields:

| Field | Purpose |
|-------|---------|
| `title` | Page heading and browser title |
| `description` | Metadata and index summaries |
| `order` | Sidebar order; lower numbers appear first |
| `form` | Docs page model: `doc` or `manual` |
| `part` | Optional chapter group label for doc pages |
| `paging` | Override previous/next chapter links for this page |
| `icon` | Optional card icon path |
| `tags` | Optional SEO tags; render only when `showTags` is enabled |
| `search` | Set `false` to exclude from search |
| `published` | Set `false` to hide from routes, search, and `llms.txt` |
| `scheduled` | Future ISO datetime; hidden until that time |

`form` defaults to `doc`. Use `manual` for procedural guides that should use manual chrome and step-oriented navigation.

Human editors and coding agents use the same files. See [Agents and markdown](/writing/agents-and-markdown) for a practical workflow.

## Writing frontmatter

```yaml
---
title: Release notes
date: "2026-05-22"
description: Notes from the latest release.
author: Jane Smith
---
```

Fields:

| Field | Purpose |
|-------|---------|
| `title` | Post heading and browser title |
| `date` | Sort order on the writing index |
| `description` | Metadata and index summaries |
| `author` | Optional byline |
| `icon` | Optional card icon path |
| `featured` | Pin toward the top of indexes and homepage previews |
| `ogImage` | Open Graph image path (for example `/images/post.png`) |
| `tags` | Optional SEO tags; tag index routes at `/writing/tags/<tag>` when tags are set |
| `search` | Set `false` to exclude from search |
| `published` | Set `false` to keep as a draft |
| `scheduled` | Future ISO datetime; hidden until that time |

Writing posts show estimated reading time on the entry page. Year archive pages are available at `/writing/archive/<year>` when posts exist for that year.

RSS is generated at `<writing basePath>/rss.xml` during build. With the default writing path, that is `/writing/rss.xml`.

## Projects frontmatter

```yaml
---
title: Sample project
description: One line about the work.
status: active
featured: true
url: https://example.com
linkOnly: true
---
```

Fields:

| Field | Purpose |
|-------|---------|
| `title` | Card title |
| `description` | Card summary and metadata |
| `status` | Optional label on cards, such as `active` |
| `featured` | Pin toward the top of indexes and homepage previews |
| `url` | External link; use with `linkOnly: true` for cards that skip an on-site page |
| `repo` | Repository URL used as the card link when `url` is omitted |
| `linkOnly` | When `true` with `url` or `repo`, the card links out without a full project page |
| `icon` | Optional card icon path |
| `tags` | Optional tags; tag index routes at `<basePath>/tags/<tag>`, same pattern as writing |
| `search` | Set `false` to exclude from search |
| `published` | Set `false` to hide from routes and previews |

Enable the collection in config:

```ts
collections: {
  projects: {
    enabled: true,
    basePath: '/projects',
    kind: 'projects',
    label: 'projects',
  },
},
```

Use a custom key and URL (see [Configuration](./configuration#collection-key-url-and-label)):

```ts
collections: {
  works: {
    enabled: true,
    basePath: '/works',
    kind: 'projects',
    label: 'works',
  },
},
```

Files live in `site/src/content/works/`. Add `works` to `nav`, `home.order`, and match `href` to `basePath`.

## Headings

Start sections with `##`. The page title comes from frontmatter.

## Links

Relative links between docs pages are rewritten to site paths at build time:

```md
[Configuration](./configuration)
[Images](./writing-content#images)
[Writing index](/writing)
[External site](https://example.com)
```

External links open in a new tab with safe `rel` attributes.

## Images

Public assets:

```txt
site/public/images/architecture.png
```

```md
![Architecture diagram](/images/architecture.png)
```

Optimized local images:

```mdx
<Image src={import('./architecture.png')} alt="Architecture diagram" caption="Build flow" />
```

## Code blocks

Fenced code blocks:

```ts
export function hello(name: string) {
  return `Hello, ${name}`
}
```

Inline `code` uses the site theme and does not use syntax highlighting.

Fenced blocks get syntax highlighting from the configured code theme and a copy button on hover. See [Configuration](./configuration#typography-and-theme) for presets.

## MDX components

Built-in components are available in `.mdx` files:

- `<Callout>`
- `<Tabs>` and `<Tab>`
- `<FileTree>`
- `<Mermaid>`
- `<Image>`
- `<Tooltip>`
- `<Steps>` and `<Step>`

See [Components](./components) for examples.

## Drafts and scheduling

Hide a page or post:

```yaml
---
published: false
---
```

Schedule a page or post:

```yaml
---
scheduled: 2026-06-01T09:00:00Z
---
```

Unpublished and future-scheduled content is skipped by routes, search, and `build/llms.txt`.

## Search exclusion

Exclude one page:

```yaml
---
search: false
---
```

Exclude path patterns in config:

```ts
search: {
  exclude: ['docs/internal/*', 'writing/drafts/*'],
}
```

## File paths to URLs

Docs pages:

```txt
site/src/content/docs/getting-started.md  -> /docs/getting-started
site/src/content/docs/setup/install.md    -> /docs/setup/install
```

Writing posts:

```txt
site/src/content/writing/hello.md         -> /writing/hello
```

Custom collections use the `basePath` configured for that collection.
