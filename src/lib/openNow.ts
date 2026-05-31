// Open-Now derivation (FR20, Story 2.3). Computes a business's current open/closed state
// from its structured opening hours, evaluated in Kingston's timezone (America/Toronto) so
// the result is correct regardless of where the server or visitor sits. Pure + deterministic:
// `now` is injectable for tests.

export const KINGSTON_TZ = 'America/Toronto'

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

/** One opening interval, as stored on the Businesses `hours` array. */
export interface OpeningInterval {
  day: Weekday
  /** 24h "HH:MM". */
  opens: string
  /** 24h "HH:MM". */
  closes: string
}

const WEEKDAY_ORDER: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

/** Parse "HH:MM" (or "H:MM") into minutes-since-midnight; null if malformed. */
const toMinutes = (value: string | null | undefined): number | null => {
  if (typeof value !== 'string') return null
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1])
  const mins = Number(match[2])
  if (hours > 23 || mins > 59) return null
  return hours * 60 + mins
}

/** The current weekday + minutes-since-midnight in America/Toronto for a given instant. */
export const torontoNowParts = (now: Date): { weekday: Weekday; minutes: number } => {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: KINGSTON_TZ,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const weekday = get('weekday').toLowerCase() as Weekday
  // Intl can emit "24" for midnight in some runtimes; normalize to 0.
  const hour = Number(get('hour')) % 24
  const minute = Number(get('minute'))
  return { weekday, minutes: hour * 60 + minute }
}

const prevWeekday = (day: Weekday): Weekday => {
  const idx = WEEKDAY_ORDER.indexOf(day)
  return WEEKDAY_ORDER[(idx + 6) % 7]
}

/**
 * Is the business open right now (in America/Toronto)?
 *
 *  - `true`  — at least one interval covers the current local time.
 *  - `false` — hours are known but none cover now.
 *  - `null`  — hours are unknown (empty/missing), so we render "Hours unknown", never "Closed".
 *
 * Overnight intervals (closes ≤ opens, e.g. 18:00→02:00) are handled by also checking the
 * previous day's wrapping intervals against the early-morning portion of today.
 */
export const isOpenNow = (
  hours: OpeningInterval[] | null | undefined,
  now: Date = new Date(),
): boolean | null => {
  if (!hours || hours.length === 0) return null

  const { weekday, minutes } = torontoNowParts(now)
  const yesterday = prevWeekday(weekday)

  for (const interval of hours) {
    const opens = toMinutes(interval.opens)
    const closes = toMinutes(interval.closes)
    if (opens === null || closes === null) continue

    const overnight = closes <= opens

    if (interval.day === weekday) {
      if (!overnight) {
        if (minutes >= opens && minutes < closes) return true
      } else {
        // Same-day portion of an overnight interval: from `opens` until midnight.
        if (minutes >= opens) return true
      }
    }

    // Early-morning spillover from an interval that started yesterday and wraps past midnight.
    if (overnight && interval.day === yesterday && minutes < closes) {
      return true
    }
  }

  return false
}
