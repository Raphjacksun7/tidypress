# docsmint

`docsmint` is the official Node.js CLI for DocsMint.

Minimal markdown docs and writing.

Write markdown, preview locally, build static output, and publish the generated files with the host or script you already use.

## Install

```sh
npm install -g docsmint
# or
npm exec docsmint@latest
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

Available presets:

- `default` seeds docs and writing examples.
- `custom` also seeds a `playbooks` custom collection.

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

