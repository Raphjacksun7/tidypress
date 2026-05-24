---
title: Theme
description: Configure typography scale, color tokens, and code highlighting presets.
order: 8
---

Theme config is optional. The default is a guarded baseline theme with the `claude` code highlighting preset.

## Typography

Scales:

| Value | Use for |
|-------|---------|
| `medium` | default reading size (used when `typography` is omitted) |
| `small` | compact documentation density |
| `large` | larger marketing or narrative pages |
| `extra` | extra-large display scale (alias for `large`) |

Omit `typography` to use `medium`.

Use a smaller scale explicitly:

```ts
typography: {
  scale: 'small',
}
```

`default` and `extra` are accepted aliases. `default` resolves to `medium`; `extra` resolves to `large`.

## Theme Mode

```ts
theme: {
  mode: 'guardrailed',
  preset: 'baseline',
}
```

`guardrailed` is the default. It keeps the baseline token set and lets DocsMint handle light and dark mode safely.

`preset` currently supports:

```ts
theme: {
  preset: 'baseline',
}
```

## Code Highlighting

```ts
theme: {
  code: {
    preset: 'claude',
  },
}
```

Code presets:

| Value | Style |
|-------|-------|
| `claude` | balanced dark code theme, default |
| `jetbrains` | vibrant JetBrains-like palette |
| `github` | conservative GitHub dark style |
| `dracula` | Dracula palette |
| `material` | Material theme palette |
| `nord` | Nord palette |

Omit `theme.code` to use `claude`.

## Custom Tokens

Custom tokens require the `themingCustom` capability:

```ts
capabilities: {
  enable: ['themingCustom'],
},
theme: {
  mode: 'custom',
  tokens: {
    light: {
      bg: '#ffffff',
      fg: '#111111',
      muted: '#71717a',
      border: '#e5e5e5',
      surface: '#f4f4f4',
      codeBg: '#f4f4f4',
      codeFg: '#111111',
    },
    dark: {
      bg: '#0a0a0a',
      fg: '#fafafa',
      muted: '#a1a1aa',
      border: '#27272a',
      surface: '#18181b',
      codeBg: '#18181b',
      codeFg: '#e4e4e7',
    },
  },
}
```

Token names:

- `bg`
- `fg`
- `muted`
- `border`
- `surface`
- `codeBg`
- `codeFg`

Use custom tokens only when the baseline theme is not enough.
