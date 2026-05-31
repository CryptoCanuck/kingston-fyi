// Month-grid builder for the calendar view (FR54, FR14). Events are placed into day cells by
// their start datetime in Kingston local time (never a stored day number), so the grid is
// always correct across timezones and DST. Pure + unit-testable; the page renders the grid.

import { torontoYmd } from './buckets'

export interface CalendarEvent {
  id: string
  slug?: string | null
  title: string
  startsAt: string
}

export interface CalendarCell {
  /** Day of month, or null for leading/trailing padding cells. */
  day: number | null
  /** ISO date key "YYYY-MM-DD" for day cells (used for drill-in links), null for padding. */
  dateKey: string | null
  events: CalendarEvent[]
}

export interface MonthGrid {
  year: number
  /** 1–12. */
  month: number
  label: string
  weekdays: string[]
  weeks: CalendarCell[][]
  /** Total events placed in this month (after the caller's filtering). */
  eventCount: number
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad = (n: number): string => String(n).padStart(2, '0')

/** Build a month grid for (year, month 1–12), placing each event in its Kingston-local day. */
export const buildMonthGrid = (
  year: number,
  month: number,
  events: CalendarEvent[],
): MonthGrid => {
  const byDay = new Map<number, CalendarEvent[]>()
  let eventCount = 0
  for (const e of events) {
    const d = new Date(e.startsAt)
    if (Number.isNaN(d.getTime())) continue
    const ymd = torontoYmd(d)
    if (ymd.year !== year || ymd.month !== month) continue
    const arr = byDay.get(ymd.day) ?? []
    arr.push(e)
    byDay.set(ymd.day, arr)
    eventCount++
  }

  // Pure-date arithmetic via UTC (no timezone drift): day count + weekday of the 1st.
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()

  const cells: CalendarCell[] = []
  for (let i = 0; i < firstDow; i++) cells.push({ day: null, dateKey: null, events: [] })
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateKey: `${year}-${pad(month)}-${pad(d)}`, events: byDay.get(d) ?? [] })
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, dateKey: null, events: [] })

  const weeks: CalendarCell[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return { year, month, label: `${MONTH_NAMES[month - 1]} ${year}`, weekdays: WEEKDAYS, weeks, eventCount }
}

/** Serialize a month to the "YYYY-MM" URL param. */
export const monthParam = (year: number, month: number): string => `${year}-${pad(month)}`

/** Parse a "YYYY-MM" param, falling back to the current Kingston month. */
export const parseMonthParam = (
  value: string | undefined,
  now: Date = new Date(),
): { year: number; month: number } => {
  const m = value?.match(/^(\d{4})-(\d{2})$/)
  if (m) {
    const year = Number(m[1])
    const month = Number(m[2])
    if (month >= 1 && month <= 12) return { year, month }
  }
  const ymd = torontoYmd(now)
  return { year: ymd.year, month: ymd.month }
}

/** Shift a month by delta, rolling the year over. */
export const shiftMonth = (year: number, month: number, delta: number): { year: number; month: number } => {
  const zero = (year * 12 + (month - 1)) + delta
  return { year: Math.floor(zero / 12), month: (zero % 12) + 1 }
}
