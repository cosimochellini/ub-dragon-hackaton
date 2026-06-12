import { describe, expect, it } from 'vitest'
import { groupStudios, studioOf } from './studios'
import { testStudios, testTherapists } from '@/test/fixtures'

describe('groupStudios', () => {
  it('clusters the shared Unobravo studio (t1, t3, t6)', () => {
    const groups = groupStudios(testTherapists, testStudios)
    const ub = groups.find((g) => g.studio.id === 'ub_romana')
    expect(ub).toBeDefined()
    expect(ub?.therapists.map((t) => t.id)).toEqual(['t1', 't3', 't6'])
  })

  it('keeps private studios as singletons', () => {
    const groups = groupStudios(testTherapists, testStudios)
    expect(groups.find((g) => g.studio.id === 'brera')?.therapists).toHaveLength(1)
    expect(groups.find((g) => g.studio.id === 'isola')?.therapists).toHaveLength(1)
    expect(
      groups.find((g) => g.studio.id === 'cittastudi')?.therapists,
    ).toHaveLength(1)
  })

  it('preserves the input list order', () => {
    const groups = groupStudios(testTherapists, testStudios)
    expect(groups.map((g) => g.studio.id)).toEqual([
      'ub_romana',
      'brera',
      'isola',
      'cittastudi',
    ])
  })

  it('returns [] for an empty list', () => {
    expect(groupStudios([], testStudios)).toEqual([])
  })
})

describe('studioOf', () => {
  it('resolves a therapist to their studio', () => {
    expect(studioOf(testTherapists[0], testStudios)?.area).toBe('Porta Romana')
  })
})
