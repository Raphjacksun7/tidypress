---
title: Why we built DocsMint
date: "2026-04-10"
author: Raphael Avocegamou
description: We wanted documentation that reads as clearly as the software it describes.
---

Most documentation systems can generate HTML. That is not the hard part.

The hard part is shipping docs that are clear, consistent, and fast to maintain without
turning every project into theme work.

DocsMint exists to solve that gap.

---

It is intentionally opinionated:

- markdown-first
- constrained UI system
- predictable navigation
- built-in search and dark mode

The goal is simple: write content, publish quickly, keep quality high.

---

DocsMint is not a generic theme builder and not a CMS. It is a focused publishing system
for documentation and writing.

You own content and config. DocsMint owns the engine internals.

```bash
npx docsmint@latest init
docsmint dev
```

Python is also supported:

```bash
pip install docsmint
docsmint dev
```

---

Minimal markdown documentation builder. Write docs in markdown, get a fast static site.
