import { TidyPressError } from '../errors/TidyPressError.js'

const DOMAIN_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i

const PLATFORM_INSTRUCTIONS = {
  vercel: [
    'In Vercel project settings, add this domain under "Domains".',
    'Add the DNS record Vercel requests (typically A/CNAME).',
  ],
  netlify: [
    'In Netlify site settings, add this domain under "Domain management".',
    'Configure the DNS record Netlify shows for your site.',
  ],
  cloudflare: [
    'In Cloudflare Pages, add this domain in your project custom domains.',
    'Create the CNAME record from your zone to the Pages target.',
  ],
  'github-pages': [
    'Add this domain under your repository Pages settings.',
    'Create CNAME and A/ALIAS records based on GitHub Pages docs.',
  ],
}

/**
 * Produces setup guidance for custom domains.
 */
export class DomainSetupService {
  /**
   * @param {{ configLoader: import('./ConfigLoader.js').ConfigLoader }} dependencies
   */
  constructor({ configLoader }) {
    this.configLoader = configLoader
  }

  /**
   * @param {{ projectRoot: string, domain?: string, platform: string }} request
   * @returns {Promise<{
   *   docsDir: string,
   *   configSiteUrl?: string,
   *   resolvedDomain: string,
   *   domainSource: 'argument' | 'config',
   *   suggestedSiteUrl: string,
   *   platform: string,
   *   instructions: string[],
   * }>}
   */
  async setup({ projectRoot, domain, platform }) {
    const normalizedPlatform = this.#normalizePlatform(platform)
    const instructions = PLATFORM_INSTRUCTIONS[normalizedPlatform]
    if (!instructions) {
      throw new TidyPressError(
        `Unsupported platform: ${platform}`,
        'INVALID_DOMAIN_PLATFORM',
        `Use one of: ${Object.keys(PLATFORM_INSTRUCTIONS).join(', ')}`,
        { exitCode: 2 },
      )
    }

    const docsDir = await this.configLoader.resolveDocsDirectory({ projectRoot })
    const rawConfig = await this.configLoader.loadConfig({ docsDir })
    const configSiteUrl = this.#readSiteUrl(rawConfig)
    const domainFromConfig = this.#extractDomainFromSiteUrl(configSiteUrl)
    const rawDomain = typeof domain === 'string' && domain.trim().length > 0 ? domain : domainFromConfig
    if (!rawDomain) {
      throw new TidyPressError(
        'Missing domain value for setup.',
        'INVALID_DOMAIN_VALUE',
        'Pass a domain argument or set siteUrl in docs/tidypress.config.ts',
        { exitCode: 2 },
      )
    }
    const normalizedDomain = this.#normalizeDomain(rawDomain)
    const suggestedSiteUrl = `https://${normalizedDomain}`

    return {
      docsDir,
      configSiteUrl,
      resolvedDomain: normalizedDomain,
      domainSource: rawDomain === domainFromConfig ? 'config' : 'argument',
      suggestedSiteUrl,
      platform: normalizedPlatform,
      instructions,
    }
  }

  /**
   * @param {unknown} rawConfig
   * @returns {string | undefined}
   */
  #readSiteUrl(rawConfig) {
    if (rawConfig && typeof rawConfig === 'object' && 'siteUrl' in rawConfig) {
      const value = rawConfig.siteUrl
      if (typeof value === 'string' && value.trim().length > 0) {
        return value
      }
    }
    return undefined
  }

  /**
   * @param {string | undefined} siteUrl
   * @returns {string | undefined}
   */
  #extractDomainFromSiteUrl(siteUrl) {
    if (!siteUrl) {
      return undefined
    }
    try {
      return new URL(siteUrl).hostname
    } catch {
      return undefined
    }
  }

  /**
   * @param {string} domain
   * @returns {string}
   */
  #normalizeDomain(domain) {
    const normalized = domain.trim().toLowerCase()
    if (!normalized || normalized.includes('://') || normalized.includes('/')) {
      throw new TidyPressError(
        `Invalid domain: ${domain}`,
        'INVALID_DOMAIN_VALUE',
        'Pass a bare host like docs.example.com',
        { exitCode: 2 },
      )
    }
    if (!DOMAIN_PATTERN.test(normalized)) {
      throw new TidyPressError(
        `Invalid domain: ${domain}`,
        'INVALID_DOMAIN_VALUE',
        'Use a valid hostname like docs.example.com',
        { exitCode: 2 },
      )
    }
    return normalized
  }

  /**
   * @param {string} platform
   * @returns {string}
   */
  #normalizePlatform(platform) {
    return platform.trim().toLowerCase()
  }
}
