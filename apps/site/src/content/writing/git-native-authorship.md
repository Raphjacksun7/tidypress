---
title: Git-native authorship
date: "2026-05-26"
description: Why the publish tree and the build receipt matter more than another writing surface.
tags:
  - writing
featured: true
---

Most publishing tools optimize the moment you hit Publish. The problem I kept running into was earlier than that: the repo already had the real material, but the public version of the work was a separate surface I had to rebuild.

TidyPress optimizes the whole loop: the folder layout in git, review on a pull request, and a static `build/` folder you can point at in production.

[Simon Willison](https://simonwillison.net/) has been spelling out the operational version for years — canonical drafts in files you control, real URLs, models that propose edits while you keep the repo. That discipline predates the current model wave. TidyPress implements it as a small CLI and a repeatable public shape.

## The public interface is the repo

An engineer’s public face is scattered by default: README fragments, release notes, half-finished wikis, posts on feeds you do not own. The source is already in git; the missing layer is the public interface. TidyPress assembles **one publish root**:

```txt
site/
├── tidypress.config.ts
└── src/content/
    ├── writing/    # dated posts (RSS, tags, archive)
    ├── projects/   # cards + optional pages (lab preset)
    └── docs/       # docs collection — sidebar-ordered guides at /docs/…
```

`writing/` holds dated posts with RSS. `projects/` drives the home page. The **`docs` collection** at `docs/` is sidebar-ordered manuals at `/docs/…` (enable per preset or config). Enable collections in config; shape the site to the work.

## Build output is the contract

`tidypress build` produces HTML you can host anywhere and **`build/llms.txt`**: titles, URLs, full markdown bodies of everything that shipped. Agents read that file the way humans read the site — one artifact, generated from the same source tree.

Pagefind runs at build time, so search indexes exactly what you built.

## Site shape, your prose

TidyPress fixes navigation, home sections, collection kinds, and the path from markdown to `build/`. You write the pages. The conventions exist so every new repository does not reinvent the presentation layer from scratch.

```bash
npx tidypress init --preset lab --site-url https://yoursite.example
```

[Why TidyPress](/docs/why-tidypress) states the thesis in one page. [Agents and markdown](/writing/agents-and-markdown) walks the same pipeline when the co-author is a model.
