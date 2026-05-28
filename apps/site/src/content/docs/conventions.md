---
title: Conventions
description: Opinionated site shape, flexible markdown — what TidyPress enforces and what it leaves alone.
order: 4
---

TidyPress is **opinionated about site shape** and **lightweight about content**. You pick a preset and collection kinds; you write markdown inside those boundaries.

## What we enforce

| Layer | Rule |
|-------|------|
| **Preset** | `lab`, `blog`, `persona`, `body-of-work`, `body-of-work-docs`, `docs-writing`, `custom` — nav, home, and default collections |
| **Kind** | `writing`, `projects`, `content`, `page` — routing, RSS, sidebar, layouts |
| **Config** | `siteUrl` for production URLs; `tidypress doctor` / `tidypress build` warn on placeholders |
| **Nav** | Strict mode validates internal `href` values; overflow uses a “more” menu on small screens |

## What we do not enforce

- Per-file JSON Schema or lint scores (`check` / `sweep` are out of scope)
- Résumé blocks, OpenAPI, or embed platforms in core
- A single folder tree for every author — use `custom` when you need extra collections

## Collection kinds

| Kind | Use for |
|------|---------|
| `writing` | Dated posts, RSS, tags |
| `projects` | Cards, featured work, optional project pages |
| `content` | Reference shelves, ADRs, playbooks (docs-style shell) |
| `page` | `/about`, `/now`, standalone pages |

## Product docs vs body of work

| Collection | Purpose |
|------------|---------|
| `docs` | Product documentation (tutorials, guides) |
| `reference` | Facts: API, CLI, config |
| `process` | Decisions: ADRs, roadmaps |

Preset **`body-of-work`** keeps `docs` off and links **reference** / **process** from the footer. Use **`body-of-work-docs`** or **`docs-writing`** when you need product docs on day one.

## siteUrl and sitemap

Set **`siteUrl`** to your production origin before deploy:

```bash
npx tidypress init --site-url https://yoursite.example
```

Until `siteUrl` is real (not `https://example.com`), TidyPress **does not** emit absolute canonical/OG URLs or an Astro sitemap with a fake host. After you set `siteUrl`, `tidypress build` writes `sitemap-index.xml` tied to that URL.

## Escape hatches

- **`custom` preset** — extra collections with a known `kind`
- **`navPolicy.mode: 'relaxed'`** — nav links not validated against routes
- Enable or disable collections in `tidypress.config.ts` after init

## Related

- [Body of work](./body-of-work)
- [Configuration](./configuration)
