import { defaultConfig } from '../defaults.js'
import type { TidyPressConfig, TidyPressSearch } from '../schema/index.js'

export function normalizeSearch(config: TidyPressConfig): TidyPressSearch {
  return {
    ...defaultConfig.search,
    ...(config.search ?? {}),
    exclude: config.search?.exclude ?? defaultConfig.search?.exclude ?? [],
  }
}
