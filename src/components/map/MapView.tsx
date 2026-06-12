import { Suspense, lazy, useSyncExternalStore } from 'react'
import type { ComponentType } from 'react'
import { StylizedMap } from './StylizedMap'
import { MapErrorBoundary } from './MapErrorBoundary'
import type { MapProps } from './props'

// Stable no-op subscription: the "mounted" snapshot never changes after the
// first client render, so there is nothing to subscribe to.
const noop = () => {}
const subscribe = () => noop

// Leaflet has no SSR support — it touches window/document on import. Beyond not
// rendering it on the server, the *server bundle must not reference the chunk at
// all*: the Netlify function bundler traces and hoists dynamic-import chunks, so
// a server-reachable `import('./RealMap')` pulls Leaflet's top-level code into
// the function and crashes it at cold start with "window is not defined".
// Guarding on the compile-time `import.meta.env.SSR` flag lets the SSR build
// dead-code-eliminate the import entirely, while the client build keeps it and
// lazy-loads the real map after mount.
const RealMap: ComponentType<MapProps> | null = import.meta.env.SSR
  ? null
  : lazy(() => import('./RealMap'))

/**
 * Map slot for the directory. The server and the first client render emit the
 * stylized SVG map — identical markup, no hydration mismatch — then we swap to
 * the real Leaflet map once mounted in the browser. The SVG map is also the
 * graceful fallback if the Leaflet chunk fails to load (error boundary) or while
 * it loads (Suspense).
 */
export function MapView(props: MapProps) {
  // Client-only gate without an effect-driven state flip: the server and the
  // first hydration render see `false` (stylized SVG — no hydration mismatch),
  // then the client re-renders with `true` and swaps in the real map.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  if (!mounted || !RealMap) return <StylizedMap {...props} />

  return (
    <MapErrorBoundary fallback={<StylizedMap {...props} />}>
      <Suspense fallback={<StylizedMap {...props} />}>
        <RealMap {...props} />
      </Suspense>
    </MapErrorBoundary>
  )
}
