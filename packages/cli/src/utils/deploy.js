import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function hasUriScheme(target) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(target)
}

/**
 * @typedef {{ kind: 'artifact-only' }} ArtifactOnlyPlan
 * @typedef {{ kind: 'local-copy', destinationPath: string }} LocalCopyPlan
 * @typedef {{ kind: 'external-target', target: string }} ExternalTargetPlan
 * @typedef {ArtifactOnlyPlan | LocalCopyPlan | ExternalTargetPlan} DeployPlan
 */

/**
 * @param {{ projectRoot: string, target?: string }} options
 * @returns {DeployPlan}
 */
export function resolveDeployTarget({ projectRoot, target }) {
  if (!target) {
    return { kind: 'artifact-only' }
  }

  if (target.startsWith('file://')) {
    return {
      kind: 'local-copy',
      destinationPath: fileURLToPath(target),
    }
  }

  if (hasUriScheme(target)) {
    return { kind: 'external-target', target }
  }

  return {
    kind: 'local-copy',
    destinationPath: path.resolve(projectRoot, target),
  }
}

/**
 * @param {{ distDir: string, destinationDir: string }} options
 * @returns {Promise<void>}
 */
export async function copyDistToDestination({ distDir, destinationDir }) {
  await fs.rm(destinationDir, { recursive: true, force: true })
  await fs.mkdir(path.dirname(destinationDir), { recursive: true })
  await fs.cp(distDir, destinationDir, { recursive: true })
}
