import type { TidyPressFooterCredit } from '../schema/index.js'

/** Default product credit appended when `footer.showCredit` is true. */
export const defaultFooterCredit: TidyPressFooterCredit = {
  prefix: ', Made with ',
  label: 'tidypress',
  href: 'https://tidypress.pages.dev/',
}
