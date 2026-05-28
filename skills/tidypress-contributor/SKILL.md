---
name: tidypress-contributor
description: >-
  Contribute to the TidyPress monorepo — setup, package boundaries, PR checklist,
  changesets, and optional AI-assisted workflow. Use when working in the tidypress
  GitHub repo, packages/cli|engine|config, apps/site docs, examples, or when the
  user mentions contributing, pull requests, or developing TidyPress itself.
---

# TidyPress contributor (monorepo)

Read these before non-trivial changes:

1. [`CONTRIBUTING.md`](../../CONTRIBUTING.md) — how to contribute (required)
2. [`README.md`](../../README.md) — product overview and workspace commands
3. [`RELEASING.md`](../../RELEASING.md) — when changing publishable packages
4. [`LICENSE`](../../LICENSE)

Never reference or depend on maintainer-private workspace folders that are not in the public contribution guide. Contributors use their own AI setup.

## Product scope

**Pitch:** A publishing framework for Git-native authorship.

**Thesis:** The public interface for an engineer's repos, work, ideas, projects, docs, references, and product knowledge.

Rendering stays **Node.js + Astro** only. Python wraps tooling; it is not a second renderer.

## Package boundaries

| Package | Owns | Does not own |
|---------|------|----------------|
| `packages/cli` | Commands, deploy strategies | Rendering, Astro |
| `packages/engine` | Astro site runtime, components | Deploy provider SDKs in core paths |
| `packages/config` | Schema, defaults, normalization | CLI UX |
| `apps/site` | Product docs at tidypress.pages.dev | Example sites |
| `wrappers/python` | Packaging, Python helpers | Site rendering |

## Workspace commands

```bash
pnpm install
pnpm -r test
pnpm -r build
```

Before opening a PR:

```bash
pnpm test          # or pnpm -r test for wide changes
pnpm build         # or pnpm -r build
pnpm changeset     # when publishable packages change
```

Marketing docs snapshot (when CI expects it):

```bash
pnpm --filter @tidypress/site build
```

## Pull requests

- One focused change per PR when possible
- Clear **title** and **summary** (squash merge uses the title)
- Link a GitHub issue for bugs and features
- Update `apps/site/src/content/docs/` when user-facing behavior changes
- Add/update tests when logic changes
- Include a **test plan** in the PR body
- Do not commit unless the user explicitly asks

## Using AI to contribute

Any AI assistant is fine. Follow [`CONTRIBUTING.md`](../../CONTRIBUTING.md#using-ai-tools-optional).

1. **Install skills (optional)** — `npx tidypress skills install` adds `tidypress` and `tidypress-contributor` to Cursor, Claude Code, or Codex.
2. **Load repo context** — `CONTRIBUTING.md`, package README, tests for files you touch.
3. **Docs** — Edit `apps/site/src/content/docs/`; keep `configuration.md` accurate.
4. **LLM export** — `tidypress build` and inspect `docs/build/llms.txt` when changing published-content export.
5. **Verify** — `pnpm test` and `pnpm build`; scan the full diff for secrets and unrelated files.
6. **Disclose** — Say in the PR if AI wrote most of the change.

Never commit credentials.

## Personal AI workspace (local only)

Contributors may keep a **private gitignored folder** for AI rules, roadmaps, or notes—any name they choose (e.g. `my-workspace/`, `notes/`, `.cursor/`).

Setup (contributor machine, not in PRs):

1. Pick a directory name outside shared packages (or use editor-global skills).
2. Add it to `.gitignore` before creating files.
3. Store prompts, `SKILL.md` copies, and session notes there.
4. Point the AI at [`CONTRIBUTING.md`](../../CONTRIBUTING.md) and package READMEs from the clone—do not invent maintainer-only workflows.

Rules:

- **Do not** commit personal tooling or reference maintainer-private paths in PRs, issues, or user docs.
- **Do not** tell contributors they must use a specific private folder name from this repo.
- **Rule:** Personal workflow stays out of git; only shared code, tests, and docs belong in PRs.

If the user asks for a private AI workspace, help them extend `.gitignore` and keep PRs limited to product changes.

## Changesets

When changing `packages/cli`, `packages/engine`, `packages/config`, or the published `tidypress` package:

```bash
pnpm changeset
```

Commit the generated `.changeset/*.md` file with the PR.

## Guardrails (user-facing product)

- Do not add docs-SaaS or competitor-site positioning in user copy
- Do not add fake deploy implementations beyond instructions-only strategies
- Do not break `writeLlmsTxt` / `createContentSnapshot` tests without updating expectations
- Keep the core pitch: *Git-native authorship*, not “docs platform” marketing stacks

## Examples

From repo root after `pnpm install`:

```bash
pnpm --filter @tidypress/example-lab build
pnpm --filter @tidypress/example-minimal build
```

See `examples/` and [examples doc](https://tidypress.pages.dev/docs/examples).

## End-user skills

Bundled under `skills/` and installed via `tidypress skills install` for site authors—not required for monorepo code contributions.
