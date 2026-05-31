// Display formatting for event datetimes, in Kingston local time. Honours optional human
// overrides (displayDate / displayTime) the operator can set on an event.

import { KINGSTON_TZ } from './buckets'

export interface EventWhen {
  /** Short weekday, upper-cased for the date chip, e.g. "SAT". */
  weekday: string
  /** Day of month, e.g. "13". */
  day: string
  /** Short month, e.g. "Jun". */
  month: string
  /** Time of day, e.g. "7:00 PM" (or the displayTime override). */
  time: string
  /** Full date line, e.g. "Sat, Jun 13". */
  dateLine: string
}

const part = (date: Date, opts: Intl.DateTimeFormatOptions): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: KINGSTON_TZ, ...opts }).format(date)

export const formatEventWhen = (
  startsAt: string | Date,
  overrides: { displayDate?: string | null; displayTime?: string | null } = {},
): EventWhen => {
  const d = startsAt instanceof Date ? startsAt : new Date(startsAt)
  if (Number.isNaN(d.getTime())) {
    return { weekday: '', day: '', month: '', time: overrides.displayTime ?? '', dateLine: overrides.displayDate ?? '' }
  }
  const weekday = part(d, { weekday: 'short' })
  const day = part(d, { day: 'numeric' })
  const month = part(d, { month: 'short' })
  const time = overrides.displayTime?.trim() || part(d, { hour: 'numeric', minute: '2-digit', hour12: true })
  const dateLine = overrides.displayDate?.trim() || `${weekday}, ${month} ${day}`
  return { weekday: weekday.toUpperCase(), day, month, time, dateLine }
}
