import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { CardHead } from './CardHead'
import { renderWithRouter } from '@/test/render'
import { testTherapists } from '@/test/fixtures'

describe('CardHead', () => {
  it('links the therapist to their profile page', () => {
    const sara = testTherapists[0]
    renderWithRouter(<CardHead t={sara} />)

    const link = screen.getByRole('link', {
      name: `View ${sara.name}'s profile`,
    })
    expect(link).toHaveAttribute('href', `/therapist/${sara.id}`)
  })
})
