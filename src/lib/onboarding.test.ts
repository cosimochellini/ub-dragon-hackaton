import { afterEach, describe, expect, it } from 'vitest'
import {
  ONBOARDING_STORAGE_KEY,
  answersToFilters,
  clearOnboarding,
  loadOnboarding,
  matchesZone,
  saveOnboarding,
} from './onboarding'
import type { OnboardingAnswers } from './onboarding'

const sample: OnboardingAnswers = {
  path: 'couples',
  age: 34,
  reasons: ['anxiety', 'work'],
  more: 'A bit more context.',
  duration: 'one_year',
  priorTherapy: 'first',
  city: 'milan',
  zone: 'se',
  genderPref: 'female',
}

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('onboarding storage', () => {
  it('round-trips saved answers', () => {
    saveOnboarding(sample)
    expect(loadOnboarding()).toEqual(sample)
  })

  it('returns null when nothing is stored', () => {
    expect(loadOnboarding()).toBeNull()
  })

  it('clears stored answers', () => {
    saveOnboarding(sample)
    clearOnboarding()
    expect(loadOnboarding()).toBeNull()
  })

  it('discards a version mismatch', () => {
    globalThis.localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ version: 999, answers: sample }),
    )
    expect(loadOnboarding()).toBeNull()
  })

  it('discards malformed payloads', () => {
    globalThis.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'not json')
    expect(loadOnboarding()).toBeNull()
  })

  it('discards answers that fail validation', () => {
    globalThis.localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ version: 1, answers: { ...sample, zone: 'nowhere' } }),
    )
    expect(loadOnboarding()).toBeNull()
  })
})

describe('answersToFilters', () => {
  it('maps couples + female + zone', () => {
    expect(answersToFilters(sample)).toEqual({
      service: 'couples',
      gender: 'female',
      zone: 'se',
    })
  })

  it('treats "minor" path as individual', () => {
    expect(answersToFilters({ ...sample, path: 'minor' }).service).toBe(
      'individual',
    )
  })

  it('maps a male preference and "no preference" to gender filters', () => {
    expect(answersToFilters({ ...sample, genderPref: 'male' }).gender).toBe(
      'male',
    )
    expect(answersToFilters({ ...sample, genderPref: 'any' }).gender).toBe('any')
  })
})

describe('matchesZone', () => {
  it('matches areas inside the zone', () => {
    expect(matchesZone('Brera', 'nw')).toBe(true)
    expect(matchesZone('Navigli', 'sw')).toBe(true)
  })

  it('rejects areas outside the zone', () => {
    expect(matchesZone('Brera', 'sw')).toBe(false)
    expect(matchesZone('Unknown', 'ne')).toBe(false)
  })
})
