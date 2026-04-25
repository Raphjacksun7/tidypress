# Docsmint

Minimal markdown documentation builder. Write docs in markdown, get a fast static site.

Docsmint is an opinionated publishing system for documentation and writing.  
It is built to eliminate time from content to production, with no friction.

## Why Docsmint

- Markdown-first workflow with a constrained, consistent UI
- Built-in docs + writing sections, search, dark mode, and sitemap
- Host-agnostic output: build once, deploy anywhere static files are supported
- Strong architecture boundaries (`cli`, `engine`, `config`) for long-term maintainability

## Install

### Node.js CLI (primary)

```sh
npm install -g docsmint
# or
npx docsmint@latest
```

### Python package (optional wrapper)

```sh
pip install docsmint
```

The Python package delegates to the Node.js CLI and still requires Node.js.

## Quick start

```sh
# from your project root
docsmint init
docsmint dev
```

Open `http://localhost:4321`.

### Build for production

```sh
docsmint build
docsmint preview
```

Production output is generated at `docs/.docsmint/dist/`.

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

You own content and config. Docsmint owns rendering internals.

## Configuration

```ts
// docs/docsmint.config.ts
import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'my-project',
  description: 'Minimal markdown docs and writing.',
  nav: [
    { label: 'docs', href: '/docs', priority: 'core' },
    { label: 'writing', href: '/writing', priority: 'core' },
  ],
  writing: {
    description: 'Engineering notes, architectural decisions, and observations.',
  },
  pages: ['about', { slug: 'work', navLabel: 'My Work' }],
  footer: [{ label: 'GitHub', href: 'https://github.com/your/repo' }],
  siteUrl: 'https://example.com',
})
```

## CLI commands

```sh
docsmint init               # scaffold docs/ structure
docsmint dev                # run local dev server
docsmint build              # build static output
docsmint preview            # preview production build
docsmint deploy [target]    # host-agnostic deploy flow
docsmint clean              # remove docs/.docsmint workdir
docsmint context [output]   # export LLM-friendly content snapshot
```

## Architecture

- `packages/cli`: command orchestration, parsing, dependency injection
- `packages/engine`: Astro-based rendering runtime
- `packages/config`: typed schema, defaults, normalization, nav policy

Docsmint keeps Astro as the engine core boundary today, while keeping the CLI/runtime contract stable.

## Documentation

- Project docs source: `apps/site/src/content/docs/`
- Release process and roadmap: `RELEASING.md`
- npm package: [docsmint](https://www.npmjs.com/package/docsmint)
- PyPI package: [docsmint](https://pypi.org/project/docsmint/)
