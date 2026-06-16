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
 * The 7 day anchors (offsets 0..6 from "today" in Rome) as `Date`s at noon UTC
 * on each Rome calendar day. Built once so any caller mapping availability onto
 * the next week — `buildDays` here and the Calendly schedule resolver — reads
 * the *same* calendar dates/weekdays and can never drift apart.
 *
 * Noon-UTC anchoring means adding whole days never crosses a DST boundary into
 * the wrong calendar date; UTC getters then read back the intended day/weekday
 * deterministically. `referenceDate` is injectable so output stays pure.
 */
export function weekAnchors(referenceDate: Date = new Date()): Date[] {
  const { year, month, day } = romeDayParts(referenceDate)
  const anchorMs = Date.UTC(year, month - 1, day, 12, 0, 0)
  return Array.from({ length: 7 }, (_, i) => new Date(anchorMs + i * DAY_MS))
}

/**
 * Resolve a 7-entry availability pattern (dayOffset 0..6) into concrete `Day`s
 * relative to `referenceDate` ("today" in Rome).
 */
export function buildDays(
  pattern: string[][],
  referenceDate: Date = new Date(),
): Day[] {
  const anchors = weekAnchors(referenceDate)

  return pattern.map((slots, i) => {
    const d = anchors[i]
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
