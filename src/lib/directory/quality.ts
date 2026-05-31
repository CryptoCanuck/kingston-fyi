// Indexing quality gate (NFR1/NFR5). Thin or unclaimed auto-seeded listings are kept out of
// the search index (noindex) until they're enriched or claimed, so low-value skeleton pages
// don't dilute crawl quality. Pure and null-safe so it can gate `generateMetadata` directly
// and be unit-tested without a database.

export interface ListingQualityInput {
  blurb?: string | null
  /** Lexical richText value — only its presence/emptiness matters here. */
  description?: unknown
  photos?: unknown[] | null
  reviewCount?: number | null
  address?: { street?: string | null } | null
  lifecycleStatus?: string | null
  /** Provenance source label, e.g. 'operator' | 'google-places' | 'submission' | 'owner'. */
  provenanceSource?: string | null
}

export interface ListingQuality {
  indexable: boolean
  /** Number of substantive content signals present (0–5). */
  score: number
  /** Human-readable signals/reasons, useful in tests and debugging. */
  reasons: string[]
}

// Auto-seeded sources treated as "unclaimed" until a human enriches or claims them.
const UNCLAIMED_SOURCES = new Set(['google-places'])
// Lifecycle states that should never be indexed regardless of content richness.
const NOINDEX_LIFECYCLES = new Set(['permanently-closed', 'stale-unverified'])

const collectText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''
  const n = node as { text?: unknown; children?: unknown[] }
  let out = typeof n.text === 'string' ? n.text : ''
  if (Array.isArray(n.children)) out += n.children.map(collectText).join('')
  return out
}

/** A lexical richText value carries real content (not just an empty paragraph). */
export const hasRichTextContent = (value: unknown): boolean => {
  const root = (value as { root?: { children?: unknown[] } } | null)?.root
  if (!root || !Array.isArray(root.children) || root.children.length === 0) return false
  return collectText(root).trim().length > 0
}

/**
 * Decide whether a listing's detail page may be indexed. Closed/stale listings are always
 * gated. Otherwise we count substantive content signals (blurb, description, photos, reviews,
 * a street address): unclaimed auto-seeds must clear a higher bar than operator/owner-entered
 * listings before they earn indexing.
 */
export const listingQuality = (b: ListingQualityInput): ListingQuality => {
  if (b.lifecycleStatus && NOINDEX_LIFECYCLES.has(b.lifecycleStatus)) {
    return { indexable: false, score: 0, reasons: [`lifecycle:${b.lifecycleStatus}`] }
  }

  const reasons: string[] = []
  let score = 0
  if (b.blurb && b.blurb.trim().length >= 40) {
    score++
    reasons.push('blurb')
  }
  if (hasRichTextContent(b.description)) {
    score++
    reasons.push('description')
  }
  if (Array.isArray(b.photos) && b.photos.length > 0) {
    score++
    reasons.push('photos')
  }
  if (typeof b.reviewCount === 'number' && b.reviewCount > 0) {
    score++
    reasons.push('reviews')
  }
  if (b.address?.street && b.address.street.trim().length > 0) {
    score++
    reasons.push('address')
  }

  const unclaimed = !b.provenanceSource || UNCLAIMED_SOURCES.has(b.provenanceSource)
  const threshold = unclaimed ? 3 : 1
  const indexable = score >= threshold
  if (!indexable) reasons.push(unclaimed ? 'thin-unclaimed' : 'thin')
  return { indexable, score, reasons }
}
