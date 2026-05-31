import Link from 'next/link'
import React from 'react'

import { Section } from './Section'

export interface VenueEvent {
  id: string
  slug?: string | null
  title: string
  startsAt?: string | null
  summary?: string | null
}

const formatWhen = (value?: string | null): string => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })
}

/**
 * "Upcoming events at this venue" cross-link rail (FR38). Events arrive in Epic 3; until then
 * the venue's event list is empty and this renders nothing — no section, no broken layout.
 */
export const VenueEventsRail = ({ events }: { events: VenueEvent[] }) => {
  if (!events || events.length === 0) return null
  return (
    <Section title="Upcoming events at this venue">
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 6 }}>
        {events.map((e) => (
          <Link
            key={e.id}
            href={`/events/${e.slug ?? e.id}`}
            className="card card-link"
            style={{ flex: '0 0 240px', padding: 16, display: 'block' }}
          >
            <div className="faint" style={{ fontSize: 12.5, fontWeight: 600 }}>
              {formatWhen(e.startsAt)}
            </div>
            <h3 style={{ fontSize: 16, marginTop: 6 }}>{e.title}</h3>
            {e.summary && (
              <p className="meta" style={{ fontSize: 13.5, marginTop: 6 }}>
                {e.summary}
              </p>
            )}
          </Link>
        ))}
      </div>
    </Section>
  )
}
