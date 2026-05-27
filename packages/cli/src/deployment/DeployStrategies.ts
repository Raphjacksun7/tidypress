import { TidyPressError } from '../errors/TidyPressError.js'
import { copyDistToDestination, resolveDeployTarget } from '../application/deployment/deploy-target.js'
import type { CliIo } from '../types.js'

/**
 * @typedef {{ projectRoot: string, distDir: string, target?: string }} DeployRequest
 */

/**
 * Reports where to upload the build artifact when no explicit target is provided.
 */
export class ArtifactOnlyDeployStrategy {
  id: string
  io: CliIo

  constructor({ io = console as unknown as CliIo }: { io?: CliIo } = {}) {
    this.id = 'artifact-only'
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
  id: string

  constructor() {
    this.id = 'local-copy'
  }

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
      throw new TidyPressError('Local copy deploy received unsupported target.', 'DEPLOY_INTERNAL')
    }
    await copyDistToDestination({
      distDir: request.distDir,
      destinationDir: plan.destinationPath,
    })
  }
}

/**
 * Emits host-agnostic instructions for external targets.
 */
export class ExternalTargetDeployStrategy {
  id: string
  io: CliIo

  constructor({ io = console as unknown as CliIo }: { io?: CliIo } = {}) {
    this.id = 'external-target'
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
      throw new TidyPressError('External deploy received unsupported target.', 'DEPLOY_INTERNAL')
    }
    this.io.info(`Build artifact ready: ${request.distDir}`)
    this.io.info(`Target specified: ${plan.target}`)
    this.io.info('Upload dist with your preferred tool for this host.')
  }
}
