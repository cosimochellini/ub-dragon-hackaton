import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { TherapistNotFound } from './TherapistNotFound'
import { renderWithRouter } from '@/test/render'

describe('TherapistNotFound', () => {
  it('shows the recovery message and a link back to the directory', () => {
    renderWithRouter(<TherapistNotFound />)

    expect(screen.getByText('Therapist not found')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to directory' }),
    ).toHaveAttribute('href', '/')
  })
})
