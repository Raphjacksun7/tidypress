import type { TidyPressConfig } from '@tidypress/config'

const config: TidyPressConfig = {
  name: 'tidypress',
  description: 'A publishing framework for Git-native authorship.',
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
