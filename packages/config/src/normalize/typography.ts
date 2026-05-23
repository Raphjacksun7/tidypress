import { defaultConfig } from '../defaults.js'
import type { DocsMintConfig, DocsMintTypography } from '../schema/index.js'

export const TYPOGRAPHY_SCALES = ['small', 'medium', 'large'] as const
export type ResolvedTypographyScale = (typeof TYPOGRAPHY_SCALES)[number]

const SCALE_ALIASES: Record<string, ResolvedTypographyScale> = {
  default: 'medium',
  extra: 'large',
}

export function normalizeTypography(config: DocsMintConfig): DocsMintTypography {
  const defaults = defaultConfig.typography ?? { scale: 'medium' }
  const typography = {
    ...defaults,
    ...(config.typography ?? {}),
  }

  const raw = typography.scale ?? 'medium'
  const resolved = SCALE_ALIASES[raw] ?? raw

  if (!(TYPOGRAPHY_SCALES as readonly string[]).includes(resolved)) {
    throw new Error(
      `typography.scale must be one of: ${TYPOGRAPHY_SCALES.map((s) => `"${s}"`).join(', ')}.`,
    )
  }

  typography.scale = resolved as ResolvedTypographyScale
  return typography
}
