// Directory sort (FR23). Pure, null-rating-safe ordering applied in-memory over a city-scoped
// result set. Distance depends on the user's location (a precomputed id→metres map from
// lib/geo); without it, distance falls back to relevance so the control never dead-ends.

export type SortKey = 'relevance' | 'rating' | 'distance' | 'newest' | 'az'

export const SORT_KEYS: SortKey[] = ['relevance', 'rating', 'distance', 'newest', 'az']
export const DEFAULT_SORT: SortKey = 'relevance'

export const SORT_LABELS: Record<SortKey, string> = {
  relevance: 'Relevance',
  rating: 'Rating',
  distance: 'Distance',
  newest: 'Newest',
  az: 'A–Z',
}

/** Coerce an arbitrary query-param value to a valid SortKey (defaults to relevance). */
export const parseSortKey = (value: unknown): SortKey =>
  typeof value === 'string' && (SORT_KEYS as string[]).includes(value)
    ? (value as SortKey)
    : DEFAULT_SORT

export interface SortableBusiness {
  id: string
  name?: string | null
  rating?: number | null
  reviewCount?: number | null
  createdAt?: string | null
}

export interface SortOptions {
  /** id → distance in metres (from lib/geo), required for meaningful distance sort. */
  distanceById?: Map<string, number>
}

const ratingOf = (b: SortableBusiness): number | null =>
  typeof b.rating === 'number' && !Number.isNaN(b.rating) ? b.rating : null

// "Popular & well-rated" blend: rating weighted by review volume. No rating → 0 (sorts last).
const relevanceScore = (b: SortableBusiness): number => {
  const rating = ratingOf(b)
  if (rating === null) return 0
  return rating * Math.log1p(Math.max(0, b.reviewCount ?? 0))
}

const byName = (a: SortableBusiness, b: SortableBusiness): number =>
  (a.name ?? '').localeCompare(b.name ?? '', 'en', { sensitivity: 'base' })

// Nulls always sort last regardless of direction.
const nullsLastDesc = (a: number | null, b: number | null): number => {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return b - a
}

const comparators: Record<SortKey, (a: SortableBusiness, b: SortableBusiness, o: SortOptions) => number> = {
  relevance: (a, b) => relevanceScore(b) - relevanceScore(a) || byName(a, b),
  rating: (a, b) => nullsLastDesc(ratingOf(a), ratingOf(b)) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0) || byName(a, b),
  newest: (a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : NaN
    const tb = b.createdAt ? Date.parse(b.createdAt) : NaN
    return nullsLastDesc(Number.isNaN(ta) ? null : ta, Number.isNaN(tb) ? null : tb) || byName(a, b)
  },
  az: (a, b) => byName(a, b),
  distance: (a, b, o) => {
    const da = o.distanceById?.get(a.id)
    const db = o.distanceById?.get(b.id)
    const na = da === undefined ? null : da
    const nb = db === undefined ? null : db
    // ascending distance, missing distances last
    if (na === null && nb === null) return 0
    if (na === null) return 1
    if (nb === null) return -1
    return na - nb || byName(a, b)
  },
}

/**
 * Sort businesses by the chosen key (null-rating/-distance-safe). Returns a new array.
 * Distance with no location data falls back to relevance.
 */
export const sortBusinesses = <T extends SortableBusiness>(
  items: T[],
  key: SortKey,
  options: SortOptions = {},
): T[] => {
  const effective: SortKey =
    key === 'distance' && (!options.distanceById || options.distanceById.size === 0)
      ? 'relevance'
      : key
  return [...items].sort((a, b) => comparators[effective](a, b, options))
}
