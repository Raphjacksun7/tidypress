<h1 align="center">
  <img src="./packages/engine/public/favicon-white.svg" alt="" width="40" height="40">
  docsmint
</h1>

Minimal markdown docs and writing.

[Website](https://usedocsmint.pages.dev/) · [Documentation](https://usedocsmint.pages.dev/docs) · [npm](https://www.npmjs.com/package/docsmint) · [PyPI](https://pypi.org/project/docsmint/) · [Issues](https://github.com/Raphjacksun7/docsmint/issues)

[![CI](https://github.com/Raphjacksun7/docsmint/actions/workflows/ci.yml/badge.svg)](https://github.com/Raphjacksun7/docsmint/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/docsmint.svg)](https://www.npmjs.com/package/docsmint)
[![License: MIT](https://img.shields.io/badge/license-MIT-black.svg)](./LICENSE)

docsmint turns a `docs/` folder into a static site for documentation and dated writing. Write markdown in git, preview locally, build HTML, and deploy the generated folder with the host or script you already use.

## Install

Node.js 22.12 or newer is required for rendering.

```sh
npm install docsmint
# or
pnpm add docsmint
```

Python users can also install the wrapper:

```sh
pip install docsmint
```

The Python package includes Python-native helpers. Site commands still use the Node.js CLI and Astro engine.

## Quickstart

```sh
npx docsmint init
npx docsmint dev
```

Open `http://localhost:4321`.

Production build:

```sh
npx docsmint build
npx docsmint preview
```

Output:

```txt
docs/.docsmint/dist/
```

## File shape

```txt
docs/
├── docsmint.config.ts
├── public/
└── src/content/
    ├── docs/
    ├── writing/
    └── pages/
```

Docs are stable instructions. Writing is dated context. Pages map to root routes.

## Why

- markdown and MDX as source
- content and config stay in your project
- Pagefind search at build time
- clean default UI, dark mode, sitemap, and metadata
- static output you can deploy anywhere
- Astro rendering behind a small CLI

## Examples

Run examples from the repo root after `pnpm install`:

```sh
pnpm --filter @docsmint/example-minimal build
pnpm --filter @docsmint/example-custom-collections build
pnpm --filter @docsmint/example-i18n-versioned build
```

See [`examples/`](./examples/).

## Packages

| Package | Role |
|---------|------|
| `docsmint` | CLI: init, dev, build, preview, deploy, context |
| `@docsmint/engine` | Astro rendering runtime |
| `@docsmint/config` | config schema, defaults, normalization |
| `wrappers/python` | Python entrypoint and Python-native helpers |

End users install `docsmint`.

## Contributors

```sh
pnpm install
pnpm test
pnpm build
```

Before review:

```sh
./agent-os/scripts/verify.sh
```

Release notes live in [`RELEASING.md`](./RELEASING.md).
