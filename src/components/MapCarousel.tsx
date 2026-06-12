import { useEffect, useRef } from 'react'
import { MapCard } from './therapist/MapCard'
import type { PickHandler } from './therapist/DayStrip'
import type { Studio, Therapist } from '@/lib/types'

/**
 * Horizontal, snap-scrolling strip of compact cards under the map. When the
 * selected pin changes it scrolls that therapist's card into view (one-way:
 * scrolling the strip does not change the selection, which keeps the effect
 * free of feedback loops).
 */
export function MapCarousel({
  list,
  studios,
  selectedId,
  onPick,
}: {
  list: Therapist[]
  studios: Record<string, Studio>
  selectedId: string | null
  onPick: PickHandler
}) {
  const scroller = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!selectedId) return
    const sc = scroller.current
    const el = cardRefs.current[selectedId]
    if (sc && el && typeof sc.scrollTo === 'function') {
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      sc.scrollTo({
        left: Math.max(0, el.offsetLeft - 18),
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    }
  }, [selectedId])

  return (
    <div
      ref={scroller}
      className="no-sb absolute inset-x-0 bottom-[100px] z-30 flex gap-3 overflow-x-auto px-[18px]"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      {list.map((t) => (
        <div
          key={t.id}
          ref={(el) => {
            cardRefs.current[t.id] = el
          }}
          className="shrink-0 basis-[84%]"
          style={{ scrollSnapAlign: 'start' }}
        >
          <MapCard t={t} studios={studios} onPick={onPick} />
        </div>
      ))}
    </div>
  )
}
