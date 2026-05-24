# docsmint

Minimal markdown site for fast writing and project showcase.

`docsmint` is the CLI: init, dev, build, preview, deploy. Markdown in `docs/` becomes static HTML.

## Install

Node.js 22.12 or newer is required.

```sh
npm install docsmint
# or
pnpm add docsmint
```

## Quickstart

```sh
npx docsmint init              # lab preset: writing + projects
npx docsmint init --preset blog   # writing only
npx docsmint init --preset persona
npx docsmint dev
```

Open `http://localhost:4321`.

Presets: `lab` (default), `persona`, `blog`, `docs-writing`, `custom`. `default` aliases `lab`.

```sh
npx docsmint build
npx docsmint preview
```

Output is written to `docs/build/` (or `<docsDir>/build/` when config is at the project root).

## Commands

| Command | Purpose |
|---------|---------|
| `docsmint init [--preset <name>]` | scaffold a `docs/` folder |
| `docsmint dev [--port <n>]` | run the local dev server |
| `docsmint build [--output <dir>]` | build static output |
| `docsmint preview [--port <n>]` | preview the production build |
| `docsmint deploy [target]` | copy or hand output to a static host/tool |
| `docsmint clean` | remove `build/` and local docsmint cache |
| `docsmint context [output]` | write a markdown snapshot of published content |

`--starter <name>` is accepted as an alias for `--preset <name>`.

## Minimal config

```ts
// docs/docsmint.config.ts
import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'my-project',
  description: 'Minimal markdown site for fast writing and project showcase.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  siteUrl: 'https://example.com',
})
```

## Links

- Documentation: <https://usedocsmint.pages.dev/docs>
- Repository: <https://github.com/Raphjacksun7/docsmint>
- Issues: <https://github.com/Raphjacksun7/docsmint/issues>
