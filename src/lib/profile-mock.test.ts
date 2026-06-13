import { describe, expect, it } from 'vitest'
import { buildProfile } from './profile-mock'
import { testStudios } from '@/test/fixtures'
import type { ServiceType, TherapistRecord } from './types'

const studioId = Object.keys(testStudios)[0]

function record(
  id: string,
  services: ServiceType[] = ['individual'],
): TherapistRecord {
  return {
    id,
    name: 'Sara Bianchi',
    initials: 'SB',
    title: 'Psicologa',
    gender: 'female',
    services,
    studio: studioId,
    avatar: 'candy8',
    availability: [[], [], [], [], [], [], []],
  }
}

const ALL_IDS = Array.from({ length: 60 }, (_, i) => `t${i + 1}`)

describe('buildProfile', () => {
  it('is deterministic for the same id', () => {
    expect(buildProfile(record('t7'), testStudios)).toEqual(
      buildProfile(record('t7'), testStudios),
    )
  })

  it('produces a fully populated profile', () => {
    const p = buildProfile(record('t3'), testStudios)
    expect(p.headline).toBeTruthy()
    expect(p.alboRegion).toBe('Lombardy')
    expect(p.alboNumber).toMatch(/^\d{4}$/)
    expect(p.city).toBe('Milan')
    expect(p.orientation).toBeTruthy()
    expect(p.bio.length).toBeGreaterThan(40)
    expect(p.topics.length).toBeGreaterThanOrEqual(3)
    expect(p.education.length).toBeGreaterThanOrEqual(3)
    expect(p.styleAxes).toHaveLength(2)
    expect(p.sessionAxes).toHaveLength(2)
  })

  it('keeps numeric fields in plausible ranges across the whole directory', () => {
    for (const id of ALL_IDS) {
      const p = buildProfile(record(id), testStudios)
      expect(p.age).toBeGreaterThanOrEqual(30)
      expect(p.age).toBeLessThanOrEqual(58)
      expect(p.yearsExperience).toBeGreaterThanOrEqual(3)
      expect(p.yearsExperience).toBeLessThanOrEqual(20)
      // Experience must stay plausible against age (started at ~25+).
      expect(p.yearsExperience).toBeLessThan(p.age - 24)
      expect(p.peopleHelped).toBeGreaterThanOrEqual(12)
      for (const axis of [...p.styleAxes, ...p.sessionAxes]) {
        expect(axis.value).toBeGreaterThanOrEqual(0)
        expect(axis.value).toBeLessThanOrEqual(100)
      }
    }
  })

  it('includes a couples topic for therapists who offer couples', () => {
    const p = buildProfile(record('t9', ['individual', 'couples']), testStudios)
    expect(p.topics).toContain('Couples therapy')
  })
})
