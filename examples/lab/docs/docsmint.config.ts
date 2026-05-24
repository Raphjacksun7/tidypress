export default {
  name: 'lab',
  description: 'Minimal markdown site for fast writing and project showcase.',
  nav: [
    { label: 'writing', href: '/writing' },
    { label: 'projects', href: '/projects' },
  ],
  home: {
    order: ['writing', 'projects'],
    previewLimit: 5,
    collections: {
      projects: { layout: 'card', showDescription: true },
    },
  },
  capabilities: {
    disable: ['docs', 'pages'],
  },
  writing: {
    description: 'Writing from the lab example.',
  },
  collections: {
    docs: { enabled: false, basePath: '/docs', label: 'docs' },
    writing: { enabled: true, kind: 'writing', basePath: '/writing', label: 'writing' },
    projects: { enabled: true, kind: 'projects', basePath: '/projects', label: 'projects' },
    pages: { enabled: false, kind: 'page' },
  },
  footer: [],
  siteUrl: 'https://example.com',
}
