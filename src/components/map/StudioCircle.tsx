import { StudioMarkerContent } from './StudioMarkerContent'
import { selectedTherapistOf } from '@/lib/studios'
import type { StudioGroup } from '@/lib/studios'

export function StudioCircle({
  group,
  selectedId,
  onSelect,
}: {
  group: StudioGroup
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { studio, therapists } = group
  const count = therapists.length
  const isUnobravo = studio.type === 'unobravo'
  const selected = selectedTherapistOf(group, selectedId)

  return (
    <button
      type="button"
      onClick={() => onSelect(selected.id)}
      aria-label={`${isUnobravo ? 'Unobravo studio' : 'Private studio'} in ${studio.area} — ${count} therapist${count > 1 ? 's' : ''}`}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0"
      style={{
        left: `${studio.map.x}%`,
        top: `${studio.map.y}%`,
        zIndex: therapists.some((t) => t.id === selectedId) ? 5 : 2,
      }}
    >
      <StudioMarkerContent group={group} selectedId={selectedId} />
    </button>
  )
}
