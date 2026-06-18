---
title: Why TidyPress
description: A publishing framework for Git-native authorship.
order: 1
paging: false
---

> Your repo already contains the work. TidyPress gives it a public shape: writing, projects, docs when useful, references, and the static build artifact that actually shipped.

Write markdown — by hand or with an agent that edits files in git. Preview locally. Run `tidypress build`. Deploy the `build/` folder with whatever host you already use.

The bet is not that the world needs another blank static-site starter. The bet is that engineers keep solving the same presentation problem: what should a repo expose publicly, and how much structure should the tool give you before it gets in your way?

## What stays simple

- markdown and MDX as source
- writing and work in one publish root in git
- `docs` collection for sidebar-ordered guides and reference at `/docs/…` (enable per preset or config)
- projects and ideas presented with default conventions
- a clean default interface
- Pagefind search and `llms.txt` at build time
- static site in `site/build/`
- deploy targets that hand off to normal static hosting tools

## The thesis

Git holds the source. The build proves what shipped. The site is yours to host, fork, and leave — because the tree and `build/` are the product, not an account on someone else’s platform.

Write the pages. Build the site. Ship the folder.
