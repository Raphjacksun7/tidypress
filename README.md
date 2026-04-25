# DocsMint

Minimal markdown documentation builder. Write docs in markdown, get a fast static site — no Astro knowledge required.

## Install

```sh
npm install -g docsmint
# or
npx docsmint@latest
```

## Usage

From your project root:

```sh
docsmint init       # scaffold docs/ in the current project
docsmint dev        # start local dev server (localhost:4321)
docsmint build      # build for production
docsmint preview    # preview the production build
docsmint deploy [target]  # host-agnostic deploy flow
docsmint clean      # remove the working directory
docsmint context    # emit an LLM-friendly content snapshot
```

On first run, docsmint will offer to scaffold a `docs/` directory if none exists.

## Docs structure

Your docs source stays minimal:

```
docs/
├── docsmint.config.ts      # site name, nav, footer
└── src/
    └── content/
        ├── docs/
        │   └── *.md        # documentation pages
        └── writing/
            └── *.md        # articles and release notes
```

The rendering engine (Astro, components, styles) is bundled inside the package and managed automatically.

## Config

```ts
// docs/docsmint.config.ts
export default {
  name: 'my-project',
  description: 'Minimal markdown docs and writing.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  siteUrl: 'https://example.com',
}
```

## Extensions

Extensions are bounded customizations that keep DocsMint's core visual system intact.

- `customPages` creates top-level pages such as `/about`
- `navLabel` adds that page to the navbar
- Page content lives in `docs/src/content/extensions/<slug>.md`

## Navigation policy

DocsMint keeps navigation constrained for layout quality:

- `navPolicy.mode: "strict"` enforces route and nav-budget rules
- `maxVisibleDesktop` and `maxVisibleMobile` control visible header links
- overflow links automatically render in a `more` popover (no drawer)
- internal links must resolve to known routes in strict mode
- external links can use `target: "_blank"` and get safe `rel` values

Use the context snapshot command to export markdown summaries for LLM workflows:

```sh
docsmint context
```

## Author

Raphael Avocegamou  
GitHub: [github.com/Raphjacksun7](https://github.com/Raphjacksun7)

## Page frontmatter

```md
---
title: Getting started
description: Welcome to the docs.
order: 1
---
```
