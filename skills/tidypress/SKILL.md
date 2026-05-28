---
name: tidypress
description: >-
  TidyPress publishing framework for Git-native sites — init, dev, build, deploy,
  collections, presets, Pagefind search, and build/llms.txt. Use when
  editing docs/tidypress.config.ts, markdown in docs/src/content, static site output,
  or when the user mentions tidypress, TidyPress, lab/blog/persona presets, or
  engineer-owned publishing in git.
---

# TidyPress

**Pitch:** A publishing framework for Git-native authorship.

**Thesis:** The public interface for an engineer's repos, work, ideas, projects, docs, references, and product knowledge.

Rendering is **Node.js + Astro 6** only. Python (`pip install tidypress`) wraps tooling; site commands still use the Node CLI.

## Project layout

```txt
docs/
├── tidypress.config.ts
├── public/
└── src/content/
    ├── docs/       # stable manuals (optional)
    ├── writing/    # dated posts (RSS, tags, archive)
    ├── pages/      # root routes (e.g. /about)
    └── projects/   # cards + optional pages (lab preset)
```

Build output: `docs/build/` (override with `tidypress build --output`).

## CLI (load before suggesting commands)

| Command | Purpose |
|---------|---------|
| `tidypress init` | Scaffold `docs/` (`--preset …` `--site-url <url>`) |
| `tidypress dev` | Dev server (default port 4321) |
| `tidypress build` | Production static build + Pagefind index |
| `tidypress preview` | Preview production build |
| `tidypress clean` | Remove build + cache |
| `tidypress deploy [target]` | Provider strategies (Cloudflare, Vercel, Netlify, GitHub Pages, …) |
| `tidypress doctor` | Baseline setup check |
| `tidypress import devto` | Live import; medium/ghost/substack are scaffolds |
| `tidypress skills install` | Install these skills into Cursor / Claude Code / Codex |

Node **22.12+** required. Default command if omitted: `dev`.

## Presets (`tidypress init --preset`)

| Preset | Home / collections |
|--------|-------------------|
| `lab` (default) | writing + projects; docs/pages off |
| `blog` | writing only |
| `persona` | hero, projects, writing, about page |
| `body-of-work` | works, projects, writing; reference/process in footer; docs off |
| `body-of-work-docs` | body-of-work + enabled `docs` |
| `docs-writing` | docs + writing |
| `custom` | docs + writing + sample custom collection |

`default` aliases `lab`.

## Config essentials

File: `docs/tidypress.config.ts`

```ts
import { defineConfig } from 'tidypress/config'

export default defineConfig({
  name: 'my-site',
  description: 'A publishing framework for Git-native authorship.',
  siteUrl: 'https://yoursite.example', // required for sitemap + absolute canonical/OG
  nav: [
    { label: 'writing', href: '/writing' },
    { label: 'projects', href: '/projects' },
  ],
  collections: {
    writing: { enabled: true, basePath: '/writing', kind: 'writing', label: 'writing' },
    projects: { enabled: true, basePath: '/projects', kind: 'projects', label: 'projects' },
    docs: { enabled: false, basePath: '/docs', label: 'docs' },
  },
})
```

- **Collections** map folders → route families (`kind`: `writing`, `page`, `projects`, or default content).
- **Capabilities** (`capabilities.enable` / `disable`) toggle starter features (docs, pages, RSS, search, …).
- **Home** (`home.order`, sections) controls homepage sections.
- **Nav policy** `strict` (default) validates internal links; use `relaxed` for external-generated routes.

Full config patterns: [reference.md](reference.md).

## Conventions (product)

Opinionated presets + kinds; flexible markdown. `siteUrl` must be production (not `example.com`) for sitemap and absolute canonical/OG. Product docs: `docs` collection or `body-of-work-docs` preset — not mixed into default `body-of-work` header nav.

## Content conventions

- **Writing:** frontmatter `title`, `description`, `date`; optional `tags`, `featured`, `draft` / `published` / `scheduled`.
- **Docs:** stable titles; versioned docs via `tidypress add-version`.
- **Projects:** `url` + `linkOnly: true` for external cards; body for on-site pages.
- **Pages:** slug maps to `/slug` (e.g. `about.md` → `/about`).

## Deploy and search

- Static output works on any static host; `tidypress deploy` wraps common CLIs (e.g. Cloudflare Pages, GitHub Pages).
- **Pagefind** runs after build; do not remove the generated search bundle from `build/`.
- After `tidypress build`, use `build/llms.txt` (full published markdown) for agent context.

## Marketing guardrails (user-facing copy)

- One-liner only: *A publishing framework for Git-native authorship.*
- Do **not** lead with "documentation platform", competitor names, or stacked slogan lists.
- Hosted platform (task 22) and editor app (task 19) are **separate layers** — not the core CLI pitch.

## Docs

Official site: https://tidypress.pages.dev/docs

When unsure about schema or flags, prefer site docs and `tidypress --help` over guessing.
