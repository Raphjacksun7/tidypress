import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { AddVersionService } from '../src/services/AddVersionService.js'
import { ConfigLoader } from '../src/services/ConfigLoader.js'
import { DocsMintError } from '../src/errors/DocsMintError.js'
import { DeployService } from '../src/services/DeployService.js'
import { ImportService } from '../src/services/ImportService.js'
import { ExperimentalFeatureService } from '../src/services/ExperimentalFeatureService.js'
import { SectionsMigrationService } from '../src/services/SectionsMigrationService.js'

test('DeployService throws DocsMintError when no strategy matches', async () => {
  const service = new DeployService({ strategies: [] })

  await assert.rejects(
    async () => {
      await service.deploy({
        projectRoot: '/workspace',
        distDir: '/workspace/.docsmint/dist',
        target: 'unknown-provider',
      })
    },
    /** @param {unknown} error */
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'DEPLOY_NO_STRATEGY')
      assert.match(error.formatUserMessage(), /Run docsmint deploy --help/)
      return true
    },
  )
})

async function createVersionFixtureProject() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-version-'))
  const docsDir = path.join(root, 'docs')
  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })
  await fs.writeFile(
    path.join(docsDir, 'docsmint.config.ts'),
    `export default { name: 'fixture' }
`,
    'utf8',
  )
  return { root, docsDir }
}

test('AddVersionService scaffolds version folder and starter doc', async () => {
  const { root } = await createVersionFixtureProject()
  const service = new AddVersionService({ configLoader: new ConfigLoader() })

  const result = await service.run({
    projectRoot: root,
    versionLabel: '2.0',
    setLatest: false,
  })

  assert.match(result.versionDir, /\/docs\/src\/content\/docs\/v2\.0$/)
  const starter = await fs.readFile(path.join(result.versionDir, 'getting-started.md'), 'utf8')
  assert.match(starter, /Getting Started \(v2\.0\)/)
})

test('AddVersionService updates latest alias when requested', async () => {
  const { root, docsDir } = await createVersionFixtureProject()
  const service = new AddVersionService({ configLoader: new ConfigLoader() })

  const result = await service.run({
    projectRoot: root,
    versionLabel: '3.0',
    setLatest: true,
  })

  assert.ok(result.latestLinkPath)
  const stat = await fs.lstat(path.join(docsDir, 'src/content/docs/latest'))
  assert.equal(stat.isSymbolicLink(), true)
})

test('ImportService creates writing scaffold for provider source', async () => {
  const { root, docsDir } = await createVersionFixtureProject()
  const service = new ImportService({ configLoader: new ConfigLoader() })

  const result = await service.run({
    projectRoot: root,
    provider: 'medium',
    source: 'https://medium.com/@writer/post-slug',
  })

  assert.match(result.outputPath, /\/docs\/src\/content\/writing\/imported\/medium-/)
  const imported = await fs.readFile(result.outputPath, 'utf8')
  assert.match(imported, /title: Imported medium draft/)
  assert.match(imported, /Source: https:\/\/medium.com\/@writer\/post-slug/)
  const importedDir = path.join(docsDir, 'src/content/writing/imported')
  const files = await fs.readdir(importedDir)
  assert.equal(files.length, 1)
})

test('ImportService validates scheduled datetime value', async () => {
  const { root } = await createVersionFixtureProject()
  const service = new ImportService({ configLoader: new ConfigLoader() })

  await assert.rejects(
    async () => {
      await service.run({
        projectRoot: root,
        provider: 'ghost',
        source: './ghost-export.json',
        scheduled: 'not-a-date',
      })
    },
    /** @param {unknown} error */
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'INVALID_IMPORT_OPTION')
      return true
    },
  )
})

test('SectionsMigrationService writes deterministic sections migration artifact', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-sections-migration-'))
  const docsDir = path.join(root, 'docs')
  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })
  await fs.writeFile(
    path.join(docsDir, 'docsmint.config.ts'),
    `export default {
  name: 'fixture',
  sections: {
    docs: { enabled: true, basePath: '/reference' },
    writing: { enabled: false, basePath: '/notes' },
  },
}
`,
    'utf8',
  )
  const service = new SectionsMigrationService({ configLoader: new ConfigLoader() })
  const result = await service.run({ projectRoot: root })
  assert.equal(result.migrated, true)
  const payload = JSON.parse(await fs.readFile(result.outputPath, 'utf8'))
  assert.equal(payload.migrated, true)
  assert.deepEqual(payload.collections.docs, {
    enabled: true,
    basePath: '/reference',
    label: 'docs',
  })
  assert.deepEqual(payload.collections.writing, {
    enabled: false,
    basePath: '/notes',
    kind: 'writing',
    label: 'writing',
  })
  assert.equal(payload.removeSections, true)
})

test('ExperimentalFeatureService requires explicit CLI opt-in', async () => {
  const { root } = await createVersionFixtureProject()
  const service = new ExperimentalFeatureService({ configLoader: new ConfigLoader() })

  await assert.rejects(
    async () => {
      await service.assertEnabled({
        projectRoot: root,
        feature: 'editor',
        cliEnabled: false,
        cliHint: 'Use docsmint editor --enable-experimental-editor',
        configHint: 'Set experimental.editor = true',
      })
    },
    /** @param {unknown} error */
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'EXPERIMENTAL_FLAG_REQUIRED')
      return true
    },
  )
})

test('ExperimentalFeatureService requires config opt-in', async () => {
  const { root } = await createVersionFixtureProject()
  const service = new ExperimentalFeatureService({ configLoader: new ConfigLoader() })

  await assert.rejects(
    async () => {
      await service.assertEnabled({
        projectRoot: root,
        feature: 'export',
        cliEnabled: true,
        cliHint: 'Use docsmint export <pdf|epub|archive> [source] --enable-experimental-export',
        configHint: 'Set experimental.export = true',
      })
    },
    /** @param {unknown} error */
    error => {
      assert.ok(error instanceof DocsMintError)
      assert.equal(error.code, 'EXPERIMENTAL_CONFIG_DISABLED')
      return true
    },
  )
})

test('ExperimentalFeatureService allows feature when both opt-ins are enabled', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-experimental-'))
  const docsDir = path.join(root, 'docs')
  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })
  await fs.writeFile(
    path.join(docsDir, 'docsmint.config.ts'),
    `export default {
  name: 'fixture',
  experimental: { ai: true }
}
`,
    'utf8',
  )

  const service = new ExperimentalFeatureService({ configLoader: new ConfigLoader() })
  await service.assertEnabled({
    projectRoot: root,
    feature: 'ai',
    cliEnabled: true,
    cliHint: 'Use docsmint ai <suggest|translate|changelog> [args] --enable-experimental-ai',
    configHint: 'Set experimental.ai = true',
  })
})

test('ExperimentalFeatureService accepts capability override from config resolver', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-experimental-capability-'))
  const docsDir = path.join(root, 'docs')
  await fs.mkdir(path.join(docsDir, 'src/content/docs'), { recursive: true })
  await fs.writeFile(
    path.join(docsDir, 'docsmint.config.ts'),
    `export default {
  name: 'fixture',
  capabilities: { enable: ['ai'] }
}
`,
    'utf8',
  )

  const service = new ExperimentalFeatureService({ configLoader: new ConfigLoader() })
  await service.assertEnabled({
    projectRoot: root,
    feature: 'ai',
    cliEnabled: true,
    cliHint: 'Use docsmint ai <suggest|translate|changelog> [args] --enable-experimental-ai',
    configHint: 'Set experimental.ai = true',
  })
})
