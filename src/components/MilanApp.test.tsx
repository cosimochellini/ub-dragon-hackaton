import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MilanApp } from './MilanApp'
import { renderWithRouter } from '@/test/render'
import { testStudios, testTherapists } from '@/test/fixtures'
import type { Therapist } from '@/lib/types'

// Replace the Leaflet map with a lightweight stub exposing two taps: a group
// (≥2 therapists) and a single therapist. This lets us exercise MilanApp's
// group-focus wiring without booting Leaflet (which needs a real layout).
vi.mock('./map/MapView', () => ({
  MapView: ({
    therapists,
    onSelect,
  }: {
    therapists: Therapist[]
    onSelect: (id: string, groupTherapistIds?: string[]) => void
  }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onSelect(
            therapists[0].id,
            therapists.slice(0, 2).map((t) => t.id),
          )
        }
      >
        tap-group
      </button>
      <button
        type="button"
        onClick={() => onSelect(therapists[2].id, [therapists[2].id])}
      >
        tap-single
      </button>
    </div>
  ),
}))

/** The carousel renders one profile `<Link>` per therapist; count them. */
const cardCount = () =>
  screen.getAllByRole('link', { name: /profile/i }).length

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

describe('MilanApp map group focus', () => {
  it('narrows the carousel to a tapped group; Show all and filter changes reset it', async () => {
    const user = userEvent.setup()
    renderWithRouter(
      <MilanApp therapists={testTherapists} studios={testStudios} />,
    )
    await user.click(screen.getByRole('button', { name: 'Map' }))

    // Default Individual + Any filter → the full list of 6.
    expect(cardCount()).toBe(6)

    // Tapping a group (2 therapists) narrows the carousel to just those two.
    await user.click(screen.getByRole('button', { name: 'tap-group' }))
    expect(cardCount()).toBe(2)

    // The "Show all" pill restores the full list.
    await user.click(screen.getByRole('button', { name: /show all/i }))
    expect(cardCount()).toBe(6)

    // A single-therapist tap selects without narrowing the list.
    await user.click(screen.getByRole('button', { name: 'tap-single' }))
    expect(screen.queryByRole('button', { name: /show all/i })).toBeNull()
    expect(cardCount()).toBe(6)

    // Focus again, then a filter change drops the focus back to the (new) list.
    await user.click(screen.getByRole('button', { name: 'tap-group' }))
    expect(cardCount()).toBe(2)
    await user.click(screen.getByRole('button', { name: 'Couples' }))
    expect(screen.queryByRole('button', { name: /show all/i })).toBeNull()
    expect(cardCount()).toBe(4)
  })
})
