---
title: Sidebar navigation
description: Configure docs sidebar groups, automatic ordering, and chapter navigation.
order: 6
published: false
---

Sidebar config applies to the **`docs` collection**. Path examples use `site/` as the publish root from `init`.

Sidebar config is optional.

Without `docs.sidebar`, TidyPress builds the docs sidebar from published docs entries and their `order` frontmatter.

Use `docs.sidebar` only when you want explicit groups, custom ordering, or hidden pages.

## Automatic Sidebar

This is enough for most projects:

```yaml
---
title: Getting started
order: 1
---
```

TidyPress sorts docs pages by `order`, then by title/slug.

## Explicit Groups

Use explicit groups when the docs need named sections:

```ts
docs: {
  sidebar: [
    {
      label: 'Getting started',
      items: ['why-tidypress', 'getting-started'],
    },
    {
      label: 'Configuration',
      items: ['configuration', 'display-options', 'i18n'],
    },
  ],
}
```

`items` are docs slugs relative to the docs collection root. For example:

```txt
site/src/content/docs/getting-started.md -> getting-started
site/src/content/docs/manual/install.md -> manual/install
```

## Optional Group Labels

Group labels are optional:

```ts
docs: {
  sidebar: [
    {
      items: ['getting-started', 'configuration'],
    },
  ],
}
```

Use unlabeled groups when you only need ordering.

## First Docs Page

The `/docs` route points to the first docs entry.

When `docs.sidebar` is configured, the first matching sidebar item wins. Otherwise, the first published docs entry by `order` wins.

## Hidden Pages

With explicit groups, a page exists but does not appear in the sidebar unless its slug is listed.

Use this for landing pages, reference pages, or pages you only link to from another page.

## Chapter Navigation

Docs pages use previous/next chapter navigation by default.

Control it globally:

```ts
docs: {
  paging: 'bottom',
}
```

Options:

| Value | Behavior |
|-------|----------|
| `true` or omitted | show top and bottom navigation |
| `false` | hide navigation |
| `'none'` | hide navigation |
| `'top'` | show only above content |
| `'bottom'` | show only below content |

Override one page:

```yaml
---
title: Why TidyPress
paging: false
---
```

Chapter navigation follows the same ordering as the sidebar when explicit groups are configured.
