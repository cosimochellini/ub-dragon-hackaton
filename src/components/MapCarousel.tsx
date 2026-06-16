import { useCallback, useEffect, useRef, useState } from 'react'
import { MapCard } from './therapist/MapCard'
import type { PickHandler } from './therapist/DayStrip'
import { Icon } from '@/components/icon/Icon'
import { prefersReducedMotion } from '@/lib/motion'
import type { Studio, Therapist } from '@/lib/types'

/** Flex `gap-3` between cards, in px — used to size one scroll step. */
const CARD_GAP = 12

/**
 * Horizontal, snap-scrolling strip of compact cards under the map. When the
 * selected pin changes it scrolls that therapist's card into view (one-way:
 * scrolling the strip does not change the selection, which keeps the effect
 * free of feedback loops). `< >` buttons scroll one card at a time and disable
 * at the ends; when a map group is focused, a "Show all" pill restores the
 * full list.
 */
export function MapCarousel({
  list,
  studios,
  selectedId,
  onPick,
  focused = false,
  totalCount,
  onShowAll,
}: {
  list: Therapist[]
  studios: Record<string, Studio>
  selectedId: string | null
  onPick: PickHandler
  /** Whether the strip is narrowed to a tapped map group. */
  focused?: boolean
  /** Size of the full (unfocused) filtered list, shown in the pill. */
  totalCount?: number
  /** Clear the group focus and show every therapist again. */
  onShowAll?: () => void
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const cardElementsRef = useRef<Record<string, HTMLDivElement | null>>({})
  // The strip always mounts scrolled to the first card, and with 90%-wide cards
  // any 2+ cards overflow — so these defaults are accurate at rest and the
  // `onScroll` handler keeps them current as the strip moves. (The parent
  // remounts this via a `key` per focus, resetting the scroll position for
  // free — no syncing effect needed, mirroring TherapistList.)
  const [edges, setEdges] = useState({ start: true, end: false })

  // Recompute which ends are reached on every scroll (event-driven, so it never
  // adjusts state inside an effect). Bail out when unchanged to avoid churn
  // during a smooth scroll.
  const updateEdges = useCallback(() => {
    const sc = scrollerRef.current
    if (!sc) return
    const max = sc.scrollWidth - sc.clientWidth
    const start = sc.scrollLeft <= 1
    const end = sc.scrollLeft >= max - 1
    setEdges((prev) =>
      prev.start === start && prev.end === end ? prev : { start, end },
    )
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const sc = scrollerRef.current
    const el = cardElementsRef.current[selectedId]
    if (sc && el && typeof sc.scrollTo === 'function') {
      sc.scrollTo({
        left: el.offsetLeft,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      })
    }
  }, [selectedId])

  const scrollByCards = useCallback((dir: 1 | -1) => {
    const sc = scrollerRef.current
    if (!sc) return
    // No-op at the matching edge by reading live scroll position (not the
    // `edges` state), so the arrows can stay focusable — toggling the native
    // `disabled` attribute mid-interaction would blur a keyboard user's focus.
    const max = sc.scrollWidth - sc.clientWidth
    if (dir < 0 && sc.scrollLeft <= 1) return
    if (dir > 0 && sc.scrollLeft >= max - 1) return
    const card = sc.querySelector<HTMLElement>('[data-card]')
    const step = (card?.offsetWidth ?? sc.clientWidth * 0.9) + CARD_GAP
    sc.scrollBy({
      left: dir * step,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }, [])

  const showArrows = list.length > 1

  return (
    <div className="absolute inset-x-0 bottom-[100px] z-30 flex flex-col items-center gap-2">
      {focused && onShowAll ? (
        <button
          type="button"
          onClick={onShowAll}
          aria-label={`Showing ${list.length}${
            typeof totalCount === 'number' ? ` of ${totalCount}` : ''
          } — show all therapists`}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-white px-[14px] py-[7px] text-[12.5px] font-semibold text-grey-900 shadow-md transition-colors hover:bg-grey-50"
        >
          <span>
            Showing {list.length}
            {typeof totalCount === 'number' ? ` of ${totalCount}` : ''}
          </span>
          <span className="text-grey-400" aria-hidden="true">
            ·
          </span>
          <span className="text-candy-600">Show all ✕</span>
        </button>
      ) : null}

      {/* Arrows sit BESIDE the strip (not overlaid) so they never cover a card,
          and the whole row is padded in from the frame so nothing overflows. */}
      <div className="flex w-full items-center gap-1.5 px-2">
        {showArrows ? (
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-disabled={edges.start}
            aria-label="Previous"
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-0 bg-white shadow-md transition-opacity ${
              edges.start ? 'cursor-default opacity-40' : 'cursor-pointer'
            }`}
          >
            <Icon name="arrow-left" size={18} color="var(--color-grey-900)" />
          </button>
        ) : null}

        <div
          ref={scrollerRef}
          onScroll={updateEdges}
          className="no-sb flex min-w-0 flex-1 gap-3 overflow-x-auto"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {list.map((t) => (
            <div
              key={t.id}
              data-card
              ref={(el) => {
                cardElementsRef.current[t.id] = el
              }}
              className="shrink-0 basis-full"
              style={{ scrollSnapAlign: 'start' }}
            >
              <MapCard t={t} studios={studios} onPick={onPick} />
            </div>
          ))}
        </div>

        {showArrows ? (
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-disabled={edges.end}
            aria-label="Next"
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-0 bg-white shadow-md transition-opacity ${
              edges.end ? 'cursor-default opacity-40' : 'cursor-pointer'
            }`}
          >
            <Icon
              name="arrow-left"
              size={18}
              color="var(--color-grey-900)"
              className="rotate-180"
            />
          </button>
        ) : null}
      </div>
    </div>
  )
}
