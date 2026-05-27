import { withDefaults, type TidyPressConfig } from '@tidypress/config'

export function getConfig(userConfig: TidyPressConfig): TidyPressConfig {
  return withDefaults(userConfig)
}
