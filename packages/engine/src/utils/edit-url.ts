import type { DocsMintRepository } from '@docsmint/config'

const defaultEditBranch = 'main'

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '')
}

export function resolveEditUrl(
  repository: DocsMintRepository | undefined,
  editPath: string | undefined,
): string | undefined {
  if (!repository?.url || !repository.editPath || !editPath) {
    return undefined
  }

  const baseUrl = repository.url.replace(/\/$/, '')
  const branch = repository.branch ?? defaultEditBranch
  const contentRoot = trimSlashes(repository.editPath)
  const normalizedEditPath = trimSlashes(editPath)

  return `${baseUrl}/edit/${branch}/${contentRoot}/${normalizedEditPath}.md`
}
