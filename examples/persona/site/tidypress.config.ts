// Example fixture URL — replace before deploy (see examples/README.md).
export default {
  name: 'Alex Example',
  description: 'A publishing framework for Git-native authorship.',
  hero: {
    enabled: true,
    role: 'Systems engineer',
    lead: 'Building tools and writing about what ships.',
    links: [
      { label: 'GitHub', href: 'https://github.com/example', external: true },
      { label: 'Email', href: 'mailto:you@example.com' },
    ],
  },
  nav: [
    { label: 'projects', href: '/projects' },
    { label: 'writing', href: '/writing' },
    { label: 'about', href: '/about' },
  ],
  home: {
    order: ['projects', 'writing'],
    previewLimit: 4,
    collections: {
      projects: { layout: 'card', showDescription: true },
    },
  },
  capabilities: {
    disable: ['docs'],
  },
  writing: {
    description: 'Selected posts.',
  },
  collections: {
    docs: { enabled: false, basePath: '/docs' },
    writing: { enabled: true, kind: 'writing', basePath: '/writing', label: 'writing' },
    projects: { enabled: true, kind: 'projects', basePath: '/projects', label: 'projects' },
    pages: { enabled: true, kind: 'page' },
  },
  pages: [{ slug: 'about', navLabel: 'about' }],
  footer: [{ label: 'GitHub', href: 'https://github.com/you', icon: 'github', external: true }],
  siteUrl: 'https://example.com',
}
