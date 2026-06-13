import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TherapistList } from './TherapistList'
import { renderWithRouter } from '@/test/render'
import { testStudios, testTherapists } from '@/test/fixtures'
import type { Therapist } from '@/lib/types'

// Clone a real fixture (so days/services/studio are valid) and give each a
// unique id/name. jsdom has no IntersectionObserver, so most tests drive reveal
// via the fallback button — exactly the keyboard/no-IO path.
const base = testTherapists[0]
function cloneMany(count: number): Therapist[] {
  return Array.from({ length: count }, (_, i) => ({
    ...base,
    id: `gen-${i}`,
    name: `Therapist ${i}`,
    initials: `T${i}`,
  }))
}
const many = cloneMany(12)
const lots = cloneMany(25)

function cardCount(): number {
  return document.querySelectorAll('[data-therapist]').length
}

describe('TherapistList progressive reveal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('auto-reveals via IntersectionObserver until everything is shown', () => {
    class ControllableIO {
      readonly cb: IntersectionObserverCallback
      readonly root = null
      readonly rootMargin = ''
      readonly thresholds: ReadonlyArray<number> = []
      constructor(cb: IntersectionObserverCallback) {
        this.cb = cb
        instances.push(this)
      }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {
        disconnects += 1
      }
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
    }
    const instances: ControllableIO[] = []
    let disconnects = 0
    vi.stubGlobal('IntersectionObserver', ControllableIO)

    function fireLatest(): void {
      const io = instances.at(-1)!
      act(() => {
        io.cb(
          [{ isIntersecting: true } as unknown as IntersectionObserverEntry],
          io as unknown as IntersectionObserver,
        )
      })
    }

    renderWithRouter(<TherapistList list={lots} studios={testStudios} onPick={vi.fn()} />)
    expect(cardCount()).toBe(10)

    // Sentinel in view → reveal a page; the component re-observes a fresh
    // sentinel each time so it keeps filling rather than stalling.
    fireLatest()
    expect(cardCount()).toBe(20)
    fireLatest()
    expect(cardCount()).toBe(25) // clamped at total

    // All shown: the sentinel button is gone and the observer was torn down.
    expect(
      screen.queryByRole('button', { name: 'Show more therapists' }),
    ).toBeNull()
    expect(
      screen.getByText(/That's everyone with a studio in Milan/),
    ).toBeInTheDocument()
    expect(disconnects).toBeGreaterThanOrEqual(2)
  })

  it('renders the first page, then reveals more on click', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TherapistList list={many} studios={testStudios} onPick={vi.fn()} />)

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
    const { rerender } = renderWithRouter(
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

  it('renders the empty state (no button/footer) for an empty list', () => {
    renderWithRouter(<TherapistList list={[]} studios={testStudios} onPick={vi.fn()} />)

    expect(cardCount()).toBe(0)
    expect(screen.getByText('No therapists match')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show more therapists' }),
    ).toBeNull()
    expect(
      screen.queryByText(/That's everyone with a studio in Milan/),
    ).toBeNull()
  })

  it('shows everyone immediately when the list fits the first page', () => {
    renderWithRouter(
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
