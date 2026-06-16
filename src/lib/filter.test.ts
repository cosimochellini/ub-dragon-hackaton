import { describe, expect, it } from 'vitest'
import { filterTherapists } from './filter'
import { testStudios, testTherapists } from '@/test/fixtures'

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

  it('ignores zone when studios are not provided', () => {
    expect(
      filterTherapists(testTherapists, 'individual', 'any', { zone: 'sw' }),
    ).toHaveLength(6)
  })

  it('filters by zone when studios are provided', () => {
    // nw covers Brera (t2) and Isola (t4) among the test studios.
    const nw = filterTherapists(testTherapists, 'individual', 'any', {
      zone: 'nw',
      studios: testStudios,
    })
    expect(nw.map((t) => t.id)).toEqual(['t2', 't4'])

    // se covers Porta Romana (t1, t3, t6) and Città Studi (t5).
    const se = filterTherapists(testTherapists, 'individual', 'any', {
      zone: 'se',
      studios: testStudios,
    })
    expect(se.map((t) => t.id)).toEqual(['t1', 't3', 't5', 't6'])
  })

  it('combines zone with service and gender', () => {
    // se ∩ couples ∩ female → only t1 and t3 (Sara, Giulia at ub_romana).
    const r = filterTherapists(testTherapists, 'couples', 'female', {
      zone: 'se',
      studios: testStudios,
    })
    expect(r.map((t) => t.id)).toEqual(['t1', 't3'])
  })
})
