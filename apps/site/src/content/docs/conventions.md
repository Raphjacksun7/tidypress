---
title: Conventions
description: What TidyPress fixes in the site graph, what it leaves to markdown, and how the folder names map to intent.
order: 4
---

TidyPress fixes **site shape**—navigation, home page, collection kinds, build output—and stays out of **prose**. You choose a preset; you write markdown inside the boundaries that preset defines. The constraints exist so you do not rebuild the same presentation layer for every repository that deserves a public face.

## Vocabulary

Two different things share the word *docs*, and conflating them is the usual source of confusion.

The **publish root** is the folder that holds `tidypress.config.ts`, `src/content/`, `public/`, and eventually `build/` — the site’s home in git. `tidypress init` defaults to `site/`; you can use any folder name. Set `TIDYPRESS_PUBLISH_ROOT` when the CLI cannot infer it from your working directory.

The **`docs` collection** is a first-class routed subtree under `src/content/docs/`, served at `/docs/…`, with sidebar ordering—the same class of feature as `writing` and `projects`. It carries tutorials, guides, and stable reference. The default **lab** preset disables it so the home page foregrounds writing and work; turn it on with `docs-writing`, `body-of-work-docs`, or `collections.docs.enabled`.

| Name | Role |
|------|------|
| Publish root `site/` | Config, content collections, static output |
| `writing` | Dated posts, RSS, tags—the usual public voice |
| `projects` / `works` | Work on the home page; folder name follows the collection key |
| `docs` (collection) | Sidebar-ordered guides and reference at `/docs/…` |

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
| `content` | Reference shelves, ADRs, playbooks in the docs-style shell |
| `page` | `/about`, `/now`, standalone pages |

## Docs collection vs body of work

| Collection | Purpose |
|------------|---------|
| `docs` | Sidebar-ordered product documentation |
| `reference` | Facts: API, CLI, config |
| `process` | Decisions: ADRs, roadmaps |

Preset **`body-of-work`** disables the `docs` collection and surfaces **reference** and **process** from the footer. Use **`body-of-work-docs`** or **`docs-writing`** when you want `docs` enabled from init.

## siteUrl and sitemap

Set **`siteUrl`** to your production origin before deploy:

```bash
npx tidypress init --site-url https://yoursite.example
```

Until `siteUrl` is set to a real production origin — not the `https://example.com` placeholder — TidyPress does not emit absolute canonical or Open Graph URLs, and it does not write a sitemap that points at a placeholder host. After `siteUrl` is set, `tidypress build` produces `sitemap-index.xml` for that origin.

## Escape hatches

- **`custom` preset** — extra collections with a known `kind`
- **`navPolicy.mode: 'relaxed'`** — nav links not validated against routes
- Enable or disable collections in `tidypress.config.ts` after init

## Related

- [Body of work](./body-of-work)
- [Configuration](./configuration)
