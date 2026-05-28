# tidypress

**A publishing framework for Git-native authorship** — init, dev, build, and deploy from markdown in `site/`.

<p>
  <a href="https://github.com/Raphjacksun7/tidypress/actions/workflows/ci.yml"><img src="https://github.com/Raphjacksun7/tidypress/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/tidypress"><img src="https://img.shields.io/npm/v/tidypress.svg" alt="npm"></a>
  <a href="https://pypi.org/project/tidypress/"><img src="https://img.shields.io/pypi/v/tidypress.svg" alt="PyPI"></a>
  <a href="https://github.com/Raphjacksun7/tidypress"><img src="https://img.shields.io/github/stars/Raphjacksun7/tidypress?style=social" alt="GitHub stars"></a>
</p>

## Quickstart

Node.js **22.12+** required.

```sh
npm install tidypress
npx tidypress init --site-url https://yoursite.example
npx tidypress dev
```

```sh
npx tidypress build
npx tidypress preview
```

Build output lands in `site/build/` with `llms.txt`, Pagefind, and sitemap when `siteUrl` is set.

## Presets

`lab` is the default. Also: `blog`, `persona`, `body-of-work`, `body-of-work-docs`, `docs-writing`, `custom`.

## Commands

| Command | Purpose |
|---------|---------|
| `init` | Scaffold `site/` (`--preset …` `--site-url <url>`) |
| `dev` / `preview` | Dev server / preview build |
| `build [--no-llms-txt]` | Production static output |
| `deploy` | Publish `build/` |
| `doctor` | Setup check |
| `skills install` | Cursor / Claude / Codex skills |

Every build writes **`build/llms.txt`** with full published markdown. Skip with `--no-llms-txt` or `capabilities.disable: ['llmsTxt']`.

## Links

- **Docs:** https://tidypress.pages.dev/docs  
- **Repo README:** https://github.com/Raphjacksun7/tidypress#readme  
- **Issues:** https://github.com/Raphjacksun7/tidypress/issues  

## Monorepo development

```sh
pnpm --filter tidypress build
pnpm --filter tidypress test
```
