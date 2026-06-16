import { buildDays } from '@/lib/availability'
import { buildProfile } from '@/lib/profile-mock'
import source from './fixtures-data.json'
import type { DirectorySource, Therapist } from '@/lib/types'

/**
 * Frozen snapshot of 4 studios + 6 therapists. Tests assert exact counts/ids
 * against this, so it is intentionally decoupled from production data — which
 * the data layer builds from the real Unobravo export (`directory-source`).
 * Changing the real data must never break the suite.
 */

/** Fixed reference: Thu 11 Jun 2026 (matches the prototype's mock "today"). */
export const TEST_REFERENCE = new Date('2026-06-11T09:00:00+02:00')

const data = source as unknown as DirectorySource

export const testStudios = data.studios

export const testTherapists: Therapist[] = data.therapists.map(
  ({ availability, ...rest }) => ({
    ...rest,
    days: buildDays(availability, TEST_REFERENCE),
    profile: buildProfile({ ...rest, availability }, data.studios),
  }),
)
