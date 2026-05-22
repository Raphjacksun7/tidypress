/**
 * Handles `docsmint domain`.
 */
export class DomainCommand {
  /**
   * @param {{
   *   domainSetupService: import('../services/DomainSetupService.js').DomainSetupService
   *   io: { info: (message: string) => void }
   * }} dependencies
   */
  constructor({ domainSetupService, io }) {
    this.domainSetupService = domainSetupService
    this.io = io
  }

  /**
   * @param {{ projectRoot: string, action: 'setup', domain?: string, platform: string }} request
   * @returns {Promise<void>}
   */
  async execute({ projectRoot, domain, platform }) {
    const result = await this.domainSetupService.setup({ projectRoot, domain, platform })
    this.io.info(`Domain setup plan for ${result.suggestedSiteUrl} (${result.platform})`)
    if (result.domainSource === 'config') {
      this.io.info(`Using domain detected from siteUrl: ${result.resolvedDomain}`)
    }
    this.io.info('1) Set `siteUrl` in docs/docsmint.config.ts:')
    this.io.info(`   siteUrl: '${result.suggestedSiteUrl}'`)
    if (result.configSiteUrl && result.configSiteUrl !== result.suggestedSiteUrl) {
      this.io.info(`   Current siteUrl is ${result.configSiteUrl}; update it to match the domain.`)
    }
    this.io.info('2) Configure your hosting platform:')
    for (const instruction of result.instructions) {
      this.io.info(`   - ${instruction}`)
    }
    this.io.info(`3) Rebuild/deploy; OG image URLs will resolve from ${result.suggestedSiteUrl}/og.svg`)
  }
}
