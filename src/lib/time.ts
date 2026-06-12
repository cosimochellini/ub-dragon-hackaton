// Timezone-correct calendar helpers.
//
// This is a Milan app, so "today" must be the calendar day as seen in Rome,
// regardless of where the server (usually UTC) or client runs. Deriving the
// day via Intl with timeZone:'Europe/Rome' avoids the classic midnight-UTC
// off-by-one (e.g. 23:30 UTC is already "tomorrow" in Rome).

export interface RomeDayParts {
  year: number
  /** 1–12 (calendar month, not zero-based). */
  month: number
  day: number
}

export function romeDayParts(date: Date): RomeDayParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const valueOf = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((p) => p.type === type)?.value)

  return {
    year: valueOf('year'),
    month: valueOf('month'),
    day: valueOf('day'),
  }
}
