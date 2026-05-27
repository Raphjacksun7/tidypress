import { defaultConfig } from '../defaults.js'
import type {
  TidyPressCapabilityName,
  TidyPressConfig,
  TidyPressI18n,
  TidyPressI18nStrings,
} from '../schema/index.js'

export function normalizeI18n(config: TidyPressConfig): TidyPressI18n | undefined {
  if (!config.i18n) {
    return undefined
  }

  const rawLocales = config.i18n.locales ?? []
  const locales = Array.from(new Set(rawLocales.map(locale => locale.trim()).filter(Boolean)))
  const defaultLocale = (config.i18n.defaultLocale ?? locales[0] ?? 'en').trim()
  if (!defaultLocale) {
    throw new Error('i18n.defaultLocale must not be empty.')
  }
  if (locales.length > 0 && !locales.includes(defaultLocale)) {
    throw new Error(`i18n.defaultLocale "${defaultLocale}" must be present in i18n.locales.`)
  }

  const normalizedLocales = locales.length > 0 ? locales : [defaultLocale]
  const strings = Object.entries(config.i18n.strings ?? {}).reduce<Record<string, TidyPressI18nStrings>>(
    (acc, [locale, value]) => {
      if (!value) {
        return acc
      }
      acc[locale] = { ...value }
      return acc
    },
    {},
  )

  return {
    ...config.i18n,
    defaultLocale,
    locales: normalizedLocales,
    strings: Object.keys(strings).length > 0 ? strings : undefined,
  }
}
