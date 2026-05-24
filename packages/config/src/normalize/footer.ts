import {
  ensureBlankTargetRel,
  isExternalHref,
  LINK_TARGET_BLANK,
  type ResolvedLinkAttributes,
} from '../links/link-attributes.js'
import type { FooterItem } from '../schema/index.js'

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
