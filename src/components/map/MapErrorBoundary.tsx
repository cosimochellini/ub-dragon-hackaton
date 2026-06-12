import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

/**
 * Guards the lazily-loaded Leaflet map. If its chunk fails to load or it throws
 * at runtime, render the `fallback` (the stylized SVG map) instead of crashing
 * the whole directory screen.
 */
export class MapErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Leaflet map failed, falling back to stylized map', error, info)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
