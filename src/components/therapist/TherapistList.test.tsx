import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TherapistList } from './TherapistList'
import { testStudios, testTherapists } from '@/test/fixtures'
import type { Therapist } from '@/lib/types'

// 12 valid therapists: clone a real fixture (so days/services/studio are valid)
// and give each a unique id/name. jsdom has no IntersectionObserver, so reveal
// is driven by clicking the fallback button — exactly the keyboard/no-IO path.
const base = testTherapists[0]
const many: Therapist[] = Array.from({ length: 12 }, (_, i) => ({
  ...base,
  id: `gen-${i}`,
  name: `Therapist ${i}`,
  initials: `T${i}`,
}))

function cardCount(): number {
  return document.querySelectorAll('[data-therapist]').length
}

describe('TherapistList progressive reveal', () => {
  it('renders the first page, then reveals more on click', async () => {
    const user = userEvent.setup()
    render(<TherapistList list={many} studios={testStudios} onPick={vi.fn()} />)

    // First paint: only the initial 10 of 12.
    expect(cardCount()).toBe(10)
    expect(screen.getByText('Showing 10 of 12 therapists')).toBeInTheDocument()
    expect(
      screen.queryByText(/That's everyone with a studio in Milan/),
    ).toBeNull()

    // Reveal the rest via the accessible fallback button.
    await user.click(
      screen.getByRole('button', { name: 'Show more therapists' }),
    )

    expect(cardCount()).toBe(12)
    expect(screen.getByText('Showing 12 of 12 therapists')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show more therapists' }),
    ).toBeNull()
    expect(
      screen.getByText(/That's everyone with a studio in Milan/),
    ).toBeInTheDocument()
  })

  it('resets the visible window when remounted under a new key (filter change)', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <TherapistList key="a" list={many} studios={testStudios} onPick={vi.fn()} />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Show more therapists' }),
    )
    expect(cardCount()).toBe(12)

    // A new key is how the parent reacts to a filter change: remount, which
    // must drop the window back to the first page (and scroll to top).
    rerender(
      <TherapistList key="b" list={many} studios={testStudios} onPick={vi.fn()} />,
    )
    expect(cardCount()).toBe(10)
  })

  it('shows everyone immediately when the list fits the first page', () => {
    render(
      <TherapistList
        list={testTherapists}
        studios={testStudios}
        onPick={vi.fn()}
      />,
    )

    expect(cardCount()).toBe(testTherapists.length)
    expect(
      screen.queryByRole('button', { name: 'Show more therapists' }),
    ).toBeNull()
    expect(
      screen.getByText(/That's everyone with a studio in Milan/),
    ).toBeInTheDocument()
  })
})
