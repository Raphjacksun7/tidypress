# Releasing DocsMint

Release publishing is handled by GitHub Actions with Trusted Publishing for npm and PyPI.

## Policy

- Do not add personal accounts or maintainer names to this file.
- Publish access is controlled in GitHub, npm, and PyPI settings.
- Use Trusted Publishing (OIDC) instead of long-lived registry tokens.

## One-time setup

### npm

1. Open [npm package trusted publishers](https://www.npmjs.com/package/docsmint/access).
2. Add a trusted publisher:
   - Provider: GitHub Actions
   - Repository: this project repository
   - Workflow file: `.github/workflows/publish.yml`
   - Environment: empty (unless explicitly used)
3. Confirm no `NPM_TOKEN` secret is required.

### PyPI

1. Open [PyPI publishing settings](https://pypi.org/manage/project/docsmint/settings/publishing/).
2. Add a trusted publisher:
   - Owner: this repository owner (user or organization)
   - Repository: this project repository
   - Workflow name: `Publish`
   - Environment name: empty (unless explicitly used)
3. Confirm no `PYPI_API_TOKEN` secret is required.

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
- publishes `packages/cli` to npm
- builds and publishes `wrappers/python` to PyPI

## Release roadmap

This section tracks engineering work that affects release sequencing and risk.

### Already shipped in current release line

- `pages` custom routes (`docs/src/content/pages/`) replaced legacy extension page routing.
- `sections.docs.enabled` and `sections.writing.enabled` added for section-level control.
- Shared docs sorting added to keep redirect/sidebar ordering consistent.
- Edit-link support added via repository metadata.
- Search exclusion controls added (`search: false` + config excludes).

### Next release targets

- Autosidebar hardening (reduce manual ordering dependency).
- Route/basePath support expansion beyond current defaults.
- Docs/reference sync pass for all new config fields.

### Gated release items

- **Versioning (opt-in)**  
  Scope: CLI version command, engine selector UI, versioned search indexes, route strategy.  
  Risk: high (content snapshots, routing compatibility, build complexity).  
  Release only after a dedicated implementation cycle and test matrix.

- **i18n scaffold (opt-in)**  
  Scope: locale-aware routes, nav/search localization, content folder conventions.  
  Risk: very high (cross-cutting routing and indexing behavior).  
  Release only as a separate milestone with explicit acceptance criteria.

