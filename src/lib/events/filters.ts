// URL-as-state filtering for the events list (FR16). Mirrors the directory's approach: filters
// live in the query string, parsed on the server for the RSC list and written by the client
// filter bar. Pure helpers shared by the page and the controls.

import { eventBucket, bucketsForPreset, type DatePreset } from './buckets'

export type PriceFilter = 'all' | 'free' | 'paid'

export interface EventFilterState {
  preset: DatePreset
  /** Event-category slugs (OR). */
  cats: string[]
  /** Neighbourhood slug, or null for all. */
  hood: string | null
  price: PriceFilter
}

export const EMPTY_EVENT_FILTERS: EventFilterState = {
  preset: 'any',
  cats: [],
  hood: null,
  price: 'all',
}

export type RawSearchParams = Record<string, string | string[] | undefined>

const VALID_PRESETS: DatePreset[] = ['any', 'today', 'weekend', 'week', 'month']
const VALID_PRICES: PriceFilter[] = ['all', 'free', 'paid']

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v)
const list = (v: string | string[] | undefined): string[] => {
  if (v == null) return []
  const raw = Array.isArray(v) ? v.join(',') : v
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

export const parseEventFilters = (params: RawSearchParams): EventFilterState => {
  const preset = first(params.date) as DatePreset
  const price = first(params.price) as PriceFilter
  const hood = first(params.hood)?.trim()
  return {
    preset: VALID_PRESETS.includes(preset) ? preset : 'any',
    cats: list(params.cat),
    hood: hood ? hood : null,
    price: VALID_PRICES.includes(price) ? price : 'all',
  }
}

/** Serialize back to a query string (omitting defaults so clean state has a clean URL). */
export const serializeEventFilters = (f: EventFilterState): string => {
  const q = new URLSearchParams()
  if (f.preset !== 'any') q.set('date', f.preset)
  if (f.cats.length) q.set('cat', f.cats.join(','))
  if (f.hood) q.set('hood', f.hood)
  if (f.price !== 'all') q.set('price', f.price)
  return q.toString()
}

const slugOf = (rel: unknown): string | null =>
  rel && typeof rel === 'object' ? ((rel as { slug?: string | null }).slug ?? null) : null

export interface MatchableEvent {
  startsAt?: string | null
  isFree?: boolean | null
  category?: { slug?: string | null } | string | null
  neighbourhood?: { slug?: string | null } | string | null
}

/** Whether an event passes the current filters. Past events never match. */
export const matchesEvent = (
  e: MatchableEvent,
  f: EventFilterState,
  now: Date = new Date(),
): boolean => {
  const bucket = eventBucket(e.startsAt, now)
  if (bucket === 'past') return false
  if (!bucketsForPreset(f.preset).includes(bucket)) return false

  if (f.cats.length) {
    const cat = slugOf(e.category)
    if (!cat || !f.cats.includes(cat)) return false
  }
  if (f.hood && slugOf(e.neighbourhood) !== f.hood) return false
  if (f.price === 'free' && !e.isFree) return false
  if (f.price === 'paid' && e.isFree) return false
  return true
}

export const activeEventFilterCount = (f: EventFilterState): number =>
  (f.preset !== 'any' ? 1 : 0) + f.cats.length + (f.hood ? 1 : 0) + (f.price !== 'all' ? 1 : 0)

export interface EventsViewExtras {
  view?: 'list' | 'calendar'
  /** "YYYY-MM" calendar month. */
  month?: string
  /** "YYYY-MM-DD" calendar day drill-in. */
  day?: string
}

/**
 * Build an /events href that carries both the filters and the view/month/day state, so the
 * list↔calendar toggle, month navigation, and the filter bar all preserve each other's state.
 */
export const eventsHref = (f: EventFilterState, extras: EventsViewExtras = {}): string => {
  const q = new URLSearchParams(serializeEventFilters(f))
  if (extras.view && extras.view !== 'list') q.set('view', extras.view)
  if (extras.month) q.set('month', extras.month)
  if (extras.day) q.set('day', extras.day)
  const s = q.toString()
  return s ? `/events?${s}` : '/events'
}
