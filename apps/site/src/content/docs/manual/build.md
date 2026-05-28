---
title: Building
description: Produce a static output folder ready to deploy.
form: manual
order: 4
published: false
---

## Build

From your `site/` folder:

```bash
tidypress build
```

Output lands in `build/` under your publish root. In a monorepo, the publish root may be the project folder itself — for example `apps/site/` with config at the project root.

## Clean first

If you have stale artefacts:

```bash
tidypress clean && tidypress build
```

## What gets built

- All docs and writing entries as individual HTML pages
- `/pagefind/` — the offline full-text search index
- `/og.svg` — Open Graph image
- `/sitemap-index.xml` — sitemap for search engines

## Preview locally

```bash
tidypress preview
```

Serves the built output on [http://localhost:4321](http://localhost:4321) — identical to what your host will serve.
