# Docsmint

Hugo-speed static publishing with Ghost-style defaults. Build once, deploy where you want.

Docsmint is an opinionated publishing system for engineers who want to ship technical writing from markdown in git.
It is for people who want ownership and a fast static site without running a heavy CMS stack.

## Why Docsmint

- Markdown-first workflow with a constrained, consistent UI
- Collections-first routing with starter collections for docs + writing + pages
- Search, dark mode, and sitemap included by default
- Host-agnostic output: build once, deploy anywhere static files are supported
- Strong architecture boundaries (`cli`, `engine`, `config`) for long-term maintainability

## Install

### Node.js CLI (primary)

```sh
npm install -g docsmint
# or
npx docsmint@latest
```

### Python

```sh
pip install docsmint
```

The Python package invokes the Node.js CLI and still requires Node.js.

## 90-second quickstart

```sh
# from your project root
docsmint init
docsmint dev
```

Open `http://localhost:4321`.

Prefer a runnable fixture first? Use `examples/minimal`:

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

`docs`, `writing`, and `pages` are starter collections, not hardcoded architecture.
You can add collection keys like `playbooks`, `guides`, or `notes` through `collections` without editing engine code.

## Configuration

```ts
// docs/docsmint.config.ts
import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'my-project',
  description: 'Engineering notes, docs, and long-form writing.',
  nav: [
    { label: 'docs', href: '/docs', priority: 'core' },
    { label: 'writing', href: '/writing', priority: 'core' },
  ],
  writing: {
    description: 'Engineering notes, architectural decisions, and observations.',
  },
  collections: {
    docs: { enabled: true, basePath: '/docs', kind: 'docs', label: 'docs' },
    writing: { enabled: true, basePath: '/writing', kind: 'writing', label: 'writing' },
    playbooks: { enabled: true, basePath: '/playbooks', kind: 'docs', label: 'playbooks' },
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

## Architecture

- `packages/cli`: command orchestration, parsing, dependency injection
- `packages/engine`: Astro-based rendering runtime
- `packages/config`: typed schema, defaults, normalization, nav policy

Docsmint keeps Astro as the engine core boundary today, while keeping the CLI/runtime contract stable.

## Agent OS

Planning and agent docs: [agent-os/README.md](./agent-os/README.md) · Strategy: [STRATEGY-SOURCE.md](./agent-os/STRATEGY-SOURCE.md) · [AGENTS.md](./AGENTS.md)

```sh
./agent-os/scripts/session-start.sh
./agent-os/scripts/verify.sh   # before PR (tests + commit format)
```

CI enforces `[Task NN]` PR titles and `task(NN): area — description` commits on pull requests.

## Documentation

- Project docs source: `apps/site/src/content/docs/`
- Release process and roadmap: `RELEASING.md`
- Agent OS roadmap: `agent-os/ROADMAP.md`
- npm package: [docsmint](https://www.npmjs.com/package/docsmint)
- PyPI package: [docsmint](https://pypi.org/project/docsmint/)
