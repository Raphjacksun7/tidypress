import type { DocsMintConfig } from '@docsmint/config'

function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
  return new RegExp(`^${escaped}$`)
}

export function isSearchExcluded(config: DocsMintConfig, pathValue: string): boolean {
  const excludes = config.search?.exclude ?? []
  const normalizedPath = pathValue.replace(/^\/+/, '')
  return excludes.some(pattern => {
    const normalizedPattern = pattern.replace(/^\/+/, '')
    return patternToRegex(normalizedPattern).test(normalizedPath)
  })
}
