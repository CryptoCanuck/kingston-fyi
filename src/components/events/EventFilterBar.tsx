'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import {
  parseEventFilters,
  serializeEventFilters,
  type EventFilterState,
  type PriceFilter,
} from '@/lib/events/filters'
import { DATE_PRESETS, type DatePreset } from '@/lib/events/buckets'

export interface EventFilterBarProps {
  categories: { slug: string; name: string }[]
  neighbourhoods: { slug: string; name: string }[]
}

const PRICES: { value: PriceFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
]

/**
 * Events filter bar (FR16): date preset, category chips, neighbourhood, and Free/Paid — all
 * always visible — written to the URL via router.replace so the RSC list re-renders. Shares
 * parse/serialize with the server page through lib/events/filters.
 */
export const EventFilterBar = ({ categories, neighbourhoods }: EventFilterBarProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filters = parseEventFilters(Object.fromEntries(searchParams.entries()))

  const go = (next: EventFilterState) => {
    const qs = serializeEventFilters(next)
    router.replace(qs ? `/events?${qs}` : '/events', { scroll: false })
  }

  const toggleCat = (slug: string) => {
    const has = filters.cats.includes(slug)
    go({ ...filters, cats: has ? filters.cats.filter((c) => c !== slug) : [...filters.cats, slug] })
  }

  return (
    <div className="card" style={{ padding: '16px 18px', marginBottom: 24 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span className="kf-flabel">Date</span>
          <select
            className="select"
            style={{ width: 'auto', paddingRight: 34 }}
            value={filters.preset}
            onChange={(e) => go({ ...filters, preset: e.target.value as DatePreset })}
          >
            {DATE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        {categories.length > 0 && (
          <div style={{ flex: 1, minWidth: 220 }}>
            <span className="kf-flabel" style={{ marginBottom: 7, display: 'block' }}>
              Category
            </span>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  className={'chip' + (filters.cats.includes(c.slug) ? ' is-active' : '')}
                  aria-pressed={filters.cats.includes(c.slug)}
                  onClick={() => toggleCat(c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {neighbourhoods.length > 0 && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span className="kf-flabel">Neighbourhood</span>
            <select
              className="select"
              style={{ width: 'auto', paddingRight: 34 }}
              value={filters.hood ?? ''}
              onChange={(e) => go({ ...filters, hood: e.target.value || null })}
            >
              <option value="">All neighbourhoods</option>
              {neighbourhoods.map((h) => (
                <option key={h.slug} value={h.slug}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span className="kf-flabel">Price</span>
          <div className="kf-segment" role="group" aria-label="Price">
            {PRICES.map((p) => (
              <button
                key={p.value}
                type="button"
                aria-pressed={filters.price === p.value}
                onClick={() => go({ ...filters, price: p.value })}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
