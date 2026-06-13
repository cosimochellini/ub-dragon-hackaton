import 'leaflet/dist/leaflet.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { divIcon } from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { MapDisclaimer } from './MapDisclaimer'
import { StudioMarkerContent, studioMarkerSize } from './StudioMarkerContent'
import { ClusterMarkerContent, clusterMarkerSize } from './ClusterMarkerContent'
import type { MapProps } from './props'
import { groupStudios, selectedTherapistOf } from '@/lib/studios'
import type { StudioGroup } from '@/lib/studios'
import { clusterGroups } from '@/lib/cluster'
import type { Studio, Therapist } from '@/lib/types'

/** Map centre when nothing is selected — roughly central Milan. */
const MILAN: [number, number] = [45.4668, 9.1905]
const INITIAL_ZOOM = 13
/** Studios whose pins fall within this screen-space radius merge into a cluster. */
const CLUSTER_RADIUS_PX = 72
/** Max zoom a cluster click expands to (CARTO tiles go to 20). */
const EXPAND_MAX_ZOOM = 18

/** Coordinates of the selected therapist's studio, or null if none resolves. */
function selectedStudioCoords(
  selectedId: string | null,
  therapists: Therapist[],
  // Widened like `groupStudios`: a therapist may reference an unknown studio.
  studios: Record<string, Studio | undefined>,
): [number, number] | null {
  if (!selectedId) return null
  const t = therapists.find((x) => x.id === selectedId)
  const studio = t ? studios[t.studio] : undefined
  return studio ? [studio.coords.lat, studio.coords.lng] : null
}

/**
 * Pans the map to the selected studio whenever the selection changes (mirroring
 * the carousel auto-scroll), honouring the user's reduced-motion preference.
 */
function RecenterOnSelect({
  selectedId,
  therapists,
  studios,
}: Omit<MapProps, 'onSelect'>) {
  const map = useMap()
  // Read the latest data without making it a pan trigger: we want to pan only
  // when the *selection* changes, not when the filtered list re-references on a
  // filter change (which would discard a viewport the user had panned/zoomed).
  // With the static mock data a selected studio's coords never change beneath
  // us; a dynamic data source would need coords re-added as a trigger.
  const dataRef = useRef({ therapists, studios })
  // Keep the latest data in the ref without touching it during render (refs are
  // a commit-phase concern): this runs after every commit.
  useEffect(() => {
    dataRef.current = { therapists, studios }
  })
  // Pan only when the selection actually changes value. Seeding the ref with the
  // mount selection skips the redundant initial pan (MapContainer's `center`
  // already frames it), and comparing values — rather than a one-shot flag —
  // keeps this idempotent under React StrictMode's double effect invocation.
  const prevSelectedIdRef = useRef(selectedId)
  useEffect(() => {
    if (selectedId === prevSelectedIdRef.current) return
    prevSelectedIdRef.current = selectedId
    const { therapists: ts, studios: ss } = dataRef.current
    const coords = selectedStudioCoords(selectedId, ts, ss)
    if (!coords) return
    const reduceMotion = globalThis.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    map.panTo(coords, { animate: !reduceMotion })
  }, [selectedId, map])
  return null
}

/**
 * A Leaflet `divIcon` whose content is wrapped in a real `<button>`. Leaflet's
 * own `keyboard` option advertises `role="button"` but only activates markers
 * that bind a popup — ours don't, so a native button is what makes them truly
 * keyboard-operable: Enter/Space dispatch a click that bubbles to Leaflet's icon
 * click handler. It also carries the accessible name (Leaflet drops `alt` on
 * non-image icons). Markers therefore pass `keyboard={false}` so the button is
 * the single focusable control.
 */
