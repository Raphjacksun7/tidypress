# tidypress

A publishing framework for Git-native authorship.

`tidypress` is the CLI: init, dev, build, preview, deploy. Markdown in `docs/` becomes static HTML.

## Install

Node.js 22.12 or newer is required.

```sh
npm install tidypress
# or
pnpm add tidypress
```

## Quickstart

```sh
npx tidypress init              # lab preset: writing + projects
npx tidypress init --preset blog   # writing only
npx tidypress init --preset persona
npx tidypress dev
```

Open `http://localhost:4321`.

Presets: `lab` (default), `persona`, `blog`, `docs-writing`, `custom`. `default` aliases `lab`.

```sh
npx tidypress build
npx tidypress preview
```

Output is written to `docs/build/` (or `<docsDir>/build/` when config is at the project root).

## Commands

| Command | Purpose |
|---------|---------|
| `tidypress init [--preset <name>]` | scaffold a `docs/` folder |
| `tidypress dev [--port <n>]` | run the local dev server |
| `tidypress build [--output <dir>]` | build static output |
| `tidypress preview [--port <n>]` | preview the production build |
| `tidypress deploy [target]` | copy or hand output to a static host/tool |
| `tidypress clean` | remove `build/` and local tidypress cache |
| `tidypress skills install` | install TidyPress skills into Cursor, Claude Code, or Codex |

Every `tidypress build` writes `build/llms.txt` (full published markdown for agents). Skip with `--no-llms-txt` or `capabilities.disable: ['llmsTxt']`.

`--starter <name>` is accepted as an alias for `--preset <name>`.

## Minimal config

```ts
// docs/tidypress.config.ts
import { defineConfig } from 'tidypress/config'

export default defineConfig({
  name: 'my-project',
  description: 'A publishing framework for Git-native authorship.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  siteUrl: 'https://example.com',
})
```

## Development

From the monorepo root:

```sh
pnpm --filter tidypress build      # tsc → dist/ (published entrypoints)
pnpm --filter tidypress typecheck  # same as build, no emit
pnpm --filter tidypress dev        # tsx ./src/runCli.ts (no build step)
pnpm --filter tidypress test       # build + tsx --test
```

## Links

- Documentation: <https://tidypress.pages.dev/docs>
- Repository: <https://github.com/Raphjacksun7/tidypress>
- Issues: <https://github.com/Raphjacksun7/tidypress/issues>
