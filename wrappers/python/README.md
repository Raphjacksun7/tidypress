# docsmint (Python client)

`docsmint` on PyPI is the official Python client for DocsMint.

It provides the same `docsmint` command by delegating to the Node.js CLI, so teams in
Python projects can install DocsMint with `pip` while keeping one canonical engine.

DocsMint is an opinionated markdown publishing system for documentation and writing.
DocsMint is created to eliminate time from content to production, with no friction.

Minimal markdown documentation builder. Write docs in markdown, get a fast static site.

## Install

```sh
pip install docsmint
```

## Requirements

- Python `>=3.11`
- Node.js installed and available on `PATH`

If Node.js is missing, the command prints an actionable install message.

## Usage

The Python client exposes the same commands as the Node.js package:

```sh
docsmint init
docsmint dev
docsmint build
docsmint preview
docsmint deploy [target]
docsmint clean
docsmint context
```

## How it works

- If the repo contains a local Node CLI, it executes it directly
- Otherwise it falls back to `npx docsmint`
- No rendering engine logic is duplicated in Python

## Why this package exists

- Python-first teams can adopt DocsMint with `pip`
- CLI behavior stays aligned with npm package releases
- One product, one command surface, one canonical engine

## Project links

- npm package: <https://www.npmjs.com/package/docsmint>
- Repository: <https://github.com/Raphjacksun7/docsmint>
- Issues: <https://github.com/Raphjacksun7/docsmint/issues>
