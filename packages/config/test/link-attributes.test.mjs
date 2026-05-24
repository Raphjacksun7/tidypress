import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LINK_NEW_TAB_ATTRIBUTES,
  resolveEntryLinkAttributes,
  resolveHeroLinkAttributes,
  resolveNewTabLinkAttributes,
} from '../dist/links/link-attributes.js'
import { normalizeFooterItems } from '../dist/normalize/footer.js'

test('resolveEntryLinkAttributes opens only when external is true', () => {
  assert.deepEqual(resolveEntryLinkAttributes({}), {})
  assert.deepEqual(resolveEntryLinkAttributes({ external: true }), {
    target: '_blank',
    rel: 'noopener noreferrer',
  })
})

test('resolveHeroLinkAttributes respects explicit external false', () => {
  assert.deepEqual(resolveHeroLinkAttributes({ external: false }), {})
  assert.deepEqual(resolveHeroLinkAttributes({}), {
    target: '_blank',
    rel: 'noopener noreferrer',
  })
})

test('LINK_NEW_TAB_ATTRIBUTES is stable', () => {
  assert.deepEqual(LINK_NEW_TAB_ATTRIBUTES, resolveNewTabLinkAttributes(true))
})

test('normalizeFooterItems sets target and rel on footer links', () => {
  const [icon, text, local] = normalizeFooterItems([
    { label: 'GitHub', href: 'https://github.com/example', icon: 'github' },
    { label: 'Site', href: 'https://example.com' },
    { label: 'RSS', href: '/writing/rss.xml', icon: 'rss', external: false },
  ]) ?? []

  assert.equal(icon.target, '_blank')
  assert.equal(icon.rel, 'noopener noreferrer')
  assert.equal(text.target, '_blank')
  assert.equal(local.target, undefined)
})
