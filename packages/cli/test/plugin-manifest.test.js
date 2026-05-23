import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { withDefaults } from '@docsmint/config'
import { collectPluginManifest, writePluginManifest } from '../src/infrastructure/engine/plugin-manifest.js'

test('collectPluginManifest registers custom collection view keys', () => {
  const manifest = collectPluginManifest(withDefaults({
    name: 'site',
    collections: {
      api: {
        enabled: true,
        basePath: '/api',
        kind: 'content',
        render: {
          presentation: './site/renderers/api-presentation.ts',
        },
      },
    },
    extensions: {
      docForms: {
        'api-reference': {
          label: 'API reference',
        },
      },
    },
  }))

  assert.ok(manifest.viewDescriptors.some(descriptor => descriptor.viewKey === 'api:collection-entry'))
  assert.ok(
    manifest.viewDescriptors.some(descriptor => descriptor.viewKey === 'form-api-reference:collection-entry'),
  )
  assert.equal(manifest.presentationModules.api, './site/renderers/api-presentation.ts')
  assert.deepEqual(manifest.docFormKeys, ['api-reference'])
})

test('writePluginManifest emits generated module in workdir', async () => {
  const docsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-plugin-manifest-'))
  const workdir = path.join(docsDir, '.docsmint')
  await fs.mkdir(path.join(docsDir, 'site/renderers'), { recursive: true })
  await fs.writeFile(
    path.join(docsDir, 'site/renderers/api-presentation.ts'),
    `export function createPresentation() {
  return { async buildIndex() { return {} }, async buildEntry() { return {} } }
}`,
    'utf8',
  )
  await writePluginManifest({
    docsDir,
    config: {
      name: 'site',
      collections: {
        api: {
          enabled: true,
          basePath: '/api',
          kind: 'content',
          render: { presentation: './site/renderers/api-presentation.ts' },
        },
      },
    },
    workdir,
  })
  const generated = await fs.readFile(
    path.join(workdir, 'src/generated/docsmint-plugins.mjs'),
    'utf8',
  )
  assert.match(generated, /api:collection-entry/)
  assert.match(generated, /PLUGIN_PRESENTATION_MODULES/)
})

test('writePluginManifest rejects presentation modules without createPresentation', async () => {
  const docsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-plugin-invalid-'))
  const workdir = path.join(docsDir, '.docsmint')
  await fs.mkdir(path.join(docsDir, 'site/renderers'), { recursive: true })
  await fs.writeFile(path.join(docsDir, 'site/renderers/broken.ts'), 'export const nope = 1\n', 'utf8')

  await assert.rejects(
    () =>
      writePluginManifest({
        docsDir,
        config: {
          name: 'site',
          collections: {
            api: {
              enabled: true,
              basePath: '/api',
              kind: 'content',
              render: { presentation: './site/renderers/broken.ts' },
            },
          },
        },
        workdir,
      }),
    /createPresentation/i,
  )
})

test('collectPluginManifest omits astro imports when view files are missing', async () => {
  const docsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docsmint-plugin-astro-'))
  await fs.mkdir(path.join(docsDir, 'site/views/api'), { recursive: true })
  await fs.writeFile(path.join(docsDir, 'site/views/api/collection-entry.astro'), '---\n---\n', 'utf8')

  const manifest = collectPluginManifest(
    withDefaults({
      name: 'site',
      collections: {
        api: {
          enabled: true,
          basePath: '/api',
          kind: 'content',
          render: { views: './site/views/api/' },
        },
      },
    }),
    { projectRoot: docsDir },
  )

  assert.equal(manifest.astroViewImports['api:collection-entry'], './site/views/api/collection-entry.astro')
  assert.equal(manifest.astroViewImports['api:collection-index'], undefined)
})

test('collectPluginManifest maps form presentation scope to form- view prefix', () => {
  const manifest = collectPluginManifest(withDefaults({
    name: 'site',
    collections: { docs: { enabled: true, basePath: '/docs' } },
    extensions: {
      docForms: {
        playbook: {
          presentation: './site/renderers/playbook-presentation.ts',
        },
      },
    },
  }))
  assert.equal(manifest.presentationModules['form:playbook'], './site/renderers/playbook-presentation.ts')
  assert.ok(
    manifest.viewDescriptors.some(descriptor => descriptor.viewKey === 'form-playbook:collection-entry'),
  )
})
