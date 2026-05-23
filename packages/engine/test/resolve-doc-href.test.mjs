import assert from 'node:assert/strict'
import test from 'node:test'
import {
  parseContentFilePath,
  resolveRelativeDocHref,
} from '../plugins/rehype-resolve-doc-links.mjs'

test('parseContentFilePath reads collection and slug', () => {
  assert.deepEqual(
    parseContentFilePath('/project/src/content/docs/getting-started.mdx'),
    { collectionKey: 'docs', entrySlug: 'getting-started' },
  )
})

test('resolveRelativeDocHref resolves sibling doc links from docs root', () => {
  assert.equal(
    resolveRelativeDocHref('./writing-content', '/docs', 'getting-started'),
    '/docs/writing-content',
  )
  assert.equal(
    resolveRelativeDocHref('./writing-content#images', '/docs', 'getting-started'),
    '/docs/writing-content#images',
  )
  assert.equal(
    resolveRelativeDocHref('./configuration.md', '/docs', 'extensibility'),
    '/docs/configuration',
  )
})

test('resolveRelativeDocHref resolves nested doc paths', () => {
  assert.equal(
    resolveRelativeDocHref('../writing-content', '/docs', 'guides/start'),
    '/docs/writing-content',
  )
})

test('resolveRelativeDocHref leaves external and absolute links unchanged', () => {
  assert.equal(
    resolveRelativeDocHref('https://example.com', '/docs', 'getting-started'),
    'https://example.com',
  )
  assert.equal(
    resolveRelativeDocHref('/docs/writing-content', '/docs', 'getting-started'),
    '/docs/writing-content',
  )
})
