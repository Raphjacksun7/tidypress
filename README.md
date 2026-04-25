# DocsMint

Minimal markdown documentation builder. Write docs in markdown, get a fast static site.

DocsMint is an opinionated markdown publishing system for documentation and writing.
DocsMint is created to eliminate time from content to production, with no friction.

You write markdown. DocsMint handles the engine, theme, layout, search, and build pipeline.

## Install

### Node.js (primary)

```sh
npm install -g docsmint
# or
npx docsmint@latest
```

### Python wrapper (optional)

```sh
pip install docsmint
```

The Python package is a wrapper around the Node.js CLI and requires Node.js on the machine.

## Quick start

```sh
# from your project root
docsmint init
docsmint dev
```

Then open `http://localhost:4321`.

## CLI commands

```sh
docsmint init                 # scaffold docs/ structure
docsmint dev                  # run local dev server
docsmint build                # build static output
docsmint preview              # preview production build
docsmint deploy [target]      # host-agnostic deploy flow
docsmint clean                # remove docs/.docsmint workdir
docsmint context              # export LLM-friendly content snapshot
```

## Project structure

```txt
docs/
├── docsmint.config.ts
└── src/
    └── content/
        ├── docs/
        │   └── getting-started.md
        ├── writing/
        │   └── hello.md
        └── pages/
            └── about.md
```

Users only maintain docs content and config. The rendering engine remains internal.

## Configuration

```ts
// docs/docsmint.config.ts
export default {
  name: 'my-project',
  description: 'Minimal markdown docs and writing.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  writing: {
    description: 'Engineering notes, architectural decisions, and observations.',
  },
  footer: [],
  siteUrl: 'https://example.com',
}
```

## Pages (bounded customization)

DocsMint supports controlled custom pages without turning into a plugin framework.

- Custom top-level pages via `pages`
- Optional navbar entry via `navLabel`
- Markdown source in `docs/src/content/pages/`
- Shared DocsMint UI and layout rules remain enforced

## Navigation model

DocsMint keeps top navigation constrained for visual quality.

- Desktop visible links are budgeted
- Mobile visible links are budgeted
- Overflow items are moved into an inline `more` popover
- External links support `target` / `rel` safely
- Strict mode validates internal routes

## Frontmatter example

```md
---
title: Getting started
description: Welcome to DocsMint.
order: 1
---
```

## Author

Raphael Avocegamou  
GitHub: [Raphjacksun7](https://github.com/Raphjacksun7)
