import type { DocsMintConfig } from '@docsmint/config'

const config: DocsMintConfig = {
  name: 'docsmint',
  description: 'Minimal markdown documentation builder. Write docs. Get a clean site.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  pages: [],
  dateFormat: { year: 'numeric', month: 'short', day: 'numeric' },
  dateLocale: 'en-US',
}
export default config
