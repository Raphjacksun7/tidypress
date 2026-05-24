---
title: Versions
description: Use folder-based docs versions and the version selector.
order: 7
published: false
---

Folder-based docs versions.

## Configure versions

```ts
export default defineConfig({
  name: 'my-project',
  versions: [
    { label: 'v2 (latest)', path: '/docs' },
    { label: 'v1', path: '/docs/v1' },
  ],
})
```

The first version can live at `/docs`, so the latest docs keep clean URLs. With that setup, current pages use `/docs/getting-started`, not `/docs/v2/getting-started`.

## Content

```txt
docs/src/content/docs/
├── getting-started.md
├── configuration.md
└── v1/
    ├── getting-started.md
    └── configuration.md
```

Routes:

```txt
/docs/getting-started
/docs/v1/getting-started
```

## Scaffold a version

```bash
docsmint add-version 2.0
```

```txt
docs/src/content/docs/v2.0/getting-started.md
```

Set `latest` at the same time:

```bash
docsmint add-version 2.0 --set-latest
```

```txt
docs/src/content/docs/latest -> v2.0
```

That helper is useful when you want a `latest` content folder. For a root-anchored latest version, keep the current docs directly under `docs/src/content/docs/` and put archived versions in folders like `v1/`.

## Version selector

Configured versions appear in the docs right rail above the table of contents.

## Sidebar and chapter nav

Sidebar links and doc chapter navigation stay inside the active version path.

## Search

Search is built from the whole static output. The client filters results to the active version path when it can detect one.
