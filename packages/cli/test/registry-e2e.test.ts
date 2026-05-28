/**
 * Registry install e2e: clean `.cache/registry-e2e/<manager>-<version>/` workspaces,
 * install tidypress from npm / pnpm / PyPI (no workspace tarball).
 */
import test from 'node:test'

import {
  resolveRegistryTestVersion,
  runNpmRegistryLabFixture,
  runPipRegistryLabFixture,
  runPnpmRegistryLabFixture,
} from './support/registry-e2e-helpers.js'

const versionPromise = resolveRegistryTestVersion()

test('registry npm: install tidypress from npm registry, init lab, build', { timeout: 1_200_000 }, async () => {
  const version = await versionPromise
  await runNpmRegistryLabFixture(version)
})

test('registry pnpm: install tidypress from npm registry via pnpm, init lab, build', {
  timeout: 1_200_000,
}, async () => {
  const version = await versionPromise
  await runPnpmRegistryLabFixture(version)
})

test('registry pip: install tidypress from PyPI (+ npm CLI dep), init lab, build', {
  timeout: 1_200_000,
}, async () => {
  const version = await versionPromise
  await runPipRegistryLabFixture(version)
})
