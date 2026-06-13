import { useEffect, useRef, useState } from 'react'
import { TherapistCard } from './TherapistCard'
import type { PickHandler } from './DayStrip'
import type { Studio, Therapist } from '@/lib/types'

/** Cards shown on first paint, and how many more each reveal adds. */
const INITIAL = 10
const STEP = 10

/**
 * The scrollable directory list with client-side progressive reveal. Receives
 * the full filtered list and renders only the first `visible` cards, revealing
 * the next page as the sentinel button scrolls into view (IntersectionObserver)
 * or is activated by keyboard/click.
 *
 * It owns its own scroll container so that container can be the observer root.
 * The parent remounts it via a `key` per filter, which resets both the visible
 * count and the scroll position for free — no syncing effect needed. The full
 * count still lives in the header; this only windows what's painted.
 */
export function TherapistList({
  list,
  studios,
  onPick,
}: {
  list: Therapist[]
  studios: Record<string, Studio>
  onPick: PickHandler
}) {
  const [visible, setVisible] = useState(INITIAL)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLButtonElement | null>(null)

  const total = list.length
  const shown = Math.min(visible, total)
  const allShown = shown >= total

  function revealMore() {
    setVisible((v) => Math.min(v + STEP, total))
  }

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    if (shown >= total) return // everything revealed → no sentinel to watch
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          // Functional update never reads a stale `visible`.
          setVisible((v) => Math.min(v + STEP, total))
        }
      },
      { root, rootMargin: '200px', threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
    // Re-observing after each reveal re-checks intersection (IO only fires on
    // transition), so the list keeps filling while the sentinel stays in view
    // instead of stalling until the next manual scroll.
  }, [shown, total])

  return (
    <div
      ref={scrollRef}
      className="no-sb h-full overflow-y-auto px-[18px] pt-3.5 pb-[120px]"
    >
      <div className="flex flex-col gap-3.5">
        {list.slice(0, shown).map((t) => (
          <TherapistCard key={t.id} t={t} studios={studios} onPick={onPick} />
        ))}

        <span aria-live="polite" className="sr-only">
          Showing {shown} of {total} therapists
        </span>

        {allShown ? (
          <div className="py-1.5 text-center text-[12px] text-grey-500">
            That&apos;s everyone with a studio in Milan, for now.
          </div>
        ) : (
          <button
            ref={sentinelRef}
            type="button"
            onClick={revealMore}
            className="rounded-full py-1.5 text-center text-[12px] font-semibold text-candy-600 underline-offset-2 hover:underline"
          >
            Show more therapists
          </button>
        )}
      </div>
    </div>
  )
}
