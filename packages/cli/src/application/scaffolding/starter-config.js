import { pickHeroConfigFields } from '@tidypress/config'

const DEFAULT_HOME_PREVIEW_LIMIT = 5
const DEFAULT_SITE_URL = 'https://example.com'

/**
 * @param {import('../../templates/starters.js').StarterCollection} collection
 */
function collectionEntry(collection) {
  /** @type {{ enabled: boolean, basePath?: string, kind?: string, label?: string }} */
  const entry = { enabled: collection.enabled }
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
 * @returns {import('@tidypress/config').TidyPressConfig}
 */
export function buildStarterConfig(projectName, preset) {
  /** @type {Record<string, unknown>} */
  const config = {
    name: projectName,
    description: preset.description,
    nav: preset.nav.map(item => ({ label: item.label, href: item.href })),
    writing: { description: preset.writingDescription },
    collections: Object.fromEntries(
      preset.collections.map(collection => [collection.key, collectionEntry(collection)]),
    ),
    footer: [],
    siteUrl: DEFAULT_SITE_URL,
  }

  if (preset.hero) {
    config.hero = pickHeroConfigFields(preset.hero)
  }
  if (preset.homeOrder?.length) {
    config.home = {
      order: [...preset.homeOrder],
      previewLimit: DEFAULT_HOME_PREVIEW_LIMIT,
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
  return `export default ${JSON.stringify(config, null, 2)}\n`
}
