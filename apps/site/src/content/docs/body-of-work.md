---
title: Body of work
description: Works, projects, writing, reference, process, and pages — product docs use the docs collection separately.
order: 5
---

TidyPress models a public body of work with collection **keys** and built-in **kinds**. The `body-of-work` preset is generated from `publicationSurfaceDefinitions` in `@tidypress/config` (six surfaces — not product docs).

## Quick start

```bash
npx tidypress init --preset body-of-work --site-url https://yoursite.example
```

For work **and** product documentation in one site:

```bash
npx tidypress init --preset body-of-work-docs --site-url https://yoursite.example
```

| Key | Kind | Purpose |
|-----|------|---------|
| `works` | `projects` | Case studies, major artifacts |
| `projects` | `projects` | Repos, apps, tools, experiments |
| `writing` | `writing` | Essays, technical notes |
| `reference` | `content` | API, config, CLI reference (docs sidebar shell) |
| `process` | `content` | ADRs, decisions, build logs |
| `pages` | `page` | About, now, contact, uses, resume |

The homepage shows **works**, **projects**, and **writing**. **Reference** and **process** link from the **footer** (not the header) so mobile nav stays readable. Add them to `home.order` to surface them on the home page.

## Product docs

The **`docs`** collection is for product/project documentation (tutorials, how-tos, guides). The default `body-of-work` preset keeps it off; use **`body-of-work-docs`** or **`docs-writing`** when you need docs on day one.

```bash
npx tidypress init --preset body-of-work-docs
```

Or enable `collections.docs` later and add content under `src/content/docs/`.

## siteUrl

Set **`siteUrl`** in `tidypress.config.ts` before deploy. Until then, canonical URLs, Open Graph, RSS, and the sitemap use the placeholder host. `tidypress doctor` and `tidypress build` remind you when it is still unset.

## Reference vs docs

| Surface | Use for |
|---------|---------|
| `docs` | Teaching and product documentation |
| `reference` | Facts: API, config, CLI |
| `process` | Decisions: ADRs, roadmaps |

## Featured on the home page

Set `featured: true` in frontmatter for writing and projects-kind collections (including a `works` key).

## Related

- [Configuration](./configuration) — presets
- [Examples](./examples)
- [Advanced configuration](./advanced-configuration) — `build/llms.txt` for agents
