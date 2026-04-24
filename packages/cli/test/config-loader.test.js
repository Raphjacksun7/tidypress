import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { ConfigLoader } from '../src/services/ConfigLoader.js'

async function createDocsProject(configSource) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-config-loader-'))
  await fs.mkdir(path.join(root, 'docs/src/content/docs'), { recursive: true })
  await fs.mkdir(path.join(root, 'docs/src/content/writing'), { recursive: true })
  await fs.writeFile(path.join(root, 'docs/src/content/docs/getting-started.md'), '# docs', 'utf8')
  await fs.writeFile(path.join(root, 'docs/src/content/writing/hello.md'), '# writing', 'utf8')
  await fs.writeFile(path.join(root, 'docs/docsmint.config.ts'), configSource, 'utf8')
  return { root, docsDir: path.join(root, 'docs') }
}

test('ConfigLoader.validateNavigation throws on unknown internal links in strict mode', async () => {
  const { docsDir } = await createDocsProject(`export default {
  name: 'site',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'missing', href: '/missing' },
  ],
}`)

  const loader = new ConfigLoader()
  await assert.rejects(async () => {
    await loader.validateNavigation({ docsDir })
  }, /Unknown internal nav routes/)
})

test('ConfigLoader.validateNavigation allows unknown links in relaxed mode', async () => {
  const { docsDir } = await createDocsProject(`export default {
  name: 'site',
  navPolicy: { mode: 'relaxed' },
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'missing', href: '/missing' },
  ],
}`)

  const loader = new ConfigLoader()
  await loader.validateNavigation({ docsDir, io: { info() {} } })
})
