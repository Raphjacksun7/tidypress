---
title: Configuration
description: Set your site name, description, nav, and branding.
form: manual
order: 3
published: false
---

Open `docs/tidypress.config.ts`:

```ts
import { defineConfig } from 'tidypress/config'

export default defineConfig({
  name: 'My Project',
  description: 'Short sentence about what this is.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'blog', href: '/writing' },
  ],
  siteUrl: 'https://example.com',
})
```

## Required fields

| Field | Type | Purpose |
|-------|------|---------|
| `name` | string | Site title, shown in nav and `<title>` |

## Optional but recommended

- `description` — meta description and home subtitle
- `siteUrl` — enables canonical links and OG tags
- `branding.icon` — SVG shown beside the site name
- `nav` — overrides the default auto-generated nav

Next: [Building](./build)
