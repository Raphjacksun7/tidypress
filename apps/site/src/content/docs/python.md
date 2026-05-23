---
title: Python wrapper
description: Use DocsMint from Python and run Python-native helper commands.
order: 12
---

The Python package provides a `docsmint` entrypoint for Python environments.

Rendering still uses the Node.js CLI and Astro engine. Node.js 22.12 or newer is required for `init`, `dev`, `build`, `preview`, `deploy`, and `context`.

## Install

```bash
pip install docsmint
```

For site commands, the wrapper resolves the Node CLI in this order:

1. `DOCSMINT_CLI_JS`
2. a local monorepo or project `node_modules/docsmint`
3. `docsmint` on `PATH`

It does not use `npx` by default. `DOCSMINT_USE_NPX=1` is available as an explicit escape hatch.

## Site commands

These commands are delegated to the Node CLI:

```bash
docsmint init
docsmint dev
docsmint build
docsmint preview
docsmint clean
docsmint deploy
docsmint context
```

## Notebook conversion

`convert` is Python-native:

```bash
docsmint convert analysis.ipynb
```

By default, output goes to:

```txt
docs/src/content/docs/analysis.mdx
```

You can choose the output file:

```bash
docsmint convert analysis.ipynb --output docs/src/content/docs/reports/analysis.mdx
```

The converter preserves markdown cells, code cells, text outputs, and PNG image outputs.

## Source extraction

`extract-docs` writes a simple API notes file from Python, TypeScript, or Go comments:

```bash
docsmint extract-docs src/ --lang py
docsmint extract-docs src/ --lang ts
docsmint extract-docs src/ --lang go
```

Default output:

```txt
docs/src/content/docs/api/<lang>.md
```

This is a convenience helper for small projects. For large API references, keep using the dedicated tooling for that ecosystem.

## YAML bridge

The wrapper can read `docsmint.yaml` or `docsmint.yml`:

```yaml
python:
  convert:
    input_path: analysis.ipynb
    output_path: docs/src/content/docs/analysis.mdx
```

Run with an explicit config:

```bash
docsmint convert --config ./docsmint.yaml
```
