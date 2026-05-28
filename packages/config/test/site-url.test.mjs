import test from 'node:test'
import assert from 'node:assert/strict'

import {
  PLACEHOLDER_SITE_URL,
  collectSiteUrlWarnings,
  isPlaceholderSiteUrl,
  resolveProductionSiteUrl,
  siteUrlSetupHint,
} from '../dist/registry/site-url.js'

test('isPlaceholderSiteUrl detects example hosts', () => {
  assert.equal(isPlaceholderSiteUrl(undefined), true)
  assert.equal(isPlaceholderSiteUrl(''), true)
  assert.equal(isPlaceholderSiteUrl(PLACEHOLDER_SITE_URL), true)
  assert.equal(isPlaceholderSiteUrl('https://example.com/'), true)
  assert.equal(isPlaceholderSiteUrl('https://docs.example.com'), true)
  assert.equal(isPlaceholderSiteUrl('https://mysite.dev'), false)
})

test('siteUrlSetupHint mentions placeholder', () => {
  assert.match(siteUrlSetupHint(), /siteUrl/)
  assert.match(siteUrlSetupHint(), /example\.com/)
})

test('resolveProductionSiteUrl omits placeholders', () => {
  assert.equal(resolveProductionSiteUrl({ siteUrl: PLACEHOLDER_SITE_URL }), undefined)
  assert.equal(resolveProductionSiteUrl({ siteUrl: 'https://publish.example/' }), 'https://publish.example')
})

test('collectSiteUrlWarnings only reports placeholders', () => {
  assert.equal(collectSiteUrlWarnings({ siteUrl: 'https://publish.example' }).length, 0)
  assert.equal(collectSiteUrlWarnings({ siteUrl: PLACEHOLDER_SITE_URL }).length, 1)
})
