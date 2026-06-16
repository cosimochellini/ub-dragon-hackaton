import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MilanApp } from './MilanApp'
import { renderWithRouter } from '@/test/render'
import { testStudios, testTherapists } from '@/test/fixtures'

describe('MilanApp booking flow', () => {
  it('books a slot end-to-end: slot → sheet → confirmed → done', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MilanApp therapists={testTherapists} studios={testStudios} />)

    // Live count for the default Individual + Any filters.
    expect(screen.getByText('6 found')).toBeInTheDocument()

    // Book Sara Bianchi's first slot (15:00), scoped to her card so the test
    // doesn't depend on slot times being globally unique.
    const saraCard = screen
      .getByText('Sara Bianchi')
      .closest('[data-therapist="t1"]') as HTMLElement
    await user.click(within(saraCard).getByRole('button', { name: '15:00' }))

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText('Book a free intro call'),
    ).toBeInTheDocument()
    expect(within(dialog).getByText(/with Sara Bianchi/)).toBeInTheDocument()

    // Confirm is gated until a plausible phone number is entered.
    const confirm = within(dialog).getByRole('button', {
      name: 'Confirm booking',
    })
    expect(confirm).toBeDisabled()
    await user.type(
      within(dialog).getByLabelText('Mobile number'),
      '3401234567',
    )
    expect(confirm).toBeEnabled()

    await user.click(confirm)
    expect(screen.getByText("You're booked")).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('updates the live count when filtering to Couples', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MilanApp therapists={testTherapists} studios={testStudios} />)

    await user.click(screen.getByRole('button', { name: 'Couples' }))
    expect(screen.getByText('4 found')).toBeInTheDocument()
  })

  it('drops the area pre-filter when it would strand the first screen', async () => {
    // sw maps to areas none of the test studios use → seeding it would show 0;
    // the gate-equivalent fallback skips the zone so the screen isn't empty.
    renderWithRouter(
      <MilanApp
        therapists={testTherapists}
        studios={testStudios}
        initialZone="sw"
      />,
    )

    expect(screen.getByText('6 found')).toBeInTheDocument()
    expect(screen.queryByText('No therapists match')).toBeNull()
  })

  it('clears the area filter from the empty state once a filter change empties it', async () => {
    const user = userEvent.setup()
    // nw = Brera (t2) + Isola (t4), both male, so it seeds fine for Individual +
    // Any, then empties when the user switches Gender to Female.
    renderWithRouter(
      <MilanApp
        therapists={testTherapists}
        studios={testStudios}
        initialZone="nw"
      />,
    )
    expect(screen.getByText('2 found')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Female' }))
    expect(screen.getByText('No therapists match')).toBeInTheDocument()
    expect(screen.getByText(/North-West/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show all areas' }))
    expect(screen.getByText('3 found')).toBeInTheDocument()
  })

  it('closes the sheet on Escape', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MilanApp therapists={testTherapists} studios={testStudios} />)

    const saraCard = screen
      .getByText('Sara Bianchi')
      .closest('[data-therapist="t1"]') as HTMLElement
    await user.click(within(saraCard).getByRole('button', { name: '15:00' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
