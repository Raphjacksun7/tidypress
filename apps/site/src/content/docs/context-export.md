---
title: Context export
description: Generate a compact markdown snapshot of your published content.
order: 10
published: false
---

`tidypress context` writes a compact markdown snapshot of the site.

## Run it

```bash
tidypress context
```

```txt
tidypress-context.md
```

```bash
tidypress context ./docs-context.md
```

## Output

Each entry includes:

- collection name
- source path
- title
- description
- excerpt

```md
# TidyPress Context Snapshot

- [docs] Getting started
  - path: `src/content/docs/getting-started.md`
  - description: A minimal docs page.
  - excerpt: Use this page to introduce the project.
```

## Filters

- disabled starter collections
- `published: false`
- entries scheduled in the future
- missing or empty content folders

```yaml
---
title: Draft
published: false
---
```

```yaml
---
title: Launch notes
scheduled: 2026-06-01T09:00:00Z
---
```

## Collections

```ts
collections: {
  docs: { enabled: true },
  writing: { enabled: true, kind: 'writing' },
  playbooks: { enabled: true, basePath: '/playbooks', kind: 'content' },
}
```

Enabled custom collections appear in the snapshot.

Python users can run the same command through the Python wrapper. The site-rendering command is still delegated to the Node CLI.
