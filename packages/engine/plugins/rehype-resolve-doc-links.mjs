import path from 'node:path'
import { visit } from 'unist-util-visit'

/**
 * @param {string} filename
 */
export function stripDocExtension(filename) {
  return filename.replace(/\.(md|mdx)$/i, '')
}

/**
 * @param {string} filePath
 * @returns {{ collectionKey: string, entrySlug: string } | undefined}
 */
export function parseContentFilePath(filePath) {
  const normalized = filePath.replace(/\\/g, '/')
  const match = normalized.match(/content\/([^/]+)\/(.+)$/)
  if (!match) {
    return undefined
  }
  return {
    collectionKey: match[1],
    entrySlug: stripDocExtension(match[2]),
  }
}

/**
 * @param {string} pathname
 */
function normalizeDocPathname(pathname) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) {
    return '/'
  }
  const last = segments[segments.length - 1]
  segments[segments.length - 1] = stripDocExtension(last)
  return `/${segments.join('/')}`
}

/**
 * Resolve a markdown/doc link to a site-root path (e.g. `/docs/writing-content`).
 *
 * @param {string} href
 * @param {string} collectionBasePath
 * @param {string} entrySlug
 */
export function resolveRelativeDocHref(href, collectionBasePath, entrySlug) {
  if (/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(href)) {
    return href
  }

  const hashIndex = href.indexOf('#')
  const pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : ''

  if (!pathPart) {
    return href
  }

  const slugDir = path.posix.dirname(entrySlug)
  const docBase =
    slugDir === '.' ? collectionBasePath : `${collectionBasePath}/${slugDir}`

  const joined = pathPart.startsWith('./') || pathPart.startsWith('../')
    ? path.posix.normalize(path.posix.join(docBase, pathPart))
    : path.posix.join(docBase, pathPart)

  return normalizeDocPathname(joined) + hash
}

/**
 * @param {{ getCollectionBasePath?: (collectionKey: string) => string }} [options]
 */
export function rehypeResolveDocLinks(options = {}) {
  const { getCollectionBasePath = key => `/${key}` } = options

  return (tree, file) => {
    const filePath = file.history?.[0] ?? file.path ?? ''
    const ctx = parseContentFilePath(filePath)
    if (!ctx) {
      return
    }

    const collectionBasePath = getCollectionBasePath(ctx.collectionKey)

    visit(tree, 'element', node => {
      if (node.tagName !== 'a') {
        return
      }
      const href = node.properties?.href
      if (typeof href !== 'string') {
        return
      }
      const resolved = resolveRelativeDocHref(href, collectionBasePath, ctx.entrySlug)
      if (resolved !== href) {
        node.properties.href = resolved
      }
    })
  }
}
