import { describe, expect, it } from 'vitest'
import { resolveWeek } from './availability-schedule'
import type { CalendlyAvailability } from './availability-schedule'

// Monday 2026-06-15 in Rome; availability starts tomorrow → offsets map to:
//   0 Tue 06-16 · 1 Wed 06-17 · 2 Thu 06-18 · 3 Fri 06-19 ·
//   4 Sat 06-20 · 5 Sun 06-21 · 6 Mon 06-22
const REF = new Date('2026-06-15T09:00:00+02:00')

function entry(rules: CalendlyAvailability['availability_schedules']) {
  return { doctor_id: 1, availability_schedules: rules } as CalendlyAvailability
}

describe('resolveWeek', () => {
  it('returns 7 empty days when there is no schedule', () => {
    expect(resolveWeek(undefined, REF)).toEqual([[], [], [], [], [], [], []])
    expect(resolveWeek(entry([]), REF)).toEqual([[], [], [], [], [], [], []])
  })

  it('expands a weekday rule into hourly slots that fit a 60-min session', () => {
    const week = resolveWeek(
      entry([
        {
          default: true,
          rules: [
            { type: 'wday', wday: 'tuesday', intervals: [{ from: '09:00', to: '12:00' }] },
          ],
        },
      ]),
      REF,
    )
    // Tomorrow is Tuesday → offset 0. 09:00–12:00 fits 09, 10, 11 (12:00 would run to 13:00).
    expect(week[0]).toEqual(['09:00', '10:00', '11:00'])
    expect(week.slice(1)).toEqual([[], [], [], [], [], []])
  })

  it('includes a slot only when a full session fits before the end', () => {
    const week = resolveWeek(
      entry([
        {
          default: true,
          rules: [
            { type: 'wday', wday: 'tuesday', intervals: [{ from: '18:00', to: '19:00' }] },
          ],
        },
      ]),
      REF,
    )
    expect(week[0]).toEqual(['18:00'])
  })

  it('unions multiple intervals in a day, de-duplicated and sorted', () => {
    const week = resolveWeek(
      entry([
        {
          default: true,
          rules: [
            {
              type: 'wday',
              wday: 'tuesday',
              intervals: [
                { from: '14:00', to: '16:00' },
                { from: '09:00', to: '11:00' },
                { from: '15:00', to: '16:00' }, // overlaps 14–16 → dedup
              ],
            },
          ],
        },
      ]),
      REF,
    )
    expect(week[0]).toEqual(['09:00', '10:00', '14:00', '15:00'])
  })

  it('lets a date-specific rule override the recurring weekday rule', () => {
    const week = resolveWeek(
      entry([
        {
          default: true,
          rules: [
            { type: 'wday', wday: 'wednesday', intervals: [{ from: '18:00', to: '21:00' }] },
            { type: 'date', date: '2026-06-17', intervals: [{ from: '09:00', to: '11:00' }] },
          ],
        },
      ]),
      REF,
    )
    // Offset 1 is Wed 2026-06-17 → the date override wins over the weekday rule.
    expect(week[1]).toEqual(['09:00', '10:00'])
  })

  it('treats an empty date rule as a day off (overriding the weekday rule)', () => {
    const week = resolveWeek(
      entry([
        {
          default: true,
          rules: [
            { type: 'wday', wday: 'wednesday', intervals: [{ from: '18:00', to: '21:00' }] },
            { type: 'date', date: '2026-06-17', intervals: [] },
          ],
        },
      ]),
      REF,
    )
    expect(week[1]).toEqual([])
  })

  it('treats a "24:00" interval end as midnight (end-of-day)', () => {
    const week = resolveWeek(
      entry([
        {
          default: true,
          rules: [
            { type: 'wday', wday: 'tuesday', intervals: [{ from: '22:00', to: '24:00' }] },
          ],
        },
      ]),
      REF,
    )
    expect(week[0]).toEqual(['22:00', '23:00'])
  })

  it('uses the default schedule when several are present', () => {
    const week = resolveWeek(
      entry([
        {
          name: 'ignored',
          default: false,
          rules: [
            { type: 'wday', wday: 'tuesday', intervals: [{ from: '08:00', to: '09:00' }] },
          ],
        },
        {
          name: 'working hours',
          default: true,
          rules: [
            { type: 'wday', wday: 'tuesday', intervals: [{ from: '10:00', to: '11:00' }] },
          ],
        },
      ]),
      REF,
    )
    expect(week[0]).toEqual(['10:00'])
  })
})
