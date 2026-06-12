import { MapBase } from './MapBase'
import { StudioCircle } from './StudioCircle'
import { Icon } from '@/components/icon/Icon'
import { groupStudios } from '@/lib/studios'
import type { Studio, Therapist } from '@/lib/types'

export function StylizedMap({
  therapists,
  studios,
  selectedId,
  onSelect,
}: {
  therapists: Therapist[]
  studios: Record<string, Studio>
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const groups = groupStudios(therapists, studios)
  return (
    <div className="absolute inset-0 overflow-hidden bg-cream">
      <MapBase />
      {groups.map((g) => (
        <StudioCircle
          key={g.studio.id}
          group={g}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-[7px] text-[11.5px] font-medium text-grey-700 shadow-sm backdrop-blur-md">
          <Icon name="pin-empty" size={14} color="var(--color-candy-600)" />
          Approximate areas — exact address after booking
        </div>
      </div>
    </div>
  )
}
