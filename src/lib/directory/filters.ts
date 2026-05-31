// Directory filter state (FR21, FR26). Filters live in URL search params so the directory is
// shareable + back-button-friendly. This module is the single source of truth for parsing
// params → typed state, matching a business against that state, deriving the category tree,
// and producing the active-filter chips. Pure + testable; the page applies it in-memory over
// the city-scoped result set (launch scale), the client components read/serialize it.

import { isOpenNow, type OpeningInterval } from '../openNow'
import { type SortKey, parseSortKey } from './sort'

export const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 4.0, label: '4.0 & up' },
  { value: 4.5, label: '4.5 & up' },
  { value: 4.8, label: '4.8 & up' },
]

export const PRICE_OPTIONS = ['$', '$$', '$$$', '$$$$']

export interface FilterState {
  q: string
  /** Leaf category slugs. */
  cats: string[]
  /** Neighbourhood slug, or null for all. */
  hood: string | null
  minRating: number
  openNow: boolean
  prices: string[]
  sort: SortKey
  page: number
}

/** Next's searchParams shape. */
export type RawSearchParams = Record<string, string | string[] | undefined>

const asArray = (value: string | string[] | undefined): string[] => {
  if (value == null) return []
  return Array.isArray(value) ? value : value.split(',').filter(Boolean)
}

const asString = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? ''

export const parseFilters = (params: RawSearchParams): FilterState => {
  const ratingRaw = Number(asString(params.rating))
  const pageRaw = Number(asString(params.page))
  return {
    q: asString(params.q).trim(),
    cats: asArray(params.cat),
    hood: asString(params.hood) || null,
    minRating: Number.isFinite(ratingRaw) && ratingRaw > 0 ? ratingRaw : 0,
    openNow: asString(params.open) === '1' || asString(params.open) === 'true',
    prices: asArray(params.price),
    sort: parseSortKey(asString(params.sort) || undefined),
    page: Number.isFinite(pageRaw) && pageRaw > 1 ? Math.floor(pageRaw) : 1,
  }
}

/** Serialize state back to a URLSearchParams query string (omitting defaults). */
export const serializeFilters = (state: Partial<FilterState>): string => {
  const sp = new URLSearchParams()
  if (state.q) sp.set('q', state.q)
  if (state.cats?.length) sp.set('cat', state.cats.join(','))
  if (state.hood) sp.set('hood', state.hood)
  if (state.minRating) sp.set('rating', String(state.minRating))
  if (state.openNow) sp.set('open', '1')
  if (state.prices?.length) sp.set('price', state.prices.join(','))
  if (state.sort && state.sort !== 'relevance') sp.set('sort', state.sort)
  if (state.page && state.page > 1) sp.set('page', String(state.page))
  return sp.toString()
}

/** A business as the directory consumes it (populated category + neighbourhood). */
export interface DirectoryBusiness {
  id: string
  name: string
  blurb?: string | null
  rating?: number | null
  reviewCount?: number | null
  priceTier?: string | null
  hours?: OpeningInterval[] | null
  createdAt?: string | null
  category?: { slug?: string | null; name?: string | null; parent?: unknown } | string | null
  neighbourhood?: { slug?: string | null; name?: string | null } | string | null
}

const slugOf = (rel: DirectoryBusiness['category'] | DirectoryBusiness['neighbourhood']): string | null =>
  rel && typeof rel === 'object' ? ((rel as { slug?: string | null }).slug ?? null) : null

const nameOf = (rel: DirectoryBusiness['category'] | DirectoryBusiness['neighbourhood']): string =>
  rel && typeof rel === 'object' ? ((rel as { name?: string | null }).name ?? '') : ''

