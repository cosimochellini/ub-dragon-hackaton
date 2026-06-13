import { romeDayParts } from './time'
import type { Day, Therapist } from './types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Resolve a 7-entry availability pattern (dayOffset 0..6) into concrete `Day`s
 * relative to `referenceDate` ("today" in Rome).
 *
 * The anchor is built at noon UTC on the Rome calendar day, so adding whole
 * days never crosses a DST boundary into the wrong calendar date; UTC getters
 * then read back the intended day/weekday deterministically. `referenceDate`
 * is injectable so the output is pure and testable.
 */
export function buildDays(
  pattern: string[][],
  referenceDate: Date = new Date(),
): Day[] {
  const { year, month, day } = romeDayParts(referenceDate)
  const anchorMs = Date.UTC(year, month - 1, day, 12, 0, 0)

  return pattern.map((slots, i) => {
    const d = new Date(anchorMs + i * DAY_MS)
    const dow = WEEKDAYS[d.getUTCDay()]
    const dayNum = d.getUTCDate()
    const monthAbbr = MONTHS[d.getUTCMonth()]
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dow
    return {
      key: i,
      label,
      dow,
      day: dayNum,
      month: monthAbbr,
      dateLabel: `${dow} ${dayNum} ${monthAbbr}`,
      slots,
    }
  })
}

/** The earliest day with at least one free slot, or null if none this week. */
export function nextAvailable(t: Therapist): { day: Day; slot: string } | null {
  for (const d of t.days) {
    if (d.slots.length > 0) return { day: d, slot: d.slots[0] }
  }
  return null
}
