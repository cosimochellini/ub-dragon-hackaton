import { afterEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { OnboardingGate } from './OnboardingGate'
import { renderWithRouter } from '@/test/render'
import { testStudios, testTherapists } from '@/test/fixtures'
import { saveOnboarding } from '@/lib/onboarding'
import type { OnboardingAnswers } from '@/lib/onboarding'

const sample: OnboardingAnswers = {
  path: 'couples',
  age: 34,
  reasons: ['anxiety'],
  duration: 'one_year',
  city: 'milan',
  genderPref: 'female',
}

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('OnboardingGate', () => {
  it('shows the questionnaire when nothing is stored', async () => {
    renderWithRouter(
      <OnboardingGate therapists={testTherapists} studios={testStudios} />,
    )

    expect(
      await screen.findByText('Which path are you interested in?'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Edit preferences' }),
    ).toBeNull()
  })

  it('shows the directory when valid answers are stored', async () => {
    saveOnboarding(sample)
    renderWithRouter(
      <OnboardingGate therapists={testTherapists} studios={testStudios} />,
    )

    expect(
      await screen.findByRole('button', { name: 'Edit preferences' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Therapists in Milan')).toBeInTheDocument()

    // Saved answers pre-seed the visible filter chips…
    expect(screen.getByRole('button', { name: 'Couples' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Female' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    // …and the filtered count reflects them: couples + female = Sara (t1) +
    // Giulia (t3).
    expect(screen.getByText('2 found')).toBeInTheDocument()
  })
})
