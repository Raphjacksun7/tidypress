# @tidypress/config

## 1.0.12

### Patch Changes

- Remove `tidypress context` command. Every `tidypress build` writes full published markdown to `build/llms.txt` (opt out with `capabilities.disable: ['llmsTxt']` or `--no-llms-txt`). Update site and CLI docs accordingly.
