export class RoutePath {
  readonly segments: string[]

  constructor(segments: string[]) {
    this.segments = segments.filter(Boolean)
  }

  static fromPathname(pathname: string): RoutePath {
    return new RoutePath(pathname.split('/').filter(Boolean))
  }

  withLocale(locale: string | undefined): RoutePath {
    if (!locale) {
      return this
    }
    return new RoutePath([locale, ...this.segments])
  }

  append(...segments: string[]): RoutePath {
    return new RoutePath([...this.segments, ...segments.filter(Boolean)])
  }

  toPathname(): string {
    if (this.segments.length === 0) {
      return '/'
    }
    return `/${this.segments.join('/')}`
  }

  toParam(): string {
    return this.segments.join('/')
  }
}
