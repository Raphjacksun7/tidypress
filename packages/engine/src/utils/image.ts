export const TIDYPRESS_IMAGE_PRESENTATION = {
  figureClass: 'my-8',
  frameClass: 'tidy-image-frame',
  captionClass: 'tidy-image-caption',
  optimizedWidth: 800,
  optimizedHeight: 450,
} as const

export function isRemoteOrPublicImageSrc(src: unknown): src is string {
  if (typeof src !== 'string') {
    return false
  }
  return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')
}
