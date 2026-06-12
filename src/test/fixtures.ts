import { buildDays } from '@/lib/availability'
import source from '@/data/therapists.json'
import type { DirectorySource, Therapist } from '@/lib/types'

/** Fixed reference: Thu 11 Jun 2026 (matches the prototype's mock "today"). */
export const TEST_REFERENCE = new Date('2026-06-11T09:00:00+02:00')

const data = source as unknown as DirectorySource

export const testStudios = data.studios

export const testTherapists: Therapist[] = data.therapists.map(
  ({ availability, ...rest }) => ({
    ...rest,
    days: buildDays(availability, TEST_REFERENCE),
  }),
)
