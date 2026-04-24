import { withDefaults, type DocsMintConfig } from '@docsmint/config'

export function getConfig(userConfig: DocsMintConfig): DocsMintConfig {
  return withDefaults(userConfig)
}
