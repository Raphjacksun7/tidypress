import { defaultConfig } from '../defaults.js'
import type { DocsMintConfig, DocsMintTypography } from '../schema/index.js'

export function normalizeTypography(config: DocsMintConfig): DocsMintTypography {
  const defaults = defaultConfig.typography ?? { scale: 'default' }
  const typography = {
    ...defaults,
    ...(config.typography ?? {}),
  }

  if (typography.scale === 'extra') {
    typography.scale = 'large'
  }

  const allowed = new Set(['default', 'medium', 'large'])
  if (!allowed.has(typography.scale ?? 'default')) {
    throw new Error('typography.scale must be one of: "default", "medium", "large".')
  }

  return typography
}
