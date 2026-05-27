import { writeDeployWorkflowTemplate } from '../deployment/CiWorkflowTemplates.js'

/**
 * Handles `tidypress deploy`.
 */
export class DeployCommand {
  buildService: any
  deployService: any
  io: any
  workflowTemplateWriter: any


  /**
   * @param {{
   *   buildService: import('../services/BuildService.js').BuildService
   *   deployService: import('../services/DeployService.js').DeployService
   *   io: { info: (message: string) => void }
 *   workflowTemplateWriter?: (request: { projectRoot: string, target?: string }) => Promise<string>
   * }} dependencies
   */
  constructor({ buildService, deployService, io, workflowTemplateWriter = writeDeployWorkflowTemplate }) {
    this.buildService = buildService
    this.deployService = deployService
    this.io = io
    this.workflowTemplateWriter = workflowTemplateWriter
  }

  /**
   * @param {{ projectRoot: string, target?: string, withCi?: boolean }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot, target, withCi = false }) {
    if (withCi) {
      const workflowPath = await this.workflowTemplateWriter({ projectRoot, target })
      this.io.info(`Generated deploy workflow: ${workflowPath}`)
      return
    }
    const { buildDir } = await this.buildService.build({ projectRoot })
    await this.deployService.deploy({ projectRoot, distDir: buildDir, target })

    if (target) {
      this.io.info(`Deploy flow completed for target: ${target}`)
      return
    }
    this.io.info('Deploy flow completed.')
  }
}
