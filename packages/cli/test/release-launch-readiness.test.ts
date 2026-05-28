import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const minimalExampleRoot = path.join(repoRoot, 'examples/minimal')

test('minimal example includes runnable quickstart scripts', async () => {
  const packageJsonRaw = await fs.readFile(path.join(minimalExampleRoot, 'package.json'), 'utf8')
  const packageJson = JSON.parse(packageJsonRaw)

  assert.equal(packageJson.scripts?.build, 'tidypress build')
  assert.equal(packageJson.scripts?.dev, 'tidypress dev')
  assert.equal(packageJson.scripts?.preview, 'tidypress preview')
})

test('minimal example quickstart docs mention 90-second path', async () => {
  const readme = await fs.readFile(path.join(minimalExampleRoot, 'README.md'), 'utf8')
  assert.match(readme, /90-second quickstart/i)
})

test('minimal example keeps required docs scaffold files', async () => {
  const requiredFiles = [
    'site/tidypress.config.ts',
    'site/src/content/docs/getting-started.md',
    'site/src/content/writing/hello.md',
  ]

  await Promise.all(
    requiredFiles.map(async relativePath => {
      await fs.access(path.join(minimalExampleRoot, relativePath))
    }),
  )
})
