/**
 * Built-in documentation forms for the `docs` collection (frontmatter `form`).
 * Not collection-level `kind`. Custom forms register later via `extensions.docForms`.
 */
export const tidyPressDocFormRegistry = {
  doc: {
    label: 'Documentation',
    description:
      'Full documentation page with sidebar navigation, chapter prev/next, and table of contents.',
  },
  manual: {
    label: 'Manual',
    description: 'Procedural or operator documentation (install, configure, run).',
  },
} as const

export type TidyPressDocForm = keyof typeof tidyPressDocFormRegistry

/** Tuple for Zod and other APIs that need a fixed enum list. */
export const tidyPressDocFormSchema = ['doc', 'manual'] as const satisfies readonly TidyPressDocForm[]

export const tidyPressDocForms: TidyPressDocForm[] = [...tidyPressDocFormSchema]

export const defaultTidyPressDocForm: TidyPressDocForm = 'doc'

export function isTidyPressDocForm(value: string | undefined): value is TidyPressDocForm {
  return value !== undefined && value in tidyPressDocFormRegistry
}

export function formatTidyPressDocForms(): string {
  return tidyPressDocForms.map(form => `"${form}"`).join(', ')
}

/** User-defined doc forms via `extensions.docForms` (loaded at build time). */
export interface TidyPressCustomDocFormDescriptor {
  label?: string
  /** Project-relative presentation module (`createPresentation` factory). */
  presentation?: string
  /** Project-relative Astro views directory (`<mode>.astro` per route mode). */
  views?: string
}
