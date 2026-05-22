import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'docsmint',
  description: 'Static publishing for engineers who want docs and writing they own.',
  branding: {
    icon: '/favicon.svg',
    favicon: '/favicon-white.svg',
  },
  typography: {
    scale: 'medium',
  },
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  pages: [],
  siteUrl: 'https://usedocsmint.pages.dev',
})
