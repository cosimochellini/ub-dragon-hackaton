/** Pixel size of the cluster pin's center circle, per state. Doubles as the
 * Leaflet `iconSize`/`iconAnchor` basis so the pin stays centered on its
 * coordinate. */
const CLUSTER_PX = { active: 50, base: 44 } as const

export function clusterMarkerSize(active: boolean): number {
  return active ? CLUSTER_PX.active : CLUSTER_PX.base
}

/**
 * The visual of a multi-studio cluster pin: a fuzzy radius, a candy circle with
 * the aggregate therapist count, and a "{n} studios" label. Pure and click-free
 * (mirrors `StudioMarkerContent`) so it can be rendered into a Leaflet
 * `divIcon`.
 */
export function ClusterMarkerContent({
  studioCount,
  therapistCount,
  active,
}: {
  studioCount: number
  therapistCount: number
  active: boolean
}) {
  const size = clusterMarkerSize(active)
  const radius = active ? 128 : 112

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ease-out"
        style={{
          width: radius,
          height: radius,
          background: active ? 'rgba(255,87,34,0.20)' : 'rgba(255,87,34,0.12)',
          border: `1.5px dashed ${active ? 'rgba(211,60,0,0.6)' : 'rgba(211,60,0,0.45)'}`,
        }}
      />
      <div
        className="relative grid place-items-center rounded-full border-[3px] border-white bg-candy-600 font-display font-bold text-white shadow-sm"
        style={{ width: size, height: size, fontSize: 16 }}
      >
        {therapistCount}
      </div>
      <div
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/90 px-[7px] py-0.5 text-[10.5px] font-semibold whitespace-nowrap text-grey-700 shadow-xs"
        style={{ top: size - 2 }}
      >
        {studioCount} studios
      </div>
    </div>
  )
}
