export function toCollectionAwareContentId(_collection: string, entryPath: string): string {
  const normalizedPath = entryPath.replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '')
  return normalizedPath
}
