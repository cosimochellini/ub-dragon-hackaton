/**
 * Whether the user has asked the OS to minimize motion. Read at call time so it
 * always reflects the current setting, and shared by the map/carousel animations
 * so they degrade to instant moves consistently. Browser-only (callers run in
 * effects / event handlers, never during SSR).
 */
export function prefersReducedMotion(): boolean {
  return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
}
