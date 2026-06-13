import { DayStrip } from '@/components/therapist/DayStrip'
import type { PickHandler } from '@/components/therapist/DayStrip'
import type { Therapist } from '@/lib/types'

/** "Book a free intro call" panel on the profile — reuses the directory DayStrip. */
export function BookingPanel({
  t,
  onPick,
}: {
  t: Therapist
  onPick: PickHandler
}) {
  return (
    <div className="rounded-[20px] border border-grey-200 bg-white p-4 shadow-xs">
      <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-grey-500">
        Free intro call · 50 min
      </div>
      <DayStrip t={t} onPick={onPick} />
    </div>
  )
}
