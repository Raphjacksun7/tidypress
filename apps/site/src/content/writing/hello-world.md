---
title: Why we built DocsMint
date: "2026-04-10"
author: Raphael Avocegamou
description: We wanted an engineer publishing workflow with ownership and clean defaults.
---

Most publishing tools can render markdown. That is not the hard part.

The hard part is shipping writing that is clear, consistent, and fast to maintain without
turning every project into theme work or platform setup.

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
for engineer docs, blogs, and technical writing.

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

Hugo-speed output with Ghost-style defaults, without giving up content ownership.
