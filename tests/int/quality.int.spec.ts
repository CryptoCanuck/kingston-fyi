import { describe, it, expect } from 'vitest'

import { listingQuality, hasRichTextContent } from '@/lib/directory/quality'

// Pure unit coverage for the indexing quality gate (NFR1/NFR5). No database needed.
const richText = (text: string) => ({
  root: { children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] },
})
const emptyRichText = { root: { children: [{ type: 'paragraph', children: [] }] } }

describe('listingQuality (NFR1/NFR5 indexing gate)', () => {
  it('always gates permanently-closed and stale listings', () => {
    expect(listingQuality({ lifecycleStatus: 'permanently-closed' }).indexable).toBe(false)
    expect(listingQuality({ lifecycleStatus: 'stale-unverified' }).indexable).toBe(false)
  })

  it('gates a thin unclaimed (google-places) listing', () => {
    const q = listingQuality({ provenanceSource: 'google-places', address: { street: '1 Main St' } })
    expect(q.indexable).toBe(false)
    expect(q.reasons).toContain('thin-unclaimed')
  })

  it('indexes an enriched unclaimed listing once it clears the higher bar', () => {
    const q = listingQuality({
      provenanceSource: 'google-places',
      blurb: 'A long-standing Kingston coffee roaster pouring single-origin espresso downtown.',
      photos: [{}, {}],
      reviewCount: 42,
      address: { street: '1 Princess St' },
    })
    expect(q.indexable).toBe(true)
    expect(q.score).toBeGreaterThanOrEqual(3)
  })

  it('indexes an operator/claimed listing with a single substantive signal', () => {
    const q = listingQuality({ provenanceSource: 'operator', description: richText('We are open.') })
    expect(q.indexable).toBe(true)
  })

  it('treats a missing provenance source as unclaimed', () => {
    expect(listingQuality({ blurb: 'short' }).indexable).toBe(false)
  })
})

describe('hasRichTextContent', () => {
  it('detects real content vs an empty paragraph', () => {
    expect(hasRichTextContent(richText('hello'))).toBe(true)
    expect(hasRichTextContent(emptyRichText)).toBe(false)
    expect(hasRichTextContent(null)).toBe(false)
    expect(hasRichTextContent(undefined)).toBe(false)
  })
})
