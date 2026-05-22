# Releasing DocsMint

Release publishing is handled by GitHub Actions with Trusted Publishing for npm and PyPI.

## Policy

- Do not add personal accounts or maintainer names to this file.
- Publish access is controlled in GitHub, npm, and PyPI settings.
- Use Trusted Publishing (OIDC) instead of long-lived registry tokens.

## Release

1. Bump versions:
   - `packages/cli/package.json`
   - `wrappers/python/pyproject.toml`
2. Keep npm and PyPI versions aligned with the tag (example: `v0.1.1` -> `0.1.1`).
3. Commit to `main`.
4. Create and push a tag:

```bash
git tag v0.1.1
git push origin v0.1.1
```

## What happens after tagging

The `Publish` workflow:
- verifies the release tag version matches npm and PyPI package versions
- runs workspace tests and builds (including `examples/minimal` smoke build)
- publishes `packages/cli` to npm
- builds and publishes `wrappers/python` to PyPI

## Release roadmap

This section tracks engineering work that affects release sequencing and risk.

### Already shipped in current release line

- `pages` custom routes (`docs/src/content/pages/`) replaced legacy extension page routing.
- `sections.docs.enabled` and `sections.writing.enabled` added for section-level control.
- `collections` is the canonical routing surface; `sections` remains compatibility-only.
- `docsmint migrate-sections` generates deterministic migration output at
  `docs/.docsmint/migrations/sections-to-collections.json`.
- Shared docs sorting added to keep redirect/sidebar ordering consistent.
- Edit-link support added via repository metadata.
- Search exclusion controls added (`search: false` + config excludes).

### Compatibility lifecycle (sections -> collections)

- `sections` remains accepted for backward compatibility in 0.1.x.
- `collections` always takes precedence when both `sections` and `collections` define docs/writing.
- Migration guidance must remain in `README.md` and site docs until a formal deprecation release is announced.
- Any future removal requires a major-version announcement and explicit migration notes.

### Next release targets

- Autosidebar hardening (reduce manual ordering dependency).
- Route/basePath support expansion beyond current defaults.
- Docs/reference sync pass for all new config fields.
- CLI TypeScript migration track (incremental, test-guarded).
- Architecture policy codification for long-term engine/runtime boundaries.

### Architecture decisions (release policy)

- Keep Astro as the engine build core (`docsmint build` -> Astro build).
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
- Keep `bin/docsmint.js` as a thin launcher.
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

