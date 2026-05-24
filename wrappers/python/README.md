# docsmint (Python)

Python entrypoint for DocsMint.

Minimal markdown docs and writing.

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

These commands are delegated to the Node CLI:

```sh
docsmint init
docsmint dev
docsmint build
docsmint preview
docsmint deploy
docsmint context
```

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

## YAML bridge

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
