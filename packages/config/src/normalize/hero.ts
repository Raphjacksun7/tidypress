import type { TidyPressHero } from '../schema/types.js'

export { heroHasRenderableContent } from '../registry/hero-fields.js'

/** Opt-in home hero (`enabled: true` only). Disabled or omitted heroes are removed from config. */
export function normalizeHero(hero?: TidyPressHero): TidyPressHero | undefined {
  return hero?.enabled === true ? hero : undefined
}
