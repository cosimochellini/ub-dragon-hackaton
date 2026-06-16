import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MapCarousel } from './MapCarousel'
import { renderWithRouter } from '@/test/render'
import { testStudios, testTherapists } from '@/test/fixtures'

const noop = () => {}

describe('MapCarousel', () => {
  it('renders one card per therapist in the list', () => {
    const list = testTherapists.slice(0, 3)
    renderWithRouter(
      <MapCarousel
        list={list}
        studios={testStudios}
        selectedId={list[0].id}
        onPick={noop}
      />,
    )
    for (const t of list) {
      expect(screen.getByText(t.name)).toBeInTheDocument()
    }
  })

  it('shows prev/next buttons (prev disabled at the start) when there are 2+ cards', () => {
    renderWithRouter(
      <MapCarousel
        list={testTherapists.slice(0, 3)}
        studios={testStudios}
        selectedId={testTherapists[0].id}
        onPick={noop}
      />,
    )
    const prev = screen.getByRole('button', { name: 'Previous' })
    const next = screen.getByRole('button', { name: 'Next' })
    expect(prev).toBeInTheDocument()
    expect(next).toBeInTheDocument()
    // The strip starts scrolled to the first card. The arrow uses aria-disabled
    // (not the native attribute) so it stays focusable for keyboard users.
    expect(prev).toHaveAttribute('aria-disabled', 'true')
  })

  it('hides the scroll buttons when there is a single card', () => {
    renderWithRouter(
      <MapCarousel
        list={testTherapists.slice(0, 1)}
        studios={testStudios}
        selectedId={testTherapists[0].id}
        onPick={noop}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull()
  })

  it('shows the "Show all" pill only when focused and fires onShowAll', async () => {
    const user = userEvent.setup()
    const onShowAll = vi.fn()
    const list = testTherapists.slice(0, 2)
    const { rerender } = renderWithRouter(
      <MapCarousel
        list={list}
        studios={testStudios}
        selectedId={list[0].id}
        onPick={noop}
        focused={false}
        totalCount={testTherapists.length}
        onShowAll={onShowAll}
      />,
    )
    expect(screen.queryByRole('button', { name: /show all/i })).toBeNull()

    rerender(
      <MapCarousel
        list={list}
        studios={testStudios}
        selectedId={list[0].id}
        onPick={noop}
        focused
        totalCount={testTherapists.length}
        onShowAll={onShowAll}
      />,
    )
    const pill = screen.getByRole('button', { name: /show all/i })
    expect(pill).toHaveTextContent(`Showing ${list.length} of ${testTherapists.length}`)

    await user.click(pill)
    expect(onShowAll).toHaveBeenCalledTimes(1)
  })
})
