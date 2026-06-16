import { matchesZone } from './onboarding'
import type { Zone } from './onboarding'
import type { GenderFilter, ServiceType, Studio, Therapist } from './types'

export interface FilterOptions {
  /** When set (with `studios`), keep only therapists whose studio is in the zone. */
  zone?: Zone | null
  /** Studio lookup needed to resolve a therapist's area for zone filtering. */
  studios?: Record<string, Studio>
}

/**
 * Directory filter: a therapist matches when they offer the selected service
 * (single-select) and either gender is "any" or matches. An optional `zone`
 * (from the onboarding questionnaire) further restricts results to therapists
 * whose studio area falls in that zone; it is ignored unless both `zone` and
 * `studios` are provided, so existing 3-arg calls behave exactly as before.
 */
export function filterTherapists(
  list: Therapist[],
  service: ServiceType,
  gender: GenderFilter,
  { zone, studios }: FilterOptions = {},
): Therapist[] {
  return list.filter((t) => {
    if (!t.services.includes(service)) return false
    if (gender !== 'any' && t.gender !== gender) return false
    if (zone && studios) {
      const studio = studios[t.studio] as Studio | undefined
      if (!studio || !matchesZone(studio.area, zone)) return false
    }
    return true
  })
}
