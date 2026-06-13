import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileScreen } from './ProfileScreen'
import { renderWithRouter } from '@/test/render'
import { testStudios, testTherapists } from '@/test/fixtures'

const sara = testTherapists[0]

describe('ProfileScreen', () => {
  it('renders the identity and every profile section', () => {
    renderWithRouter(<ProfileScreen therapist={sara} studios={testStudios} />)

    expect(
      screen.getByRole('heading', { level: 1, name: sara.name }),
    ).toBeInTheDocument()
    expect(screen.getByText('What you should know')).toBeInTheDocument()
    expect(screen.getByText('Often works with')).toBeInTheDocument()
    expect(screen.getByText('Their style')).toBeInTheDocument()
    expect(screen.getByText('During sessions')).toBeInTheDocument()
    expect(
      screen.getByText('How they describe themselves'),
    ).toBeInTheDocument()
    expect(screen.getByText('Education & training')).toBeInTheDocument()
    expect(screen.getByText(sara.profile.bio)).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'Back to directory' }),
    ).toHaveAttribute('href', '/')
  })

  it('books a free intro call directly from the profile', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ProfileScreen therapist={sara} studios={testStudios} />)

    // Sara's first available day in the fixture opens at 15:00.
    await user.click(screen.getByRole('button', { name: '15:00' }))

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText('Book a free intro call'),
    ).toBeInTheDocument()

    await user.type(
      within(dialog).getByLabelText('Mobile number'),
      '3401234567',
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Confirm booking' }),
    )
    expect(screen.getByText("You're booked")).toBeInTheDocument()
  })
})
