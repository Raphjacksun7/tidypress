import type { DocsMintHero, DocsMintHeroLink } from '../schema/types.js'
import { resolveHeroLinkAttributes } from '../links/link-attributes.js'

/** Scalar hero fields rendered on the home page (excluding link list). */
export const docsMintHeroScalarFields = ['role', 'pronunciation', 'lead', 'image'] as const

export type DocsMintHeroScalarField = (typeof docsMintHeroScalarFields)[number]

export function heroHasRenderableScalarField(hero: DocsMintHero): boolean {
  return docsMintHeroScalarFields.some(key => Boolean(hero[key]))
}

export function heroHasRenderableLinks(hero: DocsMintHero): boolean {
  return Boolean(hero.links?.length)
}

export function heroHasRenderableContent(hero: DocsMintHero): boolean {
  return heroHasRenderableScalarField(hero) || heroHasRenderableLinks(hero)
}

function mapHeroLink(link: DocsMintHeroLink) {
  const item: DocsMintHeroLink = { label: link.label, href: link.href }
  if (link.external !== undefined) {
    item.external = link.external
  }
  return item
}

/** Build a config-ready hero object from preset or partial hero input. */
export function pickHeroConfigFields(
  hero: Partial<DocsMintHero> & { enabled?: boolean },
): DocsMintHero {
  const entry: DocsMintHero = { enabled: hero.enabled === true }
  for (const key of docsMintHeroScalarFields) {
    const value = hero[key]
    if (value) {
      entry[key] = value
    }
  }
  if (hero.links?.length) {
    entry.links = hero.links.map(mapHeroLink)
  }
  return entry
}

export { resolveHeroLinkAttributes }
