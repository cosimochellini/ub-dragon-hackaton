import { Icon } from '@/components/icon/Icon'
import { studioOf } from '@/lib/studios'
import type { Day, Studio, Therapist } from '@/lib/types'

export function SlotSummary({
  t,
  day,
  slot,
  studios,
}: {
  t: Therapist
  day: Day
  slot: string
  studios: Record<string, Studio>
}) {
  const studio = studioOf(t, studios)
  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-cream px-[14px] py-[13px]">
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ background: 'rgba(211,60,0,0.10)' }}
      >
        <Icon name="calendar-check" size={20} color="var(--color-candy-700)" />
      </div>
      <div className="flex-1">
        <div className="text-[14px] font-semibold text-candy-800">
          {day.dateLabel} · {slot}
        </div>
        <div className="mt-px text-[12px] text-candy-800/75">
          50 min · In person{studio ? `, ${studio.area}` : ''}
        </div>
      </div>
    </div>
  )
}
