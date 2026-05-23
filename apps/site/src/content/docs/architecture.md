---
title: Architecture
description: How the CLI, config package, Astro engine, and generated workdir fit together.
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

Three packages share the work: commands, config, rendering.

## Build flow

When you run `docsmint dev` or `docsmint build`, the CLI finds your `docs/` folder and prepares `docs/.docsmint/`.

```txt
docs/
├── docsmint.config.ts
├── src/content/
└── .docsmint/
    ├── astro.config.mjs
    ├── src/
    ├── public/
    ├── docsmint.config.ts
    └── dist/
```

The workdir contains the engine package plus your content and config:

1. The CLI resolves the docs directory.
2. It validates navigation and config.
3. It syncs the engine into `.docsmint/`.
4. It links content during dev or copies content during build.
5. It runs Astro inside `.docsmint/`.
6. On build, it runs Pagefind over `dist/`.

The workdir is generated. Source changes belong in `docs/src/content/` and `docs/docsmint.config.ts`.

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

Deploy commands work from static output: local copies, provider CLIs, Docker files, or artifact paths.

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

`packages/engine` is an Astro project. It owns:

- layouts
- routing strategies
- collection views
- MDX components
- sidebar and table-of-contents UI
- theme CSS
- Pagefind search UI
- sitemap and metadata output

Routing starts from enabled collections. A `docs` page gets docs chrome. A `kind: writing` collection gets dated posts. A `kind: page` collection gets root-level pages. A `kind: content` collection uses docs-like routing.

## Content model

Docs pages live in:

```txt
docs/src/content/docs/
```

They support `form`:

- `doc` for normal documentation
- `manual` for procedural pages

`doc` is the default form. It includes sidebar navigation, table of contents, and chapter previous/next links. `manual` uses a procedural chrome for install, configure, and run guides.

Writing posts live in:

```txt
docs/src/content/writing/
```

They use dates for sorting.

Custom collections live beside those folders and are configured in `docsmint.config.ts`.

## Search

Search is powered by [Pagefind](https://pagefind.app/).

`docsmint build` renders HTML, then builds the Pagefind index from `docs/.docsmint/dist/`.

You can exclude pages with:

```yaml
---
search: false
---
```

or with `search.exclude` in config.

## Python wrapper

The Python package delegates site commands to the Node.js CLI and carries Python-native helpers for notebook conversion and source extraction.

## Extension points

Advanced projects can extend rendering with:

- `collections.<key>.render`
- `extensions.docForms`
- project-local presentation modules
- optional Astro view files

Start with markdown, collections, and config. Add custom rendering when the built-in docs, writing, and page layouts stop fitting.