function buttonIcon(content: ReactNode, label: string, size: number) {
  return divIcon({
    html: renderToStaticMarkup(
      <button
        type="button"
        aria-label={label}
        className="block cursor-pointer border-0 bg-transparent p-0"
      >
        {content}
      </button>,
    ),
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

/** A single studio's marker (selectable), identical to the pre-cluster pin. */
function studioMarker(
  g: StudioGroup,
  selectedId: string | null,
  onSelect: (id: string) => void,
) {
  const { studio, therapists: members } = g
  const count = members.length
  const active = members.some((t) => t.id === selectedId)
  const isUnobravo = studio.type === 'unobravo'
  const size = studioMarkerSize(g, selectedId)
  const label = `${isUnobravo ? 'Unobravo studio' : 'Private studio'} in ${studio.area} — ${count} therapist${count > 1 ? 's' : ''}`
  return (
    <Marker
      key={studio.id}
      position={[studio.coords.lat, studio.coords.lng]}
      icon={buttonIcon(
        <StudioMarkerContent group={g} selectedId={selectedId} />,
        label,
        size,
      )}
      keyboard={false}
      title={label}
      zIndexOffset={active ? 1000 : 0}
      eventHandlers={{
        click: () => onSelect(selectedTherapistOf(g, selectedId).id),
      }}
    />
  )
}

/**
 * Renders the studio pins, dynamically merging nearby studios into cluster pins
 * at the current zoom. Clusters are recomputed on `zoomend` (projecting each
 * studio to pixel space at the live zoom), so zooming out accretes pins and
 * zooming in splits them — they're never static. A cluster pin click zooms in
 * to expand it; a single-studio pin selects, exactly as before.
 */
function ClusterLayer({
  groups,
  selectedId,
  onSelect,
}: {
  groups: StudioGroup[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())

  useEffect(() => {
    const onZoomEnd = () => setZoom(map.getZoom())
    map.on('zoomend', onZoomEnd)
    return () => {
      map.off('zoomend', onZoomEnd)
    }
  }, [map])

  const clusters = useMemo(
    () =>
      clusterGroups(
        groups,
        (lat, lng) => {
          const pt = map.project([lat, lng], zoom)
          return { x: pt.x, y: pt.y }
        },
        CLUSTER_RADIUS_PX,
      ),
    [groups, map, zoom],
  )

  const expand = useCallback(
    (lat: number, lng: number) => {
      const reduceMotion = globalThis.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      const targetZoom = Math.min(map.getZoom() + 2, EXPAND_MAX_ZOOM)
      map.setView([lat, lng], targetZoom, { animate: !reduceMotion })
    },
    [map],
  )

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.groups.length === 1) {
          return studioMarker(cluster.groups[0], selectedId, onSelect)
        }
        const studioCount = cluster.groups.length
        const active = cluster.groups.some((g) =>
          g.therapists.some((t) => t.id === selectedId),
        )
        const size = clusterMarkerSize(active)
        const label = `${studioCount} studios — ${cluster.therapistCount} therapists, zoom in to expand`
        return (
          <Marker
            key={cluster.key}
            position={[cluster.lat, cluster.lng]}
            icon={buttonIcon(
              <ClusterMarkerContent
                studioCount={studioCount}
                therapistCount={cluster.therapistCount}
                active={active}
              />,
              label,
              size,
            )}
            keyboard={false}
            title={label}
            zIndexOffset={active ? 1000 : 0}
            eventHandlers={{ click: () => expand(cluster.lat, cluster.lng) }}
          />
        )
      })}
    </>
  )
}

/**
 * Realistic, interactive Leaflet map (CARTO Positron tiles, no API key). Renders
 * the same custom studio markers as the stylized map via `divIcon`, keeping the
 * marker↔carousel selection sync, and merges nearby studios into cluster pins
 * that re-form on zoom. Client-only — loaded lazily by `MapView` because Leaflet
 * touches `window`/`document` on import (no SSR).
 */
export default function RealMap({
  therapists,
  studios,
  selectedId,
  onSelect,
}: MapProps) {
  const groups = useMemo(
    () => groupStudios(therapists, studios),
    [therapists, studios],
  )
  // `center` is only read on mount by MapContainer; recomputing it per render is
  // harmless (changing it later does not move the map).
  const center = selectedStudioCoords(selectedId, therapists, studios) ?? MILAN

  return (
    <div className="absolute inset-0 z-0 isolate bg-cream">
      <MapContainer
        center={center}
        zoom={INITIAL_ZOOM}
        scrollWheelZoom
        className="h-full w-full bg-cream"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains={['a', 'b', 'c', 'd']}
          maxZoom={20}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <ClusterLayer
          groups={groups}
          selectedId={selectedId}
          onSelect={onSelect}
        />
        <RecenterOnSelect
          selectedId={selectedId}
          therapists={therapists}
          studios={studios}
        />
      </MapContainer>
      <MapDisclaimer />
    </div>
  )
}
