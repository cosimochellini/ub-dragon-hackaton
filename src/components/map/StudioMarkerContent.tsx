import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/icon/Icon'
import { selectedTherapistOf } from '@/lib/studios'
import type { StudioGroup } from '@/lib/studios'
import type { ReactNode } from 'react'

/**
 * Pixel size of the marker's center element (the dot / count chip / avatar) per
 * state. Single source of truth for both the rendered element and the Leaflet
 * `iconSize`/`iconAnchor`, so the pin stays centered if a size is ever tweaked.
 */
const CENTER_PX = { active: 44, cluster: 34, single: 18 } as const

/**
 * Pixel size of the marker's center element. The decorative ring and the label
 * overflow this box, so it doubles as the Leaflet `iconSize`/`iconAnchor` basis
 * for centering the pin on its coordinate.
 */
export function studioMarkerSize(
  group: StudioGroup,
  selectedId: string | null,
): number {
  const active = group.therapists.some((t) => t.id === selectedId)
  if (active) return CENTER_PX.active
  return group.therapists.length > 1 ? CENTER_PX.cluster : CENTER_PX.single
}

/**
 * The visual of a studio marker — fuzzy radius, center (dot / count / avatar)
 * and area label — laid out around the origin of a relative box sized to its
 * center element. Pure and click-free so it is shared by the stylized SVG map
 * (wrapped in a button) and the Leaflet map (rendered into a `divIcon`).
 */
export function StudioMarkerContent({
  group,
  selectedId,
}: {
  group: StudioGroup
  selectedId: string | null
}) {
  const { studio, therapists } = group
  const count = therapists.length
  const active = therapists.some((t) => t.id === selectedId)
  const selected = selectedTherapistOf(group, selectedId)
  const isUnobravo = studio.type === 'unobravo'
  // Same value the Leaflet `iconSize`/`iconAnchor` use, so the box the ring and
  // dot are centered within is exactly the box the pin is anchored by.
  const size = studioMarkerSize(group, selectedId)

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
        {/*
          Initials only (no real photo) on purpose: the Leaflet map renders this
          via `renderToStaticMarkup`, which strips React handlers — so Avatar's
          `onError` photo→initials fallback can't run here and a 404 would leave
          a broken image. The illustrated avatar always renders.
        */}
        <Avatar
          initials={selected.initials}
          variant={selected.avatar}
          size={CENTER_PX.active}
        />
        {count > 1 ? (
          <span className="absolute -right-1.5 -bottom-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-candy-600 px-[5px] text-[11px] font-bold text-white">
            +{count - 1}
          </span>
        ) : null}
      </div>
    )
  } else if (count > 1) {
    center = (
      <div
        className="grid place-items-center rounded-full border-[2.5px] border-white bg-candy-600 font-display text-[15px] font-bold text-white shadow-sm"
        style={{ width: CENTER_PX.cluster, height: CENTER_PX.cluster }}
      >
        {count}
      </div>
    )
  } else {
    center = (
      <div
        className="rounded-full border-[2.5px] border-white bg-candy-600 shadow-sm"
        style={{ width: CENTER_PX.single, height: CENTER_PX.single }}
      />
    )
  }

  return (
    // Explicitly sized to `size` (= studioMarkerSize) so `top-1/2 left-1/2`
    // resolves to the box centre regardless of how Leaflet sizes the host
    // element; the ring and centre dot share that centre, and the Leaflet
    // anchor `[size/2, size/2]` lands it on the studio coordinate.
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ease-out"
        style={{
          width: radius,
          height: radius,
          background: fill,
          border: `1.5px dashed ${ringColor}`,
        }}
      />
      <div className="relative">{center}</div>
      <div
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/90 px-[7px] py-0.5 text-[10.5px] font-semibold whitespace-nowrap shadow-xs"
        style={{
          top: active ? 30 : 16,
          color: isUnobravo
            ? 'var(--color-candy-700)'
            : 'var(--color-grey-700)',
        }}
      >
        <Icon name={isUnobravo ? 'office' : 'pin-empty'} size={11} />
        {isUnobravo ? 'Unobravo studio' : studio.area}
      </div>
    </div>
  )
}
