import type { GenderFilter, ServiceType, Therapist } from './types'

/**
 * Directory filter: a therapist matches when they offer the selected service
 * (single-select) and either gender is "any" or matches. Both filters are
 * single-select in v1.
 */
export function filterTherapists(
  list: Therapist[],
  service: ServiceType,
  gender: GenderFilter,
): Therapist[] {
  return list.filter(
    (t) =>
      t.services.includes(service) && (gender === 'any' || t.gender === gender),
  )
}
