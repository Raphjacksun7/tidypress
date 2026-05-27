---
title: Installation
description: Install TidyPress and scaffold a new docs folder.
form: manual
order: 2
published: false
---

## Install

```bash
npm install -g tidypress
```

Or use it without installing:

```bash
npm exec tidypress@latest init
```

## Scaffold

Run inside your project root:

```bash
tidypress init
```

This creates a `docs/` folder:

```
docs/
  tidypress.config.ts
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
tidypress dev
```

Open [http://localhost:4321](http://localhost:4321). You should see the default home page.

Next: [Configuration](./configure)
