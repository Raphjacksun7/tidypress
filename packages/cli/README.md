# docsmint

`docsmint` is the official Node.js CLI for DocsMint.

DocsMint is an opinionated markdown publishing system for engineer blogs, docs, and technical writing.
It keeps setup simple: write in markdown, build static output, publish to the host you choose.

## Install

```sh
npm install -g docsmint
# or
npx docsmint@latest
```

## Commands

```sh
docsmint init [--preset <name>]
docsmint dev
docsmint build
docsmint preview
docsmint deploy [target]
docsmint deploy [target] --with-ci
docsmint clean
docsmint context
```

## Quick start

```sh
docsmint init --preset default
docsmint dev
```

`--starter <name>` is accepted as an alias for `--preset <name>`.

## Minimal config

```ts
// docs/docsmint.config.ts
export default {
  name: 'my-project',
  description: 'Engineering notes, docs, and long-form writing.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  siteUrl: 'https://example.com',
}
```

## Project links

- Repository: <https://github.com/Raphjacksun7/docsmint>
- Issues: <https://github.com/Raphjacksun7/docsmint/issues>

