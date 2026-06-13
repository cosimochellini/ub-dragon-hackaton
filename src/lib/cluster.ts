import type { StudioGroup } from './studios'

/**
 * A set of studio groups merged because they sit within `radiusPx` of each
 * other in screen space at the current zoom. A cluster of one is just a single
 * studio; a cluster of many is rendered as an aggregate pin.
 */
export interface MapCluster {
  /** Stable per membership: the member studio ids joined in input order. */
  key: string
  /** Centroid of the member studios, where the cluster pin is placed. */
  lat: number
  lng: number
  groups: StudioGroup[]
  /** Total therapists across all member studios. */
  therapistCount: number
}

/** Projects a coordinate to pixel space at the zoom being clustered for. */
export type ProjectPoint = (lat: number, lng: number) => { x: number; y: number }

/**
 * Greedy proximity clustering of studio groups in screen space. Each still-free
 * group seeds a cluster and absorbs every other free group whose projected
 * point is within `radiusPx`. Pure (projection is injected), so it's zoom-aware
 * without depending on Leaflet and is unit-testable. Input order is preserved,
 * so the resulting pins render deterministically.
 */
export function clusterGroups(
  groups: StudioGroup[],
  project: ProjectPoint,
  radiusPx: number,
): MapCluster[] {
  const points = groups.map((group) => ({
    group,
    point: project(group.studio.coords.lat, group.studio.coords.lng),
  }))
  const used = new Set<string>()
  const clusters: MapCluster[] = []
  const r2 = radiusPx * radiusPx

  for (const seed of points) {
    if (used.has(seed.group.studio.id)) continue
    used.add(seed.group.studio.id)
    const members = [seed.group]

    for (const other of points) {
      if (used.has(other.group.studio.id)) continue
      const dx = other.point.x - seed.point.x
      const dy = other.point.y - seed.point.y
      if (dx * dx + dy * dy <= r2) {
        used.add(other.group.studio.id)
        members.push(other.group)
      }
    }

    const therapistCount = members.reduce(
      (sum, m) => sum + m.therapists.length,
      0,
    )
    const lat =
      members.reduce((sum, m) => sum + m.studio.coords.lat, 0) / members.length
    const lng =
      members.reduce((sum, m) => sum + m.studio.coords.lng, 0) / members.length
    // Disjoint memberships ⇒ unique; input order is deterministic ⇒ stable.
    const key = members.map((m) => m.studio.id).join('|')

    clusters.push({ key, lat, lng, groups: members, therapistCount })
  }

  return clusters
}
