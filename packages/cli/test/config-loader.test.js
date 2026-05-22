import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

import { ConfigLoader } from '../src/services/ConfigLoader.js'
import { createDocsProjectFixture } from '../test-support/project-fixtures.js'

test('ConfigLoader.validateNavigation throws on unknown internal links in strict mode', async () => {
  const { docsDir } = await createDocsProjectFixture({ configSource: `export default {
  name: 'site',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'missing', href: '/missing' },
  ],
}` })

  const loader = new ConfigLoader()
  await assert.rejects(async () => {
    await loader.validateNavigation({ docsDir })
  }, /Unknown internal nav routes/)
})

test('ConfigLoader.validateNavigation allows unknown links in relaxed mode', async () => {
  const { docsDir } = await createDocsProjectFixture({ configSource: `export default {
  name: 'site',
  navPolicy: { mode: 'relaxed' },
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'missing', href: '/missing' },
  ],
}` })

  const loader = new ConfigLoader()
  await loader.validateNavigation({ docsDir, io: { info() {} } })
})

test('ConfigLoader.validateNavigation recognizes arbitrary configured collection routes', async () => {
  const { docsDir } = await createDocsProjectFixture({ configSource: `export default {
  name: 'site',
  collections: {
    playbooks: { enabled: true, basePath: '/playbooks', kind: 'docs' },
  },
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'playbooks', href: '/playbooks' },
  ],
}` })

  const loader = new ConfigLoader()
  await loader.validateNavigation({ docsDir })
})

test('ConfigLoader.validateNavigation recognizes page-kind collection entry routes', async () => {
  const { docsDir } = await createDocsProjectFixture({ configSource: `export default {
  name: 'site',
  collections: {
    company: { enabled: true, basePath: '/company', kind: 'page' },
  },
  nav: [
    { label: 'company', href: '/company/about' },
  ],
}` })

  await fs.mkdir(path.join(docsDir, 'src/content/company'), { recursive: true })
  await fs.writeFile(path.join(docsDir, 'src/content/company/about.md'), '# About', 'utf8')

  const loader = new ConfigLoader()
  await loader.validateNavigation({ docsDir })
})

test('ConfigLoader.validateNavigation keeps nav parity with custom starter base paths', async () => {
  const { docsDir } = await createDocsProjectFixture({ configSource: `export default {
  name: 'site',
  collections: {
    docs: { enabled: true, basePath: '/reference', kind: 'docs' },
    writing: { enabled: true, basePath: '/notes', kind: 'writing' },
  },
  nav: [
    { label: 'docs', href: '/reference' },
    { label: 'writing', href: '/notes' },
  ],
}` })

  const loader = new ConfigLoader()
  await loader.validateNavigation({ docsDir })
})
