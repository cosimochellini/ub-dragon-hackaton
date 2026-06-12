import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/icon/Icon'
import type { StudioGroup } from '@/lib/studios'
import type { ReactNode } from 'react'

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
  const active = therapists.some((t) => t.id === selectedId)
  const selected = therapists.find((t) => t.id === selectedId) ?? therapists[0]
  const isUnobravo = studio.type === 'unobravo'

  const ringColor = active ? 'rgba(211,60,0,0.6)' : 'rgba(211,60,0,0.45)'
  const fill = active ? 'rgba(255,87,34,0.20)' : 'rgba(255,87,34,0.12)'
  const radius = active ? (count > 1 ? 124 : 112) : count > 1 ? 104 : 88

  let center: ReactNode
  if (active) {
    center = (
      <div
        className="relative"
        style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))' }}
      >
        <Avatar initials={selected.initials} variant={selected.avatar} size={44} />
        {count > 1 ? (
          <span className="absolute -right-1.5 -bottom-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-candy-600 px-[5px] text-[11px] font-bold text-white">
            +{count - 1}
          </span>
        ) : null}
      </div>
    )
  } else if (count > 1) {
    center = (
      <div className="grid h-[34px] w-[34px] place-items-center rounded-full border-[2.5px] border-white bg-candy-600 font-display text-[15px] font-bold text-white shadow-sm">
        {count}
      </div>
    )
  } else {
    center = (
      <div className="h-[18px] w-[18px] rounded-full border-[2.5px] border-white bg-candy-600 shadow-sm" />
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(selected.id)}
      aria-label={`${isUnobravo ? 'Unobravo studio' : 'Private studio'} in ${studio.area} — ${count} therapist${count > 1 ? 's' : ''}`}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0"
      style={{ left: `${studio.map.x}%`, top: `${studio.map.y}%`, zIndex: active ? 5 : 2 }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ease-out"
        style={{ width: radius, height: radius, background: fill, border: `1.5px dashed ${ringColor}` }}
      />
      <div className="relative">{center}</div>
      <div
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/90 px-[7px] py-0.5 text-[10.5px] font-semibold whitespace-nowrap shadow-xs"
        style={{
          top: active ? 30 : 16,
          color: isUnobravo ? 'var(--color-candy-700)' : 'var(--color-grey-700)',
        }}
      >
        <Icon name={isUnobravo ? 'office' : 'pin-empty'} size={11} />
        {isUnobravo ? 'Unobravo studio' : studio.area}
      </div>
    </button>
  )
}
