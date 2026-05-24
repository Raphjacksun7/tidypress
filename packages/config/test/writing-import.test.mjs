import test from 'node:test'
import assert from 'node:assert/strict'

import { formatWritingImportMarkdown } from '../dist/index.js'

test('formatWritingImportMarkdown emits frontmatter from registry', () => {
  const markdown = formatWritingImportMarkdown({
    title: 'Hello',
    description: 'A post',
    date: '2024-01-15',
    tags: ['astro', 'docs'],
    scheduled: new Date('2024-06-01T12:00:00.000Z'),
    body: 'Body text',
    source: 'dev.to',
  })

  assert.match(markdown, /^---\n/)
  assert.match(markdown, /title: Hello/)
  assert.match(markdown, /description: A post/)
  assert.match(markdown, /date: 2024-01-15/)
  assert.match(markdown, /published: true/)
  assert.match(markdown, /tags: \["astro", "docs"\]/)
  assert.match(markdown, /scheduled: 2024-06-01T12:00:00.000Z/)
  assert.match(markdown, /Body text/)
  assert.match(markdown, /Imported from dev.to/)
})
