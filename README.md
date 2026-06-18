<h1 align="center">
  <img src="./packages/engine/public/favicon-white.svg" alt="" width="48" height="48">
  <br>
  tidypress
</h1>

<p align="center">
  <strong>A publishing framework for Git-native authorship.</strong>
</p>

<p align="center">
  <a href="https://tidypress.pages.dev/">Website</a> ·
  <a href="https://tidypress.pages.dev/docs">Docs</a> ·
  <a href="https://www.npmjs.com/package/tidypress">npm</a> ·
  <a href="https://pypi.org/project/tidypress/">PyPI</a> ·
  <a href="https://github.com/Raphjacksun7/tidypress/issues">Issues</a>
</p>

<p align="center">
  <a href="https://github.com/Raphjacksun7/tidypress/actions/workflows/ci.yml"><img src="https://github.com/Raphjacksun7/tidypress/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/tidypress"><img src="https://img.shields.io/npm/v/tidypress.svg" alt="npm version"></a>
  <a href="https://pypi.org/project/tidypress/"><img src="https://img.shields.io/pypi/v/tidypress.svg" alt="PyPI version"></a>
  <img src="https://img.shields.io/node/v/tidypress.svg?label=node" alt="Node 22.12+">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-black.svg" alt="MIT license"></a>
</p>

Markdown in git. `tidypress init`, `dev`, `build` - static output you own. Writing, projects, and a `docs` collection in one publish root.

TidyPress gives an engineer's repo a public shape: writing, projects, docs when useful, references, and the static build artifact that actually shipped.

## Install

Node.js 22.12 or newer is required for rendering.

```sh
npm install tidypress
# or
pnpm add tidypress
```

Python users can also install the wrapper:

```sh
pip install tidypress
```

The Python package includes Python-native helpers. Site commands still use the Node.js CLI and Astro engine.

### Install size

`tidypress` ships Astro, Vite, Pagefind, and related tooling in one package so `init` and `build` work without assembling a stack. The install is larger than a markdown linter; that is the tradeoff for a reliable first site.

A thinner install (peer dependencies, split CLI vs engine packages) is possible later and would trade first-run simplicity for a smaller download. The current core optimizes DX over tarball size.

## Quickstart

```sh
npx tidypress init --site-url https://yoursite.example
npx tidypress dev
```

Open `http://localhost:4321`.

Production build:

```sh
npx tidypress build
npx tidypress preview
```

Output:

```txt
site/build/
```

## File shape

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

Docs are stable instructions. Writing is dated context. Pages map to root routes.

## Why

Your repo already contains the material. TidyPress supplies the repeatable site shape:

- writing and projects on the home page
- `docs` collection for sidebar-ordered guides at `/docs/…` (enable per preset or config)
- markdown and MDX in git, one CLI, static output
- Pagefind search, RSS for writing, archive and tags
- deploy anywhere you host static files

## Examples

Run examples from the repo root after `pnpm install`:

```sh
pnpm --filter @tidypress/example-lab build
pnpm --filter @tidypress/example-blog build
pnpm --filter @tidypress/example-persona build
pnpm --filter @tidypress/example-minimal build
pnpm --filter @tidypress/example-custom-collections build
pnpm --filter @tidypress/example-i18n-versioned build
```

See [`examples/`](./examples/).

## Packages

| Package | Role |
|---------|------|
| `tidypress` | CLI: init, dev, build, preview, deploy (`build/` includes `llms.txt`) |
| `@tidypress/engine` | Astro rendering runtime |
| `@tidypress/config` | config schema, defaults, normalization |
| `wrappers/python` | Python entrypoint and Python-native helpers |

End users install `tidypress`.

## Agent skills (Cursor, Claude Code, Codex)

TidyPress ships [Agent Skills](https://cursor.com/docs/context/skills) so coding agents know the CLI, config, and monorepo conventions.

```sh
npx tidypress skills install
```

After `pnpm add tidypress` (or the first CLI command) in an interactive terminal, you may be prompted to install skills into Cursor, Claude Code, or Codex — same pattern as Cloudflare Wrangler. Force install: `npx tidypress --install-skills`.

See [`skills/README.md`](./skills/README.md).

## Contributors

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for setup, pull requests, and optional AI-assisted workflow. [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) · [`SECURITY.md`](./SECURITY.md)

```sh
pnpm install
pnpm test
pnpm build
```

Release notes live in [`RELEASING.md`](./RELEASING.md).

## Backlog (contributors)

Explicit backlog items (P3 stretch, import scaffolds) are listed in [`RELEASING.md`](./RELEASING.md#explicit-backlog-not-regressions). They are not regressions.
