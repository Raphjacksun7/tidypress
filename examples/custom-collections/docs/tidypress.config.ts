export default {
  name: 'custom-collections-example',
  description: 'TidyPress custom collections example.',
  nav: [
    { label: 'docs', href: '/docs' },
    { label: 'playbooks', href: '/playbooks' },
    { label: 'writing', href: '/writing' },
  ],
  collections: {
    playbooks: {
      enabled: true,
      basePath: '/playbooks',
      kind: 'content',
      label: 'playbooks',
    },
  },
  siteUrl: 'https://example.com',
}
