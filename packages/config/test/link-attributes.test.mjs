import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LINK_NEW_TAB_ATTRIBUTES,
  resolveEntryLinkAttributes,
  resolveHeroLinkAttributes,
  resolveNewTabLinkAttributes,
} from '../dist/links/link-attributes.js'
import {
  formatFooterCopyright,
  normalizeFooterItems,
  resolveSiteFooter,
} from '../dist/normalize/footer.js'

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

test('resolveSiteFooter adds default GitHub and does not inject RSS', () => {
  const empty = resolveSiteFooter({ footer: [] })
  assert.equal(empty.links.length, 1)
  assert.equal(empty.links[0].icon, 'github')
  assert.equal(empty.showCredit, true)

  const withRepo = resolveSiteFooter({
    footer: [],
    repository: { url: 'https://github.com/acme/widgets' },
  })
  assert.equal(withRepo.links[0].href, 'https://github.com/acme/widgets')

  const custom = resolveSiteFooter({
    footer: [{ label: 'X', href: 'https://x.com/you', icon: 'x' }],
  })
  assert.equal(custom.links.length, 2)
  assert.equal(custom.links[0].icon, 'github')
  assert.equal(custom.links[1].icon, 'x')
})

test('resolveSiteFooter object form supports main, copyright, and showCredit', () => {
  const resolved = resolveSiteFooter({
    footer: {
      main: { start: 'Acme Labs', end: 'Built in Brooklyn' },
      copyright: '© {year} Acme',
      showCredit: false,
      links: [{ label: 'GitHub', href: 'https://github.com/acme', icon: 'github' }],
    },
  })
  assert.equal(resolved.copyright, '© {year} Acme')
  assert.deepEqual(resolved.main, { start: 'Acme Labs', end: 'Built in Brooklyn' })
  assert.equal(resolved.showCredit, false)
  assert.equal(resolved.credit, undefined)
  assert.equal(resolved.links.length, 1)
})

test('resolveSiteFooter normalizes main slot links', () => {
  const resolved = resolveSiteFooter({
    footer: {
      main: {
        start: [
          { label: 'Docs', href: 'https://example.com/docs' },
          { label: 'Home', href: '/', external: false },
        ],
      },
    },
  })
  assert.equal(resolved.main.start?.length, 2)
  assert.equal(resolved.main.start?.[0].target, '_blank')
  assert.equal(resolved.main.start?.[1].target, undefined)
})

test('resolveSiteFooter maps legacy aside to main.end', () => {
  const resolved = resolveSiteFooter({
    footer: {
      aside: 'Questions? hello@example.com',
    },
  })
  assert.equal(resolved.main.end, 'Questions? hello@example.com')
  assert.equal(resolved.main.start, undefined)
})

test('resolveSiteFooter resolves credit defaults when showCredit is true', () => {
  const resolved = resolveSiteFooter({ footer: [] })
  assert.equal(resolved.credit?.label, 'tidypress')
  assert.equal(resolved.credit?.href, 'https://tidypress.pages.dev/')
  assert.equal(resolved.credit?.prefix, ', Made with ')
})

test('resolveSiteFooter applies credit overrides', () => {
  const resolved = resolveSiteFooter({
    footer: {
      credit: { label: 'Acme Docs', href: 'https://acme.example', prefix: ' · ' },
    },
  })
  assert.equal(resolved.credit?.label, 'Acme Docs')
  assert.equal(resolved.credit?.href, 'https://acme.example')
  assert.equal(resolved.credit?.prefix, ' · ')
})

test('formatFooterCopyright substitutes tokens and defaults', () => {
  assert.equal(
    formatFooterCopyright('© {year} {name}', { year: 2026, name: 'Lab' }),
    '© 2026 Lab',
  )
  assert.equal(formatFooterCopyright(undefined, { year: 2026, name: 'Lab' }), '© 2026 Lab')
})
