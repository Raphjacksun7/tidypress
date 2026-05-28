---
title: Why TidyPress
description: A publishing framework for Git-native authorship.
order: 1
paging: false
---

> A publishing framework for Git-native authorship.

TidyPress is the public interface for your repos and work. It gives engineers a way to talk about their projects, showcase ideas, publish writing, and host the docs, references, and knowledge behind the things they build.

Write markdown — by hand or with an agent that edits files in git. Preview locally. Run `tidypress build`. Deploy the `build/` folder with whatever host you already use.

The bet is DX: fast Markdown-to-site publishing with conventions built in, so you do not have to invent the presentation layer from scratch every time a new project deserves a real public surface.

## What stays simple

- markdown and MDX as source
- docs and dated writing in one tree
- projects and ideas presented with default conventions
- a clean default interface
- Pagefind search and `llms.txt` at build time (machine-readable export of published pages)
- static site in `build/` (for example `docs/build/`)
- deploy targets that hand off to normal static hosting tools

## What TidyPress is not

TidyPress is not an API docs SaaS, community feed, newsletter platform, or team wiki. It does not own your audience, content, or hosting.

Write the pages. Build the site. Keep the shape simple enough to leave.