import path from 'node:path'
import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
)
const engineRoot = path.join(workspaceRoot, 'packages/engine')
const engineSrc = path.join(engineRoot, 'src')

/**
 * Jiti loader that understands engine path aliases (`@/`, `@site-config`).
 */
export function createEngineJiti(importMetaUrl) {
  return createJiti(importMetaUrl, {
    alias: {
      '@': engineSrc,
      '@site-config': path.join(engineRoot, 'docsmint.config.ts'),
    },
  })
}

/**
 * @param {string} importMetaUrl
 * @param {string} modulePath Path relative to `packages/engine/src` (with or without leading `./`)
 */
export function loadEngineModule(importMetaUrl, modulePath) {
  const normalized = modulePath.replace(/^\.\//, '')
  const jiti = createEngineJiti(importMetaUrl)
  return jiti(path.join(engineSrc, normalized))
}
