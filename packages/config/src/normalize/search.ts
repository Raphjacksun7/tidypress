import { defaultConfig } from '../defaults.js'
import type { DocsMintConfig, DocsMintSearch } from '../schema/index.js'

export function normalizeSearch(config: DocsMintConfig): DocsMintSearch {
  return {
    ...defaultConfig.search,
    ...(config.search ?? {}),
    exclude: config.search?.exclude ?? defaultConfig.search?.exclude ?? [],
  }
}
