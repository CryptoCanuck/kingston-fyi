// Event aggregation normalization + venue matching (FR19). Public-source events are messy;
// these pure helpers turn a raw feed item into a clean, draftable event and attempt to match
// its named venue to an existing business — flagging rather than guessing. The job
// (src/jobs/aggregateEvents) wires these to the queue and the moderation gate.

import { normalizeName } from '../places/dedup'
import { slugify } from '../../fields/slugField'

/** A raw event as a public source / import yields it (shape is intentionally loose). */
export interface RawAggregatedEvent {
  /** Stable id from the source, if any — preferred dedup key. */
  sourceId?: string | null
  title?: string | null
  /** ISO (or Date-parseable) start. */
  startsAt?: string | null
  endsAt?: string | null
  description?: string | null
  venueName?: string | null
  url?: string | null
  isFree?: boolean | null
  priceText?: string | null
}

export interface NormalizedAggregatedEvent {
  title: string
  slug: string
  startsAt: string
  endsAt?: string
  blurb?: string
  venueName?: string
  isFree: boolean
  priceText?: string
  sourceUrl?: string
  /** Idempotency key for upsert across re-runs. */
  dedupKey: string
}

const FREE_RE = /\b(free|no charge|pwyc|pay what you can|donation)\b/i

const clean = (v: string | null | undefined): string | undefined => {
  const t = typeof v === 'string' ? v.trim() : ''
  return t.length > 0 ? t : undefined
}

/**
 * Normalize a raw feed item into a draftable event, or null if it lacks the essentials (a
 * title and a parseable start). Deterministic — any LLM cleanup happens in the job, on top.
 */
export const normalizeAggregatedEvent = (
  raw: RawAggregatedEvent,
): NormalizedAggregatedEvent | null => {
  const title = clean(raw.title)
  if (!title) return null
  const start = raw.startsAt ? new Date(raw.startsAt) : null
  if (!start || Number.isNaN(start.getTime())) return null

  const slug = slugify(title)
  if (!slug) return null
  const startsAt = start.toISOString()
  const end = raw.endsAt ? new Date(raw.endsAt) : null
  const endsAt = end && !Number.isNaN(end.getTime()) ? end.toISOString() : undefined
  const priceText = clean(raw.priceText)
  const isFree = typeof raw.isFree === 'boolean' ? raw.isFree : FREE_RE.test(priceText ?? '')

  return {
    title,
    slug,
    startsAt,
    endsAt,
    blurb: clean(raw.description)?.slice(0, 280),
    venueName: clean(raw.venueName),
    isFree,
    priceText: isFree ? undefined : priceText,
    sourceUrl: clean(raw.url),
    dedupKey: clean(raw.sourceId) ?? `${slug}-${startsAt.slice(0, 10)}`,
  }
}

export interface VenueCandidate {
  id: string
  name: string
}

export interface VenueMatch {
  id: string
  matchedName: string
}

/**
 * Attempt to match a named venue to an existing business by normalized name. Returns the match
 * only on an unambiguous (normalized-equal) hit — otherwise null, so the caller leaves the
 * event unlinked for an operator to resolve rather than guessing.
 */
export const matchVenue = (
  venueName: string | null | undefined,
  businesses: VenueCandidate[],
): VenueMatch | null => {
  const norm = normalizeName(venueName ?? '')
  if (!norm) return null
  for (const b of businesses) {
    if (normalizeName(b.name) === norm) return { id: b.id, matchedName: b.name }
  }
  return null
}
