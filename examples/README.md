# DocsMint Examples

Focused examples live here. Keep each example small and centered on one product surface.

Run from the repo root after `pnpm install`.

## Examples

| Example | Shows | Command |
|---------|-------|---------|
| `minimal` | smallest runnable project and init-parity smoke fixture | `pnpm --filter @docsmint/example-minimal build` |
| `lab` | engineer presence: writing + projects, docs off (`docsmint init` default) | `pnpm --filter @docsmint/example-lab build` |
| `blog` | writing-only blog (`docsmint init --preset blog`) | `pnpm --filter @docsmint/example-blog build` |
| `persona` | hero, projects, writing, about page | `pnpm --filter @docsmint/example-persona build` |
| `custom-collections` | a `playbooks` collection beside docs and writing | `pnpm --filter @docsmint/example-custom-collections build` |
| `i18n-versioned` | default-locale root docs, French routes, and archived version docs | `pnpm --filter @docsmint/example-i18n-versioned build` |

`apps/site` is the full dogfood documentation site. Use these examples when you want a narrow fixture.
