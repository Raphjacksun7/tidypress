# Contributing to TidyPress

Thank you for helping improve [TidyPress](https://tidypress.pages.dev/). This guide is for everyone contributing to the [tidypress repository](https://github.com/Raphjacksun7/tidypress)—whether you edit by hand or with AI tools.

## Quick links

| Action | Link |
|--------|------|
| Improve documentation | [CONTRIBUTING.md](https://github.com/Raphjacksun7/tidypress/blob/main/CONTRIBUTING.md) · [docs folder](https://github.com/Raphjacksun7/tidypress/tree/main/apps/site/src/content/docs) |
| Report a bug | [Bug report](https://github.com/Raphjacksun7/tidypress/issues/new?template=bug_report.yml) |
| Suggest a feature | [Feature request](https://github.com/Raphjacksun7/tidypress/issues/new?template=feature_request.yml) |
| Security issue | [Private advisory](https://github.com/Raphjacksun7/tidypress/security/advisories/new) ([policy](./SECURITY.md)) |

## Ways to contribute

| Kind of change | Suggested first step |
|----------------|----------------------|
| Documentation typo or clarification | Pull request (issue optional) |
| Bug fix | [Bug report](https://github.com/Raphjacksun7/tidypress/issues/new?template=bug_report.yml), then PR |
| Feature or improvement | [Feature request](https://github.com/Raphjacksun7/tidypress/issues/new?template=feature_request.yml) before large PRs |
| Security vulnerability | [Private advisory](./SECURITY.md) — not a public issue |

## Two paths

### Path A — Quick fix (most contributors)

For typos, small bugs, and focused doc updates:

1. Fork and branch from `main`.
2. Change code or `apps/site/src/content/docs/`.
3. Run `pnpm test` and `pnpm build`.
4. Open a pull request with a clear **title** and **summary**.
5. Wait for **CI** and review.

You do **not** need a special commit format. We **squash-merge**; the PR title becomes the main history line.

### Path B — Larger change

For features, refactors, or multi-package work:

1. Open a [feature request](https://github.com/Raphjacksun7/tidypress/issues/new?template=feature_request.yml) or [bug report](https://github.com/Raphjacksun7/tidypress/issues/new?template=bug_report.yml) and agree on scope with a maintainer.
2. Same implementation steps as Path A.
3. Add tests when behavior changes.
4. Run `pnpm changeset` when publishable packages change.

## Development setup

Requirements: **Node.js 22.12+**, **pnpm**.

```bash
git clone https://github.com/Raphjacksun7/tidypress.git
cd tidypress
pnpm install       # installs a prepare-commit-msg hook that strips Cursor co-author trailers
pnpm test          # or: pnpm -r test
pnpm build         # or: pnpm -r build
```

| Path | Role |
|------|------|
| `packages/cli` | `tidypress` CLI |
| `packages/engine` | Astro rendering runtime |
| `packages/config` | Config schema and normalization |
| `apps/site` | Product documentation site |
| `examples/` | Example sites |
| `wrappers/python` | Python wrapper (not a second renderer) |

## Pull requests

1. Fork and branch from `main`.
2. Keep each PR focused when possible.
3. Write a clear **title** and **summary** (squash merge uses the title).
4. Link an issue for bugs and non-trivial features.
5. Fill out the [PR template](.github/PULL_REQUEST_TEMPLATE.md).
6. Ensure **CI is green** on your PR.

### Checks before you open a PR

```bash
pnpm test
pnpm build
```

For changes to publishable packages (`packages/cli`, `packages/engine`, `packages/config`, root `tidypress`):

```bash
pnpm changeset
```

Commit the generated `.changeset/*.md` file with your PR.

When you change user-facing behavior, update **`apps/site/src/content/docs/`**.

### Review and merge (what maintainers do)

1. Triage issues (labels, repro steps).
2. Require green CI (`validate`, `install-e2e`).
3. Review for scope, tests, and user docs.
4. Approve and **squash-merge** when ready.
5. Release via Changesets when needed ([`RELEASING.md`](./RELEASING.md)).

## Using AI tools

You may use **any** AI assistant (Cursor, Claude Code, Codex, ChatGPT, etc.). There is no required vendor workflow.

1. **Read context** — This file, the package README, and nearby tests.
2. **Optional skills** — `npx tidypress skills install` installs `tidypress` and `tidypress-contributor` for Cursor, Claude Code, or Codex.
3. **LLM export** — run `tidypress build` and spot-check `site/build/llms.txt` when touching published-content export.
4. **Implement** — Smallest change that solves the issue.
5. **Verify** — `pnpm test` and `pnpm build`; review the full `git diff`.
6. **Disclose** — Note in the PR if AI generated most of the patch.

Do not commit API keys, tokens, or `.env` files.

## Personal notes and AI config (do not commit)

Many contributors keep **private** folders for local AI rules, roadmaps, or session notes. Those are welcome locally and must **never** appear in pull requests.

Check [`.gitignore`](./.gitignore) for paths already excluded from the shared repo. If you use **your own** directory (any name), add it to `.gitignore` before creating files there.

```gitignore
# Personal AI / notes — never commit
my-workspace/
```

**Rule:** If it is only for how *you* work with AI, it stays out of git.

## Community

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security policy](./SECURITY.md)

### Maintainer: GitHub repo settings

After merging template and policy files, apply branch protection and labels (requires [GitHub CLI](https://cli.github.com/)):

```bash
./scripts/setup-github-repo.sh
```

If checks fail to match, open a recent PR on GitHub → Checks and use the exact names in Settings → Rules → `main`.

## Product guardrails (user-facing copy)

- Core pitch: *A publishing framework for Git-native authorship.*
- Do not add docs-SaaS marketing stacks or competitor site names in user-facing docs.
- Write clear standalone sentences. Parentheses and tree comments are fine when they compress useful detail — not as a dodge for unclear prose.

## License

By contributing, you agree that your contributions are licensed under the same license as the project ([MIT](./LICENSE)).
