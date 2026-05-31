import React from 'react'

import { Stars } from '@/components/ui'
import type { ReviewSummary } from '@/lib/reviews'

export interface ReviewItem {
  id: string
  author?: string | null
  rating?: number | null
  reviewDate?: string | null
  text?: string | null
  provenanceSource?: string | null
}

// Provenance labelling for sourced ratings (FR61) — these are imported, not native, reviews.
const SOURCE_LABEL: Record<string, string> = {
  'google-places': 'Google',
  google: 'Google',
  operator: 'Kingston.FYI',
  submission: 'Community',
  owner: 'Owner',
}
const sourceLabel = (s?: string | null): string | null =>
  s ? (SOURCE_LABEL[s] ?? s.replace(/-/g, ' ')) : null

const formatDate = (value?: string | null): string => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Reviews section (FR61): average + 5★→1★ histogram and the individual sourced reviews, each
 * provenance-labelled. Renders gracefully when there are no ratings — no histogram, just a
 * muted note — so listings without sourced reviews still look complete.
 */
export const BusinessReviews = ({
  summary,
  reviews,
}: {
  summary: ReviewSummary
  reviews: ReviewItem[]
}) => {
  if (summary.count === 0) {
    return (
      <p className="meta" style={{ fontSize: 15 }}>
        No ratings yet for this business.
      </p>
    )
  }

  const total = summary.histogram.reduce((a, b) => a + b, 0) || 1

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          padding: '16px 20px',
          background: 'var(--limestone)',
          borderRadius: 'var(--r)',
          marginBottom: 20,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1,
              color: 'var(--slate-900)',
            }}
          >
            {summary.average?.toFixed(1)}
          </div>
          <Stars value={summary.average ?? 0} showNum={false} />
          <div className="faint" style={{ fontSize: 12.5, marginTop: 4 }}>
            {summary.count} {summary.count === 1 ? 'review' : 'reviews'}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[5, 4, 3, 2, 1].map((n) => {
            const pct = Math.round((summary.histogram[5 - n] / total) * 100)
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="faint" style={{ fontSize: 12.5, width: 12 }}>
                  {n}
                </span>
                <span
                  style={{
                    flex: 1,
                    height: 7,
                    borderRadius: 5,
                    background: 'var(--line-strong)',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{ display: 'block', height: '100%', width: `${pct}%`, background: 'var(--accent)' }}
                  />
                </span>
                <span className="faint" style={{ fontSize: 12.5, width: 32, textAlign: 'right' }}>
                  {pct}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {reviews.map((r) => {
          const name = r.author?.trim() || 'Anonymous'
          const label = sourceLabel(r.provenanceSource)
          return (
            <div key={r.id} style={{ padding: '16px 0', borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: 'var(--limestone-2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'var(--slate-700)',
                    fontFamily: 'var(--serif)',
                  }}
                >
                  {name[0].toUpperCase()}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Stars value={r.rating ?? 0} showNum={false} />
                    <span className="faint" style={{ fontSize: 12.5 }}>
                      {formatDate(r.reviewDate)}
                      {label ? ` · via ${label}` : ''}
                    </span>
                  </div>
                </div>
              </div>
              {r.text && (
                <p style={{ fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink)' }}>{r.text}</p>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
