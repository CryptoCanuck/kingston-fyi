// Time-bucketing for the events list (FR14/FR15). Events are grouped into Today / This Weekend
// / Next Week / This Month (+ a Later catch-all so nothing vanishes) derived from their start
// datetime relative to now, all computed in Kingston local time so "today" means today here.

export const KINGSTON_TZ = 'America/Toronto'

export type EventBucketKey = 'today' | 'weekend' | 'nextweek' | 'month' | 'later'

export const BUCKET_ORDER: EventBucketKey[] = ['today', 'weekend', 'nextweek', 'month', 'later']

export const BUCKET_LABELS: Record<EventBucketKey, string> = {
  today: 'Today',
  weekend: 'This Weekend',
  nextweek: 'Next Week',
  month: 'This Month',
  later: 'Later',
}

const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

interface DateParts {
  year: number
  month: number
  day: number
  dow: number
}

/** Calendar parts of a Date as seen in Kingston, independent of the runtime timezone. */
const torontoParts = (date: Date): DateParts => {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: KINGSTON_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
  const parts = fmt.formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    dow: DOW[get('weekday')] ?? 0,
  }
}

/** Whole-day index (days since the epoch) for a set of calendar parts. */
const dayNumber = (p: DateParts): number => Math.floor(Date.UTC(p.year, p.month - 1, p.day) / 86_400_000)

/** Kingston-local calendar date (year, month 1–12, day) of an instant. */
export const torontoYmd = (date: Date): { year: number; month: number; day: number } => {
  const p = torontoParts(date)
  return { year: p.year, month: p.month, day: p.day }
}

/**
 * Assign an event to a time bucket relative to `now` (Kingston time). Past events return
 * 'past' so the list can drop them. Buckets are mutually exclusive, resolved by priority:
 * today → this weekend → next 7 days → this month (≤31 days) → later.
 */
export const eventBucket = (
  startsAt: string | Date | null | undefined,
  now: Date = new Date(),
): EventBucketKey | 'past' => {
  if (!startsAt) return 'later'
  const start = startsAt instanceof Date ? startsAt : new Date(startsAt)
  if (Number.isNaN(start.getTime())) return 'later'

  const nowParts = torontoParts(now)
  const diff = dayNumber(torontoParts(start)) - dayNumber(nowParts)

  if (diff < 0) return 'past'
  if (diff === 0) return 'today'

  // The upcoming Sat + Sun. On Sunday the weekend is "today", so nothing future qualifies.
  const weekendDiffs = nowParts.dow === 0 ? [] : [6 - nowParts.dow, 7 - nowParts.dow]
  if (weekendDiffs.includes(diff)) return 'weekend'

  if (diff <= 7) return 'nextweek'
  if (diff <= 31) return 'month'
  return 'later'
}

export type DatePreset = 'any' | 'today' | 'weekend' | 'week' | 'month'

export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'any', label: 'Any date' },
  { value: 'today', label: 'Today' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
]

const PRESET_BUCKETS: Record<DatePreset, EventBucketKey[]> = {
  any: BUCKET_ORDER,
  today: ['today'],
  weekend: ['today', 'weekend'],
  week: ['today', 'weekend', 'nextweek'],
  month: ['today', 'weekend', 'nextweek', 'month'],
}

/** Which buckets a date preset admits (used by both list filtering and the calendar). */
export const bucketsForPreset = (preset: DatePreset): EventBucketKey[] => PRESET_BUCKETS[preset] ?? BUCKET_ORDER
