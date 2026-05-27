export default {
  name: 'lab',
  description: 'A publishing framework for Git-native authorship.',
  nav: [
    { label: 'writing', href: '/writing' },
    { label: 'projects', href: '/projects' },
  ],
  home: {
    order: ['writing', 'projects'],
    previewLimit: 5,
    collections: {
      writing: { layout: 'list', showDate: true },
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
    projects: {
      enabled: true,
      kind: 'projects',
      basePath: '/projects',
      label: 'projects',
      display: { layout: 'list', showDescription: true },
    },
    pages: { enabled: false, kind: 'page' },
  },
  footer: [{ label: 'GitHub', href: 'https://github.com/you', icon: 'github', external: true }],
  siteUrl: 'https://example.com',
}
