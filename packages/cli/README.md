# docsmint

`docsmint` is the official Node.js CLI for DocsMint.

DocsMint is an opinionated markdown publishing system for documentation and writing.
DocsMint is created to eliminate time from content to production, with no friction.

## Install

```sh
npm install -g docsmint
# or
npx docsmint@latest
```

## Commands

```sh
docsmint init
docsmint dev
docsmint build
docsmint preview
docsmint deploy [target]
docsmint clean
docsmint context
```

## Quick start

```sh
docsmint init
docsmint dev
```

## Minimal config

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

## Project links

- Repository: <https://github.com/Raphjacksun7/docsmint>
- Issues: <https://github.com/Raphjacksun7/docsmint/issues>

