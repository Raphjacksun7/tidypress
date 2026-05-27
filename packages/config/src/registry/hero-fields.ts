import type { TidyPressHero, TidyPressHeroLink } from '../schema/types.js'
import { resolveHeroLinkAttributes } from '../links/link-attributes.js'

/** Scalar hero fields rendered on the home page (excluding link list). */
export const tidyPressHeroScalarFields = ['role', 'pronunciation', 'lead', 'image'] as const

export type TidyPressHeroScalarField = (typeof tidyPressHeroScalarFields)[number]

export function heroHasRenderableScalarField(hero: TidyPressHero): boolean {
  return tidyPressHeroScalarFields.some(key => Boolean(hero[key]))
}

export function heroHasRenderableLinks(hero: TidyPressHero): boolean {
  return Boolean(hero.links?.length)
}

export function heroHasRenderableContent(hero: TidyPressHero): boolean {
  return heroHasRenderableScalarField(hero) || heroHasRenderableLinks(hero)
}

function mapHeroLink(link: TidyPressHeroLink) {
  const item: TidyPressHeroLink = { label: link.label, href: link.href }
  if (link.external !== undefined) {
    item.external = link.external
  }
  return item
}

/** Build a config-ready hero object from preset or partial hero input. */
export function pickHeroConfigFields(
  hero: Partial<TidyPressHero> & { enabled?: boolean },
): TidyPressHero {
  const entry: TidyPressHero = { enabled: hero.enabled === true }
  for (const key of tidyPressHeroScalarFields) {
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
