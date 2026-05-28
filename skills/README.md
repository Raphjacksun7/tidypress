# TidyPress agent skills

Agent Skills for [TidyPress](https://tidypress.pages.dev/) — a publishing framework for Git-native authorship. Compatible with Cursor, Claude Code, OpenAI Codex, and any tool that reads `SKILL.md` files.

## Skills

| Skill | Use when |
|-------|----------|
| **tidypress** | Building or editing a TidyPress site (`site/`, config, collections, deploy, `llms.txt`) |
| **tidypress-contributor** | Contributing to the TidyPress monorepo (PRs, packages, docs, optional AI workflow) |

## Install

### Automatic (recommended)

When you install the package in an **interactive** terminal, TidyPress detects Cursor, Claude Code, and/or Codex and prompts once:

```sh
pnpm add tidypress
# or npm install tidypress
```

The same prompt runs on the first `tidypress` CLI command if you skipped install:

```sh
npx tidypress init
# or
npx tidypress skills install
```

Skip with `TIDYPRESS_SKIP_SKILLS_INSTALL=1` or `pnpm add tidypress --ignore-scripts`.

Force install without prompting:

```sh
npx tidypress --install-skills
npx tidypress skills install --force
```

### Manual

Copy skill folders into your agent's global skills directory:

| Agent | Directory |
|-------|-----------|
| Cursor | `~/.cursor/skills/` |
| Claude Code | `~/.claude/skills/` |
| OpenAI Codex | `~/.codex/skills/` |

```sh
cp -R skills/tidypress ~/.cursor/skills/tidypress
cp -R skills/tidypress-contributor ~/.cursor/skills/tidypress-contributor
```

### From GitHub (skills CLI)

If you use the open Agent Skills installer:

```sh
npx skills add https://github.com/Raphjacksun7/tidypress --skill tidypress
```

(Project path may vary once the skills layout is published on the default branch.)

## Personal AI workspace

Contributors may use any AI tool. Optional global install (`tidypress skills install`) loads `tidypress-contributor`, which points at [`CONTRIBUTING.md`](../CONTRIBUTING.md)—not a maintainer-private workflow.

If you keep local AI notes or rules, store them in a **gitignored** folder on your machine and never include them in pull requests. See CONTRIBUTING.md → *Personal notes and AI config*.
