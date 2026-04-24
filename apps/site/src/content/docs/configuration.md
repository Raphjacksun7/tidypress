---
title: Configuration
description: docsmint.config.ts — all available options.
order: 2
---

docsmint reads a single config file: `docsmint.config.ts` in your `docs/` directory.

## Basic structure

```javascript
export default {
  name: 'Your Project',
  description: 'Short description for metadata.',
  nav: [
    { label: 'docs',    href: '/docs/getting-started' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [
    { label: 'GitHub', href: 'https://github.com/your/repo' },
  ],
}
```

## Options

### `name`

Project name. Used in page titles, the nav header, and metadata.

```javascript
name: 'my-project'
```

### `description`

Short description. Appears in site metadata and the homepage.

```javascript
description: 'Minimal markdown documentation builder.'
```

### `nav`

Top navigation links. Array of `{ label, href }`. Internal and external links both work. Omit to show only the site name.

```javascript
nav: [
  { label: 'docs',    href: '/docs/getting-started' },
  { label: 'writing', href: '/writing' },
  { label: 'github',  href: 'https://github.com/your/repo' },
]
```

### `footer`

Footer links. Same structure as `nav`.

```javascript
footer: [
  { label: 'GitHub',  href: 'https://github.com/your/repo' },
  { label: 'License', href: '/license' },
]
```

### `siteUrl`

Canonical URL. Used for sitemaps and social metadata.

```javascript
siteUrl: 'https://docs.example.com'
```

### `dateFormat`

Controls how dates appear on writing posts and the writing index. Accepts `Intl.DateTimeFormat` options.

```javascript
dateFormat: { year: 'numeric', month: 'short', day: 'numeric' }
// → "Apr 11, 2026"

dateFormat: { year: 'numeric', month: '2-digit', day: '2-digit' }
// → "04/11/2026"
```

Default: `{ year: 'numeric', month: 'short', day: 'numeric' }`.

### `dateLocale`

BCP 47 locale string for date formatting.

```javascript
dateLocale: 'en-US'   // "Apr 11, 2026"
dateLocale: 'fr-FR'   // "11 avr. 2026"
dateLocale: 'ja-JP'   // "2026年4月11日"
```

Default: `'en-US'`.

## Full example

```javascript
export default {
  name: 'dbq',
  description: 'Data processing framework for multi-tenant pipelines.',
  siteUrl: 'https://docs.dbq.internal',
  nav: [
    { label: 'docs',    href: '/docs/getting-started' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [
    { label: 'GitHub', href: 'https://github.com/centiro/dbq' },
  ],
  dateLocale: 'en-US',
  dateFormat: { year: 'numeric', month: 'short', day: 'numeric' },
}
```
