import { Icon } from '@/components/icon/Icon'
import { studioOf } from '@/lib/studios'
import type { Studio, Therapist } from '@/lib/types'

export function StudioRow({
  t,
  studios,
}: {
  t: Therapist
  studios: Record<string, Studio>
}) {
  const studio = studioOf(t, studios)
  if (!studio) return null
  const isUnobravo = studio.type === 'unobravo'
  return (
    <div className="mt-3 flex items-center gap-1.5">
      <Icon
        name={isUnobravo ? 'office' : 'pin-empty'}
        size={15}
        color="var(--color-candy-600)"
      />
      <span className="text-[12.5px] font-medium text-grey-700">
        {studio.name} · {studio.area}, Milan
      </span>
    </div>
  )
}
