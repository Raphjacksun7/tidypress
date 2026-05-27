# Changesets

This directory is managed by [Changesets](https://github.com/changesets/changesets).

## How to add a changeset

```bash
pnpm changeset
```

Follow the prompts: pick affected packages, choose `patch`/`minor`/`major`, write a summary.

All three npm packages (`@tidypress/config`, `@tidypress/engine`, `tidypress`) are **linked** — they always release at the same version. Selecting any one of them bumps all three.

## Release flow

1. Make changes and open a PR.
2. Add a changeset: `pnpm changeset`.
3. Merge the PR to `main`.
4. The Changesets GitHub Action opens a "Version Packages" PR with bumped versions and updated `CHANGELOG.md`.
5. Before merging the version PR, also bump `wrappers/python/pyproject.toml` to match.
6. Merge the version PR — the `Publish` workflow publishes all packages to npm and PyPI.
