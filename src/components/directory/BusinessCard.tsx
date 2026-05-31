import Link from 'next/link'
import React from 'react'

import { Ph, Stars, DotSep } from '@/components/ui'
import { isOpenNow, type OpeningInterval } from '@/lib/openNow'

export interface BusinessCardItem {
  id: string
  slug?: string | null
  name: string
  blurb?: string | null
  rating?: number | null
  reviewCount?: number | null
  priceTier?: string | null
  hours?: OpeningInterval[] | null
  lifecycleStatus?: string | null
  category?: { name?: string | null } | string | null
  neighbourhood?: { name?: string | null } | string | null
}

const relName = (rel: BusinessCardItem['category']): string =>
  rel && typeof rel === 'object' ? (rel.name ?? '') : ''

const LIFECYCLE_LABEL: Record<string, string> = {
  'temporarily-closed': 'Temporarily closed',
  'permanently-closed': 'Permanently closed',
  'stale-unverified': 'Unverified',
}

/**
 * Directory list card (FR21/FR27). Server component — links to the detail page and renders
 * the open/closed pill (lib/openNow), rating, category·price·neighbourhood meta, blurb, and a
 * lifecycle badge when not active. Hover/list-map sync is layered on in Story 2.6.
 */
export const BusinessCard = ({ item }: { item: BusinessCardItem }) => {
  const open = isOpenNow(item.hours)
  const href = `/business/${item.slug ?? item.id}`
  const meta = [relName(item.category), item.priceTier, relName(item.neighbourhood)].filter(Boolean)
  const lifecycle = item.lifecycleStatus && item.lifecycleStatus !== 'active'
    ? LIFECYCLE_LABEL[item.lifecycleStatus]
    : null

  return (
    <Link
      href={href}
      className="card card-link"
      style={{ display: 'flex', gap: 16, padding: 14, alignItems: 'stretch' }}
      data-business-id={item.id}
    >
      <div style={{ width: 116, flexShrink: 0 }}>
        <Ph hue="ph-a" height={104} icon="pin" rounded />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <h3 style={{ fontSize: 18, lineHeight: 1.25, minWidth: 0 }}>{item.name}</h3>
          {open !== null && (
            <span
              style={{
                flexShrink: 0,
                fontSize: 11.5,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 'var(--r-pill)',
                background: open ? 'var(--accent-soft)' : 'var(--limestone-2)',
                color: open ? 'var(--accent-strong)' : 'var(--ink-soft)',
              }}
            >
              {open ? 'Open now' : 'Closed'}
            </span>
          )}
        </div>
        {typeof item.rating === 'number' && (
          <Stars value={item.rating} count={item.reviewCount ?? undefined} />
        )}
        {meta.length > 0 && (
          <span className="meta" style={{ fontSize: 14 }}>
            {meta.map((m, i) => (
              <React.Fragment key={i}>
                {i > 0 && <DotSep />}
                {m}
              </React.Fragment>
            ))}
          </span>
        )}
        {item.blurb && (
          <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0 }}>
            {item.blurb}
          </p>
        )}
        {lifecycle && (
          <span className="tag tag-outline" style={{ alignSelf: 'flex-start' }}>
            {lifecycle}
          </span>
        )}
      </div>
    </Link>
  )
}
