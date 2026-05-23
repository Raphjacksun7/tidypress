---
title: Installation
description: Install DocsMint and scaffold a new docs folder.
form: manual
order: 2
---

## Install

```bash
npm install -g docsmint
```

Or use it without installing:

```bash
npm exec docsmint@latest init
```

## Scaffold

Run inside your project root:

```bash
docsmint init
```

This creates a `docs/` folder:

```
docs/
  docsmint.config.ts
  src/
    content/
      docs/
        getting-started.md
      writing/
        hello.md
```

## Verify

```bash
cd docs
docsmint dev
```

Open [http://localhost:4321](http://localhost:4321). You should see the default home page.

Next: [Configuration](./configure)
