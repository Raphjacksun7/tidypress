import { copyDistToDestination, resolveDeployTarget } from '../utils/deploy.js'

/**
 * @typedef {{ projectRoot: string, distDir: string, target?: string }} DeployRequest
 */

/**
 * @typedef {{ supports: (request: DeployRequest) => boolean, execute: (request: DeployRequest) => Promise<void> }} DeployStrategy
 */

/**
 * Reports where to upload the build artifact when no explicit target is provided.
 */
export class ArtifactOnlyDeployStrategy {
  /**
   * @param {{ io?: { info: (message: string) => void } }} [dependencies]
   */
  constructor({ io = console } = {}) {
    this.io = io
  }

  /**
   * @param {DeployRequest} request
   * @returns {boolean}
   */
  supports(request) {
    return resolveDeployTarget(request).kind === 'artifact-only'
  }

  /**
   * @param {DeployRequest} request
   * @returns {Promise<void>}
   */
  async execute(request) {
    this.io.info(`Build artifact ready: ${request.distDir}`)
    this.io.info('Deploy this directory using any hosting provider or custom pipeline.')
  }
}

/**
 * Copies the build artifact into a local destination path.
 */
export class LocalCopyDeployStrategy {
  /**
   * @param {DeployRequest} request
   * @returns {boolean}
   */
  supports(request) {
    return resolveDeployTarget(request).kind === 'local-copy'
  }

  /**
   * @param {DeployRequest} request
   * @returns {Promise<void>}
   */
  async execute(request) {
    const plan = resolveDeployTarget(request)
    if (plan.kind !== 'local-copy') {
      throw new Error('LocalCopyDeployStrategy received unsupported target.')
    }
    await copyDistToDestination({
      distDir: request.distDir,
      destinationDir: plan.destinationPath,
    })
  }
}

/**
 * Emits host-agnostic instructions for external targets (e.g. bucket URIs).
 */
export class ExternalTargetDeployStrategy {
  /**
   * @param {{ io?: { info: (message: string) => void } }} [dependencies]
   */
  constructor({ io = console } = {}) {
    this.io = io
  }

  /**
   * @param {DeployRequest} request
   * @returns {boolean}
   */
  supports(request) {
    return resolveDeployTarget(request).kind === 'external-target'
  }

  /**
   * @param {DeployRequest} request
   * @returns {Promise<void>}
   */
  async execute(request) {
    const plan = resolveDeployTarget(request)
    if (plan.kind !== 'external-target') {
      throw new Error('ExternalTargetDeployStrategy received unsupported target.')
    }
    this.io.info(`Build artifact ready: ${request.distDir}`)
    this.io.info(`Target specified: ${plan.target}`)
    this.io.info('Upload dist with your preferred tool for this host.')
  }
}
