/** Seed files for `body-of-work` — keyed by collection; paths are the first line of each entry. */

/** @type {Record<string, string>} */
export const bodyOfWorkSeedBodies = {
  works: `sample-work.md
---
title: Sample work
description: A case study or major artifact — replace with your own.
status: shipped
featured: true
---

## Overview

What this work is and why it matters.

## Problem

What you were solving.

## What I built

Concrete outcomes, stack, and links.

## What I learned

Takeaways and current status.
`,
  projects: `sample-project.md
---
title: Sample project
description: A repo, tool, or experiment you maintain.
status: active
featured: true
repo: https://github.com/you/sample
---

Optional body when the project has an on-site page. Set \`url\` to link out instead.
`,
  writing: `hello.md
---
title: Hello
description: A starter writing post.
date: 2026-05-01
featured: true
---

Use writing for essays, release notes, and technical notes.
`,
  reference: `cli.md
---
title: CLI reference
description: Commands and flags for your project.
order: 1
---

Reference pages use the docs sidebar shell (\`kind: content\`). Add API, config, or source notes here.
`,
  process: `0001-sample-decision.md
---
title: Sample architecture decision
description: Record why you chose an approach.
order: 1
---

## Context

What forced a decision.

## Decision

What you chose.

## Outcome

What happened next.
`,
  pages: `about.md
---
title: About
description: Background, contact, uses, or resume.
navLabel: about
---

About, now, contact, uses, and resume pages live in \`pages\`.
`,
}
