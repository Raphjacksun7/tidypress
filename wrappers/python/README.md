# docsmint (Python)

Python entrypoint for DocsMint.

Minimal markdown site for fast writing and project showcase.

Rendering uses the Node.js CLI and Astro engine. Node.js 22.12 or newer is required for site commands.

## Install

```sh
pip install docsmint
```

For site commands, the wrapper resolves the Node CLI in this order:

1. `DOCSMINT_CLI_JS`
2. local `node_modules/docsmint`
3. `docsmint` on `PATH`

It does not use `npx` by default.

## Site commands

These commands are delegated to the Node CLI (same as `npx docsmint`):

```sh
docsmint init [--preset lab|blog|persona|docs-writing|custom]
docsmint dev
docsmint build
docsmint preview
docsmint clean
docsmint deploy
docsmint context [output.md]
docsmint import devto <url-or-slug>   # real fetch; other providers write scaffolds
docsmint doctor
docsmint migrate-sections
docsmint add-version <label>
docsmint domain setup [domain] --platform <platform>
```

Experimental Node commands (`editor`, `export`, `ai`) are also forwarded when enabled in config.

## Python-native commands

`convert` turns a notebook into MDX:

```sh
docsmint convert analysis.ipynb --output docs/src/content/docs/analysis.mdx
```

It preserves frontmatter, markdown cells, code cells, text output, and PNG image outputs.

`extract-docs` writes simple API notes from source comments:

```sh
docsmint extract-docs src/ --lang py
docsmint extract-docs src/ --lang ts
docsmint extract-docs src/ --lang go
```

## Help and init presets

```sh
docsmint --help
docsmint init --help
```

The Python wrapper prints init preset summaries (`lab`, `blog`, `persona`, `docs-writing`, `custom`) from the same metadata as `@docsmint/config`.

## Streaming build and deploy

`build` and `deploy` use an async subprocess with live stdout/stderr. Pass `--sync` to use the blocking path instead.

## YAML bridge

`docsmint.yaml` is validated against the shared JSON Schema shipped with `@docsmint/config` (bundled in this package under `docsmint/schemas/`).

The wrapper supports reading `docsmint.yaml` / `docsmint.yml` and bridging command-scoped args from:

```yaml
python:
  convert:
    input_path: analysis.ipynb
    output_path: docs/src/content/docs/analysis.mdx
    watch: true
```

Use an explicit config when needed:

```sh
docsmint convert --config ./docsmint.yaml
```

Full docs: <https://usedocsmint.pages.dev/docs/python>
