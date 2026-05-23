import { defaultConfig } from '../defaults.js'
import type {
  DocsMintCapabilityName,
  DocsMintCodeThemePreset,
  DocsMintConfig,
  DocsMintTheme,
  DocsMintThemeTokenName,
  DocsMintThemeTokenSurface,
} from '../schema/index.js'
import { docsMintCodeThemePresets } from '../schema/index.js'
import { isDocsMintCodeThemePreset } from '../registry/code-themes.js'

const allowedThemeTokens = new Set<DocsMintThemeTokenName>([
  'bg',
  'fg',
  'muted',
  'border',
  'surface',
  'codeBg',
  'codeFg',
])

export function normalizeTheme(
  config: DocsMintConfig,
  capabilityFlags: Partial<Record<DocsMintCapabilityName, boolean>>,
): DocsMintTheme {
  const fallback: DocsMintTheme = structuredClone(defaultConfig.theme ?? {
    mode: 'guardrailed',
    preset: 'baseline',
    code: { preset: 'claude' },
    tokens: { light: {}, dark: {} },
  })
  const source = config.theme ?? {}
  const mode = source.mode ?? fallback.mode ?? 'guardrailed'
  const preset = source.preset ?? fallback.preset ?? 'baseline'
  const requestedCodePresetRaw = source.code?.preset ?? fallback.code?.preset ?? 'claude'
  if (!isDocsMintCodeThemePreset(requestedCodePresetRaw)) {
    throw new Error(
      `theme.code.preset must be one of: ${docsMintCodeThemePresets.join(', ')}.`,
    )
  }
  const requestedCodePreset: DocsMintCodeThemePreset = requestedCodePresetRaw
  if (preset !== 'baseline') {
    throw new Error('theme.preset must be "baseline".')
  }
  if (mode !== 'guardrailed' && mode !== 'custom') {
    throw new Error('theme.mode must be "guardrailed" or "custom".')
  }

  if (capabilityFlags.theming === false) {
    return {
      mode: 'guardrailed',
      preset: 'baseline',
      code: {
        preset: fallback.code?.preset ?? 'claude',
      },
      tokens: fallback.tokens,
    }
  }

  const defaultLight = fallback.tokens?.light ?? {}
  const defaultDark = fallback.tokens?.dark ?? {}
  const customTokens = source.tokens

  if (mode === 'guardrailed') {
    return {
      mode,
      preset,
      code: {
        preset: requestedCodePreset,
      },
      tokens: {
        light: defaultLight,
        dark: defaultDark,
      },
    }
  }

  if (capabilityFlags.themingCustom !== true) {
    throw new Error(
      'theme.mode="custom" requires capabilities.enable to include "themingCustom".',
    )
  }
  if (!customTokens || !customTokens.light || !customTokens.dark) {
    throw new Error('theme.mode="custom" requires theme.tokens.light and theme.tokens.dark.')
  }

  const normalizeTokenMap = (
    tokenMap: Partial<DocsMintThemeTokenSurface>,
    field: 'theme.tokens.light' | 'theme.tokens.dark',
  ): Partial<DocsMintThemeTokenSurface> => {
    const normalized: Partial<DocsMintThemeTokenSurface> = {}
    for (const [key, rawValue] of Object.entries(tokenMap)) {
      if (!allowedThemeTokens.has(key as DocsMintThemeTokenName)) {
        throw new Error(
          `${field} contains unsupported token "${key}". Allowed tokens: ${Array.from(allowedThemeTokens).join(', ')}.`,
        )
      }
      const value = String(rawValue ?? '').trim()
      if (!value) {
        throw new Error(`${field}.${key} must be a non-empty string.`)
      }
      if (!/^[#(),.%/\-\sA-Za-z0-9]+$/.test(value)) {
        throw new Error(`${field}.${key} contains unsupported characters for a CSS token.`)
      }
      normalized[key as DocsMintThemeTokenName] = value
    }
    if (Object.keys(normalized).length === 0) {
      throw new Error(`${field} must include at least one token override.`)
    }
    return normalized
  }

  return {
    mode,
    preset,
    code: {
      preset: requestedCodePreset,
    },
    tokens: {
      light: {
        ...defaultLight,
        ...normalizeTokenMap(customTokens.light, 'theme.tokens.light'),
      },
      dark: {
        ...defaultDark,
        ...normalizeTokenMap(customTokens.dark, 'theme.tokens.dark'),
      },
    },
  }
}
