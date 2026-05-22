import type { DocsMintVersion } from '@docsmint/config'

function normalizePath(pathValue: string): string {
  if (pathValue.length > 1 && pathValue.endsWith('/')) {
    return pathValue.slice(0, -1)
  }
  return pathValue
}

export function resolveActiveVersionPath(
  versions: DocsMintVersion[] | undefined,
  pathname: string,
): string | undefined {
  if (!versions || versions.length === 0) {
    return undefined
  }
  const normalizedPathname = normalizePath(pathname)
  return versions.find(version => {
    const versionPath = normalizePath(version.path)
    return normalizedPathname === versionPath || normalizedPathname.startsWith(`${versionPath}/`)
  })?.path
}

export function relativeDocsPath(pathname: string, docsBasePath: string, activeVersionPath?: string): string {
  const normalizedPathname = normalizePath(pathname)
  const normalizedDocsBasePath = normalizePath(docsBasePath)
  const normalizedVersionPath = activeVersionPath ? normalizePath(activeVersionPath) : undefined

  if (normalizedVersionPath && normalizedPathname.startsWith(`${normalizedVersionPath}/`)) {
    return normalizedPathname.slice(normalizedVersionPath.length + 1)
  }
  if (normalizedPathname.startsWith(`${normalizedDocsBasePath}/`)) {
    return normalizedPathname.slice(normalizedDocsBasePath.length + 1)
  }
  return ''
}

export function versionTargetPath(versionPath: string, relativePath: string): string {
  const base = normalizePath(versionPath)
  if (!relativePath) {
    return base
  }
  return `${base}/${relativePath.replace(/^\/+/, '')}`
}

export function versionContentPrefix(versionPath: string, docsBasePath: string): string | undefined {
  const normalizedVersionPath = normalizePath(versionPath)
  const normalizedDocsBasePath = normalizePath(docsBasePath)
  if (normalizedVersionPath === normalizedDocsBasePath) {
    return undefined
  }
  if (!normalizedVersionPath.startsWith(`${normalizedDocsBasePath}/`)) {
    return undefined
  }
  return normalizedVersionPath.slice(normalizedDocsBasePath.length + 1)
}

export function stripDocExtension(entryId: string): string {
  return entryId.replace(/\.mdx?$/, '')
}
