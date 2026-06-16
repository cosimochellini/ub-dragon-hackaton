import { createServerFn } from '@tanstack/react-start'
import { buildDays } from './availability'
import { buildDirectorySource } from './directory-source'
import { buildProfile } from './profile-mock'
import type { DirectoryData, Therapist } from './types'

/**
 * Data layer for the directory. Builds the directory from the real Unobravo
 * export (studios + active doctors + Calendly availability), then resolves each
 * therapist's offset-based availability into concrete dates **once on the
 * server** using a single reference instant, so SSR markup and client hydration
 * share identical date strings (no hydration mismatch).
 *
 * Production swap point: replace `buildDirectorySource` with a real API/DB call
 * that returns the same `DirectorySource` shape.
 */
export const getTherapists = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DirectoryData> => {
    const referenceDate = new Date()
    const data = buildDirectorySource(referenceDate)

    const therapists: Therapist[] = data.therapists.map((record) => {
      const { availability, ...rest } = record
      return {
        ...rest,
        days: buildDays(availability, referenceDate),
        profile: buildProfile(record, data.studios),
      }
    })

    return { studios: data.studios, therapists }
  },
)
