import { describe, expect, it } from 'vitest'
import { filterTherapists } from './filter'
import { testTherapists } from '@/test/fixtures'

describe('filterTherapists', () => {
  it('individual + any → all 6', () => {
    expect(filterTherapists(testTherapists, 'individual', 'any')).toHaveLength(
      6,
    )
  })

  it('couples + any → t1, t3, t4, t6', () => {
    const r = filterTherapists(testTherapists, 'couples', 'any')
    expect(r.map((t) => t.id)).toEqual(['t1', 't3', 't4', 't6'])
  })

  it('individual + female → t1, t3, t5', () => {
    const r = filterTherapists(testTherapists, 'individual', 'female')
    expect(r.map((t) => t.id)).toEqual(['t1', 't3', 't5'])
  })

  it('couples + male → t4, t6', () => {
    const r = filterTherapists(testTherapists, 'couples', 'male')
    expect(r.map((t) => t.id)).toEqual(['t4', 't6'])
  })

  it('returns empty when nothing matches', () => {
    const maleIndividualOnly = testTherapists.filter((t) => t.id === 't2')
    expect(
      filterTherapists(maleIndividualOnly, 'couples', 'female'),
    ).toHaveLength(0)
  })
})
