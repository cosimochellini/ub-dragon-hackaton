import { createServerFn } from '@tanstack/react-start'
import { buildDays } from './availability'
import { expandDirectory } from './directory-mock'
import source from '@/data/therapists.json'
import type { DirectoryData, DirectorySource, Therapist } from './types'

/** Total therapists to surface — the seed expanded with generated mocks. */
const DIRECTORY_SIZE = 60

/**
 * Data layer for the directory. Reads the mock JSON seed, expands it to a
 * realistic directory (deterministically, so it's SSR/hydration-stable), then
 * resolves each therapist's offset-based availability into concrete dates
 * **once on the server** using a single reference instant so SSR markup and
 * client hydration share identical date strings (no hydration mismatch).
 *
 * Production swap point: replace the JSON read + `expandDirectory` with a real
 * API/DB call that returns the same `DirectoryData` shape.
 */
export const getTherapists = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DirectoryData> => {
    const seed = source as unknown as DirectorySource
    const data = expandDirectory(seed, DIRECTORY_SIZE)
    const referenceDate = new Date()

    const therapists: Therapist[] = data.therapists.map((record) => {
      const { availability, ...rest } = record
      return { ...rest, days: buildDays(availability, referenceDate) }
    })

    return { studios: data.studios, therapists }
  },
)