/** Does a business satisfy the filter state? Open-Now is evaluated against `now`. */
export const matchesBusiness = (
  b: DirectoryBusiness,
  f: FilterState,
  now: Date = new Date(),
): boolean => {
  if (f.q) {
    const s = f.q.toLowerCase()
    const haystack = [b.name, b.blurb ?? '', nameOf(b.category), nameOf(b.neighbourhood)]
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(s)) return false
  }
  if (f.cats.length) {
    const cat = slugOf(b.category)
    if (!cat || !f.cats.includes(cat)) return false
  }
  if (f.hood) {
    if (slugOf(b.neighbourhood) !== f.hood) return false
  }
  if (f.minRating > 0) {
    if (typeof b.rating !== 'number' || b.rating < f.minRating) return false
  }
  if (f.prices.length) {
    if (!b.priceTier || !f.prices.includes(b.priceTier)) return false
  }
  if (f.openNow) {
    if (isOpenNow(b.hours, now) !== true) return false
  }
  return true
}

export interface CategoryNode {
  slug: string
  name: string
}
export interface CategoryTreeBranch {
  parent: CategoryNode
  children: CategoryNode[]
}

/** A flat category collection (with optional parent ids) → a parent→children tree. */
export const buildCategoryTree = (
  categories: { id: string; slug?: string | null; name?: string | null; parent?: unknown }[],
): CategoryTreeBranch[] => {
  const byId = new Map(categories.map((c) => [c.id, c]))
  const parentIdOf = (c: { parent?: unknown }): string | null => {
    const p = c.parent
    if (p == null) return null
    return typeof p === 'object' ? String((p as { id: unknown }).id) : String(p)
  }
  const branches = new Map<string, CategoryTreeBranch>()
  const node = (c: { slug?: string | null; name?: string | null }): CategoryNode => ({
    slug: c.slug ?? '',
    name: c.name ?? '',
  })

  for (const c of categories) {
    const pid = parentIdOf(c)
    if (!pid) continue // a parent category itself
    const parent = byId.get(pid)
    if (!parent) continue
    if (!branches.has(pid)) branches.set(pid, { parent: node(parent), children: [] })
    branches.get(pid)!.children.push(node(c))
  }
  return [...branches.values()]
    .map((b) => ({ parent: b.parent, children: b.children.sort((x, y) => x.name.localeCompare(y.name)) }))
    .sort((a, b) => a.parent.name.localeCompare(b.parent.name))
}

export interface ActiveChip {
  /** Stable key. */
  key: string
  label: string
  /** The filter state with this chip removed (for the client to navigate to). */
  next: FilterState
}

/** Derive the active-filter chips (FR26), each carrying the state it removes itself from. */
export const activeFilterChips = (
  f: FilterState,
  catLabels: Record<string, string> = {},
  hoodLabels: Record<string, string> = {},
): ActiveChip[] => {
  const chips: ActiveChip[] = []
  if (f.q) chips.push({ key: 'q', label: `“${f.q}”`, next: { ...f, q: '', page: 1 } })
  if (f.openNow) chips.push({ key: 'open', label: 'Open Now', next: { ...f, openNow: false, page: 1 } })
  if (f.hood)
    chips.push({ key: `hood`, label: hoodLabels[f.hood] ?? f.hood, next: { ...f, hood: null, page: 1 } })
  if (f.minRating)
    chips.push({ key: 'rating', label: `${f.minRating}+ stars`, next: { ...f, minRating: 0, page: 1 } })
  for (const c of f.cats)
    chips.push({
      key: `cat:${c}`,
      label: catLabels[c] ?? c,
      next: { ...f, cats: f.cats.filter((x) => x !== c), page: 1 },
    })
  for (const p of f.prices)
    chips.push({
      key: `price:${p}`,
      label: p,
      next: { ...f, prices: f.prices.filter((x) => x !== p), page: 1 },
    })
  return chips
}

/** Count of active facets (for the "Clear (n)" control). */
export const activeFilterCount = (f: FilterState): number =>
  f.cats.length +
  f.prices.length +
  (f.hood ? 1 : 0) +
  (f.minRating ? 1 : 0) +
  (f.openNow ? 1 : 0) +
  (f.q ? 1 : 0)

export const EMPTY_FILTERS: FilterState = {
  q: '',
  cats: [],
  hood: null,
  minRating: 0,
  openNow: false,
  prices: [],
  sort: 'relevance',
  page: 1,
}
