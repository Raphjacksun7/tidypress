---
title: Hello, world
date: "2026-03-18"
description: A public interface for work I actually own — not another feed.
author: Raph
tags:
  - writing
  - tidypress
---

I ship a lot of small things: repos, experiments, notes that should have been posts, reference pages that never quite fit a README. For years the “public face” of that work was scattered — a profile link here, a thread there, a docs folder nobody bookmarked. **TidyPress is my attempt to gather it:** one git-native site where writing, projects, and optional docs share the same calm interface.

That is the vision in one sentence: *a publishing framework for Git-native authorship.* Not a newsletter product. Not a team wiki dressed as a homepage. The public interface for repos and work — ideas on the home page, essays in `writing/`, a manual in `docs/` only when a tool needs one.

## What I was optimizing for

Two constraints kept showing up:

1. **Ownership.** Markdown in the tree I already use. A `build/` folder I can host anywhere. No second database that becomes the real source of truth after the acquihire.
2. **Reading fatigue.** Narrow measure, quiet chrome, typography that still feels good on post three. Flashy sites get one visit; a site you do not mind reopening gets the return traffic — including future-you grepping for what you meant six months ago.

<Image src="/images/flower.jpg" alt="Single flower in soft light" caption="Small surface, full attention — the layout should feel like this, not like a dashboard." />

## What ships from here

This post is the first file in `writing/`. More will follow: how I think about folders as the product, how agents fit the same git contract, builds as receipts, that sort of thing. The point is not volume. The point is that **publishing stays as small as saving a file**, and the site stays legible enough that someone landing from GitHub, a talk slide, or an LLM citation can orient in one scroll.

If you are building the same kind of surface — engineer-owned, static, honest about what is in git — [start with the docs](/docs/getting-started) or skim [why TidyPress](/docs/why-tidypress) for the boundary lines we draw on purpose.

Welcome. The folder is upstream; what you are reading is what cleared the build.
