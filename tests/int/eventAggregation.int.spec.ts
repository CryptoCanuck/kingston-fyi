import { getPayload, type Payload } from 'payload'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import config from '@/payload.config'
import { DEFAULT_CITY_SLUG } from '@/lib/city'
import { normalizeAggregatedEvent, matchVenue } from '@/lib/events/aggregation'
import { runAggregateEvents } from '@/jobs/aggregateEvents'

describe('normalizeAggregatedEvent (FR19)', () => {
  it('cleans a raw item, derives slug/dedup key, and infers Free', () => {
    const n = normalizeAggregatedEvent({
      title: '  Buskers Rendezvous  ',
      startsAt: '2026-07-04T18:00:00.000Z',
      description: '  Street performers downtown.  ',
      priceText: 'Free admission',
      venueName: 'Springer Market Square',
    })
    expect(n).not.toBeNull()
    expect(n!.slug).toBe('buskers-rendezvous')
    expect(n!.isFree).toBe(true)
    expect(n!.dedupKey).toBe('buskers-rendezvous-2026-07-04')
    expect(n!.venueName).toBe('Springer Market Square')
  })

  it('rejects items without a title or parseable start', () => {
    expect(normalizeAggregatedEvent({ title: '', startsAt: '2026-07-04' })).toBeNull()
    expect(normalizeAggregatedEvent({ title: 'X', startsAt: 'not-a-date' })).toBeNull()
  })
})

describe('matchVenue (FR19)', () => {
  const businesses = [
    { id: '1', name: 'The Merchant Tap House' },
    { id: '2', name: "Chez Piggy" },
  ]
  it('matches on normalized name, else null (never guesses)', () => {
    expect(matchVenue('the merchant tap house', businesses)?.id).toBe('1')
    expect(matchVenue('Some Unknown Venue', businesses)).toBeNull()
    expect(matchVenue('', businesses)).toBeNull()
  })
})

describe('runAggregateEvents — live (FR19, NFR4)', () => {
  let payload: Payload
  let cityId: string
  let venueName: string
  const slugs = ['agg-test-matched', 'agg-test-unmatched']

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'cities',
      where: { slug: { equals: DEFAULT_CITY_SLUG } },
      limit: 1,
      overrideAccess: true,
    })
    cityId = String(docs[0].id)
    const biz = await payload.find({ collection: 'businesses', where: { city: { equals: cityId } }, limit: 1, overrideAccess: true })
    venueName = String((biz.docs[0] as { name?: string })?.name ?? 'Nonexistent Venue')
  })

  afterAll(async () => {
    for (const slug of slugs) {
      const { docs } = await payload.find({ collection: 'events', where: { slug: { equals: slug } }, limit: 1, overrideAccess: true })
      if (docs[0]) await payload.delete({ collection: 'events', id: String(docs[0].id), overrideAccess: true })
    }
  })

  it('ingests as draft, matches a known venue, and leaves unknowns for the operator', async () => {
    const startsAt = new Date(Date.now() + 5 * 86400000).toISOString()
    const res = await runAggregateEvents(payload, {
      events: [
        { title: 'Agg Test Matched', startsAt, venueName },
        { title: 'Agg Test Unmatched', startsAt, venueName: 'Definitely Not A Real Venue 9000' },
      ],
    })
    expect(res.configured).toBe(true)
    expect(res.created).toBe(2)
    expect(res.matchedVenues).toBe(1)
    expect(res.unmatchedVenues).toBe(1)

    const matched = await payload.find({ collection: 'events', where: { slug: { equals: 'agg-test-matched' } }, limit: 1, depth: 0, overrideAccess: true })
    expect(matched.docs[0].status).toBe('draft') // never auto-published (NFR4)
    expect(matched.docs[0].venue).toBeTruthy()

    const unmatched = await payload.find({ collection: 'events', where: { slug: { equals: 'agg-test-unmatched' } }, limit: 1, depth: 0, overrideAccess: true })
    expect(unmatched.docs[0].venue ?? null).toBeNull()
    expect(unmatched.docs[0].locationName).toBe('Definitely Not A Real Venue 9000')
  })

  it('is a graceful no-op with nothing to ingest', async () => {
    const res = await runAggregateEvents(payload, {})
    expect(res.configured).toBe(false)
    expect(res.created).toBe(0)
  })
})
