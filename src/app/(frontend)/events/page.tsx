import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { getActiveCity } from '@/lib/city'
import { PUBLIC_STATUSES } from '@/fields/statusField'
import { buildMetadata } from '@/lib/seo/metadata'
import { Icon } from '@/components/ui'
import { EventCard, type EventCardItem } from '@/components/events/EventCard'
import { EventFilterBar } from '@/components/events/EventFilterBar'
import { eventBucket, BUCKET_ORDER, BUCKET_LABELS } from '@/lib/events/buckets'
import {
  matchesEvent,
  parseEventFilters,
  type RawSearchParams,
} from '@/lib/events/filters'

export const metadata: Metadata = buildMetadata({
  title: 'Events',
  description: "What's on in Kingston — concerts, markets, festivals and more, by date.",
  path: '/events',
})

const taxonomy = (docs: { slug?: string | null; name?: string | null }[]) =>
  docs.map((d) => ({ slug: d.slug ?? '', name: d.name ?? '' })).filter((d) => d.slug)

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const params = await searchParams
  const filters = parseEventFilters(params)

  const payload = await getPayload({ config: await config })
  const city = await getActiveCity()
  if (!city) {
    return (
      <div className="kf-route kf-wrap" style={{ padding: '60px 28px' }}>
        <h1>Events</h1>
        <p className="meta">No active city is configured yet.</p>
      </div>
    )
  }

  const [eventsRes, categoriesRes, neighbourhoodsRes] = await Promise.all([
    payload.find({
      collection: 'events',
      where: { and: [{ city: { equals: city.id } }, { status: { in: PUBLIC_STATUSES } }] },
      depth: 1,
      limit: 1000,
      pagination: false,
      sort: 'startsAt',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'event-categories',
      where: { city: { equals: city.id } },
      depth: 0,
      limit: 1000,
      pagination: false,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'neighbourhoods',
      where: { city: { equals: city.id } },
      depth: 0,
      limit: 1000,
      pagination: false,
      overrideAccess: true,
    }),
  ])

  const now = new Date()
  const all = eventsRes.docs as unknown as EventCardItem[]
  const matched = all.filter((e) => matchesEvent(e as never, filters, now))

  // Group the matched events into time buckets, preserving the startsAt sort within each.
  const grouped = new Map<string, EventCardItem[]>()
  for (const e of matched) {
    const bucket = eventBucket(e.startsAt, now)
    if (bucket === 'past') continue
    const arr = grouped.get(bucket) ?? []
    arr.push(e)
    grouped.set(bucket, arr)
  }

  const categories = taxonomy(categoriesRes.docs as { slug?: string | null; name?: string | null }[])
  const neighbourhoods = taxonomy(neighbourhoodsRes.docs as { slug?: string | null; name?: string | null }[])

  return (
    <div className="kf-route kf-wrap" style={{ padding: '30px 28px 56px' }}>
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">What&apos;s on in Kingston</div>
        <h1 style={{ fontSize: 40, marginTop: 6 }}>Events</h1>
      </div>

      <EventFilterBar categories={categories} neighbourhoods={neighbourhoods} />

      <div className="meta" style={{ marginBottom: 18, fontSize: 14 }}>
        Showing <strong style={{ color: 'var(--ink)' }}>{matched.length}</strong>{' '}
        {matched.length === 1 ? 'event' : 'events'}
      </div>

      {matched.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-faint)' }}>
          <Icon name="calendar" size={34} stroke={1.4} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink-soft)' }}>
            No events match those filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
          {BUCKET_ORDER.map((bucket) => {
            const items = grouped.get(bucket)
            if (!items || items.length === 0) return null
            return (
              <section key={bucket}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <h2 style={{ fontSize: 24 }}>{BUCKET_LABELS[bucket]}</h2>
                  <span
                    style={{
                      background: 'var(--accent-soft)',
                      color: 'var(--accent-strong)',
                      fontWeight: 700,
                      fontSize: 13,
                      padding: '3px 10px',
                      borderRadius: 'var(--r-pill)',
                    }}
                  >
                    {items.length}
                  </span>
                  <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {items.map((e) => (
                    <EventCard key={e.id} item={e} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
