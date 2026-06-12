import { CardHead } from './CardHead'
import { StudioRow } from './StudioRow'
import { DayStrip } from './DayStrip'
import type { PickHandler } from './DayStrip'
import type { Studio, Therapist } from '@/lib/types'

export function TherapistCard({
  t,
  studios,
  onPick,
}: {
  t: Therapist
  studios: Record<string, Studio>
  onPick: PickHandler
}) {
  return (
    <div
      data-therapist={t.id}
      className="rounded-[24px] border border-grey-200 bg-white p-4 shadow-xs"
    >
      <CardHead t={t} />
      <StudioRow t={t} studios={studios} />
      <div className="mt-[14px] mb-3 h-px bg-grey-200" />
      <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-grey-500">
        Free intro call · 50 min
      </div>
      <DayStrip t={t} onPick={onPick} />
    </div>
  )
}
