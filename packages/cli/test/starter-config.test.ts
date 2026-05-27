import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildStarterConfig,
  formatConfigModule,
} from '../src/application/scaffolding/starter-config.js'
import { resolveStarterPreset } from '../src/templates/starters.js'

test('buildStarterConfig maps preset data without string templates', () => {
  const preset = resolveStarterPreset('persona')
  const config = buildStarterConfig('Alex', preset)

  assert.equal(config.name, 'Alex')
  assert.equal(config.hero?.enabled, true)
  assert.equal(config.hero?.role, 'Engineer')
  assert.deepEqual(config.home?.order, ['projects', 'writing'])
  assert.deepEqual(config.pages, [{ slug: 'about', navLabel: 'about' }])
  assert.equal(config.collections?.writing?.kind, 'writing')
})

test('formatConfigModule emits parseable export default', () => {
  const config = buildStarterConfig('lab-site', resolveStarterPreset('lab'))
  const source = formatConfigModule(config)

  assert.match(source, /^export default \{/)
  const value = JSON.parse(source.replace(/^export default\s*/, '').trim())
  assert.equal(value.name, 'lab-site')
  assert.deepEqual(value.capabilities.disable, ['docs', 'pages'])
})

test('lab preset omits hero block', () => {
  const config = buildStarterConfig('lab-site', resolveStarterPreset('lab'))
  assert.equal(config.hero, undefined)
})

test('blog preset enables writing only', () => {
  const config = buildStarterConfig('my-blog', resolveStarterPreset('blog'))

  assert.equal(config.name, 'my-blog')
  assert.deepEqual(config.home?.order, ['writing'])
  assert.deepEqual(config.capabilities?.disable, ['docs', 'pages'])
  assert.equal(config.collections?.docs?.enabled, false)
  assert.equal(config.collections?.pages?.enabled, false)
  assert.equal(config.collections?.writing?.enabled, true)
  assert.equal(config.collections?.projects, undefined)
  assert.equal(config.hero, undefined)
  assert.match(JSON.stringify(config.footer), /\/writing\/rss\.xml/)
})
