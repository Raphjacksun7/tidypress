<h1 align="center">
  <img src="./packages/engine/public/favicon-white.svg" alt="" width="40" height="40">
  tidypress
</h1>

A publishing framework for Git-native authorship.

[Website](https://tidypress.pages.dev/) · [Documentation](https://tidypress.pages.dev/docs) · [npm](https://www.npmjs.com/package/tidypress) · [PyPI](https://pypi.org/project/tidypress/) · [Issues](https://github.com/Raphjacksun7/tidypress/issues)

[![CI](https://github.com/Raphjacksun7/tidypress/actions/workflows/ci.yml/badge.svg)](https://github.com/Raphjacksun7/tidypress/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/tidypress.svg)](https://www.npmjs.com/package/tidypress)
[![License: MIT](https://img.shields.io/badge/license-MIT-black.svg)](./LICENSE)

Markdown in git. `tidypress init`, `dev`, `build` — static output you own. Optional docs when you need a manual.

TidyPress is the public interface for an engineer's repos and work: writing, ideas, projects, references, and product knowledge in one owned site.

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

`tidypress` ships Astro, Vite, Pagefind, and related tooling in one package so `init` and `build` work without assembling a stack. The install is larger than a markdown linter; that is the tradeoff for a single-command publishing path.

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
docs/build/
```

## File shape

```txt
docs/
├── tidypress.config.ts
├── public/
└── src/content/
    ├── docs/
    ├── writing/
    └── pages/
```

Docs are stable instructions. Writing is dated context. Pages map to root routes.

## Why

- writing and projects on the home page
- optional docs when you need a manual
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
| `tidypress` | CLI: init, dev, build, preview, deploy, context |
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
