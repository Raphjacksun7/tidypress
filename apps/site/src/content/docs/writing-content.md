---
title: Writing content
description: Frontmatter, markdown, MDX, assets, links, drafts, and file organization.
order: 4
---

Content lives under `docs/src/content/`. Markdown is the default. MDX adds components.

## Collections

```txt
docs/src/content/
├── docs/       # documentation pages
├── writing/    # dated posts
└── pages/      # root-level pages
```

`docs` uses sidebar order. `writing` uses dates. `pages` maps to root routes.

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
| `published` | Set `false` to hide from routes, search, and context output |
| `scheduled` | Future ISO datetime; hidden until that time |

`form` defaults to `doc`. Use `manual` for procedural guides that should use manual chrome and step-oriented navigation.

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
| `tags` | Optional SEO tags; hidden in the UI unless `showTags` is enabled |
| `search` | Set `false` to exclude from search |
| `published` | Set `false` to keep as a draft |
| `scheduled` | Future ISO datetime; hidden until that time |

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
docs/public/images/architecture.png
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

Unpublished and future-scheduled content is skipped by routes, search, and `docsmint context`.

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
docs/src/content/docs/getting-started.md  -> /docs/getting-started
docs/src/content/docs/setup/install.md    -> /docs/setup/install
```

Writing posts:

```txt
docs/src/content/writing/hello.md         -> /writing/hello
```

Custom collections use the `basePath` configured for that collection.
