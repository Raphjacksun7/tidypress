/** Default `siteUrl` in generated configs until the author sets production URL. */
export const PLACEHOLDER_SITE_URL = 'https://example.com'

/**
 * True when canonical/OG/RSS URLs will not match a real deployment.
 */
export function isPlaceholderSiteUrl(siteUrl: string | undefined): boolean {
  if (!siteUrl || typeof siteUrl !== 'string') {
    return true
  }
  const normalized = siteUrl.trim().replace(/\/$/, '')
  if (!normalized) {
    return true
  }
  if (normalized === PLACEHOLDER_SITE_URL) {
    return true
  }
  try {
    const host = new URL(normalized).hostname.toLowerCase()
    return host === 'example.com' || host === 'docs.example.com'
  } catch {
    return true
  }
}

export function siteUrlSetupHint(): string {
  return `Set siteUrl in tidypress.config.ts to your production URL (canonical, OG, RSS, sitemap). Placeholder: ${PLACEHOLDER_SITE_URL}`
}

/**
 * Production base URL for absolute links (canonical, OG, RSS, sitemap).
 * Returns undefined when siteUrl is unset or still a placeholder.
 */
export function resolveProductionSiteUrl(config: { siteUrl?: string }): string | undefined {
  if (!config.siteUrl || typeof config.siteUrl !== 'string') {
    return undefined
  }
  const normalized = config.siteUrl.trim().replace(/\/$/, '')
  if (isPlaceholderSiteUrl(normalized)) {
    return undefined
  }
  return normalized
}

/** @alias resolveProductionSiteUrl */
export const getEffectiveSiteUrl = resolveProductionSiteUrl

/**
 * @param {{ siteUrl?: string }} config
 * @returns {string[]}
 */
export function collectSiteUrlWarnings(config: { siteUrl?: string }): string[] {
  return isPlaceholderSiteUrl(config.siteUrl) ? [siteUrlSetupHint()] : []
}
