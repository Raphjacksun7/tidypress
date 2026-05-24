---
title: Site layout
description: Configure sidebar groups, chapter navigation, homepage previews, indexes, tags, and icons.
order: 6
---

Start without layout config. Add only the overrides your site needs.

## Hero bar

The home hero is off by default. Enable it in config when you want role, pronunciation, lead, and links above homepage previews:

```ts
hero: {
  enabled: true,
  role: 'Engineer',
  lead: 'Short bio on the home page.',
  links: [
    { label: 'GitHub', href: 'https://github.com/you', external: true },
  ],
},
```

Use `docsmint init --preset persona` for a starter layout with hero, projects, and an about page.

## Sidebar

Without `docs.sidebar`, DocsMint builds the docs sidebar from published docs entries and their `order` frontmatter.

```yaml
---
title: Getting started
order: 1
---
```

Use explicit groups when the docs need named sections:

```ts
docs: {
  sidebar: [
    {
      label: 'Start',
      items: ['why-docsmint', 'getting-started'],
    },
    {
      label: 'Configure',
      items: ['configuration', 'site-layout'],
    },
  ],
}
```

`items` are docs slugs relative to `docs/src/content/docs/`:

```txt
docs/src/content/docs/getting-started.md -> getting-started
docs/src/content/docs/manual/install.md -> manual/install
```

With explicit groups, a page exists but does not appear in the sidebar unless its slug is listed.

## Chapter navigation

Docs pages show previous and next links by default. Control them globally:

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
title: Why DocsMint
paging: false
---
```

## Homepage previews

Homepage previews default to writing first, then docs. Use `home` to change order or display:

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

`home.order` lists **collection keys** from `collections`, not `label` values. A projects showcase keyed as `works` belongs in the array as `'works'`:

```ts
home: {
  order: ['writing', 'works'],
  collections: {
    works: { layout: 'card', showDescription: true },
  },
},
```

### Home presets

`home.preset` applies default section order (and lab/persona project card layout) when you omit `home.order`. It does **not** enable or disable collections — set `collections` and `capabilities` separately.

| `home.preset` | Default `home.order` |
|---------------|----------------------|
| `lab` | `['writing', 'projects']` + project cards on homepage |
| `blog` | `['writing']` |
| `docs-writing` | `['writing', 'docs']` |
| `persona` | `['projects', 'writing']` + project cards on homepage |

```ts
home: {
  preset: 'lab',
  previewLimit: 4,
},
```

Explicit `home.order` and `home.collections` override preset defaults.

Defaults:

| Option | Default |
|--------|---------|
| `home.previewLimit` | `5` |
| `home.order` | `['writing', 'docs']` |
| `layout` | `list` |
| `gap` | `sm` |
| writing dates on homepage | shown |
| descriptions on homepage | hidden |
| tags | hidden |

## Index pages

Collection index display is separate from homepage display:

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

Layouts:

| Value | Use for |
|-------|---------|
| `list` | compact rows |
| `card` | richer rows |

Gaps:

| Value | Use for |
|-------|---------|
| `sm` | tight lists |
| `md` | normal card stacks |
| `lg` | airy landing pages |

## Tags and icons

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
