---
name: tidypress
description: >-
  TidyPress publishing framework for Git-native sites — init, dev, build, deploy,
  collections, presets, Pagefind search, and build/llms.txt. Use when
  editing site/tidypress.config.ts, markdown in site/src/content, static site output,
  or when the user mentions tidypress, TidyPress, lab/blog/persona presets, or
  engineer-owned publishing in git.
---

# TidyPress

**Pitch:** A publishing framework for Git-native authorship.

**Thesis:** The public interface for an engineer's repos, work, ideas, projects, docs, references, and product knowledge.

Rendering is **Node.js + Astro 6** only. Python (`pip install tidypress`) wraps tooling; site commands still use the Node CLI.

## Project layout

`site/` is the default publish root from `init`. Config can live in any folder with `tidypress.config.ts`.

```txt
site/
├── tidypress.config.ts
├── public/
└── src/content/
    ├── docs/       # docs collection — sidebar-ordered guides at /docs/…
    ├── writing/    # dated posts (RSS, tags, archive)
    ├── pages/      # root routes (e.g. /about)
    └── projects/   # cards + optional pages (lab preset)
```

Build output: `site/build/` (override with `tidypress build --output`).

## CLI

| Command | Purpose |
|---------|---------|
| `tidypress init` | Scaffold `site/` (`--preset …` `--site-url <url>`) |
| `tidypress migrate-sections` | Generate sections→collections migration output |
| `tidypress dev` | Dev server (default port 4321) |
| `tidypress build` | Production static build + Pagefind index (`--no-llms-txt`) |
| `tidypress preview` | Preview production build |
| `tidypress clean` | Remove build + cache |
| `tidypress deploy [target]` | Provider strategies (Cloudflare, Vercel, Netlify, GitHub Pages, …) |
| `tidypress domain` | Print custom domain setup plan |
| `tidypress doctor` | Baseline setup check |
| `tidypress import devto` | Live import; medium/ghost/substack are scaffolds |
| `tidypress skills install` | Install these skills into Cursor / Claude Code / Codex |
| `tidypress add-version` | Scaffold docs version folder (`--set-latest`) |
| `tidypress release-check` | Verify package release metadata |
| `tidypress editor` | Experimental web editor (requires config flag) |
| `tidypress export` | Experimental multiformat export (requires config flag) |
| `tidypress ai` | Experimental AI workflow (requires config flag) |

Node **22.12+** required. Default command if omitted: `dev`.

Install skills: `tidypress skills install --force` or `tidypress --install-skills` (global flag; does not start dev). Detection checks for `~/.cursor`, `~/.claude`, or `~/.codex` directories — not installed binaries.

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

File: `site/tidypress.config.ts` by default — any publish root works.

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

- **Publish root** — folder with `tidypress.config.ts`. `init` defaults to `site/`. Not the same as the **`docs` collection** (`src/content/docs/` → `/docs/…`).
- **Collections** map folders under `src/content/` → route families (`kind`: `writing`, `page`, `projects`, or default content).
- **Capabilities** (`capabilities.enable` / `disable`) toggle starter features (docs, pages, RSS, search, …).
- **Home** (`home.order`, sections) controls homepage sections.
- **Nav policy** `strict` (default) validates internal links; use `relaxed` for external-generated routes.
- **Discovery** — CLI checks cwd, then `site/`, then sibling folders. Set `TIDYPRESS_PUBLISH_ROOT` when ambiguous.

Full config patterns: [reference.md](reference.md).

## Conventions (product)

Opinionated presets + kinds; flexible markdown. `siteUrl` must be production (not `example.com`) for sitemap and absolute canonical/OG. The `docs` collection is first-class; `body-of-work` disables it in favor of reference/process—use `body-of-work-docs` when you want both.

## Content conventions

Use `published: false` for drafts; `scheduled` for future posts. There is no separate `draft` frontmatter field.

- **Writing:** `title`, `description`, `date`; optional `author`, `tags`, `featured`, `ogImage`, `search`, `published`, `scheduled`.
- **Docs:** `title`, `description`, `order`, `form` (`doc` or `manual`); optional `part`, `paging`, `icon`, `tags`, `search`, `published`, `scheduled`.
- **Projects:** `title`, `description`; optional `status`, `featured`, `url`, `repo`, `linkOnly`, `icon`, `tags`, `search`, `published`. Use `url` + `linkOnly: true` for external cards; body for on-site pages; `repo` when the card should link to a repository.
- **Pages:** slug maps to `/slug` (e.g. `about.md` → `/about`).

## MDX components (`.mdx` files only)

Available without imports: `<Callout type="note|warning|tip|quote">`, `<FileTree>`, `<Mermaid code={\`…\`}>`, `<Tabs labels={[]}>` + `<Tab>`, `<Image src alt …>`, `<Steps>` + `<Step>`, `<Tooltip tip="…">`. See site docs `/docs/components`.

## Deploy and search

- Static output works on any static host; `tidypress deploy` wraps common CLIs (e.g. Cloudflare Pages, GitHub Pages).
- **Pagefind** runs after build; do not remove the generated search bundle from `build/`.
- After `tidypress build`, use `build/llms.txt` (full published markdown) for agent context.

## Marketing guardrails (user-facing copy)

- One-liner only: *A publishing framework for Git-native authorship.*
- Lead with the thesis and what the tool does — git, collections, build, ship.
- Avoid negation tours (“not a X, not a Y”) and competitor names; state the positive model instead.
- Keep user-facing copy on the **core CLI** (git → build → static site). Do not pitch unreleased products.
- Use parentheses and tree comments when they compress useful detail — not as a substitute for clear sentences.

## Docs

Official site: https://tidypress.pages.dev/docs

When unsure about schema or flags, prefer site docs and `tidypress --help` over guessing.
