import { describe, expect, it } from 'vitest'
import { clusterGroups } from './cluster'
import type { ProjectPoint } from './cluster'
import type { Studio, Therapist } from './types'
import type { StudioGroup } from './studios'

// A trivial projection: treat lng as x and lat as y, 1:1. Distances are then in
// raw coordinate units, so the radius in tests is in those same units.
const project: ProjectPoint = (lat, lng) => ({ x: lng, y: lat })

function group(id: string, lat: number, lng: number, therapists: number): StudioGroup {
  const studio: Studio = {
    id,
    type: 'private',
    name: 'Private studio',
    area: id,
    map: { x: 0, y: 0 },
    coords: { lat, lng },
  }
  return {
    studio,
    therapists: Array.from({ length: therapists }, (_, i) => ({
      id: `${id}-${i}`,
    })) as unknown as Therapist[],
  }
}

describe('clusterGroups', () => {
  it('returns [] for no groups', () => {
    expect(clusterGroups([], project, 10)).toEqual([])
  })

  it('keeps groups farther apart than the radius separate', () => {
    const out = clusterGroups([group('a', 0, 0, 2), group('b', 0, 50, 3)], project, 10)
    expect(out).toHaveLength(2)
    expect(out.map((c) => c.key)).toEqual(['a', 'b'])
    expect(out.map((c) => c.therapistCount)).toEqual([2, 3])
  })

  it('merges groups within the radius and sums therapists', () => {
    const out = clusterGroups([group('a', 0, 0, 2), group('b', 0, 5, 3)], project, 10)
    expect(out).toHaveLength(1)
    expect(out[0].key).toBe('a|b')
    expect(out[0].therapistCount).toBe(5)
    // Centroid of the two members.
    expect(out[0].lng).toBeCloseTo(2.5)
    expect(out[0].lat).toBeCloseTo(0)
  })

  it('separates a far group from a nearby pair', () => {
    const out = clusterGroups(
      [group('a', 0, 0, 1), group('b', 0, 4, 1), group('c', 0, 80, 1)],
      project,
      10,
    )
    expect(out).toHaveLength(2)
    expect(out[0].key).toBe('a|b')
    expect(out[0].groups).toHaveLength(2)
    expect(out[1].key).toBe('c')
  })

  it('clusters change with the projection scale (zoom)', () => {
    const groups = [group('a', 0, 0, 1), group('b', 0, 5, 1)]
    // Zoomed out: coordinates compress, points fall within the radius → merged.
    const out = clusterGroups(groups, (lat, lng) => ({ x: lng, y: lat }), 10)
    expect(out).toHaveLength(1)
    // Zoomed in: same coords projected 10× farther apart → split.
    const zoomedIn = clusterGroups(
      groups,
      (lat, lng) => ({ x: lng * 10, y: lat * 10 }),
      10,
    )
    expect(zoomedIn).toHaveLength(2)
  })
})
