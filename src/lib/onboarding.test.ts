import { afterEach, describe, expect, it } from 'vitest'
import {
  ONBOARDING_STORAGE_KEY,
  answersToFilters,
  clearOnboarding,
  loadOnboarding,
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
      JSON.stringify({ version: 1, answers: { ...sample, path: 'nope' } }),
    )
    expect(loadOnboarding()).toBeNull()
  })
})

describe('answersToFilters', () => {
  it('maps couples + female', () => {
    expect(answersToFilters(sample)).toEqual({
      service: 'couples',
      gender: 'female',
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
