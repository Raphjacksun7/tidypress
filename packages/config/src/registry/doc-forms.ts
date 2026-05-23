/**
 * Built-in documentation forms for the `docs` collection (frontmatter `form`).
 * Not collection-level `kind`. Custom forms register later via `extensions.docForms`.
 */
export const docsMintDocFormRegistry = {
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

export type DocsMintDocForm = keyof typeof docsMintDocFormRegistry

/** Tuple for Zod and other APIs that need a fixed enum list. */
export const docsMintDocFormSchema = ['doc', 'manual'] as const satisfies readonly DocsMintDocForm[]

export const docsMintDocForms: DocsMintDocForm[] = [...docsMintDocFormSchema]

export const defaultDocsMintDocForm: DocsMintDocForm = 'doc'

export function isDocsMintDocForm(value: string | undefined): value is DocsMintDocForm {
  return value !== undefined && value in docsMintDocFormRegistry
}

export function formatDocsMintDocForms(): string {
  return docsMintDocForms.map(form => `"${form}"`).join(', ')
}

/** User-defined doc forms via `extensions.docForms` (loaded at build time). */
export interface DocsMintCustomDocFormDescriptor {
  label?: string
  /** Project-relative presentation module (`createPresentation` factory). */
  presentation?: string
  /** Project-relative Astro views directory (`<mode>.astro` per route mode). */
  views?: string
}
