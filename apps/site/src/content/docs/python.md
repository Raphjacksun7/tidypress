---
title: Python wrapper
description: Use TidyPress from Python and run Python-native helper commands.
order: 12
---

The Python package provides a `tidypress` entrypoint for Python environments.

Rendering still uses the Node.js CLI and Astro engine. Node.js 22.12 or newer is required for `init`, `dev`, `build`, `preview`, and `deploy`.

## Install

```bash
pip install tidypress
```

For site commands, the wrapper resolves the Node CLI in this order:

1. `TIDYPRESS_CLI_JS`
2. a local monorepo or project `node_modules/tidypress`
3. `tidypress` on `PATH`

It does not use `npx` by default. `TIDYPRESS_USE_NPX=1` is available as an explicit escape hatch.

## Site commands

These commands are delegated to the Node CLI (same surface as `npx tidypress`):

```bash
tidypress init [--preset lab|blog|persona|docs-writing|custom]
tidypress dev
tidypress build
tidypress preview
tidypress clean
tidypress deploy
# build/llms.txt on every build
tidypress import devto <url-or-slug>
tidypress doctor
tidypress migrate-sections
tidypress add-version <label>
```

`import devto` fetches real markdown. Other import providers write review scaffolds. Experimental Node commands (`editor`, `export`, `ai`) forward when enabled in config.

## Notebook conversion

`convert` is Python-native:

```bash
tidypress convert analysis.ipynb
```

By default, output goes to:

```txt
docs/src/content/docs/analysis.mdx
```

You can choose the output file:

```bash
tidypress convert analysis.ipynb --output docs/src/content/docs/reports/analysis.mdx
```

The converter preserves markdown cells, code cells, text outputs, and PNG image outputs.

## Source extraction

`extract-docs` writes a simple API notes file from Python, TypeScript, or Go comments:

```bash
tidypress extract-docs src/ --lang py
tidypress extract-docs src/ --lang ts
tidypress extract-docs src/ --lang go
```

Default output:

```txt
docs/src/content/docs/api/<lang>.md
```

This is a convenience helper for small projects. For large API references, keep using the dedicated tooling for that ecosystem.

## Agents and markdown

Agents that edit files in git use the same commands as you do: add markdown under `src/content/`, run `tidypress build`, deploy `build/`. Point the model at `build/llms.txt` (or the live `/llms.txt` URL) for full published content. Details: [Agents and markdown](/writing/agents-and-markdown).

## Help and init presets

```bash
tidypress --help
tidypress init --help
```

The Python entrypoint lists the same init presets as the Node CLI (`lab`, `blog`, `persona`, `docs-writing`, `custom`). `default` is an alias for `lab`.

## Streaming build and deploy

`tidypress build` and `tidypress deploy` stream Node CLI output live through an async subprocess. Add `--sync` to use the legacy blocking runner (for scripts that capture output).

## YAML bridge

`tidypress.yaml` is validated against the shared JSON Schema from `@tidypress/config` before Python commands read bridged flags.

The wrapper can read `tidypress.yaml` or `tidypress.yml`:

```yaml
python:
  convert:
    input_path: analysis.ipynb
    output_path: docs/src/content/docs/analysis.mdx
```

Run with an explicit config:

```bash
tidypress convert --config ./tidypress.yaml
```
