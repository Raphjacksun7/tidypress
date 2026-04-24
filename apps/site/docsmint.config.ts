import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'docsmint',
  description: 'Minimal markdown publishing system for docs and writing.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  extensions: {
    customPages: [],
  },
  siteUrl: 'https://docsmint.dev',
})
