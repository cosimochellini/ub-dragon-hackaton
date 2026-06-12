import { Suspense, lazy, useEffect, useState } from 'react'
import { StylizedMap } from './StylizedMap'
import { MapErrorBoundary } from './MapErrorBoundary'
import type { MapProps } from './props'

const RealMap = lazy(() => import('./RealMap'))

/**
 * Map slot for the directory. Leaflet has no SSR support (it touches the DOM on
 * import), so the server and the first client render emit the stylized SVG map
 * — identical markup, no hydration mismatch — then we swap to the real Leaflet
 * map once mounted in the browser. The SVG map is also the graceful fallback if
 * the Leaflet chunk fails to load (error boundary) or while it loads (Suspense).
 */
export function MapView(props: MapProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <StylizedMap {...props} />

  return (
    <MapErrorBoundary fallback={<StylizedMap {...props} />}>
      <Suspense fallback={<StylizedMap {...props} />}>
        <RealMap {...props} />
      </Suspense>
    </MapErrorBoundary>
  )
}
