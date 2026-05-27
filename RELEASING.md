# Releasing TidyPress

Release publishing is handled by GitHub Actions with Trusted Publishing for npm and PyPI.

## Policy

- Do not add personal accounts or maintainer names to this file.
- Publish access is controlled in GitHub, npm, and PyPI settings.
- Use Trusted Publishing (OIDC) instead of long-lived registry tokens for PyPI.
- npm publishing uses `NPM_TOKEN` stored as a GitHub Actions secret.

## Release flow (Changesets)

TidyPress uses [Changesets](https://github.com/changesets/changesets) to keep package versions
in sync and generate changelogs automatically.

### Day-to-day: adding a changeset to your PR

```bash
pnpm changeset
```

Follow the prompts. The npm packages (`@tidypress/config`, `@tidypress/engine`, `tidypress`)
are linked so their versions stay together.

### Release sequence

1. Merge your PR (with a changeset file) to `main`.
2. The `Publish` workflow opens or updates a **"chore: release packages"** PR automatically.
   This PR contains bumped `package.json` versions and updated `CHANGELOG.md` files.
3. Before merging the version PR, also bump `wrappers/python/pyproject.toml` to match the
   new version (Changesets does not manage Python).
4. Merge the version PR to `main`.
5. Push a tag matching the version:

```bash
git tag v1.0.4
git push origin v1.0.4
```

6. The `Publish` workflow validates all four versions, runs tests, publishes `tidypress` to npm,
   runs a real CLI smoke test, then publishes to PyPI.

## Manual release (without Changesets)

If you need to cut a release manually without a changeset:

1. Bump all four versions to the same value:
   - `packages/config/package.json`
   - `packages/engine/package.json`
   - `packages/cli/package.json`
   - `wrappers/python/pyproject.toml`
2. Commit to `main`.
3. Push a tag: `git tag vX.Y.Z && git push origin vX.Y.Z`

## npm package shape

Users install one public npm package:

```bash
npm install tidypress
pnpm add tidypress
```

`@tidypress/config` and `@tidypress/engine` are internal runtime packages. They are bundled into
the `tidypress` tarball through `bundleDependencies`, so npm users do not need to install or
resolve separate scoped packages.

`pnpm publish` replaces `workspace:*` entries with real semver at pack time.

## External rename checklist

The TidyPress rename is a clean break in this repository. Before publishing a renamed release:

- Reserve or verify npm package ownership for `tidypress` and the `@tidypress` scope.
- Configure PyPI Trusted Publishing for the `tidypress` project.
- Create or rename the Cloudflare Pages project to `tidypress` so the default URL is `tidypress.pages.dev`.
- Rename the GitHub repository or update repository URLs if the canonical repo moves.
- Deprecate the old npm/PyPI package names with a pointer to TidyPress after the new release is live.

## Required GitHub secrets / publisher setup

CI publishing and deployment need these external settings:

- `NPM_TOKEN` — GitHub Actions secret with publish access to the `tidypress` npm package.
- `CLOUDFLARE_API_TOKEN` — GitHub Actions secret with Cloudflare Pages edit/deploy access.
- `CLOUDFLARE_ACCOUNT_ID` — GitHub Actions secret for the Cloudflare account that owns the `tidypress` Pages project.
- PyPI Trusted Publisher for `tidypress`:
  - Owner: `Raphjacksun7`
  - Repository: current GitHub repository name
  - Workflow: `publish.yml`
  - Environment: leave blank unless the workflow adds a PyPI environment.

Local Pages deploy:

```bash
pnpm exec wrangler login
pnpm exec wrangler pages project create tidypress --production-branch main
pnpm deploy:site
```

## Version alignment rule

All four packages must share the same version on every release:

| Package | File |
|---------|------|
| `@tidypress/config` | `packages/config/package.json` |
| `@tidypress/engine` | `packages/engine/package.json` |
| `tidypress` (CLI) | `packages/cli/package.json` |
| Python wrapper | `wrappers/python/pyproject.toml` |

The `validate-release` CI job enforces this — it fails if any of the four versions do not
match the git tag.

## What the publish workflow does after tagging

1. Reads all four package versions and asserts they match the tag.
2. Runs the full test suite and builds.
3. Builds `@tidypress/config` TypeScript → `dist/`.
4. Publishes `tidypress` to npm via `pnpm publish`; bundled internal packages are included in
   the tarball.
5. Runs a real smoke test: `npm install tidypress@<version>` in a clean dir, then
   `node ./node_modules/tidypress/bin/tidypress.js --version`.
6. Publishes `wrappers/python` to PyPI via Trusted Publishing.

## Explicit backlog (not regressions)

Tracked for planning and release notes. **Not** treated as ship blockers unless a release explicitly scopes them.

| Item | Status | Notes |
|------|--------|--------|
| **P3: newsletter embed** | Backlog | Config link/iframe block — not a hosted newsletter product |
| **P3: `talks` collection kind** | Backlog | Only if event schema is repeatedly requested |
| **Import: medium / ghost / substack** | Scaffold | `tidypress import devto` is live; other providers write review scaffolds (documented) |
| **Repo hygiene** | Open | Add/commit `examples/*`, `apps/site/tidypress-context.md`, and remaining moat changes when ready for PR |
| **Git-backed editor (task 19)** | Post-launch | Separate **editor app** — Medium-style UI → markdown files; not part of core tool story |
| **Hosted platform** | Post-launch | Separate **free hosting** layer — uses `tidypress build`; not core CLI pitch |

## Release roadmap

This section tracks engineering work that affects release sequencing and risk.

### Already shipped in current release line

- `pages` custom routes (`docs/src/content/pages/`) replaced legacy extension page routing.
- `sections.docs.enabled` and `sections.writing.enabled` added for section-level control.
- `collections` is the canonical routing surface; `sections` remains compatibility-only.
- `tidypress migrate-sections` generates deterministic migration output at
  `~/.cache/tidypress/<project>/migrations/sections-to-collections.json`.
- Shared docs sorting added to keep redirect/sidebar ordering consistent.
- Edit-link support added via repository metadata.
- Search exclusion controls added (`search: false` + config excludes).
- Publish pipeline fixed: `pnpm publish` replaces the former `npm publish` that shipped
  unresolved `workspace:*` dependencies to the registry.
- Changesets added for automatic version sync across package versions.

### Compatibility lifecycle (sections -> collections)

- `sections` remains accepted for backward compatibility in 0.1.x.
- `collections` always takes precedence when both `sections` and `collections` define docs/writing.
- Migration guidance must remain in `README.md` and site docs until a formal deprecation release is announced.
- Any future removal requires a major-version announcement and explicit migration notes.

### Post-launch product sequence (after task 20)

**Core package stays free and simple.** Platform and editor are separate layers on top.

1. **Core launch (task 20)** — `tidypress` tool only in npm/README pitch.
2. **Hosted platform MVP** — free tier: repo → build → URL; uses core package.
3. **Editor app Phase 1** — separate Medium-style app → `writing/*.md`; for non-dev writers.
4. **Editor app Phase 2** — projects form → `projects/*.md`.

See `agent-os/CONSTITUTION.md` (product layers) and `agent-os/TASKS/19-v4-stretch.md`.

### Next release targets

- Autosidebar hardening (reduce manual ordering dependency).
- Route/basePath support expansion beyond current defaults.
- Docs/reference sync pass for all new config fields.
- CLI TypeScript migration track (incremental, test-guarded).
- Architecture policy codification for long-term engine/runtime boundaries.

### Architecture decisions (release policy)

- Keep Astro as the engine build core (`tidypress build` -> Astro build).
- Keep package boundaries strict:
  - `packages/cli`: orchestration, command parsing, DI.
  - `packages/engine`: rendering/build runtime (Astro).
  - `packages/config`: schema/defaults/normalization.
- Treat this split as the baseline architecture unless measurable pain justifies change.

### CLI TypeScript migration strategy (incremental)

- Do not rewrite CLI in one pass.
- Phase 1: enable strict `// @ts-check` + JSDoc in current JS.
- Phase 2: migrate by layer in this order:
  1. `utils`
  2. `services`
  3. `commands`
  4. `Application` and bootstrap wiring
- Keep `bin/tidypress.js` as a thin launcher.
- Require tests to pass at each phase before moving forward.
- Prioritize product features and reliability over migration churn when JS remains stable.

### Astro long-term dependency posture

- Astro is currently a deliberate core dependency, not an accidental one.
- This dependency is acceptable while it continues to deliver:
  - predictable static output quality
  - stable content pipeline behavior
  - low operational overhead for users
- Re-evaluate only if there is measurable engineering pain (performance, extensibility, maintenance, or compatibility cost), and only with a scoped RFC plus migration plan.

### Gated release items

- **Versioning (opt-in)**
  Scope: CLI version command, engine selector UI, versioned search indexes, route strategy.
  Risk: high (content snapshots, routing compatibility, build complexity).
  Release only after a dedicated implementation cycle and test matrix.

- **i18n scaffold (opt-in)**
  Scope: locale-aware routes, nav/search localization, content folder conventions.
  Risk: very high (cross-cutting routing and indexing behavior).
  Release only as a separate milestone with explicit acceptance criteria.
