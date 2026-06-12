import type { Studio, Therapist } from './types'

export interface StudioGroup {
  studio: Studio
  therapists: Therapist[]
}

export function studioOf(
  t: Therapist,
  studios: Record<string, Studio>,
): Studio | undefined {
  return studios[t.studio]
}

/**
 * Group a (filtered) therapist list by studio. Shared Unobravo studios cluster
 * several therapists; private studios stand alone. Insertion order follows the
 * input list, so the resulting map markers render deterministically.
 */
export function groupStudios(
  list: Therapist[],
  studios: Record<string, Studio | undefined>,
): StudioGroup[] {
  const groups = new Map<string, StudioGroup>()
  for (const t of list) {
    const studio = studios[t.studio]
    if (!studio) continue // skip therapists referencing an unknown studio
    const existing = groups.get(t.studio)
    if (existing) {
      existing.therapists.push(t)
    } else {
      groups.set(t.studio, { studio, therapists: [t] })
    }
  }
  return [...groups.values()]
}
