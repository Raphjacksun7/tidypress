import { defineConfig } from 'docsmint/config'

export default defineConfig({
  name: 'minimal-example',
  description: 'Minimal markdown docs and writing.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'writing', href: '/writing' },
  ],
  footer: [],
  extensions: {
    customPages: [
      { slug: 'about', title: 'About', navLabel: 'about' },
    ],
  },
  siteUrl: 'https://example.com',
})
