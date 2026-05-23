import type { DocsMintCollections, DocsMintConfig, DocsMintVersion } from '../schema/index.js'

export function normalizeVersions(
  config: DocsMintConfig,
  collections: DocsMintCollections,
): DocsMintVersion[] | undefined {
  const versions = config.versions
  if (!versions || versions.length === 0) {
    return undefined
  }

  const docsBasePath = collections.docs?.basePath ?? '/docs'
  if (!collections.docs?.enabled) {
    throw new Error('versions requires collections.docs.enabled=true.')
  }

  const normalizedBasePath = docsBasePath === '/' ? '' : docsBasePath
  const seenLabels = new Set<string>()
  const seenPaths = new Set<string>()

  return versions.map(version => {
    const label = version.label?.trim()
    const path = version.path?.trim()
    if (!label) {
      throw new Error('versions[].label cannot be empty.')
    }
    if (!path || !path.startsWith('/') || path.includes(' ')) {
      throw new Error(`versions[].path must be an absolute path like "${docsBasePath}/v1.0".`)
    }
    if (path.length > 1 && path.endsWith('/')) {
      throw new Error(`versions[].path must not end with "/" (got "${path}").`)
    }
    if (seenLabels.has(label)) {
      throw new Error(`Duplicate versions[].label "${label}".`)
    }
    if (seenPaths.has(path)) {
      throw new Error(`Duplicate versions[].path "${path}".`)
    }
    if (normalizedBasePath && !(path === normalizedBasePath || path.startsWith(`${normalizedBasePath}/`))) {
      throw new Error(`versions[].path "${path}" must live under "${docsBasePath}".`)
    }
    seenLabels.add(label)
    seenPaths.add(path)
    return { label, path }
  })
}
