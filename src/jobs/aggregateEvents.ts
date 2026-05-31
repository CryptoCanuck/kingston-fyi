import type { Payload, TaskConfig } from 'payload'

import { DEFAULT_CITY_SLUG } from '../lib/city'
import {
  normalizeAggregatedEvent,
  matchVenue,
  type RawAggregatedEvent,
  type VenueCandidate,
} from '../lib/events/aggregation'
import { getInferenceClient } from '../lib/inference'
import { ingestDraftDefaults } from './draftDefaults'

export interface AggregateEventsResult {
  discovered: number
  created: number
  updated: number
  skipped: number
  matchedVenues: number
  unmatchedVenues: number
  /** Whether any source/import was available to ingest. */
  configured: boolean
}

export interface AggregateEventsOptions {
  /** Raw events to ingest (operator import / future fetched feed). */
  events?: RawAggregatedEvent[]
}

// Optional LLM cleanup of a blurb (AR23). Graceful: returns the input unchanged when the
// inference endpoint isn't configured or errors — aggregation never depends on it.
const refineBlurb = async (payload: Payload, title: string, blurb?: string): Promise<string | undefined> => {
  const client = getInferenceClient()
  if (!client.configured || !blurb) return blurb
  try {
    const res = await client.complete(
      [
        {
          role: 'system',
          content: 'Rewrite the event description as one concise, neutral sentence. No hype, no emojis.',
        },
        { role: 'user', content: `Event: ${title}\nDescription: ${blurb}` },
      ],
      { maxTokens: 80 },
    )
    return res.text?.trim() || blurb
  } catch (err) {
    payload.logger.warn(`[aggregate-events] inference skipped: ${(err as Error).message}`)
    return blurb
  }
}

/**
 * Aggregate events from public sources into the moderation queue (FR19). Each raw item is
 * normalized (deterministically, plus optional lib/inference cleanup), its named venue matched
 * to an existing business when unambiguous (else left for the operator — never guessed), and
 * written as DRAFT (ingestDraftDefaults — never auto-published, NFR4). Upserts by a dedup key
 * (slug+date or source id) so re-runs refresh in place. Degrades to a no-op when there's
 * nothing to ingest.
 */
export const runAggregateEvents = async (
  payload: Payload,
  options: AggregateEventsOptions = {},
): Promise<AggregateEventsResult> => {
  const events = options.events ?? []
  const result: AggregateEventsResult = {
    discovered: events.length,
    created: 0,
    updated: 0,
    skipped: 0,
    matchedVenues: 0,
    unmatchedVenues: 0,
    configured: events.length > 0,
  }
  if (!result.configured) {
    payload.logger.warn('[aggregate-events] no source/import provided — skipping')
    return result
  }

  const { docs: cities } = await payload.find({
    collection: 'cities',
    where: { slug: { equals: DEFAULT_CITY_SLUG } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const city = cities[0]
  if (!city) throw new Error('[aggregate-events] launch city is not seeded')
  const cityId = city.id as string

  // Preload this city's businesses for venue matching (id + name only).
  const { docs: bizDocs } = await payload.find({
    collection: 'businesses',
    where: { city: { equals: cityId } },
    limit: 5000,
    depth: 0,
    overrideAccess: true,
  })
  const businesses: VenueCandidate[] = bizDocs.map((b) => ({
    id: String(b.id),
    name: String((b as { name?: string }).name ?? ''),
  }))

  for (const raw of events) {
    const norm = normalizeAggregatedEvent(raw)
    if (!norm) {
      result.skipped += 1
      continue
    }

    const data: Record<string, unknown> = {
      title: norm.title,
      slug: norm.slug,
      startsAt: norm.startsAt,
      isFree: norm.isFree,
      city: cityId,
      provenance: {
        source: 'seeded',
        refreshRequired: true,
        lastRefreshedAt: new Date().toISOString(),
      },
    }
    if (norm.endsAt) data.endsAt = norm.endsAt
    const blurb = await refineBlurb(payload, norm.title, norm.blurb)
    if (blurb) data.blurb = blurb
    if (norm.priceText) data.priceText = norm.priceText

    // Match the named venue, or fall back to a plain location name for operator resolution.
    const match = norm.venueName ? matchVenue(norm.venueName, businesses) : null
    if (match) {
      data.venue = match.id
      result.matchedVenues += 1
    } else if (norm.venueName) {
      data.locationName = norm.venueName
      result.unmatchedVenues += 1
    }

    const { docs: existing } = await payload.find({
      collection: 'events',
      where: { and: [{ slug: { equals: norm.slug } }, { city: { equals: cityId } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing[0]) {
      await payload.update({
        collection: 'events',
        id: existing[0].id,
        data: data as never,
        depth: 0,
        overrideAccess: true,
        context: { skipReModeration: true },
      })
      result.updated += 1
    } else {
      await payload.create({
        collection: 'events',
        data: ingestDraftDefaults(data) as never,
        depth: 0,
        overrideAccess: true,
      })
      result.created += 1
    }
  }

  payload.logger.info(
    `[aggregate-events] discovered=${result.discovered} created=${result.created} updated=${result.updated} matchedVenues=${result.matchedVenues} unmatchedVenues=${result.unmatchedVenues} skipped=${result.skipped}`,
  )
  return result
}

export const aggregateEventsTask: TaskConfig<{
  input: Record<string, never>
  output: AggregateEventsResult
}> = {
  slug: 'aggregate-events',
  label: 'Aggregate events into the moderation queue',
  outputSchema: [
    { name: 'discovered', type: 'number' },
    { name: 'created', type: 'number' },
    { name: 'updated', type: 'number' },
    { name: 'skipped', type: 'number' },
    { name: 'matchedVenues', type: 'number' },
    { name: 'unmatchedVenues', type: 'number' },
    { name: 'configured', type: 'checkbox' },
  ],
  // No public event source is wired yet (a known seam); the queued task is a safe no-op until
  // a source/import feeds runAggregateEvents directly. See README/env for the integration point.
  handler: async ({ req }) => {
    const output = await runAggregateEvents(req.payload)
    return { output }
  },
}
