import type { DocsMintConfig } from './schema.js'

export const defaultConfig: Partial<DocsMintConfig> = {
  description: '',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  dateLocale: 'en-US',
  dateFormat: { year: 'numeric', month: 'short', day: 'numeric' },
  extensions: {
    customPages: [],
  },
  navPolicy: {
    mode: 'strict',
    maxVisibleDesktop: 3,
    maxVisibleMobile: 2,
  },
}
