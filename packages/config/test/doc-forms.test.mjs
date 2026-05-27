import test from 'node:test'
import assert from 'node:assert/strict'

import {
  defaultTidyPressDocForm,
  tidyPressDocForms,
  formatTidyPressDocForms,
  isTidyPressDocForm,
  withDefaults,
} from '../dist/index.js'

test('tidyPressDocForms registry lists documentation models for the docs collection', () => {
  assert.deepEqual(tidyPressDocForms.sort(), ['doc', 'manual'])
  assert.equal(defaultTidyPressDocForm, 'doc')
  assert.equal(isTidyPressDocForm('manual'), true)
  assert.equal(isTidyPressDocForm('playbook'), false)
  assert.match(formatTidyPressDocForms(), /"doc"/)
})

test('withDefaults accepts reserved collection render paths', () => {
  const config = withDefaults({
    name: 'site',
    collections: {
      api: {
        enabled: true,
        basePath: '/api',
        kind: 'content',
        render: {
          presentation: './site/renderers/api-presentation.ts',
          views: './site/views/api/',
        },
      },
    },
  })
  assert.equal(config.collections?.api?.render?.presentation, './site/renderers/api-presentation.ts')
})

test('withDefaults rejects render on collections.docs', () => {
  assert.throws(
    () =>
      withDefaults({
        name: 'site',
        collections: {
          docs: {
            enabled: true,
            render: { presentation: './site/renderers/docs.ts' },
          },
        },
      }),
    /collections\.docs cannot set render/,
  )
})
