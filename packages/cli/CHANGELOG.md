# tidypress

## 1.0.15

### Patch Changes

- Fix `tidypress --install-skills` so it installs bundled agent skills instead of falling through to the default `dev` command.
- Expand bundled agent skills: full CLI surface, frontmatter fields, MDX components, and explicit agent detection behavior.

## 1.0.12

### Patch Changes

- Remove `tidypress context` command. Every `tidypress build` writes full published markdown to `build/llms.txt` (opt out with `capabilities.disable: ['llmsTxt']` or `--no-llms-txt`). Update site and CLI docs accordingly.

- Updated dependencies
  - @tidypress/config@1.0.12
  - @tidypress/engine@1.0.12
