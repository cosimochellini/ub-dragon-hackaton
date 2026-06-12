import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { divIcon } from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { MapDisclaimer } from './MapDisclaimer'
import { StudioMarkerContent, studioMarkerSize } from './StudioMarkerContent'
import type { MapProps } from './props'
import { groupStudios, selectedTherapistOf } from '@/lib/studios'
import type { Studio, Therapist } from '@/lib/types'

/** Map centre when nothing is selected — roughly central Milan. */
const MILAN: [number, number] = [45.4668, 9.1905]
const INITIAL_ZOOM = 13

/** Coordinates of the selected therapist's studio, or null if none resolves. */
function selectedStudioCoords(
  selectedId: string | null,
  therapists: Therapist[],
  studios: Record<string, Studio>,
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
  const dataRef = useRef({ therapists, studios })
  dataRef.current = { therapists, studios }
  useEffect(() => {
    const { therapists: ts, studios: ss } = dataRef.current
    const coords = selectedStudioCoords(selectedId, ts, ss)
    if (!coords) return
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    map.panTo(coords, { animate: !reduceMotion })
  }, [selectedId, map])
  return null
}

/**
 * Realistic, interactive Leaflet map (CARTO Positron tiles, no API key). Renders
 * the same custom studio markers as the stylized map via `divIcon`, keeping the
 * marker↔carousel selection sync. Client-only — loaded lazily by `MapView`
 * because Leaflet touches `window`/`document` on import (no SSR).
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

  // Rebuild markers only when the groups or the selection change, so unrelated
  // re-renders (e.g. opening the booking sheet) don't tear down/recreate the
  // Leaflet marker icons. `onSelect` is a stable state setter.
  const markers = useMemo(
    () =>
      groups.map((g) => {
        const { studio, therapists: members } = g
        const count = members.length
        const active = members.some((t) => t.id === selectedId)
        const isUnobravo = studio.type === 'unobravo'
        const size = studioMarkerSize(g, selectedId)
        const label = `${isUnobravo ? 'Unobravo studio' : 'Private studio'} in ${studio.area} — ${count} therapist${count > 1 ? 's' : ''}`
        const icon = divIcon({
          html: renderToStaticMarkup(
            <StudioMarkerContent group={g} selectedId={selectedId} />,
          ),
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })
        return (
          <Marker
            key={studio.id}
            position={[studio.coords.lat, studio.coords.lng]}
            icon={icon}
            keyboard
            alt={label}
            title={label}
            zIndexOffset={active ? 1000 : 0}
            eventHandlers={{
              click: () => onSelect(selectedTherapistOf(g, selectedId).id),
            }}
          />
        )
      }),
    [groups, selectedId, onSelect],
  )

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
        {markers}
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
