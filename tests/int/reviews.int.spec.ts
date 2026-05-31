import { describe, it, expect } from 'vitest'

import { Reviews } from '@/collections/Reviews'
import { isOpenNow, torontoNowParts, type OpeningInterval } from '@/lib/openNow'
import { summarizeReviews } from '@/lib/reviews'

type AnyField = {
  name?: string
  type?: string
  fields?: AnyField[]
  defaultValue?: unknown
  required?: boolean
  min?: number
  max?: number
}
const namedFields = (fields: AnyField[]): Record<string, AnyField> => {
  const out: Record<string, AnyField> = {}
  for (const f of fields) {
    if (f.name) out[f.name] = f
    if (Array.isArray(f.fields)) Object.assign(out, namedFields(f.fields))
  }
  return out
}

describe('Reviews collection (Story 2.3)', () => {
  const fields = namedFields(Reviews.fields as AnyField[])

  it('has the sourced-review data model (FR61)', () => {
    expect(Reviews.slug).toBe('reviews')
    for (const name of ['author', 'rating', 'reviewDate', 'text', 'business', 'provenance', 'status', 'city']) {
      expect(fields[name], `missing field: ${name}`).toBeTruthy()
    }
  })

  it('constrains rating to 1–5 and requires it', () => {
    expect(fields.rating.required).toBe(true)
    expect(fields.rating.min).toBe(1)
    expect(fields.rating.max).toBe(5)
  })

  it('imported reviews are visible by default (status=published)', () => {
    expect(fields.status.defaultValue).toBe('published')
  })

  it('recomputes the parent rating + enforces same-city links', () => {
    expect(Reviews.hooks?.afterChange?.length).toBeGreaterThan(0)
    expect(Reviews.hooks?.afterDelete?.length).toBeGreaterThan(0)
    expect(Reviews.hooks?.beforeValidate?.length).toBeGreaterThan(0)
  })
})

describe('summarizeReviews() — null-rating-safe (FR61)', () => {
  it('returns an empty, null-average summary for no reviews', () => {
    expect(summarizeReviews([])).toEqual({ average: null, count: 0, histogram: [0, 0, 0, 0, 0] })
    expect(summarizeReviews(null).average).toBeNull()
    expect(summarizeReviews(undefined).count).toBe(0)
  })

  it('averages valid ratings and builds a 5★→1★ histogram', () => {
    const s = summarizeReviews([{ rating: 5 }, { rating: 4 }, { rating: 4 }, { rating: 1 }])
    expect(s.count).toBe(4)
    expect(s.average).toBe(3.5)
    // index 0 = 5★, index 4 = 1★
    expect(s.histogram).toEqual([1, 2, 0, 0, 1])
  })

  it('ignores out-of-range / non-numeric ratings', () => {
    const s = summarizeReviews([{ rating: 5 }, { rating: 0 }, { rating: 9 }, { rating: null }])
    expect(s.count).toBe(1)
    expect(s.average).toBe(5)
  })
})

describe('isOpenNow() — America/Toronto (FR20)', () => {
  const hours: OpeningInterval[] = [
    { day: 'monday', opens: '09:00', closes: '17:00' },
    // Friday late-night bar that wraps past midnight into Saturday.
    { day: 'friday', opens: '18:00', closes: '02:00' },
  ]

  // 14:00 UTC on Monday 2026-06-01 == 10:00 EDT (Toronto, UTC-4 in June) → open.
  it('is open mid-interval', () => {
    expect(isOpenNow(hours, new Date('2026-06-01T14:00:00Z'))).toBe(true)
  })

  // 03:00 UTC Monday == 23:00 EDT Sunday → outside Monday hours.
  it('is closed outside any interval', () => {
    expect(isOpenNow(hours, new Date('2026-06-01T03:00:00Z'))).toBe(false)
  })

  // Saturday 04:00 UTC == Saturday 00:00 EDT → covered by Friday's overnight spillover.
  it('handles overnight intervals spilling into the next day', () => {
    expect(isOpenNow(hours, new Date('2026-06-06T04:00:00Z'))).toBe(true)
  })

  it('returns null (unknown), never false, when hours are missing', () => {
    expect(isOpenNow([], new Date('2026-06-01T14:00:00Z'))).toBeNull()
    expect(isOpenNow(undefined)).toBeNull()
  })

  it('skips malformed time strings without throwing', () => {
    const bad: OpeningInterval[] = [{ day: 'monday', opens: 'nope', closes: '99:99' }]
    expect(isOpenNow(bad, new Date('2026-06-01T14:00:00Z'))).toBe(false)
  })

  it('reports a Toronto weekday + minutes for an instant', () => {
    const parts = torontoNowParts(new Date('2026-06-01T14:00:00Z'))
    expect(parts.weekday).toBe('monday')
    expect(parts.minutes).toBe(10 * 60)
  })
})
