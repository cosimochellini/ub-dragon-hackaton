import { describe, expect, it } from 'vitest'
import { buildDirectorySource } from './directory-source'
import doctorsRaw from '@/data/doctors.json'
import studiosRaw from '@/data/studios.json'

const REF = new Date('2026-06-16T09:00:00+02:00')
const data = buildDirectorySource(REF)

const SLOT_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const VALID_AVATARS = new Set(['candy8', 'candy4', 'smurf', 'grey'])
const VALID_SERVICES = new Set(['individual', 'couples'])
const VALID_STUDIO_TYPES = new Set(['unobravo', 'private'])

const rawDoctors = doctorsRaw as Array<{ active: boolean }>
const activeCount = rawDoctors.filter((d) => d.active).length

describe('buildDirectorySource', () => {
  it('keeps every studio from the export', () => {
    expect(Object.keys(data.studios)).toHaveLength(
      (studiosRaw as unknown[]).length,
    )
  })

  it('surfaces exactly the active doctors', () => {
    expect(data.therapists).toHaveLength(activeCount)
  })

  it('is pure and deterministic for the same reference date', () => {
    expect(buildDirectorySource(REF)).toEqual(data)
  })

  it('gives every therapist a unique id and a known studio', () => {
    const ids = data.therapists.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const t of data.therapists) {
      expect(typeof t.id).toBe('string')
      expect(data.studios[t.studio]).toBeDefined()
    }
  })

  it('emits only valid enum members and a gender-consistent title', () => {
    for (const t of data.therapists) {
      expect(['female', 'male']).toContain(t.gender)
      expect(t.title).toBe(t.gender === 'female' ? 'Psicologa' : 'Psicologo')
      expect(t.services).toContain('individual')
      expect(t.services.every((s) => VALID_SERVICES.has(s))).toBe(true)
      expect(VALID_AVATARS.has(t.avatar)).toBe(true)
      expect(typeof t.age).toBe('number')
      expect(t.photoUrl === undefined || typeof t.photoUrl === 'string').toBe(true)
    }
  })

  it('builds a 7-day availability of valid, sorted, unique slots', () => {
    for (const t of data.therapists) {
      expect(t.availability).toHaveLength(7)
      for (const day of t.availability) {
        expect(day.every((s) => SLOT_RE.test(s))).toBe(true)
        expect(new Set(day).size).toBe(day.length)
        expect(day.every((s, i) => i === 0 || s >= day[i - 1])).toBe(true)
      }
    }
  })

  it('produces studios with a valid type, projected map position and coords', () => {
    for (const studio of Object.values(data.studios)) {
      expect(VALID_STUDIO_TYPES.has(studio.type)).toBe(true)
      expect(studio.map.x).toBeGreaterThanOrEqual(0)
      expect(studio.map.x).toBeLessThanOrEqual(100)
      expect(studio.map.y).toBeGreaterThanOrEqual(0)
      expect(studio.map.y).toBeLessThanOrEqual(100)
      expect(Number.isFinite(studio.coords.lat)).toBe(true)
      expect(Number.isFinite(studio.coords.lng)).toBe(true)
      expect(studio.area.length).toBeGreaterThan(0)
    }
  })

  it('keeps the filters meaningful (a healthy service mix)', () => {
    const couples = data.therapists.filter((t) =>
      t.services.includes('couples'),
    ).length
    expect(couples).toBeGreaterThanOrEqual(10)
    expect(data.therapists.some((t) => t.gender === 'female')).toBe(true)
    expect(data.therapists.some((t) => t.gender === 'male')).toBe(true)
  })
})
