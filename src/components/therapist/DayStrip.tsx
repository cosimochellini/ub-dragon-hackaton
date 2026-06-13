import { useState } from 'react'
import { SlotChip } from '@/components/ui/SlotChip'
import type { Day, Therapist } from '@/lib/types'

export type PickHandler = (t: Therapist, day: Day, slot: string) => void

function dayShortLabel(day: Day): string {
  if (day.label === 'Today') return 'Today'
  if (day.label === 'Tomorrow') return 'Tmrw'
  return day.dow
}

export function DayStrip({ t, onPick }: { t: Therapist; onPick: PickHandler }) {
  // Lazy initial state: compute the first day-with-slots once, not every render.
  const [activeIndex, setActiveIndex] = useState(() => {
    const firstWithSlots = t.days.findIndex((d) => d.slots.length > 0)
    return Math.max(firstWithSlots, 0)
  })
  const day = t.days.at(activeIndex) ?? t.days.at(0)

  if (!day) {
    return (
      <span className="text-[12.5px] text-grey-500">
        No availability this week.
      </span>
    )
  }

  return (
    <div>
      <div className="no-sb -mx-0.5 flex gap-1.5 overflow-x-auto pb-1">
        {t.days.map((d, i) => {
          const has = d.slots.length > 0
          const on = i === activeIndex
          return (
            <button
              key={d.key}
              type="button"
              disabled={!has}
              aria-pressed={has ? on : undefined}
              onClick={() => setActiveIndex(i)}
              className={`flex w-[50px] shrink-0 flex-col items-center gap-0.5 rounded-[14px] border-0 py-[7px] transition-all duration-[120ms] ease-out ${
                on
                  ? 'bg-candy-600 text-white'
                  : has
                    ? 'cursor-pointer bg-grey-100 text-grey-900'
                    : 'cursor-default bg-transparent text-grey-400 opacity-60'
              }`}
            >
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.02em]">
                {dayShortLabel(d)}
              </span>
              <span className="font-display text-[16px] font-bold leading-none">
                {d.day}
              </span>
              <span
                className={`mt-px h-1 w-1 rounded-full ${
                  has ? (on ? 'bg-white' : 'bg-candy-500') : 'bg-transparent'
                }`}
              />
            </button>
          )
        })}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-[7px]">
        {day.slots.length > 0 ? (
          day.slots.map((s) => (
            <SlotChip key={s} onClick={() => onPick(t, day, s)}>
              {s}
            </SlotChip>
          ))
        ) : (
          <span className="text-[12.5px] text-grey-500">
            No free slots that day.
          </span>
        )}
      </div>
    </div>
  )
}
