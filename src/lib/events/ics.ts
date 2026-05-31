// iCalendar (RFC 5545) generation for the "Add to Calendar" action (FR17). Pure string
// building so it's testable and usable from a Route Handler. Times are emitted in UTC
// (…Z) which every calendar client understands unambiguously.

export interface IcsEventInput {
  /** Stable unique id (the event id); the @kingston.fyi domain is appended. */
  uid: string
  title: string
  /** ISO start datetime. */
  startsAt: string
  /** ISO end datetime (optional — omitted from the VEVENT when absent). */
  endsAt?: string | null
  description?: string | null
  locationName?: string | null
  /** Absolute event URL. */
  url?: string | null
  /** ISO timestamp for DTSTAMP; defaults to now. Injectable for deterministic tests. */
  dtstamp?: string
}

const pad = (n: number): string => String(n).padStart(2, '0')

/** ISO → UTC basic format "YYYYMMDDTHHMMSSZ". Returns '' for an invalid date. */
const toUtcBasic = (iso: string): string => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

/** Escape a TEXT value per RFC 5545 §3.3.11 (backslash, semicolon, comma, newline). */
const esc = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')

/** Build a single-event VCALENDAR document (CRLF-terminated lines per spec). */
export const buildIcsEvent = (e: IcsEventInput): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kingston.FYI//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.uid}@kingston.fyi`,
    `DTSTAMP:${toUtcBasic(e.dtstamp ?? new Date().toISOString())}`,
    `DTSTART:${toUtcBasic(e.startsAt)}`,
  ]
  if (e.endsAt) lines.push(`DTEND:${toUtcBasic(e.endsAt)}`)
  lines.push(`SUMMARY:${esc(e.title)}`)
  if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`)
  if (e.locationName) lines.push(`LOCATION:${esc(e.locationName)}`)
  if (e.url) lines.push(`URL:${e.url}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}
