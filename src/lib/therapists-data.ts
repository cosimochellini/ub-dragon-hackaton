import { createServerFn } from '@tanstack/react-start'
import { buildDays } from './availability'
import source from '@/data/therapists.json'
import type { DirectoryData, DirectorySource, Therapist } from './types'

/**
 * Data layer for the directory. Reads the mock JSON and resolves each
 * therapist's offset-based availability into concrete dates **once on the
 * server**, using a single reference instant so SSR markup and client
 * hydration share identical date strings (no hydration mismatch).
 *
 * Production swap point: replace the JSON read with a real API/DB call that
 * returns the same `DirectoryData` shape.
 */
export const getTherapists = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DirectoryData> => {
    const data = source as unknown as DirectorySource
    const referenceDate = new Date()

    const therapists: Therapist[] = data.therapists.map((record) => {
      const { availability, ...rest } = record
      return { ...rest, days: buildDays(availability, referenceDate) }
    })

    return { studios: data.studios, therapists }
  },
)
