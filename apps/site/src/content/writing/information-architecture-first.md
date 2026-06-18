---
title: Information architecture first
date: "2026-05-26"
description: Why a repo still needs a public shape before the work becomes legible.
tags:
  - writing
featured: true
---

Most publishing tools optimize the moment you hit Publish. The problem I kept running into was earlier than that.

The work was already somewhere: project READMEs, notes, screenshots, release history, reference pages, half-written essays, decisions that only made sense if you were there when they happened. The public version was the part I kept rebuilding, each time from scratch, each time without solving why the previous one felt wrong.

It took longer than I want to admit to name the actual problem. **A repo is not a public interface. It is a production artifact with a different audience.**

## The site is an interface, not a mirror

A repo can be useful to the person maintaining it and still be a poor public interface. It exposes files, commits, folders, and implementation detail. A `git log` tells you what changed and when. It does not tell you what the work is, what is stable, what is exploratory, what to read first, or how the pieces relate.

Those are editorial decisions. They do not fall out of the files automatically. Someone has to make them, and the site is where that judgment either happens or visibly fails to happen.

[Simon Willison](https://simonwillison.net/) has been spelling out the operational discipline for years: keep drafts in files you control, publish at real URLs, let models propose edits while you keep review and ownership. That matters more now, not less.

## The missing piece: a public shape

The structure I kept returning to after enough failed attempts looks like this:

```txt
site/
├── tidypress.config.ts
└── src/content/
    ├── writing/    # dated thinking and essays
    ├── projects/   # work with outcomes and context
    └── docs/       # guides when the work needs a manual
```

This is not clever folder naming. Each section makes a specific *promise* to a reader.

`writing` says: time is meaningful here. These pieces have a date and they accumulate into a record of thinking over time. `projects` says: something was built, it has an outcome, and you can evaluate it. `docs` says: this explanation is stable enough to maintain. It will not rot next month.

When everything collapses into one feed, those distinctions disappear. A release note looks like an essay looks like a reference page. The reader cannot tell what they are looking at or how seriously to take it.

## Convention before output

Here is the mechanism that took me a while to see clearly.

When you start a project without a public content model, the first thing you publish sets an implicit structure. Everything after it inherits that structure. Three months later you have a `posts/` folder with fifteen files that are trying to be six different kinds of thing, and rearchitecting means breaking URLs, rewriting frontmatter, and redoing the navigation. So you do not rearchitect. You keep the structure that was never a decision.

This is why the structural choice compounds. It is not that a `writing/projects/docs` split is inherently superior to a flat `posts/` folder. It is that making the decision explicitly, before the content accretes, means you can hold to it. Every piece of content you add from that point reinforces the model rather than straining against it.

Good engineering conventions do the same thing: routes get a place to live before you build the handler, tests get a shape before you write the first assertion. The convention is not the interesting part. The interesting part is that the convention removes a class of decisions from every subsequent piece of work.

## Artifact as contract

`tidypress build` writes the public site to `site/build/`. That folder is the contract. If it is in the build, it shipped. If it is not, it did not.

Working material lives in git. Review happens in diffs. The public interface is generated from the same tree the agent and the human both edit.

```bash
npx tidypress init --preset lab --site-url https://yoursite.example
npx tidypress dev
```

The setup is not the point. The point is that the public shape of the work is an explicit decision, made once, before the content exists to resist it.

[Why TidyPress](/docs/why-tidypress) goes further on the product thesis. [Agents and markdown](/writing/agents-and-markdown) walks through what this convention looks like when an agent is part of the authorship.