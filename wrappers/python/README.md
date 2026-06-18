# tidypress (Python)

Python entrypoint for TidyPress.

A publishing framework for Git-native authorship.

Rendering uses the Node.js CLI and Astro engine. Node.js 22.12 or newer is required for site commands.

## Install

```sh
pip install tidypress
```

For site commands, the wrapper resolves the Node CLI in this order:

1. `TIDYPRESS_CLI_JS`
2. local `node_modules/tidypress`
3. `tidypress` on `PATH`

It does not use `npx` by default.

## Site commands

These commands are delegated to the Node CLI — same surface as `npx tidypress`:

```sh
tidypress init [--preset lab|blog|persona|docs-writing|custom]
tidypress dev
tidypress build
tidypress preview
tidypress clean
tidypress deploy
tidypress import devto <url-or-slug>   # real fetch; other providers write scaffolds
tidypress doctor
tidypress migrate-sections
tidypress add-version <label>
tidypress domain setup [domain] --platform <platform>
```

Every `tidypress build` writes `build/llms.txt`.

Experimental Node commands (`editor`, `export`, `ai`) are also forwarded when enabled in config.

## Python-native commands

`convert` turns a notebook into MDX:

```sh
tidypress convert analysis.ipynb --output site/src/content/docs/analysis.mdx
```

It preserves frontmatter, markdown cells, code cells, text output, and PNG image outputs.

`extract-docs` writes simple API notes from source comments:

```sh
tidypress extract-docs src/ --lang py
tidypress extract-docs src/ --lang ts
tidypress extract-docs src/ --lang go
```

## Help and init presets

```sh
tidypress --help
tidypress init --help
```

The Python wrapper prints init preset summaries (`lab`, `blog`, `persona`, `docs-writing`, `custom`) from the same metadata as `@tidypress/config`.

## Streaming build and deploy

`build` and `deploy` use an async subprocess with live stdout/stderr. Pass `--sync` to use the blocking path instead.

## YAML bridge

`tidypress.yaml` is validated against the shared JSON Schema shipped with `@tidypress/config` (bundled in this package under `tidypress/schemas/`).

The wrapper supports reading `tidypress.yaml` / `tidypress.yml` and bridging command-scoped args from:

```yaml
python:
  convert:
    input_path: analysis.ipynb
    output_path: site/src/content/docs/analysis.mdx
    watch: true
```

Use an explicit config when needed:

```sh
tidypress convert --config ./tidypress.yaml
```

Full docs: <https://tidypress.pages.dev/docs/python>
