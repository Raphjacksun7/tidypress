---
title: How to write documentation that works
date: "2026-04-11"
description: Structure, style, and the rules we follow when writing with docsmint.
author: Raphael Avocegamou
---

## Structure first

Every page answers three questions, in order: what is it, why does it exist, how do you use it.

Skip the why if it's obvious. Never skip the what.

If you can't describe what a page covers in one sentence, the page isn't ready.

---

## Write less

Remove anything that doesn't carry weight.

Cut: "you can", "this allows you to", "in order to", "it's worth noting", "simply", "just".

What's left is usually the sentence you meant to write.

One idea per paragraph. Space between them. No hedging.

---

## Headings are navigation

Readers scan before they read. Headings are the map.

Use `##` for sections. `###` for subsections. Never use `#` — docsmint renders the frontmatter `title` as the page heading.

Make headings specific. "Configuration" is worse than "Configure date format". "Usage" is worse than "Run the dev server".

---

## Code blocks always have a language

```python
def example():
    return True
```

Not:

```
def example():
    return True
```

The syntax highlighter is there. Use it.

If your example contains triple backticks, use four backticks for the outer fence.

---

## Components have rules

**Callout** — use when the reader would miss something important inline. Once or twice per page.

**Tooltip** — for jargon. One sentence. Not a paragraph.

**Tabs** — for genuine alternatives (pnpm / npm / pip). Not for organizing content.

**FileTree** — show structure. Keep it short. Only what's relevant.

**Collapsible** — for content that interrupts flow. If everything is collapsible, nothing is.

---

## The sidebar is a contract

Each entry sets an expectation.

Only include pages that are complete. Avoid placeholders — they break trust faster than missing content.

Pages in `docs/` subdirectories appear under section headers. Use this to group related content, not to create hierarchy for its own sake.

---

## LLM context

Run `docsmint context` from your project root.

It generates `docsmint-context.md` — a snapshot of your docs, writing, and custom pages with
title, path, and excerpt metadata.

Use it as source context when asking an LLM to draft or refactor documentation.

---

Good documentation teaches.

It helps people understand what to do and why it works.

The goal is always the same: the reader leaves knowing more than they arrived with, and trusting that what they read was true.
