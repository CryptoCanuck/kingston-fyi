import Link from 'next/link'
import React from 'react'

import { Ph, CatTag, Icon, DotSep } from '@/components/ui'
import { formatEventWhen } from '@/lib/events/format'

export interface EventCardItem {
  id: string
  slug?: string | null
  title: string
  startsAt: string
  displayDate?: string | null
  displayTime?: string | null
  isFree?: boolean | null
  priceText?: string | null
  category?: { name?: string | null } | string | null
  neighbourhood?: { name?: string | null } | string | null
  venue?: { name?: string | null } | string | null
  image?: { url?: string | null; alt?: string | null } | string | null
}

const relName = (rel: unknown): string =>
  rel && typeof rel === 'object' ? ((rel as { name?: string | null }).name ?? '') : ''

const priceLabel = (item: EventCardItem): string =>
  item.isFree ? 'Free' : item.priceText?.trim() || 'Paid'

/**
 * Events list-row card (FR15): a slate date chip (weekday / day / month), image thumbnail,
 * category + price tags, title, time, and venue·neighbourhood. Server component — links to the
 * event detail page.
 */
export const EventCard = ({ item }: { item: EventCardItem }) => {
  const when = formatEventWhen(item.startsAt, item)
  const href = `/events/${item.slug ?? item.id}`
  const img = item.image && typeof item.image === 'object' ? item.image : null
  const venue = relName(item.venue)
  const hood = relName(item.neighbourhood)
  const cat = relName(item.category)
  const free = !!item.isFree

  return (
    <Link
      href={href}
      className="card card-link"
      style={{ display: 'flex', overflow: 'hidden' }}
      data-event-id={item.id}
    >
      <div className="kf-evdate">
        <span className="kf-evdate-dow">{when.weekday}</span>
        <span className="kf-evdate-day">{when.day}</span>
        <span className="kf-evdate-mon">{when.month}</span>
      </div>
      <div style={{ display: 'flex', gap: 16, padding: '16px 18px', flex: 1, alignItems: 'center', minWidth: 0 }}>
        <div className="kf-evthumb">
          {img?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img.url}
              alt={img.alt ?? item.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Ph hue="ph-c" height="100%" icon="calendar" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {cat && <CatTag label={cat} color="var(--slate-700)" small />}
            <span
              style={{
                fontWeight: 700,
                fontSize: 12.5,
                padding: '4px 9px',
                borderRadius: 'var(--r-sm)',
                background: free ? 'var(--accent-soft)' : 'var(--limestone-2)',
                color: free ? 'var(--accent-strong)' : 'var(--ink-soft)',
              }}
            >
              {priceLabel(item)}
            </span>
          </div>
          <h3 style={{ fontSize: 20, lineHeight: 1.2, minWidth: 0 }}>{item.title}</h3>
          <div className="meta" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13.5 }}>
            <span className="meta">
              <Icon name="clock" size={14} /> {when.time}
            </span>
            {venue && (
              <span className="meta">
                <Icon name="pin" size={14} /> {venue}
                {hood ? (
                  <>
                    <DotSep />
                    {hood}
                  </>
                ) : null}
              </span>
            )}
          </div>
        </div>
        <Icon name="chevR" size={20} style={{ color: 'var(--ink-faint)', marginLeft: 'auto', flexShrink: 0 }} />
      </div>
    </Link>
  )
}
