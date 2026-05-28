<h1 align="center">
  <img src="./packages/engine/public/favicon-white.svg" alt="" width="48" height="48">
  <br>
  tidypress
</h1>

<p align="center">
  <strong>A publishing framework for Git-native authorship.</strong><br>
  Markdown in git → one CLI → a static site you own (writing, projects, body of work, optional docs).
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

<p align="center">
  <a href="https://tidypress.pages.dev/"><strong>Live demo → tidypress.pages.dev</strong></a>
</p>

---

## Highlights

- **One command to a real site** — `init`, `dev`, `build`; static output in `docs/build/`
- **Presets, not blank folders** — `lab`, `blog`, `persona`, `body-of-work`, `docs-writing`, `custom`
- **Body of work in git** — works, projects, writing, reference, process; product `docs` when you want them
- **Search + RSS + SEO** — Pagefind at build time; writing feeds; sitemap when `siteUrl` is set
- **`llms.txt` for agents** — full published markdown on every build (opt out if you want)
- **Deploy anywhere** — Cloudflare Pages, GitHub Pages, Netlify, Vercel, or any static host

---

## Quickstart

**Requires Node.js 22.12+.** The Python package wraps helpers; site commands use the Node CLI.

```sh
# 1. Install
npm install tidypress

# 2. Scaffold + run locally
npx tidypress init --site-url https://yoursite.example
npx tidypress dev
```

Open **http://localhost:4321** — default **lab** preset (writing + projects on the home page).

```sh
# 3. Ship static files
npx tidypress build
npx tidypress preview
```

Upload **`docs/build/`** (HTML, Pagefind search, `llms.txt`, sitemap when `siteUrl` is production-ready).

```sh
pip install tidypress   # optional Python wrapper; rendering still uses Node
```

---

## Presets

| Preset | What you get |
|--------|----------------|
| `lab` (default) | Writing + projects; docs off |
| `blog` | Writing only |
| `persona` | Hero, projects, writing, about page |
| `body-of-work` | Works, projects, writing, reference, process |
| `body-of-work-docs` | Body of work + enabled `docs` |
| `docs-writing` | Docs + writing |
| `custom` | Docs + writing + sample custom collection |

`default` is an alias for `lab`. See [Getting started](https://tidypress.pages.dev/docs/getting-started) and [Body of work](https://tidypress.pages.dev/docs/body-of-work).

---

## Why TidyPress

Most static setups assume **one** shape: a docs site or a blog. TidyPress is for engineers who want a **public interface** for repos, writing, projects, and product knowledge—without giving up git or handing content to a hosted CMS.

- Markdown and MDX stay in **`docs/src/content/`**
- **Opinionated nav and home** from presets; escape hatches in config
- **No account required** to build locally; you own the `build/` folder
- **Agent-friendly** — `build/llms.txt` plus optional [Cursor / Claude / Codex skills](./skills/README.md)

---

## Compared to a docs-only site

| | Docs-only theme | TidyPress |
|---|-----------------|-----------|
| Primary use | Manual / API reference | Whole public presence |
| Home page | Often docs index | Writing + projects (or body-of-work) |
| Collections | Usually `docs` | Writing, projects, pages, works, reference, process |
| Install | Bring your own stack | Single `npm install` (see install size below) |
| Output | Static HTML | Static HTML + search + RSS + optional `llms.txt` |

---

## Commands

| Command | Purpose |
|---------|---------|
| `tidypress init [--preset <name>] [--site-url <url>]` | Scaffold `docs/` |
| `tidypress dev` / `preview` | Local dev / preview production build |
| `tidypress build [--no-llms-txt]` | Static site → `docs/build/` |
| `tidypress deploy [target]` | Hand off `build/` to a host or CLI |
| `tidypress doctor` | Baseline setup check |
| `tidypress skills install` | Agent skills for Cursor, Claude Code, Codex |

Full reference: [CLI docs](https://tidypress.pages.dev/docs/reference) · `tidypress --help`

---

## Project layout

```txt
docs/
├── tidypress.config.ts
├── public/
└── src/content/
    ├── writing/      # posts, RSS, tags
    ├── projects/     # cards + optional pages
    ├── docs/         # optional product docs
    └── pages/        # /about, /now, …
```

---

## Install size

`tidypress` bundles Astro, Vite, and Pagefind so **`init` and `build` work without assembling a stack**. The tarball is larger than a linter-only tool; you trade download size for a single-command path. A slimmer install (peer deps) may come later.

---

## Examples

From the repo root after `pnpm install`:

```sh
pnpm --filter @tidypress/example-lab build
pnpm --filter @tidypress/example-blog build
pnpm --filter @tidypress/example-persona build
```

More: [`examples/`](./examples/) · [Examples guide](https://tidypress.pages.dev/docs/examples)

---

## Packages

| Package | Role |
|---------|------|
| `tidypress` | CLI (what you install from npm) |
| `@tidypress/engine` | Astro rendering |
| `@tidypress/config` | Config schema and defaults |
| `wrappers/python` | Python entrypoint |

---

## Contributing

[CONTRIBUTING.md](./CONTRIBUTING.md) · [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) · [SECURITY.md](./SECURITY.md) · [RELEASING.md](./RELEASING.md)

```sh
pnpm install && pnpm test && pnpm build
```

---

## Star history

<a href="https://star-history.com/#Raphjacksun7/tidypress&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Raphjacksun7/tidypress&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Raphjacksun7/tidypress&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Raphjacksun7/tidypress&type=Date" />
  </picture>
</a>
