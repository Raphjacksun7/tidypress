---
title: Analytics
description: Add optional privacy-friendly analytics scripts to the built site.
order: 9
published: false
---

```ts
analytics: { type: 'none' }
```

## Supported adapters

```ts
analytics: {
  type: 'plausible',
  endpoint: 'https://plausible.io/js/script.js',
  siteId: 'example.com',
}
```

| Type | Notes |
|------|-------|
| `none` | default; no analytics script |
| `plausible` | Plausible-style script injection |
| `fathom` | Fathom-style script injection |
| `umami` | Umami script |

## Plausible

```ts
analytics: {
  type: 'plausible',
  endpoint: 'https://plausible.io/js/script.js',
  siteId: 'docs.example.com',
}
```

## Fathom

```ts
analytics: {
  type: 'fathom',
  endpoint: 'https://cdn.usefathom.com/script.js',
  siteId: 'ABCDEFGH',
}
```

## Umami

```ts
analytics: {
  type: 'umami',
  endpoint: 'https://analytics.example.com/script.js',
  siteId: '00000000-0000-0000-0000-000000000000',
}
```

DocsMint renders the script tag with the configured endpoint and site id.
