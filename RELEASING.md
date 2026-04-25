# Releasing DocsMint

This repository uses GitHub Actions Trusted Publishing for both npm and PyPI.

## One-time setup

### 1) npm Trusted Publishing

1. Open [npm package trusted publishers](https://www.npmjs.com/package/docsmint/access).
2. Add a trusted publisher with:
   - **Provider**: GitHub Actions
   - **Repository**: `Raphjacksun7/docsmint`
   - **Workflow file**: `.github/workflows/publish.yml`
   - **Environment**: *(leave empty unless you add one later)*

No `NPM_TOKEN` secret is required when trusted publishing is configured.

### 2) PyPI Trusted Publisher

1. Open [PyPI project publishing settings](https://pypi.org/manage/project/docsmint/settings/publishing/) (create project on first release if needed).
2. Add a trusted publisher with:
   - **Owner**: `Raphjacksun7`
   - **Repository**: `docsmint`
   - **Workflow name**: `Publish`
   - **Environment name**: *(leave empty unless you add one later)*

No `PYPI_API_TOKEN` secret is required when trusted publishing is configured.

## Release flow

1. Bump versions you want to release (`packages/cli/package.json` and `wrappers/python/pyproject.toml`).
2. Keep npm and PyPI versions aligned to the release tag (example: both `0.1.1` for `v0.1.1`).
3. Commit changes on `main`.
4. Create and push a tag:

```bash
git tag v0.1.1
git push origin v0.1.1
```

The `Publish` workflow will:
- publish `packages/cli` to npm
- build and publish `wrappers/python` to PyPI

