import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/icon/Icon'
import { DayStrip } from './DayStrip'
import type { PickHandler } from './DayStrip'
import { studioOf } from '@/lib/studios'
import type { Studio, Therapist } from '@/lib/types'

/** Compact card shown in the map carousel. */
export function MapCard({
  t,
  studios,
  onPick,
}: {
  t: Therapist
  studios: Record<string, Studio>
  onPick: PickHandler
}) {
  const studio = studioOf(t, studios)
  return (
    <div className="box-border w-full rounded-[22px] border border-grey-200 bg-white p-[14px] shadow-md">
      <div className="flex items-center gap-[11px]">
        <Avatar initials={t.initials} variant={t.avatar} size="md" />
        <div className="min-w-0 flex-1">
          <div className="font-display text-[15.5px] font-bold leading-[1.1] text-grey-900">
            {t.name}
          </div>
          {studio ? (
            <div className="mt-[3px] flex items-center gap-[5px]">
              <Icon
                name={studio.type === 'unobravo' ? 'office' : 'pin-empty'}
                size={13}
                color="var(--color-candy-600)"
              />
              <span className="text-[12px] text-grey-600">
                {studio.name} · {studio.area}
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-3">
        <DayStrip t={t} onPick={onPick} />
      </div>
    </div>
  )
}
