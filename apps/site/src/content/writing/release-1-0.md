---
title: "TidyPress 1.0"
date: "2026-05-27"
description: The first stable line for a repo-shaped public interface.
tags:
  - release
  - writing
featured: true
---

TidyPress 1.0 is the first version I am comfortable calling stable.

That means something specific here: the content model is locked, the CLI surface is versioned, and the build artifact is predictable enough that I trust it for my own site. Before 1.0, I was not confident I would not break my own publishing between releases. Now I am.

The tool solves one problem. Working material lives in git. The public site gives that work a shape. The build folder is the artifact you host. If that sentence describes something you want, TidyPress is probably worth a look. If it does not, the rest of this post will not change your mind, and that is fine.

## Install

```bash
npm install tidypress
# or
pip install tidypress
```

Node.js **22.12+** is required for rendering. The Python package wraps the same CLI for notebooks and helper commands. Site builds go through the Node engine either way.

## What 1.0 actually stabilizes

### One publish root

`tidypress init` scaffolds `site/` with `tidypress.config.ts`, typed collections under `src/content/`, and a gitignored `build/`. You do not have to decide where things live. The convention is the decision.

### Presets for different shapes of work

Different sites have different structures. The presets are my best guess at the common ones:

| Preset | What it gives you |
|--------|-------------------|
| `lab` (default) | writing + projects on the home page |
| `blog` | writing only |
| `persona` | hero, projects, writing, about |
| `body-of-work` | works, projects, writing, reference, process |
| `body-of-work-docs` | body-of-work with `docs` collection enabled |
| `docs-writing` | docs + writing, for tool-shaped sites |

These are starting points. The config is TypeScript and the collections are typed, so diverging from the preset is a normal code change, not a workaround.

### Collections with reader-legible names

`writing` for dated thinking. `projects` and `works` for outcomes with links. `docs` for stable instructions. Custom keys with known kinds when none of those fit. The names matter because they encode a promise to the reader: dated thinking ages, outcomes are evaluable, docs are maintained. Collapsing all of that into `posts/` loses the distinction.

### Build artifacts you can inspect

Every `tidypress build` produces the same things: static HTML, a [Pagefind](https://pagefind.app/docs/) search index, and a sitemap when `siteUrl` is set. When the `agent-readable` flag is on, a published markdown copy generates from the same build. None of it requires a server to serve.

```bash
tidypress deploy
```

deploys to the static host in your config. The artifact that CI built is the artifact that ships.

### Agent skills

```bash
npx tidypress skills install
```

Installs the repo conventions into Cursor, Claude Code, or Codex as a readable skill file. The agent learns the folder layout, the collection kinds, and the build contract. It proposes diffs. You review them. The editorial layer does not change.

## Full command surface

`init`, `dev`, `build`, `preview`, `clean`, `deploy`, `doctor`, `import devto`, `skills install`, `add-version`.

`editor`, `export`, and `ai` are experimental and require explicit config flags. They are not the 1.0 model.

## Patch policy

Patch releases on `1.0.x` until the next planned minor. Breaking changes go in minor releases with a migration note.

## Try it

```bash
npx tidypress init --site-url https://yoursite.example
npx tidypress dev
npx tidypress build
```

The durable artifacts are intentionally plain: a `site/` tree you can review in git and a static `site/build/` folder you can deploy with whatever host you already use. Inspectable, diffable, portable.

Docs: [Getting started](/docs/getting-started) · [Examples](/docs/examples) · [GitHub](https://github.com/Raphjacksun7/tidypress)