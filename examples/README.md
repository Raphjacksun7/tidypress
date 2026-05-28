# TidyPress Examples

Focused examples live here. Keep each example small and centered on one product surface.

Run from the repo root after `pnpm install`.

## `siteUrl` in examples

Example configs use `https://example.com` on purpose: CI builds fixtures without claiming a live domain. Sitemap and absolute canonical/OG URLs are omitted until you set a real `siteUrl` (see [Conventions](https://tidypress.pages.dev/docs/conventions) on the product site).

Before deploying an example as your own site:

```ts
siteUrl: 'https://yoursite.example',
```

## Examples

| Example | Shows | Command |
|---------|-------|---------|
| `minimal` | smallest runnable project and init-parity smoke fixture | `pnpm --filter @tidypress/example-minimal build` |
| `lab` | engineer presence: writing + projects, docs off (`tidypress init` default) | `pnpm --filter @tidypress/example-lab build` |
| `blog` | writing-only blog (`tidypress init --preset blog`) | `pnpm --filter @tidypress/example-blog build` |
| `persona` | hero, projects, writing, about page | `pnpm --filter @tidypress/example-persona build` |
| `custom-collections` | a `playbooks` collection beside docs and writing | `pnpm --filter @tidypress/example-custom-collections build` |
| `i18n-versioned` | default-locale root docs, French routes, and archived version docs | `pnpm --filter @tidypress/example-i18n-versioned build` |

`apps/site` is the full dogfood documentation site. Use these examples when you want a narrow fixture.
