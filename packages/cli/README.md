# docsmint

Minimal markdown docs and writing.

`docsmint` is the Node.js CLI for DocsMint. It turns a `docs/` folder into static output for documentation and dated writing.

## Install

Node.js 22.12 or newer is required.

```sh
npm install docsmint
# or
pnpm add docsmint
```

## Quickstart

```sh
npx docsmint init
npx docsmint dev
```

Open `http://localhost:4321`.

```sh
npx docsmint build
npx docsmint preview
```

Output is written to `docs/.docsmint/dist/`.

## Commands

| Command | Purpose |
|---------|---------|
| `docsmint init [--preset <name>]` | scaffold a `docs/` folder |
| `docsmint dev [--port <n>]` | run the local dev server |
| `docsmint build [--output <dir>]` | build static output |
| `docsmint preview [--port <n>]` | preview the production build |
| `docsmint deploy [target]` | copy or hand output to a static host/tool |
| `docsmint clean` | remove the generated workdir |
| `docsmint context [output]` | write a markdown snapshot of published content |

`--starter <name>` is accepted as an alias for `--preset <name>`.

## Minimal config

```ts
// docs/docsmint.config.ts
import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'my-project',
  description: 'Minimal markdown docs and writing.',
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
