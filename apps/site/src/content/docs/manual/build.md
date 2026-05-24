---
title: Building
description: Produce a static output folder ready to deploy.
form: manual
order: 4
published: false
---

## Build

From your `docs/` folder:

```bash
docsmint build
```

Output lands in `docs/.docsmint/dist/`. Every file is static — HTML, CSS, JS, and the Pagefind search index.

## Clean first

If you have stale artefacts:

```bash
docsmint clean && docsmint build
```

## What gets built

- All docs and writing entries as individual HTML pages
- `/pagefind/` — the offline full-text search index
- `/og.svg` — Open Graph image
- `/sitemap-index.xml` — sitemap for search engines

## Preview locally

```bash
docsmint preview
```

Serves the built output on [http://localhost:4321](http://localhost:4321) — identical to what your host will serve.
