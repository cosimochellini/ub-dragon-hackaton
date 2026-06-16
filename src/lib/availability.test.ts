import { describe, expect, it } from 'vitest'
import { buildDays, nextAvailable } from './availability'
import { buildProfile } from './profile-mock'
import type { Therapist, TherapistRecord } from './types'

const PATTERN = [['09:00'], [], ['10:00', '11:00'], [], [], [], []]
// Thu 11 Jun 2026, 09:00 Rome time — the window starts the next day, Fri 12 Jun.
const REF = new Date('2026-06-11T09:00:00+02:00')

describe('buildDays', () => {
  const days = buildDays(PATTERN, REF)

  it('returns one entry per pattern day', () => {
    expect(days).toHaveLength(7)
  })

  it('labels the first day Tomorrow', () => {
    expect(days[0].label).toBe('Tomorrow')
    expect(days[1].label).toBe('Sat')
  })

  it('labels later days by weekday', () => {
    expect(days[2].label).toBe('Sun')
    expect(days[2].dow).toBe('Sun')
  })

  it('computes day, month and composed dateLabel', () => {
    expect(days[0].day).toBe(12)
    expect(days[0].month).toBe('Jun')
    expect(days[0].dateLabel).toBe('Fri 12 Jun')
    expect(days[1].dateLabel).toBe('Sat 13 Jun')
    expect(days[2].dateLabel).toBe('Sun 14 Jun')
  })

  it('carries slots through unchanged', () => {
    expect(days[0].slots).toEqual(['09:00'])
    expect(days[2].slots).toEqual(['10:00', '11:00'])
    expect(days[1].slots).toEqual([])
  })

  it('is pure for a fixed reference date', () => {
    expect(buildDays(PATTERN, REF)).toEqual(days)
  })

  it('resolves the Rome calendar day near midnight UTC (no off-by-one)', () => {
    // 23:30 UTC on 11 Jun is 01:30 on 12 Jun in Rome (CEST, +2); the window then
    // starts the next day, 13 Jun.
    const lateUtc = new Date('2026-06-11T23:30:00Z')
    const d = buildDays(PATTERN, lateUtc)
    expect(d[0].day).toBe(13)
    expect(d[0].dateLabel).toBe('Sat 13 Jun')
  })
})

describe('nextAvailable', () => {
  const base: Omit<TherapistRecord, 'availability'> = {
    id: 'x',
    name: 'X',
    initials: 'X',
    title: 'Psicologa',
    gender: 'female',
    services: ['individual'],
    studio: 'ub_romana',
    avatar: 'candy8',
  }
  const make = (availability: string[][]): Therapist => ({
    ...base,
    days: buildDays(availability, REF),
    profile: buildProfile({ ...base, availability }, {}),
  })

  it('returns the first day and slot with availability', () => {
    const na = nextAvailable(make([[], ['15:00', '16:00'], []]))
    expect(na).not.toBeNull()
    expect(na?.day.key).toBe(1)
    expect(na?.slot).toBe('15:00')
  })

  it('returns null when there is no availability all week', () => {
    expect(nextAvailable(make([[], [], [], [], [], [], []]))).toBeNull()
  })
})
