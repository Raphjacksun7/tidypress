import { defaultConfig, defaultGithubFooterItem } from '../defaults.js'
import { defaultFooterCredit } from '../registry/footer-defaults.js'
import {
  ensureBlankTargetRel,
  isExternalHref,
  LINK_TARGET_BLANK,
  type ResolvedLinkAttributes,
} from '../links/link-attributes.js'
import type {
  FooterItem,
  TidyPressConfig,
  TidyPressFooter,
  TidyPressFooterCredit,
  TidyPressFooterInput,
  TidyPressFooterMain,
  TidyPressFooterMainLink,
  TidyPressFooterMainSlot,
} from '../schema/index.js'

function iconFooterLinkAttributes(item: FooterItem): ResolvedLinkAttributes {
  if (item.external === false) {
    return {}
  }
  return {
    target: LINK_TARGET_BLANK,
    rel: ensureBlankTargetRel(undefined),
  }
}

function textFooterLinkAttributes(item: FooterItem): ResolvedLinkAttributes {
  if (item.external === false) {
    return {}
  }
  if (!isExternalHref(item.href)) {
    return {}
  }
  return {
    target: LINK_TARGET_BLANK,
    rel: ensureBlankTargetRel(undefined),
  }
}

export function normalizeFooterItems(items: FooterItem[] | undefined): FooterItem[] | undefined {
  if (!items) {
    return items
  }
  return items.map(item => {
    const linkAttrs = item.icon ? iconFooterLinkAttributes(item) : textFooterLinkAttributes(item)
    return {
      ...item,
      external: item.external ?? (item.icon ? true : isExternalHref(item.href)),
      ...linkAttrs,
    }
  })
}

function footerLinksFromInput(input: TidyPressFooterInput | undefined): FooterItem[] {
  if (input === undefined) {
    return [...((defaultConfig.footer as FooterItem[] | undefined) ?? [])]
  }
  if (Array.isArray(input)) {
    return [...input]
  }
  return [...(input.links ?? [])]
}

function mainLinkAttributes(item: TidyPressFooterMainLink): Pick<TidyPressFooterMainLink, 'target' | 'rel'> {
  if (item.external === false) {
    return {}
  }
  if (!isExternalHref(item.href)) {
    return {}
  }
  return {
    target: LINK_TARGET_BLANK,
    rel: ensureBlankTargetRel(undefined),
  }
}

function normalizeFooterMainSlot(
  slot: TidyPressFooterMainSlot | undefined,
): TidyPressFooterMainSlot | undefined {
  if (slot === undefined) {
    return undefined
  }
  if (typeof slot === 'string') {
    const text = slot.trim()
    return text || undefined
  }

  const links: TidyPressFooterMainLink[] = []

  for (const item of slot) {
    const label = item.label?.trim()
    const href = item.href?.trim()
    if (!label || !href) {
      continue
    }
    const linkAttrs = mainLinkAttributes(item)
    links.push({
      ...item,
      label,
      href,
      external: item.external ?? isExternalHref(href),
      ...linkAttrs,
    })
  }

  return links.length > 0 ? links : undefined
}

function normalizeFooterMain(input: TidyPressFooterInput | undefined): TidyPressFooterMain {
  if (input === undefined || Array.isArray(input)) {
    return {}
  }

  const start = normalizeFooterMainSlot(input.main?.start)
  const end =
    normalizeFooterMainSlot(input.main?.end) ??
    (input.aside?.trim() ? input.aside.trim() : undefined)

  return { start, end }
}

function footerSettingsFromInput(
  input: TidyPressFooterInput | undefined,
): Pick<TidyPressFooter, 'copyright' | 'showCredit'> {
  if (input === undefined || Array.isArray(input)) {
    return { showCredit: true }
  }
  return {
    copyright: input.copyright,
    showCredit: input.showCredit !== false,
  }
}

function resolveFooterCredit(
  input: TidyPressFooterInput | undefined,
  showCredit: boolean,
): TidyPressFooterCredit | undefined {
  if (!showCredit) {
    return undefined
  }

  const overrides = input !== undefined && !Array.isArray(input) ? input.credit : undefined

  return {
    prefix: overrides?.prefix ?? defaultFooterCredit.prefix,
    label: overrides?.label ?? defaultFooterCredit.label,
    href: overrides?.href ?? defaultFooterCredit.href,
  }
}

/**
 * Resolved footer for render: top band slots, sub-footer links, attribution line.
 */
export function resolveSiteFooter(
  config: Pick<TidyPressConfig, 'footer' | 'repository'>,
): TidyPressFooter {
  const settings = footerSettingsFromInput(config.footer)
  const base = footerLinksFromInput(config.footer)

  const withGithub = base.some(item => item.icon === 'github')
    ? base
    : [
        {
          ...defaultGithubFooterItem,
          href: config.repository?.url ?? defaultGithubFooterItem.href,
        },
        ...base,
      ]

  return {
    ...settings,
    main: normalizeFooterMain(config.footer),
    credit: resolveFooterCredit(config.footer, settings.showCredit),
    links: normalizeFooterItems(withGithub) ?? [],
  }
}

/** Format the attribution copyright segment (`{year}` and `{name}` tokens supported). */
export function formatFooterCopyright(
  copyright: string | undefined,
  context: { year: number; name: string },
): string {
  const template = copyright?.trim()
  if (!template) {
    return `© ${context.year} ${context.name}`
  }
  return template.replaceAll('{year}', String(context.year)).replaceAll('{name}', context.name)
}
