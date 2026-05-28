# @tidypress/engine

## 1.1.0

### Minor Changes

- Remove `tidypress context` command. Every `tidypress build` writes full published markdown to `build/llms.txt` (opt out with `capabilities.disable: ['llmsTxt']` or `--no-llms-txt`). Update site and CLI docs accordingly.

### Patch Changes

- Updated dependencies
  - @tidypress/config@1.1.0
