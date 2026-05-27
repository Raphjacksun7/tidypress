import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { fetchDevToArticle } from '../src/application/import/devto.js'
import { ImportService } from '../src/services/ImportService.js'
import { ConfigLoader } from '../src/services/ConfigLoader.js'

test('fetchDevToArticle parses by_path response', async t => {
  const originalFetch = globalThis.fetch
  t.after(() => {
    globalThis.fetch = originalFetch
  })

  globalThis.fetch = /** @type {typeof fetch} */ (async url => {
    assert.match(String(url), /dev\.to\/api\/articles\/by_path/)
    return /** @type {Response} */ ({
      ok: true,
      async json() {
        return {
          title: 'Hello Dev.to',
          description: 'A post',
          body_markdown: '# Hello\n\nBody text.',
          published_at: '2026-05-01T12:00:00Z',
          tag_list: ['docs'],
        }
      },
    })
  })

  const article = await fetchDevToArticle('https://dev.to/author/hello-world')
  assert.equal(article.title, 'Hello Dev.to')
  assert.equal(article.date, '2026-05-01')
  assert.match(article.body, /Body text/)
  assert.deepEqual(article.tags, ['docs'])
})

test('ImportService devto writes imported markdown file', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tidypress-import-devto-'))
  await fs.mkdir(path.join(root, 'src/content/writing'), { recursive: true })
  await fs.writeFile(
    path.join(root, 'tidypress.config.ts'),
    `export default { name: 'import-test', collections: { writing: { enabled: true, kind: 'writing' } } }`,
    'utf8',
  )

  const originalFetch = globalThis.fetch
  t.after(() => {
    globalThis.fetch = originalFetch
  })

  globalThis.fetch = /** @type {typeof fetch} */ (async () =>
    /** @type {Response} */ ({
      ok: true,
      async json() {
        return {
          title: 'Imported',
          description: 'Desc',
          body_markdown: 'Content here.',
          published_at: '2026-05-02T00:00:00Z',
          tag_list: [],
        }
      },
    }))

  const service = new ImportService({
    configLoader: new ConfigLoader(),
  })
  const result = await service.run({
    projectRoot: root,
    provider: 'devto',
    source: 'https://dev.to/author/post',
  })

  assert.equal(result.imported, true)
  const markdown = await fs.readFile(result.outputPath, 'utf8')
  assert.match(markdown, /title: Imported/)
  assert.match(markdown, /Content here\./)
})
