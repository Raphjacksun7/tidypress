# docsmint (Python)

Python interface for the DocsMint Node.js CLI.

Minimal markdown docs and writing. Rendering uses Astro (Node ≥22.12); this package runs that CLI reliably.

## Install

```sh
pip install docsmint
npm install -g docsmint   # or use from a repo with node_modules
```

## Usage

Same commands as the Node CLI:

```sh
docsmint init
docsmint dev
docsmint build
```

## How it finds the CLI

1. `DOCSMINT_CLI_JS` — path to `docsmint.js`
2. Monorepo / project `node_modules/docsmint` or `packages/cli/bin/docsmint.js`
3. `docsmint` on your `PATH` (from `npm install -g`)
4. Clear error with install hints (does **not** use `npx` by default)

Optional escape hatch: `DOCSMINT_USE_NPX=1` (not recommended).

## Python command routing and YAML bridge

`convert` and `extract-docs` are routed to Python-native implementations.

- `convert` performs a minimal `.ipynb` -> `.mdx` flow (frontmatter, markdown/code cells, text output, PNG image outputs).
- `extract-docs` extracts basic API docs from Python/TypeScript/Go source comments.

The wrapper supports reading `docsmint.yaml` / `docsmint.yml` and bridging command-scoped args from:

```yaml
python:
  convert:
    input_path: analysis.ipynb
    watch: true
```

You can also pass `--config /path/to/docsmint.yaml` for explicit config selection.

## Dev

```sh
pip install -e "./wrappers/python[dev]"
pytest wrappers/python/tests
```
