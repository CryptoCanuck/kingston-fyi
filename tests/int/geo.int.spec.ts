import { getPayload, type Payload } from 'payload'
import { describe, it, beforeAll, expect } from 'vitest'

import config from '@/payload.config'
import { businessesWithinRadius, businessesInBounds } from '@/lib/geo'
import { DEFAULT_CITY_SLUG } from '@/lib/city'

// Exercises the PostGIS query layer against the seeded Kingston rows (Story 2.8 data). The
// seeded listings are drafts, so these tests query with statuses:['draft'] to reach them.
describe('lib/geo PostGIS queries (FR24)', () => {
  let payload: Payload
  let cityId: string
  // Downtown Kingston.
  const center: [number, number] = [-76.481, 44.231]

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'cities',
      where: { slug: { equals: DEFAULT_CITY_SLUG } },
      limit: 1,
      overrideAccess: true,
    })
    cityId = String(docs[0]?.id)
  })

  it('finds businesses within a radius, nearest first, all inside the radius', async () => {
    const radiusM = 3000
    const hits = await businessesWithinRadius(payload, {
      cityId,
      center,
      radiusM,
      statuses: ['draft'],
    })
    expect(hits.length).toBeGreaterThan(0)
    // distances are ascending and within the radius
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i].distanceM!).toBeGreaterThanOrEqual(hits[i - 1].distanceM!)
    }
    expect(hits.every((h) => h.distanceM! <= radiusM)).toBe(true)
  })

  it('a tighter radius returns no more than a wider one', async () => {
    const wide = await businessesWithinRadius(payload, { cityId, center, radiusM: 4000, statuses: ['draft'] })
    const tight = await businessesWithinRadius(payload, { cityId, center, radiusM: 800, statuses: ['draft'] })
    expect(tight.length).toBeLessThanOrEqual(wide.length)
  })

  it('finds businesses inside a map viewport (ST_MakeEnvelope)', async () => {
    const hits = await businessesInBounds(payload, {
      cityId,
      bounds: { minLng: -76.6, minLat: 44.18, maxLng: -76.4, maxLat: 44.3 },
      statuses: ['draft'],
    })
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.every((h) => typeof h.id === 'string')).toBe(true)
  })

  it('excludes draft listings when only public statuses are allowed (moderation gate)', async () => {
    // All seeded rows are drafts → the default public-status filter must return none of them.
    const hits = await businessesWithinRadius(payload, { cityId, center, radiusM: 5000 })
    expect(hits.length).toBe(0)
  })
})
