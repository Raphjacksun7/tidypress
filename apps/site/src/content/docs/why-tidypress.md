---
title: Why TidyPress
description: A publishing framework for Git-native authorship.
order: 1
paging: false
---

> TidyPress is the public interface for your repos and work. It gives engineers a way to talk about their projects, showcase ideas, publish writing, and host the docs, references, and knowledge behind the things they build.

Write markdown — by hand or with an agent that edits files in git. Preview locally. Run `tidypress build`. Deploy the `build/` folder with whatever host you already use.

The bet is DX: fast Markdown-to-site publishing with conventions built in, so you do not have to invent the presentation layer from scratch every time a new project deserves a real public surface.

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
