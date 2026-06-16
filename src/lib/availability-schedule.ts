// Resolve a Calendly-style availability export into the directory's 7-day,
// offset-indexed slot pattern (`string[][]`, dayOffset 0..6 from "today").
//
// Pure and deterministic given `referenceDate`: it reuses `weekAnchors` so the
// calendar days it resolves against are exactly the ones `buildDays` will later
// label, and it has no `Math.random`/`Date.now`. SSR markup and client
// hydration therefore agree.

import { weekAnchors } from './availability'

/** A bookable window, "HH:MM" 24h wall-clock (clinic-local; Rome ≡ Berlin offset). */
export interface CalendlyInterval {
  from: string
  to: string
}

/** A recurring weekday rule or a one-off date override. */
export interface CalendlyRule {
  type: 'wday' | 'date'
  /** 'sunday'..'saturday' for `type: 'wday'`. */
  wday?: string
  /** 'YYYY-MM-DD' for `type: 'date'`. */
  date?: string
  intervals?: CalendlyInterval[]
}

export interface CalendlySchedule {
  default?: boolean
  name?: string
  rules?: CalendlyRule[]
  timezone?: string
}

export interface CalendlyAvailability {
  doctor_id: number
  availability_schedules?: CalendlySchedule[]
}

const WDAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]
/** Bookable session length and the cadence at which new start times are offered. */
const SESSION_MIN = 60
const STEP_MIN = 60
const DAY_MINUTES = 24 * 60

function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  // Accept "24:00" as end-of-day (1440), which Calendly emits for intervals
  // that run to midnight; reject anything else out of range.
  if (h > 24 || (h === 24 && min > 0) || min > 59) return null
  return h * 60 + min
}

function format(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Start minutes within one interval where a full session still fits before `to`. */
function slotStarts(iv: CalendlyInterval): number[] {
  const from = toMinutes(iv.from)
  const to = toMinutes(iv.to)
  if (from === null || to === null) return []
  const out: number[] = []
  for (let t = from; t + SESSION_MIN <= to; t += STEP_MIN) out.push(t)
  return out
}

function isoUTC(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** The `default` schedule (else the first); Calendly always flags one default. */
function defaultSchedule(
  entry: CalendlyAvailability,
): CalendlySchedule | undefined {
  const scheds = entry.availability_schedules ?? []
  return scheds.find((s) => s.default) ?? scheds[0]
}

/**
 * Resolve the next 7 days (offsets 0..6 from "today" in Rome) into sorted,
 * de-duplicated "HH:MM" slot lists. For each day a **date-specific** rule, when
 * present, overrides the recurring **weekday** rule (Calendly semantics — an
 * empty date rule therefore means "day off"). Returns 7 empty days when the
 * therapist has no schedule.
 */
export function resolveWeek(
  entry: CalendlyAvailability | undefined,
  referenceDate: Date,
): string[][] {
  const anchors = weekAnchors(referenceDate)
  const sched = entry ? defaultSchedule(entry) : undefined
  if (!sched) return anchors.map(() => [])

  const dateRules = new Map<string, CalendlyInterval[]>()
  const wdayRules = new Map<string, CalendlyInterval[]>()
  for (const rule of sched.rules ?? []) {
    const ivs = rule.intervals ?? []
    if (rule.type === 'date' && rule.date) {
      dateRules.set(rule.date, [...(dateRules.get(rule.date) ?? []), ...ivs])
    } else if (rule.type === 'wday' && rule.wday) {
      wdayRules.set(rule.wday, [...(wdayRules.get(rule.wday) ?? []), ...ivs])
    }
  }

  return anchors.map((d) => {
    const iso = isoUTC(d)
    const wday = WDAY_NAMES[d.getUTCDay()]
    const intervals = dateRules.has(iso)
      ? (dateRules.get(iso) ?? [])
      : (wdayRules.get(wday) ?? [])
    const starts = new Set<number>()
    for (const iv of intervals) for (const t of slotStarts(iv)) starts.add(t)
    // Emit chronologically by scanning the day's minute grid — no mutating
    // sort needed, and overlapping intervals de-duplicate via the Set.
    const day: string[] = []
    for (let t = 0; t < DAY_MINUTES; t += 1) {
      if (starts.has(t)) day.push(format(t))
    }
    return day
  })
}
