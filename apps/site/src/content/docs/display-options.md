---
title: Display options
description: Configure homepage previews, collection indexes, cards, lists, dates, descriptions, tags, and gaps.
order: 6
---

Display options are optional. Start without them, then add only the overrides your site needs.

## Defaults

Homepage defaults:

| Option | Default |
|--------|---------|
| `home.previewLimit` | `5` |
| `home.order` | `['writing', 'docs']` |
| `layout` | `list` |
| `gap` | `sm` |
| writing dates on homepage | shown |
| descriptions on homepage | hidden |
| tags | hidden |

Writing dates on the homepage are shown by default. Set `showDate: false` only when you want to hide them.

Descriptions on the homepage are opt-in. `showDescription: false` and an omitted `showDescription` both hide descriptions.

## Homepage

Use `home` for the front page preview sections:

```ts
home: {
  previewLimit: 3,
  order: ['docs', 'writing'],
  collections: {
    writing: {
      showDate: false,
      showDescription: true,
    },
  },
}
```

`home.order` controls section order. Omit it to use the default: writing first, then docs.

`home.previewLimit` controls how many entries each homepage section shows. Omit it to use `5`.

## Layout

Use `layout: 'list'` for compact rows:

```ts
home: {
  collections: {
    writing: {
      layout: 'list',
    },
  },
}
```

Use `layout: 'card'` for richer rows:

```ts
home: {
  collections: {
    docs: {
      layout: 'card',
      showDescription: true,
    },
  },
}
```

If `layout: 'card'` is set but `showDescription` is not true, homepage previews stay compact: title on the left, date on the right for writing entries.

## Gap

Spacing presets:

| Value | Use for |
|-------|---------|
| `sm` | tight lists |
| `md` | normal card stacks |
| `lg` | airy landing pages |

```ts
home: {
  collections: {
    docs: {
      gap: 'lg',
    },
  },
}
```

## Collection Indexes

Use `collections.<key>.display` for collection index pages:

```ts
collections: {
  writing: {
    display: {
      layout: 'card',
      gap: 'md',
      showDate: true,
      showDescription: true,
    },
  },
}
```

Collection index display and homepage display are separate. A writing index can show descriptions while the homepage keeps writing previews compact.

## Tags And Icons

Entries can define tags and icons:

```yaml
---
title: Release notes
date: 2026-05-22
icon: /images/release.svg
tags: [release, notes]
---
```

Tags are emitted in metadata. They render only when `showTags: true`.

Icons render on card-style previews when an entry or display config provides an `icon`.
