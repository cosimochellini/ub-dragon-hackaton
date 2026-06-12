import { MapBase } from './MapBase'
import { StudioCircle } from './StudioCircle'
import { MapDisclaimer } from './MapDisclaimer'
import { groupStudios } from '@/lib/studios'
import type { MapProps } from './props'

export function StylizedMap({
  therapists,
  studios,
  selectedId,
  onSelect,
}: MapProps) {
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
      <MapDisclaimer />
    </div>
  )
}
