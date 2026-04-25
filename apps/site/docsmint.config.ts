import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'docsmint',
  description: 'Minimal markdown publishing system for docs and writing.',
  typography: {
    scale: 'medium',
  },
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  pages: [],
  siteUrl: 'https://docsmint.dev',
})
