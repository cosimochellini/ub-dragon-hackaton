import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
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
  useEffect(() => {
    const coords = selectedStudioCoords(selectedId, therapists, studios)
    if (!coords) return
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    map.panTo(coords, { animate: !reduceMotion })
  }, [selectedId, therapists, studios, map])
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
  const groups = groupStudios(therapists, studios)
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
        {groups.map((g) => {
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
        })}
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
