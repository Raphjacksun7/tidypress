---
title: How TidyPress works
description: How the CLI, config package, Astro engine, build output, and cache fit together.
order: 3
---

TidyPress is split into three packages and one optional Python wrapper.

```txt
packages/
├── cli/        # commands, project setup, builds, deploy helpers
├── config/     # typed config, defaults, validation, normalization
└── engine/     # Astro runtime, layouts, routing, components, search UI

wrappers/
└── python/     # Python entrypoint and Python-native helpers
```

## Build flow

When you run `tidypress dev` or `tidypress build`, the CLI resolves your **publish root** and runs the pinned `@tidypress/engine` package. Your markdown stays in place; only a static artifact and a local cache are created.

`init` scaffolds `site/` by default — the conventional publish root for config, content, and `build/`. In a monorepo, config may sit at the project root instead, as in `apps/site/`. The CLI resolves whichever folder contains `tidypress.config.ts`.

```txt
site/
├── tidypress.config.ts
├── src/content/
│   ├── writing/    # dated posts (RSS, tags, archive)
│   ├── projects/   # cards + optional pages (lab preset)
│   └── docs/       # docs collection — sidebar-ordered guides at /docs/…
├── public/
└── build/
```

Steps:

1. The CLI resolves the publish root and validates config.
2. Plugin manifest codegen writes to the cache directory.
3. Astro runs from `node_modules/@tidypress/engine` with `TIDYPRESS_PROJECT_ROOT` pointing at your project.
4. Static HTML is written to `build/`.
5. Pagefind indexes `build/`.
6. The CLI writes `build/llms.txt` with full published markdown for agents. Disable with `capabilities.disable: ['llmsTxt']` or `tidypress build --no-llms-txt`.

Power users can add `@tidypress/astro` and `astro.config.mjs` via `tidypress init --with-astro`.

## CLI package

`packages/cli` owns commands:

- `init`
- `dev`
- `build`
- `preview`
- `clean`
- `deploy`
- `migrate-sections`
- `add-version`
- `domain`
- `import`
- guarded experimental commands: `editor`, `export`, `ai`

The default command is `dev`. Ports default to `4321`.

Deploy commands work from static output in `build/`.

## Config package

`packages/config` defines `defineConfig()`, defaults, capabilities, collections, nav policy, theme tokens, i18n strings, versions, analytics, and legacy migration from `sections` to `collections`.

Only `name` is required. Defaults enable starter collections:

```txt
docs      -> /docs
writing   -> /writing
pages     -> root-level custom pages
```

`collections` is the current section model. `sections` is the legacy shim.

## Engine package

`packages/engine` is an Astro project published as an npm package. It owns:

- layouts
- routing strategies
- collection views
- MDX components
- sidebar and table-of-contents UI
- theme CSS
- Pagefind search UI
- sitemap and metadata output

Bundled client assets land under `assets/` in `build/`.

## Content model

Under the publish root, `src/content/` holds **collections**—typed folders configured in `tidypress.config.ts`.

**Writing** — dated posts with RSS, the default public voice:

```txt
site/src/content/writing/
```

**Projects / works** — home-page work, `kind: 'projects'`:

```txt
site/src/content/projects/
site/src/content/works/
```

**Docs collection** — sidebar-ordered pages at `/docs/…`:

```txt
site/src/content/docs/
```

Forms: `doc` for reference pages, `manual` for procedural guides. Other collection keys use the kinds in config and [Conventions](./conventions).

## Search

Search is powered by [Pagefind](https://pagefind.app/).

`tidypress build` renders HTML, then builds the Pagefind index inside `build/`.

## Python wrapper

The Python package delegates site commands to the Node.js CLI.

## Extension points

Advanced projects can extend rendering with:

- `collections.<key>.render`
- `extensions.docForms`
- project-local presentation modules
- optional Astro view files (resolved via `@project/`)
- `@tidypress/astro` integration for explicit Astro projects

See [CI and deployment](/docs/manual/ci) for caching and upload guidance.
