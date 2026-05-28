---
title: Installation
description: Install TidyPress and scaffold a publish root at site/.
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

This creates a publish root at `site/`:

```
site/
  tidypress.config.ts
  src/
    content/
      writing/    # dated posts (RSS, tags, archive)
        hello.md
      docs/       # docs collection — sidebar-ordered guides at /docs/…
        getting-started.md
```

## Verify

```bash
cd site
tidypress dev
```

Open [http://localhost:4321](http://localhost:4321). You should see the default home page.

Next: [Configuration](./configure)
