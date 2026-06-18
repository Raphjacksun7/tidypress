---
title: "Release: TidyPress 1.0"
date: "2026-05-27"
description: The first stable line for turning a repo into a public interface.
tags:
  - release
  - writing
featured: true
---

TidyPress 1.0 is the first stable line for the idea behind the project: your repo already contains the work, and the site should be the public interface for that repo.

The durable artifacts are intentionally boring: a `site/` tree you can review in git and a static `site/build/` folder you can deploy with the host you already use. Inspectable, diffable, portable.

## Install

```bash
npm install tidypress
# or
pip install tidypress
```

Node.js **22.12+** is required for rendering. The Python package wraps the same CLI for notebooks and helper commands; site builds still go through the Node engine.

## What shipped

**One publish root.** `tidypress init` scaffolds `site/` with `tidypress.config.ts`, typed collections under `src/content/`, and a gitignored `build/`.

**Presets for real public surfaces:**

| Preset | Shape |
|--------|--------|
| `lab` (default) | writing + projects on the home page |
| `blog` | writing only |
| `persona` | hero, projects, writing, about page |
| `body-of-work` | works, projects, writing, reference, process |
| `body-of-work-docs` | body-of-work + enabled `docs` collection |
| `docs-writing` | `docs` collection + writing |

**Collections** — `writing` (RSS, dates), `projects` / `works` (home cards), `docs` (sidebar-ordered guides at `/docs/…`; enable per preset or config), plus custom keys with known kinds.

**Build artifacts** keep the publishing contract explicit:

- Static HTML, Pagefind search, sitemap when `siteUrl` is set
- `build/llms.txt` — full published markdown and URLs for agents. Skip with `--no-llms-txt` or config.
- `tidypress deploy` for common static hosts

**Agent skills** teach Cursor, Claude Code, or Codex the same repo shape: `npx tidypress skills install`.

## Command surface

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
