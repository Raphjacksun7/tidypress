---
title: How DocsMint works
description: How the CLI, config package, Astro engine, build output, and cache fit together.
order: 3
---

DocsMint is split into three packages and one optional Python wrapper.

```txt
packages/
├── cli/        # commands, project setup, builds, deploy helpers
├── config/     # typed config, defaults, validation, normalization
└── engine/     # Astro runtime, layouts, routing, components, search UI

wrappers/
└── python/     # Python entrypoint and Python-native helpers
```

## Build flow

When you run `docsmint dev` or `docsmint build`, the CLI resolves your docs directory and runs the pinned `@docsmint/engine` package. Your markdown stays in place; only a static artifact and a local cache are created.

```txt
docs/                          # or project root when config lives there
├── docsmint.config.ts
├── src/content/
├── public/
└── build/                     # gitignored — upload this folder

~/.cache/docsmint/<key>/       # compiler cache (not deployed)
```

Steps:

1. The CLI resolves the docs directory and validates config.
2. Plugin manifest codegen writes to the cache directory.
3. Astro runs from `node_modules/@docsmint/engine` with `DOCSMINT_PROJECT_ROOT` pointing at your project.
4. Static HTML is written to `build/`.
5. Pagefind indexes `build/`.

Power users can add `@docsmint/astro` and an `astro.config.mjs` in the docs directory (`docsmint init --with-astro`).

## CLI package

`packages/cli` owns commands:

- `init`
- `dev`
- `build`
- `preview`
- `clean`
- `deploy`
- `context`
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

Bundled client assets are emitted under `assets/` in `build/` (not `_astro/`).

## Content model

Docs pages live in:

```txt
docs/src/content/docs/
```

They support `form`:

- `doc` for normal documentation
- `manual` for procedural pages

Writing posts live in:

```txt
docs/src/content/writing/
```

Custom collections live beside those folders and are configured in `docsmint.config.ts`.

## Search

Search is powered by [Pagefind](https://pagefind.app/).

`docsmint build` renders HTML, then builds the Pagefind index inside `build/`.

## Python wrapper

The Python package delegates site commands to the Node.js CLI.

## Extension points

Advanced projects can extend rendering with:

- `collections.<key>.render`
- `extensions.docForms`
- project-local presentation modules
- optional Astro view files (resolved via `@project/`)
- `@docsmint/astro` integration for explicit Astro projects

See [CI and deployment](/docs/manual/ci) for caching and upload guidance.
