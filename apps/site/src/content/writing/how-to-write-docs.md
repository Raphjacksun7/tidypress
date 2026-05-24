---
title: The folder is the product
date: "2026-04-11"
description: DocsMint keeps the authoring model small enough to understand at a glance.
author: DocsMint
tags:
  - docs
  - writing
  - content
---

The useful unit in DocsMint is a folder:

```txt
docs/
├── docsmint.config.ts
├── public/
└── src/content/
    ├── docs/
    ├── writing/
    └── pages/
```

That shape is deliberate. It keeps the public site close to the source files, avoids a database, and leaves static output you can host anywhere.

Long-lived instructions belong in [docs](/docs). Dated context belongs here.
