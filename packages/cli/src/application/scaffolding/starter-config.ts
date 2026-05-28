import {
  defaultGithubFooterItem,
  isPlaceholderSiteUrl,
  pickHeroConfigFields,
  PLACEHOLDER_SITE_URL,
  siteUrlSetupHint,
} from '@tidypress/config'

const DEFAULT_HOME_PREVIEW_LIMIT = 5

/**
 * @param {import('../../templates/starters.js').StarterCollection} collection
 */
function collectionEntry(collection) {
  /** @type {Record<string, unknown>} */
  const entry: Record<string, unknown> = { enabled: collection.enabled }
  if (collection.basePath !== undefined) {
    entry.basePath = collection.basePath
  }
  if (collection.kind !== undefined) {
    entry.kind = collection.kind
  }
  if (collection.label !== undefined) {
    entry.label = collection.label
  }
  return entry
}

/**
 * @param {string} projectName
 * @param {import('../../templates/starters.js').StarterPreset} preset
 * @param {{ siteUrl?: string }} [options]
 * @returns {import('@tidypress/config').TidyPressConfig}
 */
export function buildStarterConfig(projectName, preset, options?) {
  const siteUrlOption = options && typeof options === 'object' && 'siteUrl' in options ? options.siteUrl : undefined
  const siteUrl =
    siteUrlOption && !isPlaceholderSiteUrl(siteUrlOption)
      ? siteUrlOption.replace(/\/$/, '')
      : PLACEHOLDER_SITE_URL
  const config: Record<string, unknown> = {
    name: projectName,
    description: preset.description,
    nav: preset.nav.map(item => ({ label: item.label, href: item.href })),
    writing: { description: preset.writingDescription },
    collections: Object.fromEntries(
      preset.collections.map(collection => [collection.key, collectionEntry(collection)]),
    ),
    footer: [
      { ...defaultGithubFooterItem },
      ...(preset.footerLinks ?? []).map(link => ({ ...link })),
    ],
    siteUrl,
  }

  if (preset.hero) {
    config.hero = pickHeroConfigFields(preset.hero)
  }
  if (preset.homeOrder?.length || preset.homeCollections) {
    config.home = {
      ...(preset.homeOrder?.length ? { order: [...preset.homeOrder] } : {}),
      previewLimit: DEFAULT_HOME_PREVIEW_LIMIT,
      ...(preset.homeCollections ? { collections: { ...preset.homeCollections } } : {}),
    }
  }
  if (preset.capabilitiesDisable?.length) {
    config.capabilities = { disable: [...preset.capabilitiesDisable] }
  }
  if (preset.pages?.length) {
    config.pages = preset.pages.map(page => ({ ...page }))
  }

  return /** @type {import('@tidypress/config').TidyPressConfig} */ (/** @type {unknown} */ (config))
}

/**
 * @param {import('@tidypress/config').TidyPressConfig} config
 */
export function formatConfigModule(config) {
  const header = isPlaceholderSiteUrl(
    typeof config.siteUrl === 'string' ? config.siteUrl : undefined,
  )
    ? `// ${siteUrlSetupHint()}\n`
    : ''
  return `${header}export default ${JSON.stringify(config, null, 2)}\n`
}
