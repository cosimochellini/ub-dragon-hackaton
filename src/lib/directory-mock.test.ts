import { describe, expect, it } from 'vitest'
import { expandDirectory } from './directory-mock'
import seed from '@/data/therapists.json'
import type { DirectorySource } from './types'

const SEED = seed as unknown as DirectorySource
const out = expandDirectory(SEED, 60)
const SLOT_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const VALID_AVATARS = new Set(['candy8', 'candy4', 'smurf', 'grey'])
const VALID_SERVICES = new Set(['individual', 'couples'])
const studioIds = new Set(Object.keys(out.studios))

describe('expandDirectory', () => {
  it('reaches the requested size', () => {
    expect(out.therapists).toHaveLength(60)
    expect(studioIds.size).toBe(15)
  })

  it('is pure and deterministic (same input → identical output)', () => {
    expect(expandDirectory(SEED, 60)).toEqual(out)
  })

  it('preserves the seed therapists first and untouched', () => {
    expect(out.therapists.slice(0, 6)).toEqual(SEED.therapists)
  })

  it('does not mutate the seed source', () => {
    expect(SEED.therapists).toHaveLength(6)
    expect(Object.keys(SEED.studios)).toHaveLength(4)
  })

  it('gives every therapist a unique id and no collision with the seed', () => {
    const ids = out.therapists.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('points every therapist at a known studio', () => {
    for (const t of out.therapists) {
      expect(studioIds.has(t.studio)).toBe(true)
    }
  })

  it('emits only valid enum members', () => {
    for (const t of out.therapists) {
      expect(['female', 'male']).toContain(t.gender)
      expect(t.title).toBe(t.gender === 'female' ? 'Psicologa' : 'Psicologo')
      expect(t.services).toContain('individual')
      expect((t.services as string[]).every((s) => VALID_SERVICES.has(s))).toBe(
        true,
      )
      expect(VALID_AVATARS.has(t.avatar)).toBe(true)
    }
  })

  it('builds a 7-day availability of valid, sorted, unique slots', () => {
    for (const t of out.therapists) {
      expect(t.availability).toHaveLength(7)
      for (const day of t.availability) {
        expect(day.every((s) => SLOT_RE.test(s))).toBe(true)
        expect(new Set(day).size).toBe(day.length)
        // Already chronological: each slot ≥ its predecessor.
        expect(day.every((s, i) => i === 0 || s >= day[i - 1])).toBe(true)
      }
    }
  })

  it('keeps the filters meaningful (healthy gender and service mix)', () => {
    const females = out.therapists.filter((t) => t.gender === 'female').length
    const males = out.therapists.filter((t) => t.gender === 'male').length
    const couples = out.therapists.filter((t) =>
      t.services.includes('couples'),
    ).length
    expect(females).toBeGreaterThanOrEqual(20)
    expect(males).toBeGreaterThanOrEqual(20)
    expect(couples).toBeGreaterThanOrEqual(10)
  })
})
