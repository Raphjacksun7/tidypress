---
title: "Release: TidyPress 1.0"
date: "2026-05-27"
description: What shipped in the first stable line — CLI, presets, static output, and agent-facing build artifacts.
tags:
  - release
  - writing
featured: true
---

TidyPress 1.0 is the stable line for git-native publishing: markdown in a publish root, `tidypress build`, static output in `site/build/` you deploy with the host you already use. The durable artifacts are the tree and the build folder — inspectable, diffable, portable.

## Install

```bash
npm install tidypress
# or
pip install tidypress
```

Node.js **22.12+** is required for rendering. The Python package wraps the same CLI for notebooks and helper commands; site builds still go through the Node engine.

## What you get

**One publish root.** `tidypress init` scaffolds `site/` with `tidypress.config.ts`, typed collections under `src/content/`, and a gitignored `build/`.

**Presets for real site shapes:**

| Preset | Shape |
|--------|--------|
| `lab` (default) | writing + projects on the home page |
| `blog` | writing only |
| `persona` | hero, projects, writing, about page |
| `body-of-work` | works, projects, writing, reference, process |
| `body-of-work-docs` | body-of-work + enabled `docs` collection |
| `docs-writing` | `docs` collection + writing |

**Collections** — `writing` (RSS, dates), `projects` / `works` (home cards), `docs` (sidebar-ordered guides at `/docs/…`; enable per preset or config), plus custom keys with known kinds.

**Build artifacts:**

- Static HTML, Pagefind search, sitemap when `siteUrl` is set
- `build/llms.txt` — full published markdown and URLs for agents. Skip with `--no-llms-txt` or config.
- `tidypress deploy` for common static hosts

**Agent skills** — `npx tidypress skills install` copies framework skills into Cursor, Claude Code, or Codex.

## Commands

`init`, `dev`, `build`, `preview`, `clean`, `deploy`, `doctor`, `import devto`, `skills install`, `add-version`.

Experimental surfaces `editor`, `export`, and `ai` stay behind explicit config flags.

## 1.0.x policy

Patch releases on the **1.0.x** line until the next planned minor.

## Try it

```bash
npx tidypress init --site-url https://yoursite.example
npx tidypress dev
npx tidypress build
```

Docs: [Getting started](/docs/getting-started) · [Examples](/docs/examples) · [GitHub](https://github.com/Raphjacksun7/tidypress)
