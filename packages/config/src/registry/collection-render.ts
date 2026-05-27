/**
 * Reserved collection-level rendering hooks (custom presentation + views).
 * Loaded at build time via generated manifest + dynamic import from the project root.
 */
export interface TidyPressCollectionRender {
  /** Project-relative path to a presentation module, e.g. `./site/renderers/api-presentation.ts` */
  presentation?: string
  /** Project-relative directory of Astro route views, e.g. `./site/views/api/` */
  views?: string
}

const projectRelativePathPattern = /^\.\//

export function validateCollectionRender(collectionKey: string, render?: TidyPressCollectionRender): void {
  if (!render) {
    return
  }
  for (const field of ['presentation', 'views'] as const) {
    const value = render[field]
    if (value === undefined) {
      continue
    }
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`collections.${collectionKey}.render.${field} must be a non-empty string.`)
    }
    if (!projectRelativePathPattern.test(value)) {
      throw new Error(
        `collections.${collectionKey}.render.${field} must be a project-relative path starting with "./" (got "${value}").`,
      )
    }
    if (value.includes('..')) {
      throw new Error(`collections.${collectionKey}.render.${field} must not contain "..".`)
    }
  }
}
