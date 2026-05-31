import { describe, it, expect } from 'vitest'

import { buildIcsEvent } from '@/lib/events/ics'

describe('buildIcsEvent (FR17)', () => {
  const ics = buildIcsEvent({
    uid: 'abc-123',
    title: 'Jazz, Blues & BBQ',
    startsAt: '2026-06-14T23:00:00.000Z',
    endsAt: '2026-06-15T01:30:00.000Z',
    description: 'A night of music; bring friends.',
    locationName: 'Springer Market Square',
    url: 'https://kingston.fyi/events/jazz-blues-bbq',
    dtstamp: '2026-05-31T12:00:00.000Z',
  })

  it('produces a valid single-event VCALENDAR with UTC times', () => {
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('UID:abc-123@kingston.fyi')
    expect(ics).toContain('DTSTART:20260614T230000Z')
    expect(ics).toContain('DTEND:20260615T013000Z')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics.split('\r\n').length).toBeGreaterThan(8) // CRLF-separated
  })

  it('escapes RFC 5545 TEXT special characters', () => {
    expect(ics).toContain('SUMMARY:Jazz\\, Blues & BBQ')
    expect(ics).toContain('DESCRIPTION:A night of music\\; bring friends.')
  })

  it('omits DTEND when there is no end time', () => {
    const open = buildIcsEvent({ uid: 'x', title: 'Open House', startsAt: '2026-06-14T23:00:00.000Z' })
    expect(open).not.toContain('DTEND:')
    expect(open).toContain('DTSTART:20260614T230000Z')
  })
})
