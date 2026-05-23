---
title: Capabilities
description: Enable, disable, and guard product surfaces in config.
order: 8
---

Feature gates for collections, theming, and experimental commands.

## Registry

```ts
type DocsMintCapabilityName =
  | 'docs'
  | 'writing'
  | 'pages'
  | 'editor'
  | 'export'
  | 'ai'
  | 'theming'
  | 'themingCustom'
```

## Defaults

```txt
docs
writing
pages
theming
```

Off by default:

```txt
themingCustom
editor
export
ai
```

## Enable and disable

```ts
capabilities: {
  disable: ['pages'],
  enable: ['writing'],
}
```

Resolution order:

```txt
defaults -> config -> capabilities.disable -> capabilities.enable
```

## Collections and capabilities

| Capability | Collection |
|------------|------------|
| `docs` | `collections.docs` |
| `writing` | `collections.writing` |
| `pages` | `collections.pages` |

```ts
collections: {
  writing: { enabled: false },
}
```

```ts
capabilities: {
  disable: ['writing'],
}
```

## Theming capabilities

```ts
capabilities: {
  disable: ['theming'],
}
```

```ts
capabilities: {
  enable: ['themingCustom'],
},
theme: {
  mode: 'custom',
  tokens: {
    light: { bg: '#ffffff', fg: '#111111' },
    dark: { bg: '#0b0b0b', fg: '#f5f5f5' },
  },
}
```

## Experimental commands

Experimental command scaffolds require config and CLI opt-ins:

```ts
experimental: {
  ai: true,
}
```

```bash
docsmint ai suggest docs/draft.md --enable-experimental-ai
```

- `editor`
- `export`
- `ai`

These surfaces are guarded on purpose. They are not part of the default docs and writing workflow.
