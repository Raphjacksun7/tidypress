# DocsMint

Minimal markdown docs and writing.

DocsMint is a small publishing tool for projects that want docs and writing in markdown, local control, and static output. Write files in git, preview locally, build HTML, and publish the generated directory with the host or script you already use.

## Why DocsMint

- Write docs and dated writing from plain markdown or MDX
- Keep content, config, and build output in your project
- Get search, dark mode, sitemap, metadata, and clean defaults without wiring a site from scratch
- Use starter collections for docs, writing, and pages, then add your own collections when needed
- Keep rendering in the Astro engine while the CLI handles project setup, builds, deploy helpers, and content snapshots

## Install

### Node.js CLI (primary)

```sh
npm install -g docsmint
# or
npm exec docsmint@latest
```

### Python

```sh
pip install docsmint
```

The Python package invokes the Node.js CLI and still requires Node.js.

## Quickstart

```sh
# from your project root
docsmint init
docsmint dev
```

Open `http://localhost:4321`.

Prefer a known-good example first? Use `examples/minimal`:

```sh
pnpm install
pnpm --filter @docsmint/example-minimal build
```

This builds a known-good site to `examples/minimal/docs/.docsmint/dist/`.

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

`docs`, `writing`, and `pages` are starter collections, not hardcoded architecture. You can add collection keys like `playbooks`, `guides`, or `notes` through `collections` without editing engine code.

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
  collections: {
    docs: { enabled: true, basePath: '/docs', label: 'docs' },
    writing: { enabled: true, basePath: '/writing', kind: 'writing', label: 'writing' },
    playbooks: { enabled: true, basePath: '/playbooks', kind: 'content', label: 'playbooks' },
  },
  capabilities: {
    disable: ['pages'],
    enable: ['docs', 'writing'],
  },
  pages: ['about', { slug: 'work', navLabel: 'My Work' }],
  footer: [{ label: 'GitHub', href: 'https://github.com/your/repo' }],
  siteUrl: 'https://example.com',
})
```

`sections` remains available as a backward-compatibility shim, but new projects should configure routing via `collections`.
Run `docsmint migrate-sections` to generate a deterministic migration artifact at
`docs/.docsmint/migrations/sections-to-collections.json`.

`capabilities` resolves deterministically after collection/experimental defaults using this order:
defaults -> config (`collections` / `experimental`) -> `capabilities.disable` -> `capabilities.enable`.

## CLI commands

```sh
docsmint init               # scaffold docs/ structure
docsmint init --preset default
docsmint dev                # run local dev server
docsmint build              # build static output
docsmint preview            # preview production build
docsmint deploy [target]    # host-agnostic deploy flow
docsmint clean              # remove docs/.docsmint workdir
docsmint context [output]   # export LLM-friendly content snapshot
docsmint migrate-sections   # generate sections->collections migration output
```

`init` also accepts `--starter <name>` as an alias for `--preset <name>`.

Available presets:

- `default` seeds docs and writing examples.
- `custom` also seeds a `playbooks` custom collection.

## Package layout

- `packages/cli`: command orchestration, parsing, dependency injection
- `packages/engine`: Astro-based rendering runtime
- `packages/config`: typed schema, defaults, normalization, nav policy

DocsMint keeps Astro behind the engine boundary. Your project owns content and config; the generated `.docsmint/` workdir owns build internals.

## Documentation

- Project docs source: `apps/site/src/content/docs/`
- Release process and roadmap: `RELEASING.md`
- npm package: [docsmint](https://www.npmjs.com/package/docsmint)
- PyPI package: [docsmint](https://pypi.org/project/docsmint/)
