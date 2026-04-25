import type { DocsMintConfig } from './schema.js'

export const defaultConfig: Partial<DocsMintConfig> = {
  description: '',
  writing: {
    description: 'Engineering notes, architectural decisions, and observations.',
  },
  pages: [],
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  repository: {
    branch: 'main',
  },
  search: {
    exclude: [],
  },
  sections: {
    docs: {
      enabled: true,
      basePath: '/docs',
    },
    writing: {
      enabled: true,
      basePath: '/writing',
    },
  },
  dateLocale: 'en-US',
  dateFormat: { year: 'numeric', month: 'short', day: 'numeric' },
  navPolicy: {
    mode: 'strict',
    maxVisibleDesktop: 3,
    maxVisibleMobile: 2,
  },
}
